import { useMemo, JSX } from "react";

export type Line = (JSX.Element | string)[];
export type TextPart = { type: "text"; text: string };
export type BlankPart = { type: "blank"; id: string };
export type ClozePart = TextPart | BlankPart;

/**
 * Baut Code-Zeilen für den Drag&Drop-Modus (arbeitet mit Blank-IDs)
 */
export function useClozeLinesDnD(
  parts: ClozePart[],
  renderBlankById: (blankId: string) => JSX.Element,
): Line[] {
  return useMemo(() => {
    const lines: Line[] = [[]];

    parts.forEach((part) => {
      if (part.type === "text") {
        const chunks = part.text.split("\n");
        chunks.forEach((chunk, ci) => {
          lines[lines.length - 1].push(chunk);
          if (ci < chunks.length - 1) lines.push([]);
        });
      } else {
        lines[lines.length - 1].push(renderBlankById(part.id));
      }
    });

    // Leere Startzeilen entfernen
    while (
      lines.length > 0 &&
      lines[0].every((seg) => typeof seg === "string" && seg.trim() === "")
    ) {
      lines.shift();
    }

    return lines;
  }, [parts, renderBlankById]);
}

/**
 * Baut Code-Zeilen für den TextInput-Modus (arbeitet mit Blank-Indizes)
 */
export function useClozeLinesTextInput(
  parts: Array<TextPart | { type: "blank" }>,
  renderBlankByIndex: (index: number) => JSX.Element,
): Line[] {
  return useMemo(() => {
    const lines: Line[] = [[]];
    let blankIndex = 0;

    parts.forEach((part) => {
      if (part.type === "text") {
        const chunks = part.text.split("\n");
        chunks.forEach((chunk, ci) => {
          lines[lines.length - 1].push(chunk);
          if (ci < chunks.length - 1) lines.push([]);
        });
      } else {
        lines[lines.length - 1].push(renderBlankByIndex(blankIndex++));
      }
    });

    while (
      lines.length > 0 &&
      lines[0].every((seg) => typeof seg === "string" && seg.trim() === "")
    ) {
      lines.shift();
    }

    return lines;
  }, [parts, renderBlankByIndex]);
}
