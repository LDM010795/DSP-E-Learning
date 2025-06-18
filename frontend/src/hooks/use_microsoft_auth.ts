/**
 * Microsoft Organization Authentication Hook
 *
 * Handles Microsoft OAuth2 flows for DSP organization users
 * Separate from main AuthContext for clarity and modularity
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  initiateMicrosoftLogin,
  processMicrosoftCallback,
  getMicrosoftAuthTokens,
  checkOrganizationUserStatus,
  extractOAuthParams,
  cleanupOAuthUrl,
  isOAuthCallback,
  type OrganizationInfo,
  type MicrosoftUser,
} from "../util/apis/microsoft_auth";

interface MicrosoftAuthState {
  isLoading: boolean;
  organizationInfo: OrganizationInfo | null;
  error: string | null;
}

interface MicrosoftLoginResult {
  success: boolean;
  user?: MicrosoftUser;
  organization_info?: OrganizationInfo;
  error?: string;
  redirect_url?: string;
}

export const useMicrosoftAuth = () => {
  const { tokens, isAuthenticated } = useAuth();
  const [state, setState] = useState<MicrosoftAuthState>({
    isLoading: false,
    organizationInfo: null,
    error: null,
  });

  /**
   * Startet Microsoft Organization Login Flow
   */
  const startMicrosoftLogin =
    useCallback(async (): Promise<MicrosoftLoginResult> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await initiateMicrosoftLogin();

        if (response.success) {
          // User zu Microsoft weiterleiten
          window.location.href = response.redirect_url;

          return {
            success: true,
            redirect_url: response.redirect_url,
          };
        } else {
          throw new Error(
            response.message || "Failed to initiate Microsoft login"
          );
        }
      } catch (error: any) {
        const errorMessage =
          error.message || "Microsoft login initiation failed";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    }, []);

  /**
   * Verarbeitet Microsoft OAuth2 Callback
   */
  const handleMicrosoftCallback =
    useCallback(async (): Promise<MicrosoftLoginResult> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // OAuth Parameters aus URL extrahieren
        const oauthParams = extractOAuthParams();

        if (!oauthParams) {
          throw new Error("No valid OAuth parameters found in URL");
        }

        const { code, state } = oauthParams;

        // Callback verarbeiten
        const response = await processMicrosoftCallback(code, state);

        if (response.success) {
          // JWT Tokens im localStorage speichern (wie normaler Login)
          const authTokens = {
            access: response.tokens.access,
            refresh: response.tokens.refresh,
          };
          localStorage.setItem("authTokens", JSON.stringify(authTokens));

          // Organization Info speichern
          setState((prev) => ({
            ...prev,
            organizationInfo: response.organization_info,
            isLoading: false,
          }));

          // URL bereinigen
          cleanupOAuthUrl();

          // Page reload für AuthContext Update
          window.location.reload();

          return {
            success: true,
            user: response.user,
            organization_info: response.organization_info,
          };
        } else {
          throw new Error(response.error || "Microsoft authentication failed");
        }
      } catch (error: any) {
        const errorMessage =
          error.message || "Microsoft callback processing failed";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));

        // URL trotzdem bereinigen
        cleanupOAuthUrl();

        return {
          success: false,
          error: errorMessage,
        };
      }
    }, []);

  /**
   * Prüft Organization Status des aktuellen Users
   */
  const checkOrganizationStatus = useCallback(async (): Promise<boolean> => {
    if (!tokens?.access || !isAuthenticated) {
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await checkOrganizationUserStatus(tokens.access);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          organizationInfo: {
            display_name: response.user.display_name,
            job_title: response.user.job_title,
            department: response.user.department,
            office_location: "",
            account_enabled: response.user.account_enabled,
          },
          isLoading: false,
        }));

        return response.active;
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || null,
          isLoading: false,
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Organization status check failed";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      return false;
    }
  }, [tokens?.access, isAuthenticated]);

  /**
   * Automatische Callback-Behandlung beim Component Mount
   */
  useEffect(() => {
    // Prüfe ob aktuelle URL OAuth Callback Parameter enthält
    if (isOAuthCallback()) {
      console.log("Microsoft OAuth callback detected, processing...");
      handleMicrosoftCallback();
    }

    // Prüfe auf Microsoft Auth Success Parameter (von Backend Redirect) - NEUE SICHERE METHODE
    const handleMicrosoftAuthSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const microsoftAuth = urlParams.get("microsoft_auth");
      const authError = urlParams.get("error");

      if (microsoftAuth === "success") {
        console.log(
          "Microsoft authentication successful, retrieving tokens from session..."
        );
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
          // NEUE SICHERE METHODE: Tokens aus Session via API holen
          const authData = await getMicrosoftAuthTokens();

          if (authData.success) {
            // JWT Tokens im localStorage speichern
            const authTokens = {
              access: authData.tokens.access,
              refresh: authData.tokens.refresh,
            };
            localStorage.setItem("authTokens", JSON.stringify(authTokens));

            // Organization Info speichern
            setState((prev) => ({
              ...prev,
              organizationInfo: authData.organization_info,
              isLoading: false,
            }));

            console.log("Microsoft authentication completed successfully!");

            // URL Parameter bereinigen
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, "", cleanUrl);

            // Prüfe wohin weitergeleitet werden soll
            const redirectTo = urlParams.get("redirect_to") || "dashboard";

            // Falls User nicht bereits auf der Ziel-Route ist, navigiere dorthin
            if (window.location.pathname !== `/${redirectTo}`) {
              console.log(
                `Redirecting to ${redirectTo} after Microsoft login...`
              );
              window.location.href = `/${redirectTo}`;
            } else {
              // Bereits auf Ziel-Route → nur reload für AuthContext Update
              window.location.reload();
            }
          } else {
            throw new Error(
              authData.error || "Failed to retrieve authentication data"
            );
          }
        } catch (error: any) {
          console.error("Failed to retrieve Microsoft auth tokens:", error);
          setState((prev) => ({
            ...prev,
            error: `Microsoft Login fehlgeschlagen: ${error.message}`,
            isLoading: false,
          }));

          // URL Parameter bereinigen
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
        }
      } else if (authError) {
        console.error("Microsoft authentication error:", authError);
        const errorDescription =
          urlParams.get("error_description") || "Authentication failed";
        setState((prev) => ({
          ...prev,
          error: `Microsoft Login fehlgeschlagen: ${errorDescription}`,
          isLoading: false,
        }));

        // URL Parameter bereinigen
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    };

    // Microsoft Auth Success behandeln
    handleMicrosoftAuthSuccess();
  }, [handleMicrosoftCallback]);

  /**
   * Organization Status laden wenn User eingeloggt ist
   */
  useEffect(() => {
    if (isAuthenticated && tokens?.access && !state.organizationInfo) {
      checkOrganizationStatus();
    }
  }, [
    isAuthenticated,
    tokens?.access,
    state.organizationInfo,
    checkOrganizationStatus,
  ]);

  return {
    // State
    isLoading: state.isLoading,
    organizationInfo: state.organizationInfo,
    error: state.error,

    // Actions
    startMicrosoftLogin,
    handleMicrosoftCallback,
    checkOrganizationStatus,

    // Helpers
    isMicrosoftUser: !!state.organizationInfo,
    isOAuthCallback: isOAuthCallback(),

    // Clear error
    clearError: () => setState((prev) => ({ ...prev, error: null })),
  };
};

export default useMicrosoftAuth;
