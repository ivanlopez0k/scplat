import { Navigate, useLocation } from "react-router-dom";
import { checkAuth } from "../../services/auth.service";
import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactElement;
}

export default function PrivateRoute({ children }: PrivateRouteProps): ReactNode {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAuth().then((status) => {
      setIsAuthenticated(status.authenticated);
    });
  }, []);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
