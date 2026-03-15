# Hospital Management Backend

Backend API for authentication, hospitals, departments, doctors, patients, appointments, admissions, billing, payments, dashboard stats, and audit logs.

## Prerequisites
- Node.js 18+
- MongoDB running locally, via Docker, or a remote URI
- Firebase project with:
  - Phone Authentication enabled
  - a Web app configured for the frontend
  - a service-account JSON key for the backend

## Local Setup
```bash
cd backend
npm install
```

Set up `backend/.env`:
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `FIREBASE_CREDENTIALS_PATH`

Example:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hms
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_secret
CORS_ORIGIN=http://localhost:3000
FIREBASE_CREDENTIALS_PATH=firebase-key.json
```

Place your Firebase Admin service-account JSON at:
- `backend/firebase-key.json`

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
- Backend API: `localhost:5000`
- Frontend app: `localhost:3000`

## Testing
Run from `backend/`:
```bash
npm test
npm run test:all
npm run test:integration
npm run test:reset-db
npm run test:seed-db
```

Default test DB:
- `mongodb://127.0.0.1:27017/hms_integration_test`

Override with:
- `TEST_MONGO_URI`

## Health Endpoints
- `GET /health`
- `GET /api/health`
- `GET /ready`
- `GET /api/ready`

## Auth Flow
1. Frontend collects signup data
2. Frontend sends phone OTP with Firebase Phone Authentication
3. Frontend verifies the OTP with Firebase
4. Frontend sends `firebaseIdToken` to `POST /api/auth/signup`
5. User logs in with `POST /api/auth/login`
6. Access tokens refresh with `POST /api/auth/refresh-token`

Legacy endpoints:
- `POST /api/auth/verify-otp` -> returns `410`
- `POST /api/auth/resend-otp` -> returns `410`

Protected routes use:
- `Authorization: Bearer <accessToken>`

## Frontend Integration
See:
- [`FRONTEND_INTEGRATION.md`](./FRONTEND_INTEGRATION.md)
