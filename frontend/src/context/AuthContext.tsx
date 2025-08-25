/**
 * Authentication Context for E-Learning DSP Application
 *
 * This module provides a comprehensive authentication system using JWT tokens
 * with performance optimizations and Microsoft OAuth integration support.
 *
 * Features:
 * - JWT-based authentication with access/refresh tokens
 * - Performance-optimized with caching and memoization
 * - Microsoft OAuth integration support
 * - Automatic token refresh handling
 * - Secure localStorage management
 * - Loading state management
 *
 * Architecture:
 * - Context API for global state management
 * - Custom hooks for component integration
 * - Performance utilities for optimal rendering
 * - Comprehensive error handling
 *
 * @author DSP Development Team
 * @version 1.0.0
 */

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

/**
 * JWT token pair structure for authentication
 */
interface AuthTokens {
  /** JWT access token for API requests */
  access: string;
  /** JWT refresh token for token renewal */
  refresh: string;
}

/**
 * API response structure from login endpoint
 * Extends AuthTokens with additional authentication flags
 */
interface LoginApiResponse extends AuthTokens {
  /** Flag indicating if user must change password on next login */
  require_password_change?: boolean;
}

/**
 * Decoded JWT token payload structure
 * Contains user information and permissions
 */
interface DecodedToken extends JwtPayload {
  /** Unique user identifier */
  user_id: number;
  /** Username for display and identification */
  username: string;
  /** Staff permission flag for admin access */
  is_staff?: boolean;
  /** Superuser permission flag for full admin access */
  is_superuser?: boolean;
}

/**
 * Login function return type
 * Provides success status and additional authentication information
 */
interface LoginResult {
  /** Whether login was successful */
  success: boolean;
  /** Flag indicating if password change is required */
  require_password_change?: boolean;
  /** Error message if login failed */
  error?: string;
}

/**
 * Authentication context type definition
 * Defines all authentication-related state and methods
 */
interface AuthContextType {
  /** Decoded user information (null if not authenticated) */
  user: DecodedToken | null;
  /** Boolean flag indicating authentication status */
  isAuthenticated: boolean;
  /** Login function for username/password authentication */
  login: (credentials: {
    username: string;
    password: string;
  }) => Promise<LoginResult>;
  /** Logout function to clear authentication state */
  logout: () => void;
  /** Function to set tokens from OAuth providers (Microsoft, etc.) */
  setAuthTokens: (tokens: AuthTokens) => void;
  /** Loading state for authentication operations */
  isLoading: boolean;
}

/**
 * React context for authentication state
 * Provides authentication data throughout the component tree
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Performance optimization: Advanced cache for token validation
 * Reduces localStorage access and JWT decoding operations
 */
const tokenCache = new AdvancedCache<DecodedToken>({
  storage: "memory",
  ttl: 60000, // 1 minute cache for token validation
  maxSize: 1,
});

/**
 * Authentication Provider Component
 *
 * Provides authentication context to the entire application tree.
 * Handles token management, user state, and authentication operations.
 *
 * Performance Features:
 * - Memoized state initialization to prevent multiple localStorage reads
 * - Token caching to reduce JWT decoding overhead
 * - Stable callbacks to prevent unnecessary re-renders
 * - Shallow memoization of context value
 *
 * @param children - React components that need access to authentication
 * @returns JSX.Element containing the authentication provider
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  /**
   * JWT tokens state
   */
  const [tokens, setTokens] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);

  /**
   * Loading state for authentication operations
   * Starts as true until initialization is complete
   */
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Effect to handle token changes and user state updates
   * Validates tokens and manages automatic logout on expiration
   */
  useEffect(() => {
      let cancelled = false;

      (async () => {
          try {
              const res = await api.post<{ access: string }>("/token/refresh/"); // liest HttpOnly-Cookie serverseitig
              if (!cancelled && res.data?.access) {
                  const decoded = jwtDecode<DecodedToken>(res.data.access);
                  setTokens(res.data.access);
                  setUser(decoded);
                  tokenCache.set("current_user", decoded);
              }
          } catch {
              // keine Konsole mit Sensitivem; einfach als "nicht eingeloggt" weiter
          } finally {
              if (!cancelled) setIsLoading(false);
          }
      })();

      return () => {
          cancelled = true
      };
  }, []);

  /**
   * Login function for username/password authentication
   *
   * Handles standard login flow with JWT token retrieval and storage.
   * Includes comprehensive error handling and loading state management.
   *
   * @param credentials - User login credentials
   * @param credentials.username - Username for authentication
   * @param credentials.password - Password for authentication
   * @returns Promise resolving to login result with success status
   */
  const login = useStableCallback(
    async (credentials: {
      username: string;
      password: string;
    }): Promise<LoginResult> => {
      setIsLoading(true);
        try {
    const res = await api.post<{ access: string; require_password_change?: boolean }>(
      "/token/", credentials, { baseURL: "http://localhost:8000", withCredentials: true } // wichtig: Cookie setzen lassen
    );

    const access = res.data?.access;
    if (!access) {
      return { success: false, error: "Unerwartete Serverantwort." };
    }

    const decoded = jwtDecode<DecodedToken>(access);
    setTokens(access);
    setUser(decoded);
    tokenCache.set("current_user", decoded);

    return {
      success: true,
      require_password_change: !!res.data.require_password_change,
    };
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
    [],
  );

  /**
   * Logout function to clear authentication state
   *
   * Handles both backend logout (token blacklisting) and local cleanup.
   * Clears OAuth session state and redirects appropriately.
   *
   * Features:
   * - Backend token blacklisting
   * - Local storage cleanup
   * - OAuth session state clearing
   * - Performance cache clearing
   */
  const logout = useStableCallback(async () => {
    setIsLoading(true);
  try {
    await api.post("/logout", null, { baseURL: "http://localhost:8000", withCredentials: true });
  } catch {
    // bewusst still – kein Leaken sensibler Infos
  } finally {
    tokenCache.clear();
    setTokens(null);
    setUser(null);

    // Multi-Tab-Sync (optional)
    try { new BroadcastChannel("auth").postMessage({ type: "logout" }); } catch {}

    setIsLoading(false);
  }
}, []);

  /**
   * Function to set authentication tokens from OAuth providers
   *
   * Used for Microsoft OAuth integration and other external authentication
   * providers. Handles token storage and user state initialization.
   *
   * @param newTokens - JWT token pair from OAuth provider
   */
  const setAuthTokens = useStableCallback(async (): Promise<void> => {
    setIsLoading(true);
  try {
    const res = await api.post<{ access: string }>("/token/refresh/", null, { baseURL: "http://localhost:8000", withCredentials: true });
    const access = res.data?.access;
    if (access) {
      const decoded = jwtDecode<DecodedToken>(access);
      setTokens(access);
      setUser(decoded);
      tokenCache.set("current_user", decoded);
    } else {
      setTokens(null);
      setUser(null);
    }
  } catch {
    setTokens(null);
    setUser(null);
  } finally {
    setIsLoading(false);
  }
}, []);

  /**
   * Performance optimization: Memoized context value
   * Prevents unnecessary re-renders of consuming components
   */
  const contextData = useShallowMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      setAuthTokens,
      isLoading,
    }),
    [user, login, logout, setAuthTokens, isLoading],
  );

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 *
 * Provides type-safe access to authentication state and methods.
 * Must be used within an AuthProvider component tree.
 *
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType containing all authentication data and methods
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (isAuthenticated) {
 *   return <div>Welcome, {user?.username}!</div>;
 * }
 *
 * return <LoginForm onLogin={login} />;
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
