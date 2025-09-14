from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.db import transaction
from django.db.models import OuterRef, Subquery, F, Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.contrib.auth.decorators import login_required, user_passes_test
from django.forms import formset_factory
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth import login, get_user_model
from io import BytesIO
from datetime import date, timedelta
import csv
import io
import json
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from xhtml2pdf import pisa  # type: ignore
from .models import (
    Station,
    Train,
    RouteStop,
    DailyTrainAvailability,
    Booking,
    Passenger,
    Payment,
    TrainBerthAvailability,
)
from .forms import PassengerForm, RegisterForm
from .utils import calculate_fare
from django.utils import timezone
from django.db.models import Count


def is_admin(user):
    return user.is_authenticated and user.is_staff


def home(request):
    return redirect("search_trains")


def search_trains(request):
    stations = Station.objects.order_by("name")
    results = []
    today_iso = date.today().isoformat()
    max_date_iso = (date.today() + timedelta(days=30)).isoformat()

    if request.method == "POST":
        src_code = request.POST.get("source")
        dst_code = request.POST.get("destination")
        date_str = request.POST.get("date")
        if not (src_code and dst_code and date_str):
            messages.warning(request, "Please fill all fields.")
            return render(
                request,
                "bookings/search.html",
                {"stations": stations, "today": today_iso, "max_date": max_date_iso},
            )

        journey_date = date.fromisoformat(date_str)
        if journey_date < date.today():
            messages.warning(request, "Cannot search for past dates.")
            return render(
                request,
                "bookings/search.html",
                {"stations": stations, "today": today_iso, "max_date": max_date_iso},
            )
        if journey_date > date.today() + timedelta(days=30):
            messages.warning(request, "Booking allowed only up to 30 days in advance.")
            return render(
                request,
                "bookings/search.html",
                {"stations": stations, "today": today_iso, "max_date": max_date_iso},
            )

        src = get_object_or_404(Station, code=src_code)
        dst = get_object_or_404(Station, code=dst_code)
        weekday = journey_date.weekday()

        src_seq_qs = RouteStop.objects.filter(train=OuterRef("pk"), station=src).values(
            "sequence"
        )[:1]
        dst_seq_qs = RouteStop.objects.filter(train=OuterRef("pk"), station=dst).values(
            "sequence"
        )[:1]

        trains = (
            Train.objects.annotate(
                src_seq=Subquery(src_seq_qs), dst_seq=Subquery(dst_seq_qs)
            )
            .filter(src_seq__isnull=False, dst_seq__isnull=False)
            .filter(src_seq__lt=F("dst_seq"))
        )

        for t in trains:
            berth_info = []
            for tb in t.berths.all():
                try:
                    dta = DailyTrainAvailability.objects.get(
                        train=t, berth_type=tb.berth_type, date=journey_date
                    )
                    seats_left = dta.available_seats
                except DailyTrainAvailability.DoesNotExist:
                    seats_left = tb.capacity
                try:
                    src_rs = RouteStop.objects.get(train=t, station=src)
                    dst_rs = RouteStop.objects.get(train=t, station=dst)
                except RouteStop.DoesNotExist:
                    continue
                distance = dst_rs.distance - src_rs.distance
                fare_calc = calculate_fare(
                    distance_km=distance,
                    price_per_km=tb.berth_type.price_per_km,
                    passengers=1,
                )
                berth_info.append(
                    {
                        "berth": tb.berth_type,
                        "seats_left": seats_left,
                        "fare_per_passenger": fare_calc["base_per"],
                        "fare_total_preview": fare_calc["total"],
                    }
                )
            if berth_info:
                results.append({"train": t, "berths": berth_info})
        if not results:
            messages.info(request, "No trains found for the selected route/date.")

    return render(
        request,
        "bookings/search.html",
        {
            "stations": stations,
            "results": results,
            "today": today_iso,
            "max_date": max_date_iso,
        },
    )


