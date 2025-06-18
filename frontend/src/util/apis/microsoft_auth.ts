/**
 * Microsoft Organization Authentication API
 *
 * Handles Microsoft OAuth2 flows for DSP organization users
 */

import axios from "axios";

// Basis-URL für Microsoft Services (separater Service)
const MICROSOFT_API_URL =
  import.meta.env.VITE_MICROSOFT_API_URL ||
  "http://127.0.0.1:8000/api/microsoft";

// Separate Axios-Instanz für Microsoft Auth (keine JWT-Interceptors nötig)
const microsoftApi = axios.create({
  baseURL: MICROSOFT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Für Session-basierte State-Verwaltung
});

// --- Types ---

export interface MicrosoftLoginResponse {
  success: boolean;
  message: string;
  redirect_url: string;
  state: string;
  instructions: string[];
}

export interface MicrosoftCallbackRequest {
  code: string;
  state: string;
}

export interface MicrosoftUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface OrganizationInfo {
  display_name: string;
  job_title: string;
  department: string;
  office_location: string;
  account_enabled: boolean;
}

export interface MicrosoftCallbackResponse {
  success: boolean;
  message: string;
  user: MicrosoftUser;
  organization_info: OrganizationInfo;
  tokens: {
    access: string;
    refresh: string;
  };
  expires_in: number;
  error?: string;
  error_code?: string;
}

export interface UserStatusResponse {
  success: boolean;
  active: boolean;
  user: {
    email: string;
    display_name: string;
    job_title: string;
    department: string;
    account_enabled: boolean;
  };
  error?: string;
}

// --- API Functions ---

/**
 * Startet Microsoft Organization Login Flow
 *
 * @returns Promise mit Microsoft Login URL und State
 */
export const initiateMicrosoftLogin =
  async (): Promise<MicrosoftLoginResponse> => {
    try {
      const response = await microsoftApi.get<MicrosoftLoginResponse>(
        "/auth/login/"
      );
      return response.data;
    } catch (error: any) {
      console.error("Microsoft login initiation failed:", error);
      throw new Error(
        error.response?.data?.error || "Failed to initiate Microsoft login"
      );
    }
  };

/**
 * Verarbeitet Microsoft OAuth2 Callback
 *
 * @param code - Authorization Code von Microsoft
 * @param state - State Parameter für Security
 * @returns Promise mit User-Daten und JWT Tokens
 */
export const processMicrosoftCallback = async (
  code: string,
  state: string
): Promise<MicrosoftCallbackResponse> => {
  try {
    const response = await microsoftApi.post<MicrosoftCallbackResponse>(
      "/auth/callback/",
      { code, state }
    );
    return response.data;
  } catch (error: any) {
    console.error("Microsoft callback processing failed:", error);

    // Spezifische Fehlerbehandlung
    if (error.response?.status === 403) {
      throw new Error(
        error.response.data?.error ||
          "Zugriff verweigert: Sie müssen ein aktiver DSP-Mitarbeiter sein."
      );
    }

    throw new Error(
      error.response?.data?.error || "Microsoft authentication failed"
    );
  }
};

/**
 * Prüft den aktuellen Organization-Status des Users
 *
 * @param accessToken - JWT Access Token
 * @returns Promise mit User Status in der Organization
 */
export const checkOrganizationUserStatus = async (
  accessToken: string
): Promise<UserStatusResponse> => {
  try {
    const response = await microsoftApi.get<UserStatusResponse>(
      "/auth/user-status/",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Organization user status check failed:", error);
    throw new Error(
      error.response?.data?.error || "Failed to check organization status"
    );
  }
};

// --- Helper Functions ---

/**
 * Extrahiert OAuth2 Parameters aus URL
 *
 * @param url - URL mit OAuth2 Callback Parameters
 * @returns Object mit code und state, oder null
 */
export const extractOAuthParams = (url: string = window.location.href) => {
  try {
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get("code");
    const state = urlObj.searchParams.get("state");
    const error = urlObj.searchParams.get("error");
    const errorDescription = urlObj.searchParams.get("error_description");

    if (error) {
      throw new Error(errorDescription || error);
    }

    if (code && state) {
      return { code, state };
    }

    return null;
  } catch (error) {
    console.error("Failed to extract OAuth params:", error);
    return null;
  }
};

/**
 * Bereinigt OAuth2 Parameters aus der URL
 */
export const cleanupOAuthUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");

  // URL ohne Parameter setzen
  window.history.replaceState({}, document.title, url.pathname);
};

/**
 * Prüft ob die aktuelle URL OAuth2 Callback Parameters enthält
 */
export const isOAuthCallback = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has("code") && urlParams.has("state");
};

export default microsoftApi;
