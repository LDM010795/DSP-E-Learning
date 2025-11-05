/**
 * SubmitButton
 *
 * Action button for validating user answers.
 *
 * Author: DSP development team
 * Date: 30-10-2025
 */

import { memo } from "react";

export const SubmitButton = memo(function SubmitButton({
  allFilled = false,
  checkResults,
}: {
  allFilled: boolean;
  checkResults: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!allFilled}
      onClick={checkResults}
      className={`px-4 py-2 rounded-lg border transition
            ${
              allFilled
                ? "bg-dsp-orange text-white border-orange-500 cursor-pointer hover:bg-dsp-orange_medium"
                : "bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed"
            }`}
      data-testid="outpred-submit"
    >
      Prüfen
    </button>
  );
});
SubmitButton.displayName = "SubmitButton";
