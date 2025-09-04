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
    const sanitized = url.replace(/\s/g, "%20");
    return new URL(sanitized).host.includes("wasabisys.com");
  } catch {
    // Fallback: simple string check, auch wenn URL Parsing wegen Leerzeichen fehlschlägt
    return typeof url === "string" && url.includes("wasabisys.com");
  }
}

/**
 * Extrahiert den S3 Key aus einer Wasabi URL
 * Unterstützt sowohl path-style als auch virtual-host URLs
 */
export function toWasabiKey(url: string): string | null {
  try {
    const sanitized = url.replace(/\s/g, "%20");
    const u = new URL(sanitized);
    const host = u.host;
    const parts = u.pathname.replace(/^\/+/, "").split("/");
    if (!parts.length) return null;

    // Path-style: https://s3.eu-.../bucket/key...
    if (host.startsWith("s3.")) {
      if (parts.length < 2) return null;
      return decodeURIComponent(parts.slice(1).join("/"));
    }

    // Virtual-host: https://bucket.s3.eu-.../key...
    const bucketFromHost = host.split(".s3.")[0];
    const keyParts = parts[0] === bucketFromHost ? parts.slice(1) : parts;
    return decodeURIComponent(keyParts.join("/"));
  } catch {
    // Fallback Parsing ohne URL-API (z.B. wenn Leerzeichen enthalten sind)
    try {
      const idx = url.indexOf("wasabisys.com");
      if (idx === -1) return null;
      // Alles nach der Domain nehmen und führende Slashes entfernen
      const after = url.slice(idx + "wasabisys.com".length);
      const path = after.replace(/^.*?\//, ""); // entferne evtl. ersten Segment (Bucket in Host oder Pfad)
      const cleaned = path.replace(/^\/+/, "");
      return decodeURIComponent(cleaned);
    } catch {
      return null;
    }
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
