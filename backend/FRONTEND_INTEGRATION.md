# Frontend Integration Notes

## Base Setup
- Backend base URL: `http://localhost:5000`
- Protected routes require `Authorization: Bearer <accessToken>`
- Primary API routes live under `/api/*`

## Response Contract
- Prefer reading `response.data` in the frontend
- Some endpoints also expose resource keys like `hospital`, `patient`, `appointments`, or `payments`
- Frontend code should treat `data` as the stable payload surface

## Core UI Workflow
1. Signup -> OTP verification -> login
2. Create hospital
3. Create department
4. Create doctor
5. Create patient
6. Create appointment
7. Create ward -> room -> bed
8. Create admission
9. Create billing
10. Create payment

## Frontend Readiness Checklist
- Handle `401` and `403` responses centrally
- Refresh access tokens via `/api/auth/refresh-token`
- Treat `/api/ready` as the app startup health gate
- Use list endpoints with query params for pagination/filtering
- Prefer optimistic UI only after handling soft-delete behavior

## Test Data Support
- Reset test data: `npm run test:reset-db`
- Seed baseline test data: `npm run test:seed-db`
- Run integration workflow tests: `npm run test:integration`
