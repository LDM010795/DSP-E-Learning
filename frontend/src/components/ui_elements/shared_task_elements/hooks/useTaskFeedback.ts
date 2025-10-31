import { useState, useEffect, useCallback } from "react";

export type TaskFeedback =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | { type: null; message: "" };

export function useTaskFeedback(resetOn: ReadonlyArray<unknown> = []) {
  const [feedback, setFeedback] = useState<TaskFeedback>({
    type: null,
    message: "",
  });

  // Aktionen als stabile Callbacks
  const showSuccess = useCallback(
    (message: string = "🎉 Alles richtig! Super gemacht!") => {
      setFeedback({ type: "success", message });
    },
    [],
  );

  const showError = useCallback((message: string) => {
    setFeedback({ type: "error", message });
  }, []);

  const clear = useCallback(() => {
    setFeedback({ type: null, message: "" });
  }, []);

  // Beim Arbeiten (z. B. Reorder) Feedback zurücksetzen
  useEffect(() => {
    if (feedback.type) clear();
  }, resetOn);

  return { feedback, showSuccess, showError, clear };
}
