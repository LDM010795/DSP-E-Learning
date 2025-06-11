import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Die Basis-URL wird jetzt über Umgebungsvariablen gesteuert, mit einem Fallback für die lokale Entwicklung.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// --- Request Interceptor ---
// Fügt den Access Token zum Authorization Header hinzu, falls vorhanden
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const storedTokens = localStorage.getItem("authTokens");
    if (storedTokens) {
      const tokens = JSON.parse(storedTokens);
      if (tokens?.access) {
        // Nur hinzufügen, wenn es kein Refresh-Request ist (um Endlosschleifen zu vermeiden)
        // Der Pfad ist relativ zur baseURL, daher wird "/api" hier entfernt.
        if (!config.url?.includes("/token/refresh/")) {
          config.headers["Authorization"] = `Bearer ${tokens.access}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// Behandelt 401-Fehler (Token abgelaufen) und versucht, den Token zu erneuern
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
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
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Markiere als Wiederholungsversuch und starte Refresh
      originalRequest._retry = true;
      isRefreshing = true;

      const storedTokens = localStorage.getItem("authTokens");
      if (!storedTokens) {
        isRefreshing = false;
        return Promise.reject(error);
      }
      const refreshToken = JSON.parse(storedTokens).refresh;

      try {
        const rs = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh } = rs.data;
        const newTokens = { access, refresh };
        localStorage.setItem("authTokens", JSON.stringify(newTokens));

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${access}`;
        }
        processQueue(null, access);
        return api(originalRequest);
      } catch (_error: any) {
        processQueue(_error, null);
        localStorage.removeItem("authTokens");
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    // Für alle anderen Fehler, leite sie einfach weiter
    return Promise.reject(error);
  }
);

export default api;
