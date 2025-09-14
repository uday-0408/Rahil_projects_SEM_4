# RTBS (Railway Ticket Booking System)

This project is a Django-based web application for booking railway tickets, managing user accounts, and handling train schedules. It is designed for educational and demonstration purposes.

## Project Structure

- **RTBS_Presentation.pptx**: Project presentation and overview.
- **railway/**: Main Django project directory.
  - **db.sqlite3**: SQLite database file.
  - **manage.py**: Django management script.
  - **requirements.txt**: Python dependencies for the project.
  - **bookings/**: Django app for booking logic, models, views, and templates.
  - **railway/**: Django project settings and configuration.

## Features

- **User Registration & Login**: Secure authentication for users.
- **Train & Seat Availability**: View available trains and seats.
- **Ticket Booking**: Book, view, and manage tickets.
- **Admin Interface**: Manage trains, bookings, and users.

## How to Run

1. Navigate to `RTBS/railway/`.
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```
   python manage.py migrate
   ```
4. Start the server:
   ```
   python manage.py runserver
   ```

## Technologies Used

- **Backend**: Django (Python)
- **Database**: SQLite3
- **Frontend**: Django templates, HTML, CSS

## License

This project is for educational purposes and may be adapted for real-world use with further enhancements.