@login_required
def book_train(request, train_id):
    from .models import DailyTrainAvailability, TrainBerthAvailability

    train = get_object_or_404(Train, pk=train_id)
    PassengerFormSet = formset_factory(
        PassengerForm, extra=1, max_num=5, validate_max=True
    )

    if request.method == "POST":
        src_code = request.POST.get("source")
        dst_code = request.POST.get("destination")
        date_str = request.POST.get("date")
        berth_code = request.POST.get("berth_code")

        if not (src_code and dst_code and date_str and berth_code):
            messages.error(
                request,
                "Missing booking context (source/destination/date/berth). Please re-run the search.",
            )
            return redirect("search_trains")

        try:
            journey_date = date.fromisoformat(date_str)
        except Exception:
            messages.error(request, "Invalid date provided.")
            return redirect("search_trains")

        src = get_object_or_404(Station, code=src_code)
        dst = get_object_or_404(Station, code=dst_code)

        # find berth availability record on the train
        try:
            tb = train.berths.get(berth_type__code=berth_code)
        except TrainBerthAvailability.DoesNotExist:
            messages.error(request, "Selected berth invalid for this train.")
            return redirect("search_trains")

        # passenger formset
        formset = PassengerFormSet(request.POST)
        if not formset.is_valid():
            messages.warning(request, "Please correct passenger details.")
            return render(
                request,
                "bookings/book.html",
                {
                    "train": train,
                    "formset": formset,
                    "source": src_code,
                    "destination": dst_code,
                    "date": date_str,
                    "berth_code": berth_code,
                },
            )

        passengers_data = [f.cleaned_data for f in formset if f.cleaned_data]
        num_passengers = len(passengers_data)
        if num_passengers == 0:
            messages.warning(request, "Add at least one passenger.")
            return render(
                request,
                "bookings/book.html",
                {
                    "train": train,
                    "formset": formset,
                    "source": src_code,
                    "destination": dst_code,
                    "date": date_str,
                    "berth_code": berth_code,
                },
            )
        if num_passengers > 5:
            messages.warning(request, "Maximum 5 passengers allowed.")
            return render(
                request,
                "bookings/book.html",
                {
                    "train": train,
                    "formset": formset,
                    "source": src_code,
                    "destination": dst_code,
                    "date": date_str,
                    "berth_code": berth_code,
                },
            )

        # lock availability and create booking
        with transaction.atomic():
            (
                dta,
                created,
            ) = DailyTrainAvailability.objects.select_for_update().get_or_create(
                train=train,
                berth_type=tb.berth_type,
                date=journey_date,
                defaults={"available_seats": tb.capacity},
            )
            if dta.available_seats < num_passengers:
                messages.error(
                    request,
                    f"Only {dta.available_seats} seats available for {tb.berth_type.code} on {journey_date}.",
                )
                return render(
                    request,
                    "bookings/book.html",
                    {
                        "train": train,
                        "formset": formset,
                        "source": src_code,
                        "destination": dst_code,
                        "date": date_str,
                        "berth_code": berth_code,
                    },
                )

            # compute distance, fare and create Booking
            try:
                src_rs = RouteStop.objects.get(train=train, station=src)
                dst_rs = RouteStop.objects.get(train=train, station=dst)
            except RouteStop.DoesNotExist:
                messages.error(request, "Train does not stop at the selected stations.")
                return redirect("search_trains")

            distance = dst_rs.distance - src_rs.distance
            fare = calculate_fare(
                distance_km=distance,
                price_per_km=tb.berth_type.price_per_km,
                passengers=num_passengers,
            )

            booking = Booking.objects.create(
                user=request.user,
                train=train,
                source=src,
                destination=dst,
                date_of_journey=journey_date,
                berth_type=tb.berth_type,
                passengers_count=num_passengers,
                total_fare=fare["total"],
                status="PENDING",
            )

            # create passengers
            for p in passengers_data:
                Passenger.objects.create(
                    booking=booking, name=p["name"], age=p["age"], gender=p["gender"]
                )

            # reduce availability (hold seats until payment)
            dta.available_seats -= num_passengers
            dta.save()

        return redirect("booking_preview", booking_id=booking.pk)

    src = request.GET.get("source") or None
    dst = request.GET.get("destination") or None
    date_val = request.GET.get("date") or None
    berth_code_val = request.GET.get("berth_code") or None

    # prepare an empty formset with one blank form
    formset = PassengerFormSet()
    return render(
        request,
        "bookings/book.html",
        {
            "train": train,
            "formset": formset,
            "source": src,
            "destination": dst,
            "date": date_val,
            "berth_code": berth_code_val,
        },
    )


