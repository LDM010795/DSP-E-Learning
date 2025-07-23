import { memo } from "react";

export interface MultipleChoiceOption {
  id: string;
  answer: string;
}

export interface MultipleChoiceProps {
  question: string;
  options: MultipleChoiceOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const MultipleChoice = memo<MultipleChoiceProps>(
  ({ question, options, selectedId, onSelect, disabled = false }) => (
    <div className="w-full p-4 rounded-lg border bg-white shadow">
      <div className="mb-3 font-semibold text-base">{question}</div>
      <ul className="space-y-2">
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              disabled={disabled}
              className={`w-full text-left px-4 py-2 rounded-lg border transition
              ${
                option.id === selectedId
                  ? "bg-orange-400 text-white border-orange-500"
                  : "bg-gray-50 hover:bg-orange-100 border-gray-300"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
            `}
              onClick={() => onSelect(option.id)}
            >
              {option.answer}
            </button>
          </li>
        ))}
      </ul>
    </div>
  ),
);

MultipleChoice.displayName = "MultipleChoice";

export default MultipleChoice;
