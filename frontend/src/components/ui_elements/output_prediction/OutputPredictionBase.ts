/**
 * OutputPredictionBase
 *
 * Shared types and helpers for the Output Prediction exercise.
 * - Supports multiple correct answers
 * - Allows configurable normalization (e.g., trim, collapse whitespace,
 *   newline normalization, case sensitivity)
 *
 *
 * Author: DSP development team
 * Date: 30-10-2025
 */

export type NormalizeFn = (s: string) => string;

export interface OutputPredictionProps {
  /** Visible title in the header */
  title?: string;

  /** Prompt, shown above the input (e.g., "Was gibt dieser Code aus?") */
  prompt?: string;

  /** Prism language label (e.g., "python", "typescript", "tsx") */
  language?: string;

  /** Tab label above the code block */
  filename?: string;

  /** Code snippet to display */
  code: string;

  /** One or more acceptable answers */
  expectedAnswers: string[];

  /** If true, comparison is case-sensitive; default false */
  caseSensitive?: boolean;

  /**
   * If true, we use a multiline <textarea> instead of a single-line <input>.
   * Useful when output may contain newlines (e.g., several prints).
   * Default: false
   */
  multiline?: boolean;

  /**
   * normalizer function. Applied to both user input and expected answers
   */

  normalize?: NormalizeFn;

  /** Optional callbacks for analytics/telemetry */
  onSubmit?: (userAnswer: string, isCorrect: boolean) => void;
  onCorrect?: (userAnswer: string) => void;
  onWrong?: (userAnswer: string) => void;
}

/**
 * Compare a user answer against a set of expected answers.
 * Options:
 *  - caseSensitive
 *  - normalize (applied to both sides before compare)
 */
export function matchesExpected(
  user: string,
  expected: string[],
  opts?: { caseSensitive?: boolean; normalize?: NormalizeFn },
): boolean {
  const normalize = opts?.normalize ?? ((x: string) => x);
  const caseSensitive = opts?.caseSensitive ?? false;

  const U = normalize(user);
  return expected.some((e) => {
    const E = normalize(e);
    return caseSensitive ? U === E : U.toLowerCase() === E.toLowerCase();
  });
}
