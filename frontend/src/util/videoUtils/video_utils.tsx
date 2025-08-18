/**
 * Allgemeine Video Utilities für DSP E-Learning Platform
 *
 * Hilfsfunktionen für Video-URL-Validierung und -Optimierung
 * (Spezifische YouTube/Wasabi Funktionen sind in separaten Dateien)
 */

// Prüft ob ein Video geladen werden kann (HEAD Request)
export const checkVideoAvailability = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "cors",
    });
    return response.ok;
  } catch (error) {
    console.error("Video availability check failed:", error);
    return false;
  }
};

// Optimierte Video-URL für besseres Streaming
export const optimizeVideoUrl = (url: string): string => {
  // Für Wasabi URLs: Stelle sicher dass Range Requests unterstützt werden
  if (url.includes("wasabisys.com")) {
    // URL bleibt gleich, aber Browser macht automatisch Range Requests
    return url;
  }
  return url;
};
