# Hospital Management Backend 🏥

Backend API for a complete hospital workflow: auth, staff setup, patient flow, admissions, billing, payments, dashboard, and audit logs.

## Why This Backend Is Useful 🚀
- OTP-based authentication (email OTP)
- JWT access + refresh token flow
- Role-based authorization (`SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `STAFF`)
- Full relational workflow from hospital creation to payment
- Rate limiting + centralized error handling

## Tech Stack 🛠️
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt
- Brevo email integration for OTP

## Quick Start (Local) ⚡

### 1. Prerequisites
- Node.js `18+`
- MongoDB running locally (or a remote Mongo URI)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Use `backend/.env` and ensure these are set:
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `OTP_EXPIRY`
- Optional for real OTP emails: `BREVO_API_KEY`, `BREVO_FROM_EMAIL`

### 4. Start development server
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

## Docker Run 🐳
From project root:
```bash
docker compose up --build -d
docker compose logs -f backend
docker compose down
```

Services started:
- `mongo` on `27017`
- `backend` on `5000`

## Health & Readiness ❤️
- `GET /` -> `Hospital Management API Running`
- `GET /health`
- `GET /api/health`
- `GET /ready`
- `GET /api/ready`

## Authentication Flow 🔐
1. `POST /api/auth/signup`
2. `POST /api/auth/verify-otp`
3. `POST /api/auth/login`
4. `POST /api/auth/refresh-token`
5. Use `Authorization: Bearer <accessToken>` for protected routes

If Brevo is not configured, OTP is logged in server output for development.

## Main Module Order (Recommended) 🧩
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

## API Contract (Frozen) 📘
Use this as frontend source of truth:
- [`../API_CONTRACT.md`](../API_CONTRACT.md)

## Useful Notes 💡
- All primary routes are under `/api/*`
- Write operations are role-protected
- Standard response contract:
  - success: `{ success, message, data }`
  - error: `{ success: false, message }`