@login_required
def booking_preview(request, booking_id):
    booking = get_object_or_404(Booking, pk=booking_id, user=request.user)
    return render(request, "bookings/preview.html", {"booking": booking})


@login_required
def mock_pay(request, booking_id):
    booking = get_object_or_404(Booking, pk=booking_id, user=request.user)
    if booking.status != "PENDING":
        messages.info(request, "Booking already processed.")
        return redirect("my_bookings")
    with transaction.atomic():
        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_fare,
            status="SUCCESS",
            txn_id=f"MOCK{booking.pk}",
        )
        booking.status = "CONFIRMED"
        booking.save()
        existing_passengers = Passenger.objects.filter(
            booking__train=booking.train,
            booking__date_of_journey=booking.date_of_journey,
            booking__berth_type=booking.berth_type,
        ).count()
        start_idx = existing_passengers - booking.passengers_count + 1
        if start_idx < 1:
            start_idx = 1
        prefix = booking.berth_type.code
        i = start_idx
        for p in booking.passengers.all():
            p.seat_number = f"{prefix}-{i:03d}"
            p.save()
            i += 1
    messages.success(request, "Payment successful. Booking confirmed.")
    return redirect("ticket_success", booking_id=booking.pk)


@login_required
def ticket_success(request, booking_id):
    booking = get_object_or_404(Booking, pk=booking_id, user=request.user)
    return render(request, "bookings/ticket.html", {"booking": booking})


@login_required
def my_bookings(request):
    bookings = (
        request.user.bookings.select_related(
            "train", "source", "destination", "berth_type"
        )
        .prefetch_related("passengers")
        .order_by("-created_at")
    )
    return render(request, "bookings/my_bookings.html", {"bookings": bookings})


@login_required
def profile_view(request):
    user = request.user
    if request.method == "POST":
        first_name = request.POST.get("first_name", "").strip()
        email = request.POST.get("email", "").strip()
        mobile = request.POST.get("mobile", "").strip()

        if mobile and (not mobile.isdigit() or len(mobile) != 10):
            messages.warning(request, "Mobile must be 10 digits.")
            return redirect("profile")

        # apply updates
        user.first_name = first_name or user.first_name  # keep existing if blank
        user.email = email or user.email
        user.mobile = mobile or user.mobile
        user.save()
        messages.success(request, "Profile updated.")
        return redirect("profile")

    return render(request, "bookings/profile.html")


def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, "Registration success. You can login now.")
            return redirect("login")
    else:
        form = RegisterForm()
    return render(request, "bookings/register.html", {"form": form})


def download_ticket(request, booking_id):
    booking = get_object_or_404(Booking, pk=booking_id, user=request.user)
    passengers = booking.passengers.all()

    # Prepare ticket context
    context = {
        "pnr": booking.pk,
        "booking_date": booking.created_at.strftime("%d-%m-%Y"),
        "train_number": booking.train.number,
        "train_name": booking.train.name,
        "source": f"{booking.source.name} ({booking.source.code})",
        "destination": f"{booking.destination.name} ({booking.destination.code})",
        "date_of_journey": booking.date_of_journey.strftime("%d-%m-%Y"),
        "departure_time": (
            booking.train.stops.filter(station=booking.source)
            .first()
            .departure.strftime("%H:%M")
            if booking.train.stops.filter(station=booking.source).exists()
            else "N/A"
        ),
        "class_name": booking.berth_type.name,
        "berth_code": booking.berth_type.code,
        "passengers": passengers,
        "total_fare": booking.total_fare,
        "status": booking.status,
    }

    html = render_to_string("bookings/ticket_template.html", context)

    # Generate PDF
    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="ticket_{booking.pk}.pdf"'
    pisa_status = pisa.CreatePDF(
        io.BytesIO(html.encode("utf-8")), dest=response, encoding="utf-8"
    )

    if pisa_status.err:
        return HttpResponse("Error generating ticket", status=500)
    return response


