/**
 * mapLanguage (temporary local copy)
 * ------------------------------------------------------------
 * Maps loosely specified language labels (e.g., "py", "TypeScript React")
 * to Prism-compatible language identifiers.
 *
 * Author: DSP development team
 * Date: 30-10-2025
 */

export function mapLanguage(label?: string): string {
  const s = (label || "").toLowerCase();
  if (s.includes("typescript") && s.includes("react")) return "tsx";
  if (s.includes("tsx")) return "tsx";
  if (s.includes("jsx")) return "jsx";
  if (s.includes("type")) return "typescript";
  if (s.includes("ts")) return "typescript";
  if (s.includes("js")) return "javascript";
  if (s.includes("py")) return "python";
  if (s.includes("css")) return "css";
  return s || "javascript";
}
