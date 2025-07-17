/**
 * Microsoft Authentication Hook - E-Learning DSP Frontend
 *
 * React Hook für Microsoft Organization Authentication:
 * - OAuth2-Flow für Microsoft-Organisationen
 * - Automatische Callback-Verarbeitung
 * - Session-Management und Cleanup
 * - Error-Handling und Loading-States
 *
 * Features:
 * - Generische Microsoft OAuth2-Integration
 * - React StrictMode-kompatibel
 * - Automatische URL-Cleanup
 * - Navigation nach erfolgreicher Authentifizierung
 * - Session-State-Management
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  startMicrosoftLogin,
  authenticateWithMicrosoft,
  extractCallbackFromUrl,
  cleanupUrlAfterAuth,
} from "../util/apis/microsoft_auth";

/**
 * Return-Typ für den Microsoft Auth Hook
 */
interface UseMicrosoftAuthReturn {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginWithMicrosoft: () => Promise<void>;
  handleMicrosoftCallback: () => Promise<void>;
  clearError: () => void;
  resetOAuthSession: () => void;
}

/**
 * Microsoft Authentication Hook
 *
 * Verwaltet den kompletten Microsoft OAuth2-Flow für
 * Organisations-Authentifizierung.
 */
export const useMicrosoftAuth = (): UseMicrosoftAuthReturn => {
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, setAuthTokens } = useAuth();

  // --- React StrictMode Protection ---
  // Verhindert doppelte OAuth-Callback-Verarbeitung
  const callbackProcessedRef = useRef(false);

  /**
   * Startet den Microsoft Login-Flow
   */
  const loginWithMicrosoft = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    // Die Funktion `startMicrosoftLogin` navigiert den Browser direkt
    startMicrosoftLogin();
  }, []);

  /**
   * Verarbeitet Microsoft OAuth2 Callback nach Redirect
   */
  const handleMicrosoftCallback = useCallback(async (): Promise<void> => {
    if (callbackProcessedRef.current) {
      console.log("OAuth Callback wird bereits verarbeitet, überspringe.");
      return;
    }
    callbackProcessedRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      // --- URL-Parameter extrahieren ---
      const {
        code,
        state,
        error: urlError,
        errorDescription,
      } = extractCallbackFromUrl();

      if (urlError) {
        throw new Error(errorDescription || urlError);
      }

      if (!code || !state) {
        // Keine Parameter, also normaler Seitenaufruf
        setIsLoading(false);
        return;
      }

      // --- Tool-Slug aus Environment-Variable verwenden ---
      const effectiveToolSlug =
        import.meta.env.VITE_MICROSOFT_TOOL_SLUG || "e-learning";

      console.log(
        `🚀 Starte Microsoft Authentication für Tool: ${effectiveToolSlug}...`
      );

      // --- Microsoft-Authentifizierung durchführen ---
      const authResponse = await authenticateWithMicrosoft({
        code,
        state,
        tool_slug: effectiveToolSlug,
      });

      if (!authResponse.success) {
        throw new Error(
          authResponse.message || "Microsoft authentication failed"
        );
      }

      // --- Tokens setzen ---
      const authTokens = {
        access: authResponse.tokens.access,
        refresh: authResponse.tokens.refresh,
      };

      setAuthTokens(authTokens);
      cleanupUrlAfterAuth();

      console.log("✅ Microsoft authentication successful.");

      // --- Navigation nach erfolgreicher Authentifizierung ---
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication callback failed";
      setError(errorMessage);
      console.error("❌ Microsoft auth callback error:", err);
      cleanupUrlAfterAuth();
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setAuthTokens]);

  /**
   * Automatische Callback-Behandlung bei Page Load
   */
  useEffect(() => {
    const { code, state } = extractCallbackFromUrl();
    if (code && state) {
      handleMicrosoftCallback();
    }
  }, [handleMicrosoftCallback]);

  /**
   * Fehler zurücksetzen
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Reset OAuth Session State (für Logout)
   * Ermöglicht erneuten Login nach Logout
   */
  const resetOAuthSession = useCallback((): void => {
    callbackProcessedRef.current = false;
    sessionStorage.removeItem("ms_oauth_processed");
    console.log("🧹 OAuth Session State zurückgesetzt");
  }, []);

  return {
    isLoading,
    error,
    isAuthenticated,
    loginWithMicrosoft,
    handleMicrosoftCallback,
    clearError,
    resetOAuthSession,
  };
};
