# Hospital Management System

Full-stack hospital management system with a React frontend, Express backend, MongoDB, and Firebase Phone Authentication for signup verification.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT + Firebase Phone Authentication

## Project Structure
```text
hospital-management-system/
|-- backend/
|-- frontend/
|-- docker-compose.yml
|-- API_CONTRACT.md
|-- TESTING_GUIDE.md
|-- INTEGRATION_TESTING.md
```

## Required Setup

### Frontend env
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Backend env
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hms
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_secret
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=50
TRUST_PROXY=false
FIREBASE_CREDENTIALS_PATH=firebase-key.json
```

### Firebase setup
In Firebase Console:
1. Create a Firebase project
2. Add a Web app
3. Copy the Firebase web config into `frontend/.env`
4. Enable `Authentication -> Sign-in method -> Phone`
5. Generate a service-account private key
6. Save that file locally as `backend/firebase-key.json`

Do not commit `backend/firebase-key.json`.

## How To Run

### Option 1: Docker Compose
From the project root:
```bash
docker compose up --build -d
docker compose ps
```

App URLs:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

Logs:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Stop:
```bash
docker compose down
```

### Option 2: Run Locally

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Make sure MongoDB is running locally on:
- `mongodb://localhost:27017/hms`

## Signup Flow
1. Open the frontend
2. Fill in signup details
3. Go to verify page
4. Send OTP with Firebase
5. Enter the OTP from the phone
6. Complete signup
7. Log in with email and password

Notes:
- `POST /api/auth/verify-otp` is now legacy and returns `410`
- `POST /api/auth/resend-otp` is now legacy and returns `410`

## Main API Workflow
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

## Testing
From `backend/`:
```bash
npm test
npm run test:all
npm run test:integration
```

Additional docs:
- [API_CONTRACT.md](./API_CONTRACT.md)
- [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md)
- [backend/FRONTEND_INTEGRATION.md](./backend/FRONTEND_INTEGRATION.md)
