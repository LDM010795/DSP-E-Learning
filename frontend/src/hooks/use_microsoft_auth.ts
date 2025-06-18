/**
 * React Hook für generische Microsoft Organization Authentication
 *
 * Implementiert direkten JSON-API Ansatz für generische Software-Nutzung
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  startMicrosoftLogin,
  authenticateWithMicrosoft,
  extractCallbackFromUrl,
  cleanupUrlAfterAuth,
  MicrosoftAuthResponse,
} from "../util/apis/microsoft_auth";

interface UseMicrosoftAuthReturn {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginWithMicrosoft: () => Promise<void>;
  handleMicrosoftCallback: () => Promise<void>;
  clearError: () => void;
}

export const useMicrosoftAuth = (): UseMicrosoftAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  /**
   * Startet den Microsoft Login-Flow
   */
  const loginWithMicrosoft = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Login URL von Backend holen
      const loginResponse = await startMicrosoftLogin();

      if (!loginResponse.success || !loginResponse.redirect_url) {
        throw new Error("Failed to generate Microsoft login URL");
      }

      // 2. Zu Microsoft OAuth2 weiterleiten
      window.location.href = loginResponse.redirect_url;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Microsoft login failed";
      setError(errorMessage);
      console.error("Microsoft login error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verarbeitet Microsoft OAuth2 Callback nach Redirect
   */
  const handleMicrosoftCallback = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Code und State aus URL extrahieren
      const {
        code,
        state,
        error: urlError,
        errorDescription,
      } = extractCallbackFromUrl();

      // 2. Fehler-Behandlung
      if (urlError) {
        throw new Error(errorDescription || urlError);
      }

      if (!code || !state) {
        throw new Error("Missing code or state parameter from Microsoft");
      }

      // 3. DIREKTE API: Authentication mit Code und State
      const authResponse: MicrosoftAuthResponse =
        await authenticateWithMicrosoft({
          code,
          state,
        });

      if (!authResponse.success) {
        throw new Error(
          authResponse.message || "Microsoft authentication failed"
        );
      }

      // 4. Tokens direkt im localStorage speichern (wie normaler Login)
      const authTokens = {
        access: authResponse.tokens.access,
        refresh: authResponse.tokens.refresh,
      };
      localStorage.setItem("authTokens", JSON.stringify(authTokens));

      // 5. URL aufräumen (keine sensiblen Daten)
      cleanupUrlAfterAuth();

      // 6. Zum Dashboard weiterleiten (Frontend-spezifisches Routing)
      navigate("/dashboard");

      console.log("Microsoft authentication successful:", {
        user: authResponse.user.email,
        role: authResponse.role_info.role_name,
        groups: authResponse.role_info.groups,
        permissions: authResponse.role_info.permissions,
        organization: authResponse.organization_info.display_name,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication callback failed";
      setError(errorMessage);
      console.error("Microsoft auth callback error:", err);

      // Bei Fehler URL aufräumen und zur Startseite
      cleanupUrlAfterAuth();
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Automatische Callback-Behandlung bei Page Load
   */
  useEffect(() => {
    // Prüfen ob es Microsoft OAuth Callback-Parameter gibt
    const { code, state, error: urlError } = extractCallbackFromUrl();

    if (code && state) {
      // Positive Callback - Authentication durchführen
      handleMicrosoftCallback();
    } else if (urlError) {
      // Fehler-Callback
      setError(`Microsoft authentication failed: ${urlError}`);
      cleanupUrlAfterAuth();
    }
  }, [handleMicrosoftCallback]);

  /**
   * Fehler zurücksetzen
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    isAuthenticated,
    loginWithMicrosoft,
    handleMicrosoftCallback,
    clearError,
  };
};
