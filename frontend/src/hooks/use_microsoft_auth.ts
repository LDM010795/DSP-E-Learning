/**
 * React Hook für sichere Microsoft Organization Authentication
 *
 * Implementiert OAuth2-Flow mit temporären Auth-Codes für sichere Token-Übertragung
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  startMicrosoftLogin,
  getMicrosoftTokens,
  extractAuthCodeFromUrl,
  cleanupUrlAfterAuth,
  MicrosoftTokensResponse,
} from "../util/apis/microsoft_auth";

interface UseMicrosoftAuthReturn {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginWithMicrosoft: () => Promise<void>;
  handleAuthCallback: () => Promise<void>;
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
   * Verarbeitet OAuth2 Callback nach Microsoft Redirect
   */
  const handleAuthCallback = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Auth-Code und Status aus URL extrahieren
      const {
        authCode,
        success,
        error: urlError,
        errorDescription,
      } = extractAuthCodeFromUrl();

      // 2. Fehler-Behandlung
      if (urlError) {
        throw new Error(errorDescription || urlError);
      }

      if (!success || !authCode) {
        throw new Error("Microsoft authentication was not successful");
      }

      // 3. SICHER: Tokens per JSON mit Auth-Code abholen
      const tokenResponse: MicrosoftTokensResponse = await getMicrosoftTokens(
        authCode
      );

      if (!tokenResponse.success) {
        throw new Error(
          tokenResponse.message || "Failed to get authentication tokens"
        );
      }

      // 4. Tokens direkt im localStorage speichern (wie normaler Login)
      const authTokens = {
        access: tokenResponse.tokens.access,
        refresh: tokenResponse.tokens.refresh,
      };
      localStorage.setItem("authTokens", JSON.stringify(authTokens));

      // 5. URL aufräumen (keine sensiblen Daten)
      cleanupUrlAfterAuth();

      // 6. Zu Dashboard weiterleiten
      navigate("/dashboard");

      console.log("Microsoft authentication successful:", {
        user: tokenResponse.user.email,
        role: tokenResponse.role_info.role_name,
        groups: tokenResponse.role_info.groups,
        permissions: tokenResponse.role_info.permissions,
        organization: tokenResponse.organization_info.display_name,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication callback failed";
      setError(errorMessage);
      console.error("Microsoft auth callback error:", err);

      // Bei Fehler zur Login-Seite zurück
      cleanupUrlAfterAuth();
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Automatische Callback-Behandlung bei Page Load
   */
  useEffect(() => {
    // Prüfen ob es ein Microsoft Auth Callback ist
    const { success, authCode, error: urlError } = extractAuthCodeFromUrl();

    if (success && authCode) {
      // Positive Callback - Tokens holen
      handleAuthCallback();
    } else if (urlError) {
      // Fehler-Callback
      setError(`Microsoft authentication failed: ${urlError}`);
      cleanupUrlAfterAuth();
    }
  }, [handleAuthCallback]);

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
    handleAuthCallback,
    clearError,
  };
};
