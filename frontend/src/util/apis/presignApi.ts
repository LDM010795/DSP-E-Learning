/**
 * Presign API (generisch)
 *
 * Einheitliche API-Funktionen zum Signieren von Cloud-Objekten (Bilder, PDFs, Videos per Key).
 * Für Videos per Content-ID existiert weiterhin der spezifische Video-Endpoint.
 */

import api from "./api";

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/elearning";

export const PRESIGN_ENDPOINTS = {
  SIGN_BY_KEY: `${API_BASE_URL}/modules/storage/sign/`,
} as const;

/**
 * Holt eine presigned URL für beliebige Objekte (z.B. Bilder) anhand des S3 Keys
 */
export const getPresignedByKey = async (key: string) => {
  const response = await api.get(
    `${PRESIGN_ENDPOINTS.SIGN_BY_KEY}?key=${encodeURIComponent(key)}`
  );
  return response.data as {
    presigned_url: string;
    expires_in?: number;
    key?: string;
  };
};
