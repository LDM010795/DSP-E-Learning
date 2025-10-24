export interface ClozeExerciseBaseProps {
  title?: string;

  display_mode?: "text" | "code"; // default 'text'
  languageLabel?: string; // fill if display_mode == 'text'

  onSubmit: () => void;
}

type ClozeTextPart = { type: "text"; text: string };

type ClozeBlankTextInput = {
  type: "blank";
  correct: string[];
  initialValue: string;
};

type ClozeBlankDragDrop = {
  type: "blank";
  correct: string[];
};

export type ClozePartDragDrop = ClozeTextPart | ClozeBlankDragDrop;

export type ClozePartTextInput = ClozeTextPart | ClozeBlankTextInput;

export interface ClozeResult {
  answers: Record<string, string>;
  correct: boolean;
  details: Record<string, { isCorrect: boolean; correctAnswers: string[] }>;
}
