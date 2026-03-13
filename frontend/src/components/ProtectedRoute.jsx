import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "./Loader";

export function ProtectedRoute({ roles }) {
  const location = useLocation();
  const { isAuthenticated, booting, appReady, bootError, user } = useAuth();

  if (booting) {
    return <Loader label="Starting application..." />;
  }

  if (bootError) {
    return <div className="app-error">{bootError}</div>;
  }

  if (!appReady) {
    return <div className="app-error">Backend readiness check failed.</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
