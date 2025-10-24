import { useMemo } from "react";
import type { ClozePartDragDrop } from "../ClozeExerciseBase";

export type BlankWithId = { type: "blank"; id: string; correct: string[] };
export type PartWithId = { type: "text"; text: string } | BlankWithId;

export function useClozeDragDropParts(
  clozeText: ClozePartDragDrop[],
  opts?: { prefix?: string },
) {
  const { prefix = "b" } = opts ?? {};
  const partsWithIds = useMemo<PartWithId[]>(() => {
    let b = 0;
    return clozeText.map((p) =>
      p.type === "blank" ? { ...p, id: `${prefix}-${b++}` } : p,
    );
  }, [clozeText, prefix]);

  const blanks = useMemo<BlankWithId[]>(
    () => partsWithIds.filter((p): p is BlankWithId => p.type === "blank"),
    [partsWithIds],
  );

  return { partsWithIds, blanks };
}
