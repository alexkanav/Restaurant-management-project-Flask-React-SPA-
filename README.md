# Restaurant Ordering System (Flask + React)

A full-featured, modern restaurant ordering system built with Flask (Python backend) and React (frontend SPA).
Designed for small restaurants, cafes, or as an educational example of a real-world, modular Flask-React application.

---
## Features

### Dynamic Menu Management
Create, update, and display dishes through an intuitive interface.

### Admin & Staff Dashboard
View, process, and complete incoming customer orders.

### Customer Ordering Interface
A clean, responsive UI for placing new orders.

### Order Status Tracking
Track the progress of each order from New → In Progress → Completed.

### Form Handling with react-hook-form
Simplifies form validation and state management.

### JWT-based Authentication
Secure login and protected routes using Flask-JWT-Extended.

### Backend Performance Optimization
Uses Flask-Caching for faster response times.

### API Rate Limiting
Prevent abuse and manage traffic with Flask-Limiter.

### Persistent Database Storage
Powered by Flask-SQLAlchemy, compatible with:
- SQLite
- PostgreSQL
- MySQL
- Any SQLAlchemy-supported DB

### Modular App Structure
Organized via Flask Blueprints (main, auth) for scalability and clarity.

### Environment Variable Configuration
Easily adapt settings for development, testing, or production.

---
## Development Setup

### Backend (Flask)

- Create and activate a virtual environment

- Install dependencies: pip install -r requirements.txt

- Run the server: flask run

### Frontend (React)

- Navigate to the client/ directory

- Install dependencies: npm install

- Start the dev server: npm start

Make sure both frontend and backend servers are running concurrently.

---
## Production Deployment

⚠️ Note: Never use flask run in production!

For deployment:

- Use a WSGI server like Gunicorn

- Serve via a reverse proxy (e.g., Nginx)

- Configure environment variables and production DB

- Optionally use Docker for containerized deployment

---
## License

This project is licensed under the MIT License.
Feel free to use, modify, and distribute it as needed.
