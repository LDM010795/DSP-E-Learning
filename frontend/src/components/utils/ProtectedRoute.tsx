import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  // Keine expliziten Props nötig, verwendet Context und Outlet
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) return null; // wait for first check to finish

  if (!isAuthenticated) {
    // Benutzer nicht eingeloggt, leite zur Startseite um.
    // Speichere den ursprünglichen Pfad, um nach dem Login dorthin zurückzukehren (optional)
    return <Navigate to="/" state={{ from: location }} replace />;
    // Alternativ: <Navigate to="/login" ... /> wenn es eine separate Login-Seite gäbe
  }

  // Benutzer ist eingeloggt, rendere die angeforderte Route
  return (
    <>
      <Outlet />
      {isLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              fontWeight: 600,
            }}
          >
            Wird geladen …
          </div>
        </div>
      )}
    </>
  );
};

export default ProtectedRoute;
