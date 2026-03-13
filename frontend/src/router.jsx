import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { AuthLayout } from "./pages/AuthLayout";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { VerifyOtpPage } from "./pages/VerifyOtpPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HospitalsPage } from "./pages/HospitalsPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { DoctorsPage } from "./pages/DoctorsPage";
import { PatientsPage } from "./pages/PatientsPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { InfrastructurePage } from "./pages/InfrastructurePage";
import { AdmissionsPage } from "./pages/AdmissionsPage";
import { FinancePage } from "./pages/FinancePage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { ROLES } from "./lib/constants";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/signup", element: <SignupPage /> },
          { path: "/verify-otp", element: <VerifyOtpPage /> },
          { path: "*", element: <Navigate to="/login" replace /> }
        ]
      }
    ]
  },
  {
    element: (
      <ProtectedRoute
        roles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.STAFF]}
      />
    ),
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/hospitals", element: <HospitalsPage /> },
          { path: "/departments", element: <DepartmentsPage /> },
          { path: "/doctors", element: <DoctorsPage /> },
          { path: "/patients", element: <PatientsPage /> },
          { path: "/appointments", element: <AppointmentsPage /> },
          { path: "/infrastructure", element: <InfrastructurePage /> },
          { path: "/admissions", element: <AdmissionsPage /> },
          { path: "/finance", element: <FinancePage /> },
          { path: "/audit-logs", element: <AuditLogsPage /> }
        ]
      }
    ]
  }
]);
