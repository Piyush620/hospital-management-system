import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "./Loader";

export function PublicRoute() {
  const { isAuthenticated, booting } = useAuth();

  if (booting) {
    return <Loader label="Preparing workspace..." />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
