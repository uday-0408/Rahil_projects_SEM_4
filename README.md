# RAHIL_INDIVIDUAL_PROJECT

This repository contains two major projects developed for academic and demonstration purposes:

- **FinalCafeKiosk**: A full-stack Cafe Kiosk application
- **RTBS**: A Railway Ticket Booking System

Below is an overview of the repository structure and each project's purpose.

---

## Repository Structure

```
RAHIL_INDIVIDUAL_PROJECT/
│
├── FinalCafeKiosk/
│   ├── CafeKioskPPT.pptx
│   └── cafe-kiosk/
│       ├── package.json
│       ├── server.js
│       ├── client/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── scripts/
│
├── RTBS/
│   ├── RTBS_Presentation.pptx
│   └── railway/
│       ├── db.sqlite3
│       ├── manage.py
│       ├── requirements.txt
│       ├── bookings/
│       └── railway/
│
├── FinalCafeKioskwithPPT.zip
├── RTBS_Final_1.zip
```

---

## FinalCafeKiosk
A full-stack web application for managing a cafe's menu, orders, and users. Includes both backend (Node.js/Express/MongoDB) and frontend (React) code, as well as middleware, models, and utility scripts. See `FinalCafeKiosk/README.md` for more details.

- **Features:**
  - User authentication (JWT)
  - Admin panel for menu and order management
  - Customer ordering interface
  - Responsive React frontend

---

## RTBS (Railway Ticket Booking System)
A Django-based web application for booking railway tickets, managing user accounts, and handling train schedules.

- **Features:**
  - User registration and login
  - Train and seat availability
  - Ticket booking and management
  - Admin interface for managing trains and bookings

---

## Presentations
- `CafeKioskPPT.pptx` and `RTBS_Presentation.pptx` provide overviews and demonstrations of each project.
- Zipped folders contain packaged versions of the projects for easy sharing or deployment.

---

## Getting Started

### FinalCafeKiosk
1. See `FinalCafeKiosk/README.md` for setup and usage instructions.

### RTBS
1. Navigate to `RTBS/railway/`.
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Start the server: `python manage.py runserver`

---

## License
This repository is for educational purposes. You may adapt the code for your own learning or demonstration needs.
