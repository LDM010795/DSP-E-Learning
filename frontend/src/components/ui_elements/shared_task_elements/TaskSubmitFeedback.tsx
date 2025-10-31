import { memo } from "react";

export type TaskFeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | { type: null; message: string };

export const TaskSubmitFeedback = memo(function TaskSubmitFeedback({
  feedback,
}: {
  feedback: TaskFeedbackState;
}) {
  if (!feedback.type) return null;
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
      data-testid="task-feedback"
    >
      {feedback.message}
    </div>
  );
});
TaskSubmitFeedback.displayName = "TaskSubmitFeedback";