# Hospital Management Backend

Backend API for hospital operations: authentication, hospitals, departments, doctors, patients, appointments, admissions, billing, payments, dashboard stats, and audit logs.

## Prerequisites
- Node.js 18+
- MongoDB running locally, via Docker, or a remote URI

## Local Setup
```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and set:
- `MONGO_URI`
- `TEST_MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `OTP_EXPIRY`
- optional: `BREVO_API_KEY`, `BREVO_FROM_EMAIL`

Start the backend:
```bash
npm run dev
```

Backend URL:
- `http://localhost:5000`

## Docker Setup
From the project root:
```bash
docker compose up --build -d
docker compose logs -f backend
docker compose down
```

Services:
- MongoDB: `localhost:27017`
- Backend: `localhost:5000`

## Testing
Run from `backend/`:
```bash
npm test
npm run test:all
npm run test:integration
npm run test:reset-db
npm run test:seed-db
```

Current automated coverage includes:
- validation tests
- service regression tests
- end-to-end workflow integration tests

Default test DB:
- `mongodb://127.0.0.1:27017/hms_integration_test`

Override with:
- `TEST_MONGO_URI`

## Health Endpoints
- `GET /health`
- `GET /api/health`
- `GET /ready`
- `GET /api/ready`

## Main Workflow Order
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

## Frontend Integration
See:
- [`FRONTEND_INTEGRATION.md`](./FRONTEND_INTEGRATION.md)

## Auth Flow
1. `POST /api/auth/signup`
2. `POST /api/auth/verify-otp`
3. `POST /api/auth/login`
4. `POST /api/auth/refresh-token`

Protected routes use:
- `Authorization: Bearer <accessToken>`

If Brevo is not configured, OTP is logged in development output.
