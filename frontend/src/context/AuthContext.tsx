import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import api from "../util/apis/api"; // Importiere die konfigurierte Axios-Instanz
import axios from "axios"; // Sicherstellen, dass axios importiert ist
// Performance optimization imports
import {
  useShallowMemo,
  useStableCallback,
  AdvancedCache,
} from "../util/performance";

interface AuthTokens {
  access: string;
  refresh: string;
}

// Typ für die Daten, die vom /api/token/ Endpunkt kommen
interface LoginApiResponse extends AuthTokens {
  require_password_change?: boolean; // Optionales Flag
}

interface DecodedToken extends JwtPayload {
  user_id: number;
  username: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  // Füge hier andere erwartete Felder aus deinem JWT Payload hinzu (z.B. username, email)
}

// Typ für die Rückgabe der login Funktion im Context
interface LoginResult {
  success: boolean;
  require_password_change?: boolean;
  error?: string;
}

interface AuthContextType {
  tokens: AuthTokens | null;
  user: DecodedToken | null;
  isAuthenticated: boolean;
  login: (credentials: {
    username: string;
    password: string;
  }) => Promise<LoginResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Performance optimization: Cache for token validation to reduce localStorage access
const tokenCache = new AdvancedCache<DecodedToken>({
  storage: "memory",
  ttl: 60000, // 1 minute cache for token validation
  maxSize: 1,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Performance optimization: Memoized token initialization to prevent multiple localStorage reads
  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    const storedTokens = localStorage.getItem("authTokens");
    return storedTokens ? JSON.parse(storedTokens) : null;
  });

  // Performance optimization: Memoized user initialization with caching
  const [user, setUser] = useState<DecodedToken | null>(() => {
    const storedTokens = localStorage.getItem("authTokens");
    if (storedTokens) {
      try {
        const tokenData = JSON.parse(storedTokens);

        // Check cache first to avoid repeated JWT decoding
        const cachedUser = tokenCache.get("current_user");
        if (cachedUser) {
          return cachedUser;
        }

        const decoded = jwtDecode<DecodedToken>(tokenData.access);
        // Optional: Überprüfe hier die Gültigkeit des Tokens (exp)
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp > currentTime) {
          // Cache the decoded token for performance
          tokenCache.set("current_user", decoded);
          return decoded;
        } else {
          // Token abgelaufen, entferne es
          localStorage.removeItem("authTokens");
          tokenCache.clear();
          return null;
        }
      } catch (error) {
        console.error("Error decoding token on initial load:", error);
        localStorage.removeItem("authTokens"); // Entferne ungültige Tokens
        tokenCache.clear();
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true); // Startet als true, bis Initialisierung abgeschlossen

  useEffect(() => {
    // Dieser Effekt initialisiert nur den User-State basierend auf den Tokens.
    // Das Laden des Zustands aus localStorage geschieht bereits in useState.
    if (tokens) {
      try {
        const decoded = jwtDecode<DecodedToken>(tokens.access);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp > currentTime) {
          setUser(decoded);
        } else {
          console.log(
            "Access token expired on load, attempting refresh or logout needed."
          );
          // Token entfernen und User null setzen
          localStorage.removeItem("authTokens");
          setTokens(null);
          setUser(null);

          // Zur Landingpage weiterleiten
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error decoding token on initial load:", error);
        localStorage.removeItem("authTokens");
        setTokens(null);
        setUser(null);

        // Auch hier zur Landingpage weiterleiten
        window.location.href = "/";
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [tokens]);

  // Performance optimization: Stable callback for login function to prevent unnecessary re-renders
  const login = useStableCallback(
    async (credentials: {
      username: string;
      password: string;
    }): Promise<LoginResult> => {
      setIsLoading(true);
      try {
        const response = await api.post<LoginApiResponse>("/token/", {
          username: credentials.username,
          password: credentials.password,
        });

        const data = response.data;
        if (data && data.access && data.refresh) {
          const newTokens: AuthTokens = {
            access: data.access,
            refresh: data.refresh,
          };
          const decoded = jwtDecode<DecodedToken>(newTokens.access);

          // Performance optimization: Update cache with new user data
          tokenCache.set("current_user", decoded);

          localStorage.setItem("authTokens", JSON.stringify(newTokens));
          setTokens(newTokens);
          setUser(decoded);
          console.log("User logged in, tokens stored.");
          return {
            success: true,
            require_password_change: data.require_password_change ?? false, // Default auf false setzen
          };
        } else {
          return {
            success: false,
            error: "Ungültige Antwort vom Server erhalten.",
          };
        }
      } catch (err: unknown) {
        console.error("Error during login API call:", err);
        let errorMessage =
          "Login fehlgeschlagen. Bitte versuchen Sie es später erneut.";
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            errorMessage = "Ungültige Anmeldedaten.";
          } else if (err.response?.data?.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response?.status === 404) {
            errorMessage = "Login-Service nicht erreichbar.";
          }
        }
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Performance optimization: Stable callback for logout function
  const logout = useStableCallback(async () => {
    setIsLoading(true);
    console.log("Logging out...");
    const storedTokens = localStorage.getItem("authTokens");
    const refreshToken = storedTokens ? JSON.parse(storedTokens).refresh : null;

    if (refreshToken) {
      try {
        // Sende das Refresh-Token an den Logout-Endpunkt
        await api.post("/users/logout/", { refresh_token: refreshToken });
        console.log("Logout successful on backend.");
      } catch (error) {
        // Fehler beim Backend-Logout ignorieren oder loggen, aber trotzdem lokal ausloggen
        console.error(
          "Backend logout failed, proceeding with local logout:",
          error
        );
      }
    }

    // Performance optimization: Clear cache on logout
    tokenCache.clear();

    // Lokale Daten immer entfernen
    localStorage.removeItem("authTokens");
    setTokens(null);
    setUser(null);
    setIsLoading(false);
    // Optional: Navigiere zur Startseite
    // window.location.href = '/'; // Oder useNavigate verwenden
  }, []);

  // Die Token-Refresh-Logik ist jetzt im Axios-Interceptor in api.ts

  // Performance optimization: Memoize context value to prevent unnecessary re-renders
  const contextData = useShallowMemo(
    () => ({
      tokens,
      user,
      isAuthenticated: !!tokens,
      login,
      logout,
      isLoading,
    }),
    [tokens, user, login, logout, isLoading]
  );

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
