import { z } from "zod";

// Schema für Content-Daten
const ChapterSchema = z.object({
  content: z.array(
    z.object({
      type: z.string(),
      text: z.string().optional(),
      items: z.array(z.string()).optional(),
      src: z.string().optional(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      language: z.string().optional(),
      level: z.number().optional(),
      title: z.string().optional(),
      author: z.string().optional(),
      date: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  ),
});

export type ContentData = z.infer<typeof ChapterSchema>;

/**
 * Lädt Content-Daten für ein bestimmtes Kapitel
 */
export async function loadContentChapter(
  chapter: "1.1" | "1.2",
): Promise<
  { success: true; data: ContentData } | { success: false; error: string }
> {
  try {
    const res = await fetch(`/content/${chapter}.json`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const raw = await res.json();
    const data = ChapterSchema.parse(raw);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Validiert Content-Daten und gibt Warnungen zurück
 */
export function validateContentData(d: ContentData): string[] {
  const warnings: string[] = [];

  d.content.forEach((block, i) => {
    if (block.type === "image" && !block.src) {
      warnings.push(`Block #${i} hat kein "src"`);
    }
    if (block.type === "code" && !block.language) {
      warnings.push(`Block #${i} hat keine "language"`);
    }
  });

  return warnings;
}

/**
 * Gibt verfügbare Kapitel zurück
 */
export function getAvailableChapters(): string[] {
  return ["1.1", "1.2"];
}
