import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  // Keine expliziten Props nötig, verwendet Context und Outlet
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Zeige eine Ladeanzeige, während der Auth-Status geprüft wird
    // Dies verhindert ein kurzes Aufblitzen der Login-Seite oder der geschützten Seite
    return <div>Authentifizierung wird geprüft...</div>;
  }

  if (!isAuthenticated) {
    // Benutzer nicht eingeloggt, leite zur Startseite um.
    // Speichere den ursprünglichen Pfad, um nach dem Login dorthin zurückzukehren (optional)
    return <Navigate to="/" state={{ from: location }} replace />;
    // Alternativ: <Navigate to="/login" ... /> wenn es eine separate Login-Seite gäbe
  }

  // Benutzer ist eingeloggt, rendere die angeforderte Route
  return <Outlet />; // Rendert die Kind-Route (z.B. <Dashboard />)
};

export default ProtectedRoute;
