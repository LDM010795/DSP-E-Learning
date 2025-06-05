import React from "react";
import {
  IoCalendarOutline,
  IoFlagOutline,
  IoHourglassOutline,
} from "react-icons/io5";
import { Exam, ExamAttempt } from "../../context/ExamContext";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";

interface InProgressProps {
  activeExams: ExamAttempt[];
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
  maxLength: number = 111
): string => {
  if (!text) return "Keine Beschreibung verfügbar";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const InProgress: React.FC<InProgressProps> = ({
  activeExams,
  loadingUserExams,
  errorUserExams,
  onOpenPopup,
}) => {
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

  if (activeExams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Du hast derzeit keine Prüfungen in Bearbeitung.
      </div>
    );
  }

  console.log("Aktive Prüfungen:", activeExams);

  return (
    <div className="space-y-6">
      {activeExams.map((attempt) => (
        <div
          key={attempt.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div className="flex-grow mr-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {attempt.exam.exam_title}
                  </h3>
                  <div className="flex-shrink-0 mt-px">
                    <IoHourglassOutline
                      className="text-yellow-500 animate-pulse"
                      title="In Bearbeitung"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {truncateText(attempt.exam.exam_description)}
                </p>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4 text-sm text-gray-500 flex-shrink-0">
                <div className="flex items-center mb-1">
                  <IoCalendarOutline className="mr-2" /> Gestartet:{" "}
                  {formatDate(attempt.started_at)}
                </div>
                <div className="flex items-center text-red-600 font-medium">
                  <IoFlagOutline className="mr-2" /> Fällig:{" "}
                  {formatDate(attempt.due_date)}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <ButtonPrimary
                title="Details anzeigen & Abgeben"
                classNameButton="w-full sm:w-auto text-sm"
                onClick={() => onOpenPopup(attempt.exam, attempt)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InProgress;
