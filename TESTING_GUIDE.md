# Testing Guide

## Quick Start

### Local Automated Tests
```bash
cd backend
npm install
npm test
```

This runs:
- validation tests
- regression tests
- workflow integration tests

## Test Database Utilities
Run from `backend/`:
```bash
npm run test:reset-db
npm run test:seed-db
```

Default integration test database:
- `mongodb://127.0.0.1:27017/hms_integration_test`

Override with:
- `TEST_MONGO_URI`

## Docker Runtime Testing
From the project root:
```bash
    docker compose up --build -d
docker compose ps
docker compose logs -f backend
```

Health checks:
```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/health
curl http://localhost:5000/ready
curl http://localhost:5000/api/ready
```

## Integration Test Command
```bash
cd backend
npm run test:integration
```

## What Is Covered
- Auth: signup, verify OTP, login, refresh token
- Hospital workflow: hospital -> department -> doctor -> patient -> appointment
- Admission workflow: ward -> room -> bed -> admission -> billing -> payment
- Regression checks for invalid linked IDs and response consistency

## Expected Current Result
```text
Test Suites: 3 passed, 3 total
Tests:       29 passed, 29 total
```

## CI
GitHub Actions workflow:
- `.github/workflows/backend-ci.yml`

It runs:
- dependency install
- test DB reset
- full backend test suite

## Manual API Testing
You can still use:
- `THUNDERCLIENT_COLLECTION.json`
- cURL
- Postman

Recommended manual order:
1. Auth
2. Hospital
3. Department
4. Doctor
5. Patient
6. Appointment
7. Ward
8. Room
9. Bed
10. Admission
11. Billing
12. Payment
