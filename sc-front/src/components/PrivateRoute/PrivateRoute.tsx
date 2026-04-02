import { Navigate, useLocation } from "react-router-dom";
import { checkAuth } from "../../services/auth.service";
import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactElement;
  adminOnly?: boolean;
}

export default function PrivateRoute({ children, adminOnly }: PrivateRouteProps): ReactNode {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAuth().then((status) => {
      setIsAuthenticated(status.authenticated);
      if (status.user) {
        setUserRole(status.user.role);
      }
    });
  }, []);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect admin users to admin dashboard when accessing /dashboard
  if (userRole === "admin" && !adminOnly) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Redirect non-admin users away from admin dashboard
  if (adminOnly && userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
