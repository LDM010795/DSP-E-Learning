import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Die Basis-URL wird jetzt über Umgebungsvariablen gesteuert, mit einem Fallback für die lokale Entwicklung.
const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/elearning";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// --- Request Interceptor ---
// simpler interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- Response Interceptor ---
// Behandelt 401-Fehler (Token abgelaufen) und versucht, den Token zu erneuern
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(true);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Prüfe auf 401 Fehler UND dass es nicht die Refresh-Route selbst ist UND dass es kein Wiederholungsversuch ist
    // Der Pfad ist relativ zur baseURL, daher wird "/api" hier entfernt.
    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/token/refresh/") &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/token/") // Ignoriere Login-Endpunkt
    ) {
      if (isRefreshing) {
        // Wenn bereits ein Refresh läuft, füge die Anfrage zur Warteschlange hinzu
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Markiere als Wiederholungsversuch und starte Refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh erfolgt über Cookie → kein Token im Body mehr nötig
        await axios.post(
          `${API_URL}/token/refresh/`,
          {},
          { withCredentials: true },
        );

        processQueue(null);
        return api(originalRequest);
      } catch (_error: any) {
        processQueue(_error);
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    // Für alle anderen Fehler, leite sie einfach weiter
    return Promise.reject(error);
  },
);

export default api;
