import { SubBackground } from "@/components/layouts";
import { memo, useState, useEffect, useId } from "react";
import SolutionWordBank from "./SolutionWordBank";
import ClozeBlankDropSlot from "./blanks/ClozeBlankDropSlot";
import ClozeCodingUi from "./ClozeCodingUi";
import {
  ClozeExerciseBaseProps,
  ClozePartDragDrop,
} from "./ClozeExerciseBase";
import { useClozeDragDropParts } from "./hooks/useClozeDragDropParts";
import { useClozeDragDropFunctions } from "./hooks/useClozeDragDropFunctions";
import { useClozeLinesDnD } from "./helpers/clozeLines";
import {
  ClozeHeader,
  ClozeSubmitButton,
  ClozeSubmitFeedback,
} from "./ClozeLayout";
import { userInputMatchesCorrectAnswer } from "./helpers/checkClozeInput";

export interface ClozeExerciseDragDropProps extends ClozeExerciseBaseProps {
  clozeText: ClozePartDragDrop[];

  // add wrong answers to the drag'n'droppable
  // solution words to increase difficulty
  wrongSolutionWords?: string[];
}
export const ClozeExerciseDragDrop = memo<ClozeExerciseDragDropProps>(
  ({
    title = "Fülle die Lücken aus:",
    clozeText,
    wrongSolutionWords = [],
    display_mode: mode,
    languageLabel = "Code",
    onSubmit,
  }) => {
    const exerciseId = `cloze-${useId().replace(/:/g, "")}`;
    const isCodeMode = mode === "code";

    const { partsWithIds, blanks } = useClozeDragDropParts(clozeText, {
      prefix: exerciseId,
    });
    const {
      answers,
      solutionWords, // behalte deinen vorhandenen Namen
      actions: { dropIntoBlank, clearBlank, returnToBank, quickPlace },
      derived: { getUserAnswerText, allFilled },
    } = useClozeDragDropFunctions(blanks, wrongSolutionWords);

    // --- Feedback-State unter dem Button ---
    const [feedback, setFeedback] = useState<{
      type: "success" | "error" | null;
      message: string;
    }>({ type: null, message: "" });

    // Feedback zurücksetzen, sobald der/die Nutzer:in weiterarbeitet
    useEffect(() => {
      if (feedback.type) setFeedback({ type: null, message: "" });
    }, [answers]);

    const renderTextMode = () => (
      <div className="flex flex-wrap gap-1 mb-4 text-lg leading-[1.6]">
        {partsWithIds.map((part, i) => {
          if (part.type === "text") {
            return (
              <span key={`t:${i}`} className="text-gray-600 mt-1">
                {part.text}
              </span>
            );
          }
          const currentAnswerId = answers[part.id];
          const currentWord =
            solutionWords.find((w) => w.id === currentAnswerId) ?? null;
          return (
            <ClozeBlankDropSlot
              key={`b:${part.id}`}
              id={part.id}
              exerciseId={exerciseId}
              currentWord={
                currentWord
                  ? { id: currentWord.id, word: currentWord.word }
                  : null
              }
              onDropWord={(wordId) => dropIntoBlank(part.id, wordId)}
              onCtrlClear={() => clearBlank(part.id)}
              display_mode="text"
            />
          );
        })}
      </div>
    );

    const renderCodeMode = () => {
      const lines = useClozeLinesDnD(partsWithIds, (blankId) => {
        const currentAnswerId = answers[blankId];
        const currentWord =
          solutionWords.find((w) => w.id === currentAnswerId) ?? null;
        return (
          <ClozeBlankDropSlot
            key={`b:${blankId}`}
            id={blankId}
            exerciseId={exerciseId}
            currentWord={
              currentWord
                ? { id: currentWord.id, word: currentWord.word }
                : null
            }
            onDropWord={(wordId) => dropIntoBlank(blankId, wordId)}
            onCtrlClear={() => clearBlank(blankId)}
            display_mode="code"
          />
        );
      });

      while (
        lines.length &&
        lines[0].every((seg) => typeof seg === "string" && seg.trim() === "")
      ) {
        lines.shift();
      }
      return (
        <ClozeCodingUi
          lines={lines}
          language={languageLabel}
          filename="snippet.ts"
        />
      );
    };

    const checkResults = () => {
      const total = blanks.length;
      const correctCount = blanks.reduce((acc, b) => {
        const user = getUserAnswerText(b.id);
        return acc + (userInputMatchesCorrectAnswer(user, b.correct) ? 1 : 0);
      }, 0);

      if (correctCount === total) {
        setFeedback({
          type: "success",
          message: "🎉 Alles richtig! Super gemacht!",
        });
        onSubmit();
      } else {
        setFeedback({
          type: "error",
          message: `Noch nicht ganz: ${correctCount} von ${total} richtig. Schau dir die Lücken nochmal an und probier’s erneut.`,
        });
      }
    };

    return (
      <SubBackground>
        {/* --- Header --- */}
        <ClozeHeader title={title} />

        <SolutionWordBank
          words={solutionWords}
          exerciseId={exerciseId}
          onReturnToBank={returnToBank}
          onQuickPlace={quickPlace}
        />

        {/* Umschalten der Darstellung */}
        {isCodeMode ? renderCodeMode() : renderTextMode()}

        {/* --- OK-Button --- */}
        <ClozeSubmitButton allFilled={allFilled} checkResults={checkResults} />

        {/* --- Feedback unter dem Button --- */}
        {feedback.type && <ClozeSubmitFeedback feedback={feedback} />}
      </SubBackground>
    );
  },
);

ClozeExerciseDragDrop.displayName = "ClozeExerciseDragDrop";
export default ClozeExerciseDragDrop;
