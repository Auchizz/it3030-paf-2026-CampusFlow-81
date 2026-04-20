# Smart Campus Operations Hub

A colorful, user-friendly full-stack project for the **IT3030 PAF Assignment 2026**.

## Tech Stack
- **Backend:** Spring Boot 3, Spring Security, Spring Data JPA, H2 file database, Validation
- **Frontend:** React + Vite + React Router
- **Authentication:** Demo JWT login + Google OAuth2 configuration placeholders
- **CI:** GitHub Actions build workflow

## Business Modules
- Facilities & Assets Catalogue
- Booking Management with conflict checking
- Maintenance & Incident Ticketing
- Notifications panel
- Role-based access (USER / ADMIN / TECHNICIAN)

## Project Structure
- `backend/` Spring Boot REST API
- `frontend/` React client app
- `.github/workflows/ci.yml` CI workflow

## Quick Start

### 1. Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend runs on `http://localhost:8080`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## Demo Accounts
Created automatically on startup:
- Admin: `admin@campus.com` / `Admin@123`
- User: `user@campus.com` / `User@123`
- Technician: `tech@campus.com` / `Tech@123`

## Google OAuth Setup (Optional for assignment)
This project already includes backend placeholders for Google OAuth2. To enable it, set these in `backend/src/main/resources/application.properties` or env vars:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Main REST Endpoints

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`

### Resources
- `GET /api/resources`
- `GET /api/resources/{id}`
- `POST /api/resources`
- `PUT /api/resources/{id}`
- `DELETE /api/resources/{id}`

### Bookings
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/{id}/status`
- `PATCH /api/bookings/{id}/cancel`

### Tickets
- `GET /api/tickets`
- `POST /api/tickets`
- `PATCH /api/tickets/{id}/status`
- `PATCH /api/tickets/{id}/assign`
- `POST /api/tickets/{id}/comments`
- `DELETE /api/tickets/comments/{commentId}`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read`

## Assignment Mapping
- RESTful endpoint naming
- Proper HTTP methods and status codes
- Role-based security
- Validation and meaningful error handling
- H2 **file-based** persistent database
- GitHub Actions workflow included
- Colorful and user-friendly client UI

## Notes
- Ticket image upload is implemented as attachment metadata fields for easier setup. You can extend it to real multipart uploads if needed.
- For viva/demo, the current version is intentionally readable and easy to explain.
