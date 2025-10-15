import { JsonContentBlock } from "./types";

/**
 * Konvertiert rohe JSON-Daten in das erwartete JsonContentBlock Format
 */
export const convertToJsonContentBlock = (
  rawData: unknown,
): JsonContentBlock[] => {
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
export const validateContentData = (data: unknown): string[] => {
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

/**
 * Segmentiert sehr lange Textabsätze als Fallback in sinnvolle Abschnitte.
 * Dozenten können Absätze explizit setzen; falls dennoch "Textwände" ankommen,
 * bricht diese Funktion automatisch alle N Wörter.
 */
export const sectionizeFallback = (
  text: string,
  wordsPerSection: number = 150,
): string[] => {
  if (!text) return [];

  // Hilfsfunktion: Sätze robust(er) erkennen. Einfacher Heuristik-Ansatz.
  const splitIntoSentences = (s: string): string[] => {
    // Teilt an ., !, ?, … – behält Satzzeichen am Ende; vermeidet harte Lookbehinds
    const matches = s.match(/[^.!?…]+(?:[.!?…]+|$)/g);
    if (!matches) return [s.trim()];
    return matches.map((m) => m.trim()).filter(Boolean);
  };

  // Behalte vorhandene Absätze bei; segmentiere nur Absätze, die zu lang sind
  const paragraphs = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const resultSections: string[] = [];

  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    const sentences = splitIntoSentences(trimmed);
    let buffer = "";
    let wordCount = 0;
    const flush = () => {
      if (buffer.trim()) resultSections.push(buffer.trim());
      buffer = "";
      wordCount = 0;
    };

    for (const sentence of sentences) {
      const w = sentence.split(/\s+/).filter(Boolean).length;
      if (wordCount > 0 && wordCount + w > wordsPerSection) {
        flush();
      }
      buffer += (buffer ? " " : "") + sentence;
      wordCount += w;
    }
    flush();

    // Letzten zu kurzen Abschnitt mit vorherigem mergen, um Mini-Fragmente zu vermeiden
    if (
      resultSections.length >= 2 &&
      resultSections[resultSections.length - 1].split(/\s+/).length <
        Math.max(20, Math.floor(wordsPerSection / 3))
    ) {
      const last = resultSections.pop() as string;
      const prev = resultSections.pop() as string;
      resultSections.push(prev + " " + last);
    }
  }

  return resultSections;
};

// Erweiterte Absatzbildung (Deutsch) – Satzbasiert, Abkürzungs- und Code-sensibel
export type ParagraphingOptions = {
  minWords?: number;
  targetWords?: number;
  maxWords?: number;
};

const DE_CONNECTORS = new Set([
  "Allerdings",
  "Jedoch",
  "Darüber",
  "Darüber hinaus",
  "Außerdem",
  "Ferner",
  "Zudem",
]);

const DE_ABBRS = new Set([
  "z. B.",
  "z.B.",
  "u. a.",
  "u.a.",
  "bzw.",
  "ca.",
  "Abs.",
  "Nr.",
  "S.",
  "Dr.",
  "Dipl.-Ing.",
  "u. Ä.",
  "usw.",
  "vgl.",
]);

const SQL_KEYWORDS =
  /(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/;

function isLikelyCode(text: string): boolean {
  if (/^```/.test(text.trim())) return true;
  const sym = (text.match(/[`{}[\]|<>;=]/g) ?? []).length;
  const tokens = text.trim().split(/\s+/).length || 1;
  const symDensity = sym / tokens;
  return symDensity > 0.25 || SQL_KEYWORDS.test(text) || /\|.*\|/.test(text);
}

function isAbbreviationToken(token: string): boolean {
  return DE_ABBRS.has(token);
}

function splitSentencesDEAdvanced(text: string): string[] {
  // Intl.Segmenter verfügbar?
  if (
    typeof (Intl as unknown as { Segmenter?: unknown }).Segmenter === "function"
  ) {
    // Typ-Schranke aufheben nur lokal
    const Seg: any = (Intl as any).Segmenter; // eslint-disable-line @typescript-eslint/no-explicit-any
    const seg = new Seg("de", { granularity: "sentence" });
    const segments = Array.from(seg.segment(text)) as Array<{
      segment: string;
    }>;
    return segments.map((s) => String(s.segment).trim()).filter(Boolean);
  }
  const pieces = text.split(/([.!?…])\s+(?=[A-ZÄÖÜ])/g);
  const out: string[] = [];
  for (let i = 0; i < pieces.length; i += 2) {
    const main = pieces[i] ?? "";
    const punct = pieces[i + 1] ?? "";
    const sentenceText = (main + (punct || "")).trim();
    if (!sentenceText) continue;
    const last = sentenceText.split(/\s+/).pop() || "";
    if (punct === "." && isAbbreviationToken(last + ".")) {
      pieces[i + 2] = (sentenceText + " " + (pieces[i + 2] ?? "")).trim();
      continue;
    }
    out.push(sentenceText);
  }
  return out;
}

export function autoParagraphSegments(
  raw: string,
  opts: ParagraphingOptions = {},
): string[] {
  const { minWords = 40, targetWords = 100, maxWords = 160 } = opts;
  const sections: string[] = [];

  const blocks = raw.replace(/\r\n/g, "\n").split(/\n{2,}/);
  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;
    if (isLikelyCode(b)) {
      sections.push(b);
      continue;
    }
    const sentences = splitSentencesDEAdvanced(b);
    let buf: string[] = [];
    let wc = 0;
    const flush = () => {
      if (!buf.length) return;
      sections.push(buf.join(" "));
      buf = [];
      wc = 0;
    };
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i];
      const w = s.split(/\s+/).filter(Boolean).length;
      const preferBreak =
        /[:?!]$/.test(s) ||
        (i + 1 < sentences.length &&
          DE_CONNECTORS.has((sentences[i + 1] || "").split(/\s+/)[0] || ""));
      const nextCount = wc + w;
      if (
        (nextCount > targetWords && wc >= minWords) ||
        nextCount > maxWords ||
        (preferBreak && wc >= minWords)
      ) {
        flush();
      }
      buf.push(s);
      wc += w;
    }
    flush();
    const L = sections.length;
    if (
      L >= 2 &&
      sections[L - 1].split(/\s+/).length <
        Math.max(20, Math.floor(targetWords / 3))
    ) {
      const last = sections.pop() as string;
      const prev = sections.pop() as string;
      sections.push((prev + " " + last).trim());
    }
  }
  return sections;
}
