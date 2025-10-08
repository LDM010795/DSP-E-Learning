import { SubBackground } from "@/components/layouts";
import { memo, useMemo, useState } from "react";
import SolutionWordBank, { SolutionWord } from "./SolutionWordBank";
import ClozeBlank from "./ClozeBlank";
import ClozeHeader from "./ClozeHeader";
import ClozeSubmitButton from "./ClozeSubmitButton";

export interface ClozeExerciseProps {
  title?: string;
  clozeText: ClozeTextPart[];

  // determines whether the correct answers are displayed
  // above the text and drag'n'droppable into the clozes.
  showSolutionWords: boolean;

  // add wrong answers to the drag'n'droppable
  // solution words to increase difficulty
  wrongSolutionWords?: string[];

  onSubmit: () => void;
}

export interface ClozeResult {
  answers: Record<string, string>;
  correct: boolean;
  details: Record<string, { isCorrect: boolean; correctAnswers: string[] }>;
}

export type ClozeTextPart =
  | { type: "text"; content: string }
  | { type: "blank"; correct: string[] };

type ClozeBlank = { type: "blank"; id: string; correct: string[] };

const normalize = (s: string) => s.trim().toLowerCase();
const isCorrectAnswer = (user: string, correct: string[]) =>
  correct.some((c) => normalize(c) === normalize(user));

export const ClozeExercise = memo<ClozeExerciseProps>(
  ({
    title = "Fülle die Lücken aus:",
    clozeText,
    showSolutionWords = false,
    wrongSolutionWords = [],
    onSubmit,
  }) => {
    const clozeTextWithIds = useMemo(() => {
      return clozeText.map((part, index) => {
        if (part.type === "blank") {
          return { ...part, id: `${index}` };
        }
        return part;
      });
    }, [clozeText]);

    const blanks = useMemo(
      () => clozeTextWithIds.filter((t): t is ClozeBlank => t.type === "blank"),
      [clozeTextWithIds],
    );

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [solutionWords, setSolutionWords] = useState<SolutionWord[]>(() => {
      if (!showSolutionWords) return [];

      const initialWords = [
        ...clozeTextWithIds
          .filter((p) => p.type === "blank")
          .map((p) => p.correct[0]),
        ...wrongSolutionWords,
      ].sort();

      return initialWords.map((word, i) => ({
        id: i.toString(),
        word,
        available: true,
      }));
    });

    // Hilfsfunktion: gibt den Text zurück, den wir prüfen wollen (immer ein String)
    const getUserAnswerText = (blankId: string) => {
      const val = answers[blankId];
      if (val == null) return ""; // keine Antwort

      // Wenn der Drag & Drop-Modus aktiv ist, ist answers[blankId] eine word-id -> löse sie auf
      if (showSolutionWords) {
        const word = solutionWords.find((w) => w.id === val);
        return word?.word ?? "";
      }

      // Sonst: Eingabemodus -> val ist bereits der Text
      return String(val);
    };

    const allFilled = blanks.every(
      (b) => getUserAnswerText(b.id).trim().length > 0,
    );
    const allCorrect = blanks.every((b) =>
      isCorrectAnswer(getUserAnswerText(b.id), b.correct),
    );

    const handleDropIntoBlank = (blankId: string, wordId: string) => {
      const droppedWord = solutionWords.find((w) => w.id === wordId);
      if (!droppedWord) return;

      // Finde, ob das Wort bereits woanders genutzt wurde
      const previousBlankId = Object.entries(answers).find(
        ([, id]) => id === wordId,
      )?.[0];

      setAnswers((prev) => {
        const updated = { ...prev };

        // Wenn das Wort schon irgendwo war → alte Lücke leeren
        if (previousBlankId) {
          delete updated[previousBlankId];
        }

        // Wenn Ziel-Lücke schon ein anderes Wort hat → das andere Wort freigeben
        const replacedWordId = prev[blankId];
        if (replacedWordId && replacedWordId !== wordId) {
          setSolutionWords((prevWords) =>
            prevWords.map((w) =>
              w.id === replacedWordId ? { ...w, available: true } : w,
            ),
          );
        }

        // Neues Wort in Ziel-Lücke setzen
        updated[blankId] = wordId;
        return updated;
      });

      // Das gezogene Wort als „nicht verfügbar“ markieren
      setSolutionWords((prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, available: false } : w)),
      );
    };

    const handleReturnToBank = (wordId: string) => {
      // Blank finden, in dem dieses Wort aktuell liegt
      const blankId = Object.keys(answers).find(
        (key) => answers[key] === wordId,
      );
      if (!blankId) return;

      // Wort wieder aktivieren
      setSolutionWords((prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, available: true } : w)),
      );

      // Blank leeren
      setAnswers((prev) => {
        const copy = { ...prev };
        delete copy[blankId];
        return copy;
      });
    };

    const handleQuickPlace = (wordId: string) => {
      // erste freie Lücke finden
      const firstEmptyBlank = blanks.find((blank) => !answers[blank.id]);
      if (!firstEmptyBlank) return;

      handleDropIntoBlank(firstEmptyBlank.id, wordId);
    };

    const clearBlank = (blankId: string) => {
      const wordId = answers[blankId];
      if (!wordId) return;

      setSolutionWords((prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, available: true } : w)),
      );

      setAnswers((prev) => {
        const updated = { ...prev };
        delete updated[blankId];
        return updated;
      });
    };

    const checkResults = () => {
      if (allCorrect) onSubmit();
    };

    return (
      <SubBackground>
        {/* --- Header --- */}
        <ClozeHeader title={title} />

        {/* --- Lösungsauswahl (nur wenn Lösungswörter sichtbar) --- */}
        {showSolutionWords && (
          <SolutionWordBank
            words={solutionWords}
            onReturnToBank={handleReturnToBank}
            onQuickPlace={handleQuickPlace}
          />
        )}

        {/* --- Lückentext --- */}
        <div className="flex flex-wrap gap-1 mb-4 text-lg leading-[1.6]">
          {clozeTextWithIds.map((part, i) => {
            if (part.type === "text") {
              return (
                <span key={i} className="text-gray-600 mt-1">
                  {part.content}
                </span>
              );
            }

            // --- Drag & Drop Modus ---
            if (showSolutionWords) {
              const currentAnswerId = answers[part.id];
              const currentWord =
                solutionWords.find((w) => w.id === currentAnswerId) || null;

              return (
                <ClozeBlank
                  key={part.id}
                  id={part.id}
                  showSolutionWords
                  currentWord={
                    currentWord
                      ? { id: currentWord.id, word: currentWord.word }
                      : null
                  }
                  onDropWord={(wordId) => handleDropIntoBlank(part.id, wordId)}
                  onCtrlClear={() => clearBlank(part.id)}
                />
              );
            }

            // --- Eingabe-Modus ---
            return (
              <ClozeBlank
                key={part.id}
                id={part.id}
                showSolutionWords={false}
                inputValue={answers[part.id] ?? ""}
                onInputChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [part.id]: value }))
                }
              />
            );
          })}
        </div>

        {/* --- OK-Button --- }*/}
        <ClozeSubmitButton
          label="Prüfen"
          disabled={!allFilled}
          onClick={checkResults}
        />
      </SubBackground>
    );
  },
);

ClozeExercise.displayName = "ClozeExercise";

export default ClozeExercise;
