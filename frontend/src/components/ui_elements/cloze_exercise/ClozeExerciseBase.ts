export interface ClozeExerciseBaseProps {
  title?: string;
  clozeText: ClozeTextPart[];

  display_mode?: 'text' | 'code';     // default 'text'
  languageLabel?: string;

  onSubmit: () => void;
}

export type ClozeTextTextPart = { type: "text"; text: string }
export type ClozeTextBlankPart = { type: "blank"; correct: string[] }

export type ClozeTextPart = ClozeTextTextPart | ClozeTextBlankPart

export interface ClozeResult {
  answers: Record<string, string>;
  correct: boolean;
  details: Record<string, { isCorrect: boolean; correctAnswers: string[] }>;
}

export type ClozeBlank = { type: "blank"; id: string; correct: string[] };

export const userInputMatchesCorrectAnswer = (user: string, correct: string[]) => {
  return correct.some((c) => {
    const normalizedCorrectAnswer = c.trim().toLowerCase();
    const normalizeUserAnswer = user.trim().toLowerCase();
    return normalizedCorrectAnswer === normalizeUserAnswer;
  })
}
