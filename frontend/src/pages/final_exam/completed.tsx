import React from "react";
import {
  IoCheckmarkDoneOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { Exam, ExamAttempt } from "../../context/ExamContext";
import TagScore from "../../components/tags/tag_standard";

interface CompletedProps {
  completedExams: ExamAttempt[];
  loadingUserExams: boolean;
  errorUserExams: string | null;
  onOpenPopup: (exam: Exam, attempt: ExamAttempt) => void;
}

// Hilfsfunktion zur Formatierung des Datums
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Nicht verfügbar";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Hilfsfunktion zur Begrenzung der Textlänge
const truncateText = (
  text: string | undefined,
  maxLength: number = 111,
): string => {
  if (!text) return "Keine Beschreibung verfügbar";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const Completed: React.FC<CompletedProps> = ({
  completedExams,
  loadingUserExams,
  errorUserExams,
  onOpenPopup,
}) => {
  console.log("Abgeschlossene Prüfungen:", completedExams);

  if (loadingUserExams) {
    return <div className="text-center py-8">Lädt Prüfungen...</div>;
  }

  if (errorUserExams) {
    return (
      <div className="text-center py-8 text-red-600">
        Fehler beim Laden der Prüfungen: {errorUserExams}
      </div>
    );
  }

  if (completedExams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Du hast noch keine Prüfungen abgeschlossen.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {completedExams.map((attempt) => {
        const maxScore =
          attempt.exam?.criteria?.reduce((sum, c) => sum + c.max_points, 0) ??
          null;
        return (
          <div
            key={attempt.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            <div
              onClick={() => onOpenPopup(attempt.exam, attempt)}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="mb-3 sm:mb-0 flex-grow mr-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {attempt.exam.exam_title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {truncateText(attempt.exam.exam_description)}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 space-y-2">
                  <div className="flex-shrink-0">
                    {attempt.status === "graded" && (
                      <TagScore score={attempt.score} maxScore={maxScore} />
                    )}
                    {attempt.status === "submitted" && (
                      <IoCheckmarkCircleOutline
                        className="text-blue-500"
                        title="Abgegeben"
                      />
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <IoCheckmarkDoneOutline className="mr-1 text-green-600" />
                    {attempt.status === "graded"
                      ? "Bewertet: " +
                        (attempt.graded_at
                          ? formatDate(attempt.graded_at)
                          : "Unbekannt")
                      : "Abgegeben: " +
                        (attempt.submitted_at
                          ? formatDate(attempt.submitted_at)
                          : "Unbekannt")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Completed;
