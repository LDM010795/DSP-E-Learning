/**
 * Wasabi Cloud Storage Utilities
 *
 * Funktionen für Wasabi S3 URL-Verarbeitung und Key-Extraktion
 */

/**
 * Prüft ob eine URL eine Wasabi URL ist
 */
export function isWasabiUrl(url: string): boolean {
  try {
    return new URL(url).host.includes("wasabisys.com");
  } catch {
    return false;
  }
}

/**
 * Extrahiert den S3 Key aus einer Wasabi URL
 * Unterstützt sowohl path-style als auch virtual-host URLs
 */
export function toWasabiKey(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.host;
    const parts = u.pathname.replace(/^\/+/, "").split("/");
    if (!parts.length) return null;

    // Path-style: https://s3.eu-.../bucket/key...
    if (host.startsWith("s3.")) {
      if (parts.length < 2) return null;
      return decodeURIComponent(parts.slice(1).join("/"));
    }

    // Virtual-host: https://bucket.s3.eu-.../key...
    // Einige gespeicherte URLs enthalten fälschlich den Bucket zusätzlich im Pfad.
    // Entferne ihn, falls vorhanden.
    const bucketFromHost = host.split(".s3.")[0];
    const keyParts = parts[0] === bucketFromHost ? parts.slice(1) : parts;
    return decodeURIComponent(keyParts.join("/"));
  } catch {
    return null;
  }
}

/**
 * Prüft ob eine URL eine presigned URL ist
 * Presigned URLs haben X-Amz-* Query-Parameter
 */
export function isPresigned(url: string): boolean {
  try {
    const u = new URL(url);
    const hasSignature = u.searchParams.has("X-Amz-Signature");
    const hasCredential = u.searchParams.has("X-Amz-Credential");
    const hasExpires = u.searchParams.has("X-Amz-Expires");
    return hasSignature || hasCredential || hasExpires;
  } catch {
    return false;
  }
}

/**
 * Prüft ob eine URL eine nackte Wasabi-URL ist (ohne presigned Parameter)
 */
export function isNakedWasabiUrl(url: string): boolean {
  return isWasabiUrl(url) && !isPresigned(url);
}
