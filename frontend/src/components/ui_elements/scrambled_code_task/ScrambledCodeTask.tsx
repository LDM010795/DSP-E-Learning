import { SubBackground } from "@/components/layouts";
import { memo, useState, useEffect, useMemo } from "react";
import { TaskHeader } from "../shared_task_elements/TaskHeader";
import { TaskSubmitButton } from "../shared_task_elements/TaskSubmitButton";
import { TaskSubmitFeedback } from "../shared_task_elements/TaskSubmitFeedback";
import { useTaskFeedback } from "../shared_task_elements/hooks/useTaskFeedback"
import { scramble } from "./helper/codeLinesHelper";
import ScrambledCodeEditor, { DraggableCodeLine } from "./CodeEditorDragLines";

export interface ScrambledCodeTaskProps {
    title?: string;
    codeToScramble: string[];
    codeLanguage?: string;
    onSubmit?: () => void;
}

export const ScrambledCodeTask = memo<ScrambledCodeTaskProps>(
    ({
        title = "Ordne die Codezeilen in der korrekten Reihenfolge an:",
        codeToScramble,
        codeLanguage = "typescript",
        onSubmit,
    }) => {
        const originalLines: DraggableCodeLine[] = useMemo(
            () =>
                codeToScramble.map((code, i) => ({
                    id: `line-${i + 1}`,
                    code,
                })),
            [codeToScramble]
        );

        // Startzustand: gescramble Sicht (IDs bleiben stabil)
        const [linesToSort, setLinesToSort] = useState<DraggableCodeLine[]>(
            () => scramble(originalLines)
        );
        const { feedback, showSuccess, showError, clear } = useTaskFeedback([linesToSort]);

        // Feedback zurücksetzen, sobald Nutzer weiterarbeitet
        useEffect(() => { clear() }, [linesToSort]);

        const checkResults = () => {
            // 1) Harte Korrektheit (alle Indizes exakt gleich)
            const solved = linesToSort.every((line, index) => line.id === originalLines[index].id);
            if (solved) {
                showSuccess();
                onSubmit?.();
                return;
            }

            // Hilfsfunktion: Länge der Longest Increasing Subsequence (O(n log n))
            function lisLength(arr: number[]): number {
                const tails: number[] = [];
                for (const x of arr) {
                    // binäre Suche
                    let lo = 0, hi = tails.length;
                    while (lo < hi) {
                        const mid = (lo + hi) >>> 1;
                        if (tails[mid] < x) lo = mid + 1; else hi = mid;
                    }
                    tails[lo] = x;
                }
                return tails.length;
            }

            // 2) Relative Ordnung messen (LIS)
            // Map: ID -> Zielindex in der Originalreihenfolge
            const indexOf: Record<string, number> = Object.create(null);
            originalLines.forEach((line, i) => { indexOf[line.id] = i; });

            // positions[i] = Soll-Index des aktuell an Position i stehenden Elements
            const positions = linesToSort.map(l => indexOf[l.id]);

            const lis = lisLength(positions);
            const minMoves = originalLines.length - lis;   // minimale Einfüge-Operationen, um korrekt zu werden
            const relativelyCorrect = lis;  // so viele sind bereits in korrekter relativer Reihenfolge

            showError(`❌ ${relativelyCorrect} von ${originalLines.length} Zeilen in korrekter Reihenfolge · mindestens ${minMoves} Verschiebung(en) nötig.`)
        };

        return (
            <SubBackground>
                {/* --- Header --- */}
                <TaskHeader title={title} />

                <ScrambledCodeEditor
                    lines={linesToSort}
                    codeLanguage={codeLanguage}
                    filename="snippet.ts"
                    onChange={setLinesToSort}
                />

                {/* --- OK-Button --- */}
                <TaskSubmitButton submit={checkResults} />

                {/* --- Feedback unter dem Button --- */}
                {feedback.type && <TaskSubmitFeedback feedback={feedback} />}
            </SubBackground>
        );
    }
);

ScrambledCodeTask.displayName = "ScrambledCodeTask";
export default ScrambledCodeTask;
