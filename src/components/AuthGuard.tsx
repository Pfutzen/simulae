
import { Navigate, Outlet } from "react-router-dom";

interface AuthGuardProps {
  requireAuth?: boolean;
  redirectTo?: string;
}

const AuthGuard = ({ requireAuth = true, redirectTo = "/login" }: AuthGuardProps) => {
  const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
