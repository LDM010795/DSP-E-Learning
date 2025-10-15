/**
 * YouTube Utilities
 *
 * Funktionen für YouTube URL-Verarbeitung und Video-ID-Extraktion
 */

/**
 * Prüft ob eine URL eine YouTube URL ist
 */
export const isYouTubeUrl = (url: string): boolean => {
  const youtubePatterns = [
    /youtube\.com/,
    /youtu\.be/,
    /youtube-nocookie\.com/,
  ];
  return youtubePatterns.some((pattern) => pattern.test(url));
};

/**
 * Extrahiert Video-ID aus YouTube URL
 */
export const extractVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|vi|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Erstellt eine sichere YouTube Embed URL
 */
export const createYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
};
