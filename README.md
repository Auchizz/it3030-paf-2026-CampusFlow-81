# Smart Campus Operations Hub

Full-stack campus operations system for the IT3030 PAF 2026 project.

## Stack

- Backend: Spring Boot 3, Spring Security, Spring Data JPA
- Database: PostgreSQL on Neon, with H2 fallback for local development
- Frontend: React, Vite, React Router, Axios
- CI: GitHub Actions

## Project Structure

```text
.
├── backend/
│   ├── src/main/java/com/smartcampus/
│   ├── src/main/resources/application.properties
│   ├── src/test/java/com/smartcampus/
│   ├── .env.example
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── .github/workflows/ci.yml
```

## Local Setup

### Backend

Create `backend/.env` from `backend/.env.example`.

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>/<database>?sslmode=require
SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_H2_CONSOLE_ENABLED=false
```

Run the API:

```bash
cd backend
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`.

### Frontend

Create `frontend/.env` if you need to override the default API URL.

```properties
VITE_API_URL=http://localhost:8080/api
```

Run the client:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Build

Backend:

```bash
cd backend
mvn clean compile
```

Frontend:

```bash
cd frontend
npm run build
```

## Demo Accounts

Seeded automatically when the user table is empty:

- Admin: `admin@campus.com` / `Admin@123`
- User: `user@campus.com` / `User@123`
- Technician: `tech@campus.com` / `Tech@123`

## Main API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

User dashboard:

- `GET /api/user/bookings`
- `GET /api/user/tickets`
- `GET /api/user/notifications`

Admin and shared modules:

- `GET /api/users`
- `GET /api/resources`
- `POST /api/resources`
- `PUT /api/resources/{id}`
- `DELETE /api/resources/{id}`
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/{id}/status`
- `PATCH /api/bookings/{id}/cancel`
- `GET /api/tickets`
- `POST /api/tickets`
- `PATCH /api/tickets/{id}/status`
- `PATCH /api/tickets/{id}/assign`
- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read`

## Notes

- Real environment files are ignored by Git.
- Use `.env.example` files as templates for team setup.
- The backend falls back to H2 only when `backend/.env` is not present.
