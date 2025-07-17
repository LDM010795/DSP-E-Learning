/**
 * Microsoft Organization Authentication API
 *
 * GENERISCHE API für Microsoft Authentication - Routing wird im Frontend gehandhabt
 */

import axios from "axios";

// Basis-URL für Microsoft Services
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
  tool_slug?: string;
}

export interface MicrosoftAuthResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
  };
  role_info: {
    role_name: string;
    groups: string[];
    is_staff: boolean;
    is_superuser: boolean;
    permissions: {
      can_access_admin: boolean;
      can_manage_users: boolean;
      can_manage_content: boolean;
    };
  };
  organization_info: {
    display_name: string;
    job_title: string;
    department: string;
    office_location: string;
    account_enabled: boolean;
  };
  tokens: {
    access: string;
    refresh: string;
  };
  expires_in: number;
}

export interface MicrosoftUserStatusResponse {
  success: boolean;
  active: boolean;
  user?: {
    email: string;
    display_name: string;
    job_title: string;
    department: string;
    account_enabled: boolean;
  };
  error?: string;
}

export interface MicrosoftErrorResponse {
  success: false;
  error: string;
  error_code?: string;
}

// --- API Functions ---

/**
 * 1. Startet Microsoft Organization Login Flow
 */
export const startMicrosoftLogin = (): void => {
  const loginUrl = `${MICROSOFT_API_URL}/auth/login/e-learning/`;
  // Direkte Navigation statt AJAX-Aufruf, um CORS-Redirect-Probleme zu umgehen
  window.location.href = loginUrl;
};

/**
 * 2. GENERISCHE API: Sendet OAuth Code und State für Authentication
 */
export const authenticateWithMicrosoft = async (
  callbackData: MicrosoftCallbackRequest
): Promise<MicrosoftAuthResponse> => {
  try {
    const response = await microsoftApi.post<MicrosoftAuthResponse>(
      "/auth/callback/e-learning/",
      callbackData
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    throw new Error(
      axiosError.response?.data?.error ||
        "Failed to authenticate with Microsoft"
    );
  }
};

/**
 * 3. Prüft Organization User Status
 */
export const checkMicrosoftUserStatus = async (
  accessToken: string
): Promise<MicrosoftUserStatusResponse> => {
  try {
    const response = await microsoftApi.get<MicrosoftUserStatusResponse>(
      "/auth/user-status/",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    throw new Error(
      axiosError.response?.data?.error || "Failed to check user status"
    );
  }
};

// --- Utility Functions ---

/**
 * Extrahiert Auth-Code und State aus URL-Parametern (nach Microsoft Redirect)
 */
export const extractCallbackFromUrl = (): {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
} => {
  const urlParams = new URLSearchParams(window.location.search);

  return {
    code: urlParams.get("code") || undefined,
    state: urlParams.get("state") || undefined,
    error: urlParams.get("error") || undefined,
    errorDescription: urlParams.get("error_description") || undefined,
  };
};

/**
 * Räumt URL-Parameter nach Microsoft OAuth auf
 */
export const cleanupUrlAfterAuth = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");

  window.history.replaceState({}, document.title, url.toString());
};

export default {
  startMicrosoftLogin,
  authenticateWithMicrosoft,
  checkMicrosoftUserStatus,
  extractCallbackFromUrl,
  cleanupUrlAfterAuth,
};
