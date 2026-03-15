# Integration Testing Guide

End-to-end workflow for the Firebase-based signup flow and the hospital management APIs.

## Prerequisites

Before testing, confirm:
- `frontend/.env` contains the Firebase web config (optional, for future features)
- `backend/.env` contains email SMTP settings for OTP
- Email authentication is working

## Start the Project

From the project root:
```bash
docker compose up --build -d
docker compose ps
docker compose logs -f backend
```

Expected URLs:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

Health checks:
```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/ready
```

## Authentication Flow

Authentication is now completed from the frontend UI, not by calling `/api/auth/verify-otp`.

Steps:
1. Open `http://localhost:3000`
2. Go to signup
3. Enter:
   - name
   - email
   - password
   - role
4. Continue to the verify page
5. Click `Send OTP`
6. Enter the OTP received on the email
7. Submit verification to complete account creation
8. Log in with email and password

Expected result:
- user account is created in MongoDB
- login returns `accessToken` and `refreshToken`

Legacy auth endpoints:
- `POST /api/auth/verify-otp` returns `410`
- `POST /api/auth/resend-otp` returns `410`

## API Workflow After Login

Recommended order:
1. Create hospital
2. Create department
3. Create doctor
4. Create patient
5. Create appointment
6. Create ward
7. Create room
8. Create bed
9. Create admission
10. Create billing
11. Create payment
12. Check dashboard stats
13. Check audit logs

## Manual API Examples

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "password": "TestPass123!"
  }'
```

Create hospital:
```bash
curl -X POST http://localhost:5000/api/hospitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "City Hospital",
    "address": "123 Main Street",
    "phone": "2125551234"
  }'
```

List hospitals:
```bash
curl -X GET http://localhost:5000/api/hospitals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Firebase phone auth does not send OTP
- Note: Phone authentication has been removed. OTP is sent via email now.

### Backend says Firebase credentials are missing
- confirm `backend/firebase-key.json` exists
- confirm `backend/.env` contains `FIREBASE_CREDENTIALS_PATH=firebase-key.json`
- restart the backend after adding the key

### Frontend cannot reach backend
- confirm backend is running on `http://localhost:5000`
- confirm `frontend/.env` contains `VITE_API_BASE_URL=http://localhost:5000`

### MongoDB errors
- confirm the `mongo` container is running
- run `docker compose ps`
- restart with `docker compose up --build -d`
