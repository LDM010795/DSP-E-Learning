import { useCallback } from "react";
import { reorder } from "../helper/codeLinesHelper";
import { DraggableCodeLine } from "../CodeEditorDragLines";

export function commitReordering(opts: {
  dragId: string | null;
  targetDragIndex: number | null;
  setLines: React.Dispatch<React.SetStateAction<DraggableCodeLine[]>>;
  onChange?: (next: DraggableCodeLine[]) => void;
  onAfterCommit?: () => void;
}) {
  const { dragId, targetDragIndex, setLines, onChange, onAfterCommit } = opts;

  return useCallback(() => {
    if (!dragId || targetDragIndex == null) return;

    setLines((codeLines) => {
      const fromIdx = codeLines.findIndex((codeLine) => codeLine.id === dragId);
      if (fromIdx < 0 || fromIdx === targetDragIndex) return codeLines;

      const next = reorder(codeLines, fromIdx, targetDragIndex);
      onChange?.(next);
      return next;
    });

    onAfterCommit?.();
  }, [dragId, targetDragIndex, setLines, onChange, onAfterCommit]);
}
