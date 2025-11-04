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
  return label ?? "javascript";
}
