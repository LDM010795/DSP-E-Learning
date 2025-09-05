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

interface UserData {
  date_joined: string;
  email: string;
  first_name: string;
  force_password_change: boolean;
  full_name: string;
  /** Unique user identifier */
  user_id: number;
  is_active: boolean;

  /** Staff permission flag for admin access */
  is_staff?: boolean;
  /** Superuser permission flag for full admin access */
  is_superuser?: boolean;
  last_login: string;
  last_name: string;
  /** Username for display and identification */
  username: string;
}

/**
 * Authentication context type definition
 * Defines all authentication-related state and methods
 */
interface AuthContextType {
  user?: UserData;
  /** Boolean flag indicating authentication status, true for authenticated*/
  isAuthenticated: boolean;
  /** Login function for username/password authentication */
  login: (credentials: {
    username: string;
    password: string;
  }) => Promise<LoginResult>;
  /** Logout function to clear authentication state */
  logout: () => void;
  /** Function to set Authentification status from OAuth providers, automatically fetches user data*/
  setOAuthLogin: (dummy: null) => void;
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
   * Handle user data using /users/me api endpoint
   */
  const [user, setUser] = useState<UserData | undefined>(undefined);
  /**
   * Effect to handle token changes and user state updates
   * Checks with server if current cookies are usable
   */
  useEffect(() => {

      const fetchUserData = async () => {
          try {
          const response = await api.get("users/me");
          if (response.status == 200){
              setUser(response.data);
              setAuthentification(true)
          }
            else {
                console.error(response.statusText);
          }
        } catch (error) {
          console.error(error);
        }
        finally {
              setIsLoading(false)
          }
      }

      fetchUserData();

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

        // set user information
        try {
          const response = await api.get("users/me");
          setUser(response.data);
        } catch {
          console.error("Nutzerdaten nicht gefunden");
        }

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
  const setOAuthLogin = useStableCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      setAuthentification(true);
      // set user information
      const response = await api.get("users/me");
      setUser(response.data);

      console.log(
        "Nutzer eingeloggt und Daten auf elearning Plattform gefunden",
      );
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
      user,
      isAuthenticated,
      login,
      logout,
      setOAuthLogin,
      isLoading,
    }),
    [user, isAuthenticated, login, logout, setOAuthLogin, isLoading],
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
