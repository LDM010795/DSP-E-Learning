/**
 * Video API Endpoints (spezifisch)
 *
 * Video-spezifische API-Funktionen (z.B. Presign per Content-ID)
 */

import api from "./api";

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/elearning";

// API Endpoints
export const VIDEO_ENDPOINTS = {
  // Video presigned URL endpoint (Content-ID)
  PRESIGNED_BY_ID: (contentId: number) =>
    `${API_BASE_URL}/modules/videos/${contentId}/url/`,
  // Video presign by key (bleibt vorerst für Rückwärtskompatibilität)
  PRESIGNED_BY_KEY: `${API_BASE_URL}/modules/videos/sign/`,

  // Test endpoint
  TEST: `${API_BASE_URL}/modules/videos/test/`,
} as const;

/**
 * Holt eine presigned URL für ein Video anhand der Content ID
 */
export const getPresignedUrlById = async (contentId: number) => {
  const response = await api.get(VIDEO_ENDPOINTS.PRESIGNED_BY_ID(contentId));
  return response.data;
};

/**
 * Holt eine presigned URL für ein Video anhand des S3 Keys
 */
export const getPresignedUrlByKey = async (key: string) => {
  const response = await api.get(
    `${VIDEO_ENDPOINTS.PRESIGNED_BY_KEY}?key=${encodeURIComponent(key)}`
  );
  return response.data;
};

/**
 * Testet die Video-API-Verbindung
 */
export const testVideoApi = async () => {
  const response = await api.get(VIDEO_ENDPOINTS.TEST);
  return response.data;
};
