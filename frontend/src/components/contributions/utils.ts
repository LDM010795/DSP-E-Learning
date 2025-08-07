import { JsonContentBlock } from "./types";

/**
 * Konvertiert rohe JSON-Daten in das erwartete JsonContentBlock Format
 */
export const convertToJsonContentBlock = (rawData: any): JsonContentBlock[] => {
  if (!rawData || !Array.isArray(rawData)) {
    console.warn("Ungültige JSON-Daten: Kein Array gefunden");
    return [];
  }

  return rawData.map((item, index) => {
    if (!item || typeof item !== "object") {
      console.warn(`Ungültiges Element bei Index ${index}:`, item);
      return { type: "text", text: "Ungültiger Inhalt" };
    }

    return {
      type: item.type || "text",
      text: item.text || "",
      items: item.items || [],
      src: item.src || "",
      alt: item.alt || "",
      caption: item.caption || "",
      language: item.language || "",
      level: item.level || 1,
      title: item.title || "",
      author: item.author || "",
      date: item.date || "",
      tags: item.tags || [],
    };
  });
};

/**
 * Validiert JSON-Daten und gibt Warnungen zurück
 */
export const validateContentData = (data: any): string[] => {
  const warnings: string[] = [];

  if (!data) {
    warnings.push("Keine Daten vorhanden");
    return warnings;
  }

  if (!Array.isArray(data)) {
    warnings.push("Daten sind kein Array");
    return warnings;
  }

  data.forEach((item, index) => {
    if (!item.type) {
      warnings.push(`Element ${index}: Kein Typ angegeben`);
    }

    if (item.type === "image" && !item.src) {
      warnings.push(`Element ${index}: Bild ohne src`);
    }

    if (item.type === "code" && !item.language) {
      warnings.push(`Element ${index}: Code ohne Sprache`);
    }
  });

  return warnings;
};