# Allow only staff/admin users to access
def staff_required(view_func):
    return user_passes_test(lambda u: u.is_staff)(view_func)


@staff_required
def admin_dashboard(request):

    # 1) selected date (safe fallback)
    date_str = request.GET.get("date")
    try:
        sel_date = pd.to_datetime(date_str).date() if date_str else date.today()
    except Exception:
        sel_date = date.today()

    # 2) trains + availability for selected date
    trains = Train.objects.prefetch_related("berths", "stops").order_by("number")
    trains_data = []
    for t in trains:
        total_capacity = 0
        total_available = 0
        for tb in t.berths.all():
            cap = tb.capacity or 0
            total_capacity += cap
            try:
                dta = DailyTrainAvailability.objects.get(
                    train=t, berth_type=tb.berth_type, date=sel_date
                )
                total_available += dta.available_seats
            except DailyTrainAvailability.DoesNotExist:
                total_available += cap
        trains_data.append(
            {
                "number": t.number,
                "name": t.name,
                "stops_count": t.stops.count(),
                "total_available": total_available,
                "total_capacity": total_capacity,
            }
        )

    # 3) bookings time-series (last 30 days)
    start_date = date.today() - timedelta(days=30)
    bookings_qs = Booking.objects.filter(created_at__gte=start_date).order_by(
        "created_at"
    )
    bookings_by_date = (
        bookings_qs.annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("pk"), revenue=Sum("total_fare"))
        .order_by("day")
    )

    labels_dates = [b["day"].isoformat() for b in bookings_by_date]
    counts_dates = [b["count"] for b in bookings_by_date]
    revenue_dates = [float(b["revenue"] or 0) for b in bookings_by_date]

    # 4) revenue by route (top 5)
    revenue_by_route_qs = (
        Booking.objects.values("source__code", "destination__code")
        .annotate(total_revenue=Sum("total_fare"), bookings=Count("pk"))
        .order_by("-total_revenue")[:5]
    )
    revenue_by_route = [
        {
            "route": f"{r['source__code']} → {r['destination__code']}",
            "revenue": float(r["total_revenue"] or 0),
            "bookings": r["bookings"],
        }
        for r in revenue_by_route_qs
    ]

    # 5) top customers (by bookings)
    top_customers_qs = (
        Booking.objects.values("user__username")
        .annotate(bookings=Count("pk"), revenue=Sum("total_fare"))
        .order_by("-bookings")[:5]
    )
    top_customers = [
        {
            "username": t["user__username"],
            "bookings": t["bookings"],
            "revenue": float(t["revenue"] or 0),
        }
        for t in top_customers_qs
    ]

    # 6) berth distribution
    berth_qs = Booking.objects.values("berth_type__name").annotate(count=Count("pk"))
    berth_stats = [
        {"berth": b["berth_type__name"] or "—", "count": b["count"]} for b in berth_qs
    ]

    # --- 7) Simple 7-day forecast ---
    forecast_labels, forecast_values = [], []

    today = timezone.localdate()

    # Future bookings count per date
    future_bookings_dict = dict(
        Booking.objects.filter(created_at__date__gte=today)
        .values_list("created_at__date")
        .annotate(total=Count("id"))
    )

    if len(counts_dates) >= 3:
        # Build daily history
        df = pd.DataFrame({"date": pd.to_datetime(labels_dates), "count": counts_dates})
        df = df.set_index("date").resample("D").sum().fillna(0)

        epoch = pd.Timestamp("1970-01-01")
        df["daynum"] = (df.index - epoch).days
        X, y = df[["daynum"]], df["count"]

        # Fit regression
        model = LinearRegression().fit(X, y)

        # Predict next 7 days
        last_date = df.index[-1]
        future_dates = [last_date + pd.Timedelta(days=i) for i in range(1, 8)]
        X_future = np.array([(d - epoch).days for d in future_dates]).reshape(-1, 1)
        forecast_raw = model.predict(X_future)
        forecast_raw = np.clip(forecast_raw, 0, None)  # no negatives

        for i, d in enumerate(future_dates):
            date_only = d.date()
            pred = forecast_raw[i]

            # Weekend boost
            if d.weekday() in [5, 6]:  # Sat/Sun
                pred *= 1.25

            # Ensure prediction > already booked
            already_booked = future_bookings_dict.get(date_only, 0)
            if pred <= already_booked:
                pred = already_booked + 1

            forecast_labels.append(date_only.isoformat())
            forecast_values.append(round(pred, 2))

    # 8) recent users
    User = get_user_model()
    users_qs = User.objects.order_by("-date_joined")[:20]

    # prepare context (chart data serialized to JSON strings)
    context = {
        "sel_date": sel_date.isoformat(),
        "trains_data": trains_data,
        "chart_labels_dates": json.dumps(labels_dates, cls=DjangoJSONEncoder),
        "chart_counts_dates": json.dumps(counts_dates),
        "chart_revenue_dates": json.dumps(revenue_dates),
        "revenue_by_route": json.dumps(revenue_by_route),
        "top_customers": json.dumps(top_customers),
        "berth_stats": json.dumps(berth_stats),
        "forecast_labels": json.dumps(forecast_labels),
        "forecast_values": json.dumps(forecast_values),
        "users": users_qs,
    }

    return render(request, "bookings/admin_dashboard.html", context)


