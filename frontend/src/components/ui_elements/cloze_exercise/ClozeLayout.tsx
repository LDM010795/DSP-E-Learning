import { memo } from "react";
import { FaPenToSquare } from "react-icons/fa6";

/* ---------------------------------- Header --------------------------------- */
export const ClozeHeader = memo(function ClozeHeader({
    title = "Fülle die Lücken aus:",
}: {
    title?: string;
}) {
    return (
        <div className="inline-flex items-center gap-2" data-testid="cloze-header">
            <div className="p-3 rounded-xl bg-dsp-orange_light">
                <FaPenToSquare className="w-5 h-5 text-dsp-orange" />
            </div>
            <h1 className="text-lg text-gray-600">{title}</h1>
        </div>
    );
});
ClozeHeader.displayName = "ClozeHeader";

/* ------------------------------- Submit Button ------------------------------ */
export const ClozeSubmitButton = memo(function ClozeSubmitButton({
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
            className={`w-auto text-left px-4 py-2 rounded-lg border transition
                         ${allFilled
                    ? "bg-dsp-orange text-white border-orange-500 cursor-pointer"
                    : "bg-gray-50 border-gray-300 opacity-60 cursor-not-allowed"
                }
                    `}
            onClick={checkResults}
            data-testid="cloze-submit"
        >
            Prüfen
        </button>
    );
});
ClozeSubmitButton.displayName = "ClozeSubmitButton";

/* --------------------------------- Feedback -------------------------------- */
export type ClozeFeedbackState =
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | { type: null; message: string };

export const ClozeSubmitFeedback = memo(function ClozeSubmitFeedback({
    feedback,
}: {
    feedback: ClozeFeedbackState;
}) {
    if (!feedback.type)
        return null;
    return (
        <div
            className={[
                "mt-3 rounded-md border px-3 py-2 text-sm",
                feedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
            role="status"
            aria-live="polite"
            data-testid="cloze-feedback"
        >
            {feedback.message}

        </div>
    );
});
ClozeSubmitFeedback.displayName = "ClozeSubmitFeedback";
