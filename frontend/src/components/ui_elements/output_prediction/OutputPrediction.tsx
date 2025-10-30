/**
 * OutputPrediction
 * ---------------------------------------------------------------------
 * Exercise for predicting a program's output.
 * - Reuses SubBackground and ClozeLayout (Header, Button, Feedback)
 *   for visual and behavioral consistency with Cloze exercises.
 * - Single-line or multiline answer modes.
 * - Normalization + case sensitivity options for robust grading.
 */

import { useMemo, useState } from "react";
import { SubBackground } from "@/components/layouts";
import {
  Header,
  SubmitButton,
  SubmitFeedback,
} from "@/components/ui_elements/output_prediction/layout";
import CodeReadOnly from "./CodeReadOnly";
import { OutputPredictionProps, matchesExpected } from "./OutputPredictionBase";
import { defaultOutputNormalizer } from "./helpers/normalizers";

export default function OutputPrediction({
  title = "Output vorhersagen",
  prompt = "Was gibt dieser Code aus?",
  language = "python",
  filename = "snippet.py",
  code,
  expectedAnswers,
  caseSensitive = false,
  multiline = false,
  // Default: normalize newlines, trim edges, strip trailing newline
  normalize = defaultOutputNormalizer,
  onSubmit,
  onCorrect,
  onWrong,
}: OutputPredictionProps) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const canSubmit = answer.trim().length > 0;
  const inputId = useMemo(
    () => `outpred-${Math.random().toString(36).slice(2)}`,
    [],
  );

  const normalizedCompare = useMemo(() => normalize, [normalize]);

  const checkResults = () => {
    const ok = matchesExpected(answer, expectedAnswers, {
      caseSensitive,
      normalize: normalizedCompare,
    });

    setFeedback(
      ok
        ? { type: "success", message: "Richtig – gut gemacht!" }
        : { type: "error", message: "Nicht ganz – versuch es nochmal." },
    );

    onSubmit?.(answer, ok);
    if (ok) onCorrect?.(answer);
    else onWrong?.(answer);
  };

  return (
    <SubBackground>
      {/* Header (from Cloze) */}
      <Header title={title} />

      {/* Code block */}
      <CodeReadOnly code={code} language={language} filename={filename} />

      {/* Prompt */}
      <div className="mb-2 text-gray-700">{prompt}</div>

      {/* Input + Button */}
      <div className="mb-2">
        <label htmlFor={inputId} className="sr-only">
          Antwort
        </label>

        {multiline ? (
          <>
            <textarea
              id={inputId}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Antwort eingeben…"
              className="w-full min-h-[96px] rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-dsp-orange)] focus:border-[var(--color-dsp-orange)] font-mono"
            />
            <div className="mt-2">
              <SubmitButton allFilled={canSubmit} checkResults={checkResults} />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <input
              id={inputId}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Antwort eingeben…"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-dsp-orange)] focus:border-[var(--color-dsp-orange)]"
            />
            <SubmitButton allFilled={canSubmit} checkResults={checkResults} />
          </div>
        )}
      </div>

      {/* Feedback (from Cloze) */}
      <SubmitFeedback feedback={feedback} />

      {/* Tip: If we want to allow flexible whitespace, pass a composed normalizer
          e.g. normalize={compose(defaultOutputNormalizer, collapseWhitespace)} */}
    </SubBackground>
  );
}
