/**
 * SubmitFeedback
 *
 * Displays success/error messages after checking an answer.
 *
 * Author: DSP development team
 * Date: 30-10-2025
 */

import { memo } from "react";

export type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | { type: null; message: string };

export const SubmitFeedback = memo(function SubmitFeedback({
  feedback,
}: {
  feedback: FeedbackState;
}) {
  if (!feedback.type) return null;
  return (
    <div
      className={`mt-3 rounded-md border px-3 py-2 text-sm ${
        feedback.type === "success"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
      role="status"
      aria-live="polite"
      data-testid="outpred-feedback"
    >
      {feedback.message}
    </div>
  );
});
SubmitFeedback.displayName = "SubmitFeedback";
