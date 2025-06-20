/**
 * React Hook für generische Microsoft Organization Authentication
 *
 * Implementiert direkten JSON-API Ansatz für generische Software-Nutzung
 */

import { useState, useEffect, useCallback, useRef } from "react";
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
  resetOAuthSession: () => void;
}

export const useMicrosoftAuth = (): UseMicrosoftAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, setAuthTokens } = useAuth(); // 🔥 setAuthTokens hinzufügen

  // 🔒 React StrictMode Protection: Verhindert doppelte OAuth-Callback-Verarbeitung
  const callbackProcessedRef = useRef(false);
  const isProcessingRef = useRef(false);

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
      setIsLoading(false);
    }
  }, []);

  /**
   * Verarbeitet Microsoft OAuth2 Callback nach Redirect
   */
  const handleMicrosoftCallback = useCallback(async (): Promise<void> => {
    // 🔒 Doppelte Verarbeitung verhindern
    if (isProcessingRef.current) {
      console.log(
        "OAuth Callback wird bereits verarbeitet - überspringe doppelte Ausführung"
      );
      return;
    }

    try {
      isProcessingRef.current = true;
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

      console.log("🚀 Starte Microsoft Authentication mit Backend...");

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

      // 4. 🔥 AuthContext aktualisieren STATT nur localStorage
      const authTokens = {
        access: authResponse.tokens.access,
        refresh: authResponse.tokens.refresh,
      };

      // AuthContext über Login informieren (triggert useEffect und User Update)
      setAuthTokens(authTokens);

      // 5. URL aufräumen (keine sensiblen Daten)
      cleanupUrlAfterAuth();

      console.log("✅ Microsoft authentication successful:", {
        user: authResponse.user.email,
        role: authResponse.role_info.role_name,
        groups: authResponse.role_info.groups,
        permissions: authResponse.role_info.permissions,
        organization: authResponse.organization_info.display_name,
      });

      // 6. Kurze Verzögerung für bessere UX, dann zum Dashboard weiterleiten
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication callback failed";
      setError(errorMessage);
      console.error("❌ Microsoft auth callback error:", err);

      // Bei Fehler URL aufräumen und zur Startseite
      cleanupUrlAfterAuth();
      navigate("/");
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, [navigate]);

  /**
   * Automatische Callback-Behandlung bei Page Load
   * React StrictMode Protection: Verhindert doppelte Ausführung
   */
  useEffect(() => {
    // 🔒 StrictMode Protection: Nur einmal ausführen pro Session
    const sessionKey = "ms_oauth_processed";
    const alreadyProcessed =
      sessionStorage.getItem(sessionKey) === "true" ||
      callbackProcessedRef.current;

    // 🔥 NEU: Wenn User bereits eingeloggt ist, OAuth Callback überspringen
    if (isAuthenticated) {
      console.log("🔒 User bereits eingeloggt - OAuth Callback überspringe");
      return;
    }

    if (alreadyProcessed) {
      console.log(
        "🔒 OAuth Callback bereits verarbeitet in dieser Session - überspringe"
      );
      return;
    }

    // Prüfen ob es Microsoft OAuth Callback-Parameter gibt
    const { code, state, error: urlError } = extractCallbackFromUrl();

    // DEBUG: Log was wir gefunden haben
    if (code || state || urlError) {
      console.log("🔍 Microsoft Auth Hook - URL Parameter gefunden:", {
        code: code ? "vorhanden" : "nicht vorhanden",
        state: state ? "vorhanden" : "nicht vorhanden",
        urlError: urlError || "kein Fehler",
        currentPath: window.location.pathname,
        strictModeProtection: alreadyProcessed ? "AKTIV" : "INAKTIV",
        userAuthenticated: isAuthenticated ? "JA" : "NEIN",
      });
    }

    // Sicherheitscheck: Nur Microsoft Callbacks verarbeiten wenn wir wirklich OAuth Parameter haben
    const hasMicrosoftParams = !!(code && state) || !!urlError;

    // Zusätzlicher Check: Sind wir auf einer Seite wo Microsoft Callbacks erwartet werden?
    const isCallbackPage =
      window.location.pathname === "/" ||
      window.location.pathname === "/login" ||
      window.location.pathname.includes("callback");

    if (hasMicrosoftParams && isCallbackPage) {
      // 🔒 Lock setzen BEVOR wir verarbeiten (doppelte Sicherheit)
      callbackProcessedRef.current = true;
      sessionStorage.setItem(sessionKey, "true");

      // 🔥 Loading aktivieren bei OAuth Callback
      setIsLoading(true);

      if (code && state) {
        console.log("🔄 Verarbeite Microsoft OAuth Callback...");
        // Positive Callback - Authentication durchführen
        handleMicrosoftCallback();
      } else if (urlError) {
        // Fehler-Callback
        setError(`Microsoft authentication failed: ${urlError}`);
        cleanupUrlAfterAuth();
        setIsLoading(false); // Bei Fehler Loading beenden
      }
    } else if (hasMicrosoftParams && !isCallbackPage) {
      // Cleanup hängende OAuth Parameter wenn wir nicht auf einer Callback-Seite sind
      console.log("🧹 Cleanup: Entferne hängende Microsoft OAuth Parameter");
      cleanupUrlAfterAuth();
    }

    // 🧹 Cleanup-Funktion für React StrictMode
    return () => {
      // Lock wird NICHT zurückgesetzt, da OAuth nur einmal pro Session laufen soll
      // Das verhindert StrictMode-bedingte doppelte Ausführung
    };
  }, [handleMicrosoftCallback, isAuthenticated]); // 🔥 isAuthenticated dependency hinzufügen

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
