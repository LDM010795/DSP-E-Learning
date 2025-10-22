import { SubBackground } from "@/components/layouts";
import { memo, useMemo, useState, useEffect, useCallback } from "react";
import ClozeBlankTextSlot from "./blanks/ClozeBlankTextSlot";
import ClozeCodingUi from "./ClozeCodingUi";
import {
  ClozeExerciseBaseProps,
  userInputMatchesCorrectAnswer,
} from "./ClozeExerciseBase";
import { useClozeLinesTextInput } from "./helpers/clozeLines";
import {
  ClozeHeader,
  ClozeSubmitFeedback,
  ClozeSubmitButton,
} from "./ClozeLayout";

export interface ClozeExerciseTextInputProps extends ClozeExerciseBaseProps {}
export const ClozeExerciseTextInput = memo<ClozeExerciseTextInputProps>(
  ({
    title = "Fülle die Lücken aus:",
    clozeText,
    display_mode,
    languageLabel = "Code",
    onSubmit,
  }) => {
    const isCodeMode = display_mode === "code";

    const blanksPossibleAnswers = useMemo(() => {
      const list: string[][] = [];
      clozeText.forEach((p) => {
        if (p.type === "blank") list.push(p.correct);
      });
      return list; // z.B. [ ["foo","Foo"], ["bar"] ]
    }, [clozeText]);

    const [answers, setAnswers] = useState<string[]>(() =>
      Array(blanksPossibleAnswers.length).fill(""),
    );
    // --- Feedback-State unter dem Button ---
    const [feedback, setFeedback] = useState<{
      type: "success" | "error" | null;
      message: string;
    }>({ type: null, message: "" });

    // Feedback zurücksetzen, sobald der/die Nutzer:in weiterarbeitet
    useEffect(() => {
      if (feedback.type) setFeedback({ type: null, message: "" });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answers]);

    const allFilled = answers.every((a) => a.trim().length > 0);

    const renderTextMode = () => {
      let blankCounter = 0; // zählt Blanks, dient als Index im answers-Array
      return (
        <div className="flex flex-wrap gap-1 mb-4 text-lg leading-[1.6]">
          {clozeText.map((part, i) => {
            if (part.type === "text") {
              return (
                <span key={i} className="text-gray-600 mt-1">
                  {part.text}
                </span>
              );
            }

            const index = blankCounter++;
            return (
              <ClozeBlankTextSlot
                key={`b:${index}`}
                id={`b-${index}`} // rein für testid/aria, nicht für State
                inputValue={answers[index] ?? ""}
                display_mode="text"
                onInputChange={(value) =>
                  setAnswers((prev) => {
                    const copy = prev.slice();
                    copy[index] = value;
                    return copy;
                  })
                }
              />
            );
          })}
        </div>
      );
    };

    const renderCodeMode = () => {
      const renderBlankAtIndex = useCallback(
        (index: number) => (
          <ClozeBlankTextSlot
            key={`b:${index}`}
            id={`b-${index}`} // nur für testid/aria
            inputValue={answers[index] ?? ""}
            onInputChange={(value) =>
              setAnswers((prev) => {
                const copy = prev.slice();
                copy[index] = value;
                return copy;
              })
            }
            display_mode="code" // oder vereinheitlicht: mode="code"
          />
        ),
        [answers, setAnswers],
      );

      const lines = useClozeLinesTextInput(clozeText, renderBlankAtIndex);
      return (
        <ClozeCodingUi
          lines={lines}
          language={languageLabel}
          filename="snippet.ts"
        />
      );
    };

    const checkResults = () => {
      // Zähle korrekte Antworten
      const correctCount = answers.reduce((acc, val, index) => {
        return (
          acc +
          (userInputMatchesCorrectAnswer(val, blanksPossibleAnswers[index])
            ? 1
            : 0)
        );
      }, 0);
      const total = blanksPossibleAnswers.length;

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

ClozeExerciseTextInput.displayName = "ClozeExerciseTextInput";
export default ClozeExerciseTextInput;
