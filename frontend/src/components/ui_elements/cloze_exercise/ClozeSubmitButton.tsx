import { memo } from "react";

interface ClozeSubmitButtonProps {
  disabled: boolean;
  label: string;
  onClick: () => void;
}

const ClozeSubmitButton = memo<ClozeSubmitButtonProps>(
  ({ disabled, label, onClick }) => (
    <button
      type="button"
      disabled={disabled}
      className={`w-auto text-left px-4 py-2 rounded-lg border transition
        ${
          !disabled
            ? "bg-dsp-orange text-white border-orange-500 cursor-pointer"
            : "bg-gray-50 border-gray-300 opacity-60 cursor-not-allowed"
        }
      `}
      onClick={onClick}
    >
      {label}
    </button>
  ),
);

ClozeSubmitButton.displayName = "ClozeSubmitButton";
export default ClozeSubmitButton;
