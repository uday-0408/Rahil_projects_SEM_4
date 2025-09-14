# FinalCafeKiosk

This project is a full-stack Cafe Kiosk application designed to streamline cafe operations, including menu management, order processing, and user authentication. The project is organized into several key components:

## Project Structure

- **CafeKioskPPT.pptx**: Presentation file describing the project overview and features.
- **cafe-kiosk/**: Main source code for the Cafe Kiosk application.
  - **package.json**: Node.js project configuration and dependencies for the backend.
  - **server.js**: Express.js server entry point for backend APIs.
  - **client/**: React.js frontend application for the kiosk interface.
    - **package.json**: React app dependencies and scripts.
    - **public/**: Static assets (HTML, images, manifest, etc.).
    - **src/**: Source code for React components and styles.
      - **components/**: Contains all major UI components (AdminPanel, CartPage, LoginPage, MenuPage, etc.).
  - **middleware/**: Express middleware for authentication and admin authorization.
  - **models/**: Mongoose models for MenuItem, Order, and User.
  - **routes/**: Express route handlers for authentication, menu, orders, and users.
  - **scripts/**: Utility scripts (e.g., seedMenu.js for populating the menu).

## Features

- **User Authentication**: Register and login functionality for customers and admins.
- **Menu Management**: Admins can add, update, or remove menu items.
- **Order Processing**: Customers can browse the menu, add items to cart, and place orders.
- **Admin Panel**: Manage users, view orders, and control menu items.
- **Responsive UI**: Modern, user-friendly interface built with React.

## How to Run

1. **Backend Setup**
   - Navigate to `cafe-kiosk/` and run `npm install` to install backend dependencies.
   - Start the backend server with `node server.js`.

2. **Frontend Setup**
   - Navigate to `cafe-kiosk/client/` and run `npm install` to install frontend dependencies.
   - Start the React app with `npm start`.

3. **Access the App**
   - The frontend will typically run on `http://localhost:3000` and the backend on `http://localhost:5000` (or as configured).

## Technologies Used

- **Frontend**: React.js, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT-based authentication

## Folder Overview

- `client/`: React frontend
- `middleware/`: Express middleware for authentication
- `models/`: Mongoose schemas for data models
- `routes/`: API endpoints for app functionality
- `scripts/`: Utility scripts (e.g., seeding the database)

## License

This project is for educational purposes and may be adapted for real-world use with further enhancements.
