# Frontend

React + Vite frontend for the existing hospital management backend.

## Local setup

1. Create `frontend/.env`
2. Add:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

3. Install dependencies:

```powershell
npm.cmd install
```

4. Start the dev server:

```powershell
npm.cmd run dev
```

5. Build for production:

```powershell
npm.cmd run build
```

## Backend assumptions

- Backend readiness is checked through `/api/ready`
- Protected requests use `Authorization: Bearer <accessToken>`
- Access tokens refresh through `/api/auth/refresh-token`
- `response.data` is treated as the stable payload surface
- Many operational pages depend on the active hospital selected in the app shell
- Signup requires email verification via OTP sent to your email address.
