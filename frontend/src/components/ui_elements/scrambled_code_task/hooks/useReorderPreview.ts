import { useMemo } from "react";
import { DraggableCodeLine } from "../CodeEditorDragLines";
import { reorder } from "../helper/codeLinesHelper";

export function useReorderPreview(
    codeLines: DraggableCodeLine[],
    dragId: string | null,
    targetIndex: number | null
) {
    return useMemo(() => {
        if (!dragId || targetIndex == null)
            return codeLines;

        const from = codeLines.findIndex(codeLine => codeLine.id === dragId);
        if (from < 0 || from === targetIndex)
            return codeLines;

        return reorder(codeLines, from, targetIndex);
    }, [codeLines, dragId, targetIndex]);
}
