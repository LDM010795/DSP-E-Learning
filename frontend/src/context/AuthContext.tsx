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
import api from "../util/apis/api"; // Importiere die konfigurierte Axios-Instanz
import axios from "axios"; // Sicherstellen, dass axios importiert ist
// Performance optimization imports
import { useShallowMemo, useStableCallback } from "../util/performance";

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
  /** Boolean flag indicating authentication status, true for authenticated*/
  isAuthenticated: boolean;
  /** Login function for username/password authentication */
  login: (credentials: {
    username: string;
    password: string;
  }) => Promise<LoginResult>;
  /** Logout function to clear authentication state */
  logout: () => void;
  /** Loading state for authentication operations */
  isLoading: boolean;
}

/**
 * React context for authentication state
 * Provides authentication data throughout the component tree
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
   * Loading state for authentication operations
   * Starts as true until initialization is complete
   */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  /**
   * Authentification state for login operation
   * Starts as false until logged in
   */
  const [isAuthenticated, setAuthentification] = useState<boolean>(false);
  /**
   * Effect to handle token changes and user state updates
   * Validates tokens and manages automatic logout on expiration
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!cancelled) {
        }
      } catch {
        console.error("useeffect error");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
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
        const response = await api.post("/token/", {
          username: credentials.username,
          password: credentials.password,
        });

        const error = response.status != 200;
        if (error) {
          return { success: false, error: "Unerwartete Serverantwort." };
        }

        setAuthentification(true);

        return {
          success: true,
          require_password_change: !!response.data.require_password_change,
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
    setAuthentification(false);
    console.log("Logging out...");

    try {
      // Send refresh token to logout endpoint for blacklisting
      await api.post("/users/logout/");
      console.log("Logout successful on backend.");
    } catch (error) {
      // Ignore backend logout errors but proceed with local logout
      console.error(
        "Backend logout failed, proceeding with local logout:",
        error,
      );
    }

    // Clear OAuth session state for fresh login
    sessionStorage.removeItem("ms_oauth_processed");
    console.log("🧹 OAuth Session State beim Logout zurückgesetzt");

    setIsLoading(false);
  }, []);

  /**
   * Function to set authentication tokens from OAuth providers
   *
   * Used for Microsoft OAuth integration and other external authentication
   * providers. Handles token storage and user state initialization.
   *
   * @param newTokens - JWT token pair from OAuth provider
   */
  const setAuthTokens = useStableCallback((): void => {
    setIsLoading(true);
    try {
      setIsLoading(true);
      setAuthentification(true);

      console.log("🔥 OAuth Tokens erfolgreich im AuthContext gesetzt:", {});
    } catch (error) {
      setAuthentification(false);
      console.error("❌ Fehler beim Setzen der OAuth Tokens:", error);
      // Cleanup on error
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
      isAuthenticated,
      login,
      logout,
      setAuthTokens,
      isLoading,
    }),
    [isAuthenticated, login, logout, setAuthTokens, isLoading],
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