@staff_required
def export_bookings_csv(request):
    """Export bookings as CSV."""
    date_str = request.GET.get("date")
    qs = Booking.objects.select_related(
        "user", "train", "source", "destination", "berth_type"
    )
    if date_str:
        try:
            sel_date = date.fromisoformat(date_str)
            qs = qs.filter(date_of_journey=sel_date)
        except:
            pass
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = (
        f'attachment; filename="bookings_{date_str or "all"}.csv"'
    )
    writer = csv.writer(response)
    writer.writerow(
        [
            "ID",
            "User",
            "Train",
            "Source",
            "Destination",
            "Date",
            "Passengers",
            "Fare",
            "Status",
            "Created",
        ]
    )
    for b in qs:
        writer.writerow(
            [
                b.pk,
                b.user.username if b.user else "",
                f"{b.train.number} {b.train.name}" if b.train else "",
                b.source.code if b.source else "",
                b.destination.code if b.destination else "",
                b.date_of_journey,
                b.passengers_count,
                float(b.total_fare or 0),
                b.status,
                b.created_at,
            ]
        )
    return response


@staff_required
def export_bookings_pdf(request):
    date_str = request.GET.get("date")
    qs = Booking.objects.select_related(
        "user", "train", "source", "destination", "berth_type"
    )
    if date_str:
        try:
            sel_date = date.fromisoformat(date_str)
            qs = qs.filter(date_of_journey=sel_date)
        except:
            pass
    bookings = []
    for b in qs[:500]:
        bookings.append(
            {
                "id": b.pk,
                "user": b.user.username if b.user else "",
                "train": f"{b.train.number} {b.train.name}" if b.train else "",
                "source": b.source.code if b.source else "",
                "destination": b.destination.code if b.destination else "",
                "date_of_journey": b.date_of_journey,
                "passengers": b.passengers_count,
                "fare": float(b.total_fare or 0),
                "status": b.status,
                "created_at": b.created_at,
            }
        )
    pdf_bytes, err = _render_pdf_from_template(
        "bookings/admin_bookings_pdf.html", {"bookings": bookings}
    )
    if err:
        return HttpResponse("Error generating PDF", status=500)
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="bookings_{date_str or "all"}.pdf"'
    )
    return response


def _render_pdf_from_template(template_src, context_dict):
    html = render_to_string(template_src, context_dict)
    result = BytesIO()
    pdf_status = pisa.CreatePDF(html, dest=result)
    if pdf_status.err:
        return None, pdf_status.err
    return result.getvalue(), None
