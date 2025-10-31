import { memo } from "react";

export const TaskSubmitButton = memo(function TaskSubmitButton({
  disabled = false,
  submit,
  buttonText = "Prüfen",
}: {
  disabled?: boolean;
  submit: () => void;
  buttonText?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`w-auto text-left px-4 py-2 rounded-lg border transition
                         ${
                           disabled
                             ? "bg-gray-50 border-gray-300 opacity-60 cursor-not-allowed"
                             : "bg-dsp-orange text-white border-orange-500 cursor-pointer"
                         }
                    `}
      onClick={submit}
      data-testid="task-submit"
    >
      {buttonText}
    </button>
  );
});
TaskSubmitButton.displayName = "TaskSubmitButton";
