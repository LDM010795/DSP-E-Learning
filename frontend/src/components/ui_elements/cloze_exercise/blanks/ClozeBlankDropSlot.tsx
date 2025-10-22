import { memo, useState } from "react";
import { SolutionWord } from "../SolutionWordBank";
import { CLOZE_BLANK_STYLES, ClozeBlankBaseProps } from "./ClozeBlankBase";

export interface ClozeBlankDropSlotProps extends ClozeBlankBaseProps {
    exerciseId: string; // damit kein Drag'n'Drop aus einer anderen Exercise möglich ist
    currentWord?: Pick<SolutionWord, "id" | "word"> | null; // Drag&Drop-Modus
    onDropWord?: (wordId: string) => void;
    onCtrlClear?: (wordId: string) => void;
}

const ClozeBlankDropSlot = memo<ClozeBlankDropSlotProps>(
    ({
        id,
        exerciseId,
        currentWord = null,
        onDropWord,
        onCtrlClear,
        display_mode: mode = "text",
    }) => {
        const s = CLOZE_BLANK_STYLES[mode];
        const [hovered, setHovered] = useState(false);

        // DnD-Helpers
        const handleDragStart = (
            e: React.DragEvent<HTMLDivElement>,
            wordId: string,
        ) => {
            e.dataTransfer.setData("wordId", JSON.stringify({ exerciseId, wordId }));
        };

        const handleDropEvent = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setHovered(false);
            const raw = e.dataTransfer.getData("wordId");
            if (!raw)
                return;

            const { exerciseId: src, wordId } = JSON.parse(raw);
            if (src !== exerciseId)
                return; // Wort einer fremden Cloze Exercise Blank  → ignorieren

            onDropWord?.(wordId);
        };

        // --- Drag & Drop Modus ---
        return (
            <div
                key={id}
                data-testid={`blank-${id}`}
                onDragEnter={() => setHovered(true)}
                onDragLeave={() => setHovered(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropEvent}
                onClick={(e) => {
                    if ((e.ctrlKey || e.metaKey) && currentWord?.id && onCtrlClear) {
                        e.preventDefault();
                        onCtrlClear(currentWord.id);
                    }
                }}
                className={[s.bankWrap, hovered ? s.bankHover : ""].join(" ")}
            >
                {currentWord && (
                    <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, currentWord.id)}
                        className={s.chip}
                    >
                        {currentWord.word}
                    </div>
                )}
            </div>
        );
    },
);

ClozeBlankDropSlot.displayName = "ClozeBlankDropSlot";
export default ClozeBlankDropSlot;
