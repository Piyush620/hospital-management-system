# Hospital Management System Backend 🏥

A production-style backend API for managing hospital operations end-to-end:
auth, staffing, patients, appointments, admissions, billing, payments, analytics, and audit logs.

## Why this project is useful 🚀
- OTP-based onboarding and login flow
- Role-based access control (`SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `STAFF`)
- Full workflow coverage from hospital creation to payment completion
- Secure middleware stack: JWT auth, rate limiting, security headers, centralized errors
- Docker-ready local setup

## API Contract (Frozen) 📘
- Canonical backend contract: [API_CONTRACT.md](./API_CONTRACT.md)
- Use this as frontend source of truth before integration

## Tech Stack 🛠️
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt
- Brevo email OTP integration
- Docker + Docker Compose

## Quick Start ⚡

### Prerequisites
- Node.js `18+`
- MongoDB
- Docker (optional)

### Run locally (without Docker)
```bash
cd backend
npm install
npm run dev
```

Server: `http://localhost:5000`

### Run with Docker
```bash
docker compose up --build
docker compose logs -f backend
docker compose down
```

Services:
- MongoDB on `27017`
- Backend on `5000`

## Health & Readiness ❤️
- `GET /health`
- `GET /api/health`
- `GET /ready`
- `GET /api/ready`

## Authentication Flow 🔐
1. `POST /api/auth/signup`
2. `POST /api/auth/verify-otp`
3. `POST /api/auth/login`
4. `POST /api/auth/refresh-token`

Protected routes use:
`Authorization: Bearer <accessToken>`

If Brevo is not configured, OTP is logged in backend console for development.

## Main API Modules 🧩
- Auth
- Hospitals
- Departments
- Doctors
- Patients
- Appointments
- Wards
- Rooms
- Beds
- Admissions
- Billings
- Payments
- Dashboard Stats
- Audit Logs

## Recommended Data Creation Order 📚
1. Hospital
2. Department
3. Doctor
4. Patient
5. Appointment
6. Ward
7. Room
8. Bed
9. Admission
10. Billing
11. Payment

## Project Docs 📝
- Contract: [API_CONTRACT.md](./API_CONTRACT.md)
- Integration runbook: [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md)
- OTP/Brevo setup: [RESEND_SETUP.md](./RESEND_SETUP.md)
- Backend-focused readme: [backend/README.md](./backend/README.md)

## Environment Essentials 🔧
Set in `backend/.env`:
- `PORT`
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `OTP_EXPIRY`
- Optional email OTP: `BREVO_API_KEY`, `BREVO_FROM_EMAIL`

## Scripts ▶️
Run from `backend/`:
```bash
npm run dev     # development (nodemon)
npm start       # production start
npm test        # configured project tests
```

## Notes 💡
- Main business routes are under `/api/*`
- Write operations are role protected
- Standard success shape: `{ success, message, data }`
- Standard error shape: `{ success: false, message }`
