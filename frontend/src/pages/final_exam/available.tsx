import React from "react";
import { IoTimeOutline, IoPlayOutline } from "react-icons/io5";
import { Exam } from "../../context/ExamContext";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";

interface AvailableProps {
  availableExams: Exam[];
  loadingUserExams: boolean;
  errorUserExams: string | null;
  searchTerm: string;
  onOpenPopup: (exam: Exam) => void;
}

// Hilfsfunktion zur Begrenzung der Textlänge
const truncateText = (
  text: string | undefined,
  maxLength: number = 111
): string => {
  if (!text) return "Keine Beschreibung verfügbar";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const Available: React.FC<AvailableProps> = ({
  availableExams,
  loadingUserExams,
  errorUserExams,
  searchTerm,
  onOpenPopup,
}) => {
  console.log("RENDER AVAILABLE EXAMS:", {
    loadingUserExams,
    errorUserExams,
    availableExamsCount: availableExams.length,
    availableExamsData: availableExams,
  });

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

  if (availableExams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Derzeit sind keine Prüfungen verfügbar.
      </div>
    );
  }

  // NEU: Nach Suchbegriff filtern (Titel)
  const filteredAvailableExams = availableExams.filter((exam) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      (exam.exam_title || "").toLowerCase().includes(lowerSearchTerm)
    );
  });

  if (filteredAvailableExams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Keine verfügbaren Prüfungen entsprechen den aktuellen Kriterien.
      </div>
    );
  }

  // Debug: Überprüfen der Datenstruktur der ersten Prüfung
  if (availableExams.length > 0) {
    console.log(
      "First available exam data (JSON):",
      JSON.stringify(availableExams[0], null, 2)
    );
    console.log("First available exam title:", availableExams[0].exam_title);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAvailableExams.map((exam) => {
        console.log("Rendering exam item:", exam.id, {
          title: exam.exam_title,
          description: exam.exam_description,
          difficulty: exam.exam_difficulty,
          duration_weeks: exam.exam_duration_week,
        });

        if (!exam.exam_title) {
          console.warn("ACHTUNG: Prüfung hat keinen Titel!", exam);
        }

        return (
          <div
            key={exam.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 flex flex-col"
          >
            <div className="p-5 flex-grow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800 leading-tight mr-2">
                  {exam.exam_title || "Titel nicht verfügbar"}
                </h3>
                <div className="flex-shrink-0 mt-px">
                  <IoPlayOutline className="text-lime-500" title="Verfügbar" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3 h-10 overflow-hidden">
                {truncateText(exam.exam_description, 80)}
              </p>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <IoTimeOutline className="mr-1.5" /> {exam.exam_duration_week}{" "}
                {exam.exam_duration_week === 1 ? "Woche" : "Wochen"}
              </div>
            </div>
            <div className="bg-gray-50 p-3 border-t border-gray-200">
              <div className="flex justify-end w-full">
                <ButtonPrimary
                  title="Details anzeigen"
                  onClick={() => onOpenPopup(exam)}
                  classNameButton="w-full sm:w-auto text-sm"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Available;
