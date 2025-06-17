/**
 * Microsoft Organization Authentication Hook
 *
 * Handles Microsoft OAuth2 flows for DSP organization users
 * Separate from main AuthContext for clarity and modularity
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  initiateMicrosoftLogin,
  processMicrosoftCallback,
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
  const navigate = useNavigate();
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

          // Automatisch zum Dashboard navigieren
          console.log(
            "Microsoft login successful, redirecting to dashboard..."
          );
          navigate("/dashboard");

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
    }, [navigate]);

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

    // Microsoft Auth Success Parameter werden jetzt von der Landing Page verarbeitet
    // Das vermeidet doppelte Verarbeitung
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
