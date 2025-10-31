import { DraggableCodeLine } from "../CodeEditorDragLines";

export function scramble(array: DraggableCodeLine[]): DraggableCodeLine[] {
  if (array.length <= 1)
    return [...array]; // trivial

  let shuffled: DraggableCodeLine[];
  do {
    shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } while (shuffled.some((item, i) => item === array[i]));

  return shuffled;
}

export function reorder(
  list: DraggableCodeLine[],
  from: number,
  to: number)
  : DraggableCodeLine[] {
  const result = [...list];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

export function mapLanguage(label = ""): string {
  const s = label.toLowerCase();
  if (s.includes("typescript") && s.includes("react")) return "tsx";
  if (s.includes("tsx")) return "tsx";
  if (s.includes("jsx")) return "jsx";
  if (s.includes("type") || s.includes("ts")) return "typescript";
  if (s.includes("js")) return "javascript";
  if (s.includes("py")) return "python";
  if (s.includes("css")) return "css";
  return label || "javascript";
}