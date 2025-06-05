import React from "react";
import {
  IoTimeOutline,
  IoFlagOutline,
  IoCheckmarkDoneOutline,
  IoLockClosedOutline,
  IoPlayOutline,
  IoHourglassOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { Exam, ExamAttempt } from "../../context/ExamContext";
import clsx from "clsx";
import TagScore from "../../components/tags/tag_standard";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";

type UserExamStatus =
  | "locked"
  | "available"
  | "started"
  | "submitted"
  | "graded";

interface OverviewProps {
  allExams: Exam[];
  availableExams: Exam[];
  activeExams: ExamAttempt[];
  completedExams: ExamAttempt[];
  loadingAllExams: boolean;
  loadingUserExams: boolean;
  errorAllExams: string | null;
  errorUserExams: string | null;
  searchTerm: string;
  onOpenPopup: (exam: Exam, attempt?: ExamAttempt) => void;
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

// NEU: Definiert die Reihenfolge für die Sortierung nach Status
const getStatusOrder = (status: UserExamStatus): number => {
  switch (status) {
    case "started":
      return 1;
    case "available":
      return 2;
    case "submitted":
      return 3;
    case "graded":
      return 4;
    case "locked":
      return 5;
    default:
      return 6; // Fallback
  }
};

const Overview: React.FC<OverviewProps> = ({
  allExams,
  availableExams,
  activeExams,
  completedExams,
  loadingAllExams,
  loadingUserExams,
  errorAllExams,
  errorUserExams,
  searchTerm,
  onOpenPopup,
}) => {
  console.log("RENDER OVERVIEW TAB:", {
    loadingAllExams,
    errorAllExams,
    allExamsCount: allExams.length,
    availableExamsCount: availableExams.length,
    activeExamsCount: activeExams.length,
    completedExamsCount: completedExams.length,
  });

  if (loadingAllExams || loadingUserExams) {
    return <div className="text-center py-8">Lädt Prüfungsübersicht...</div>;
  }

  if (errorAllExams || errorUserExams) {
    return (
      <div className="text-center py-8 text-red-600">
        Fehler beim Laden der Prüfungsübersicht:{" "}
        {errorAllExams || errorUserExams}
      </div>
    );
  }

  if (allExams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Keine Prüfungen im System gefunden.
      </div>
    );
  }

  // Erstelle Lookups für schnellen Status-Check
  const availableExamIds = new Set(availableExams.map((exam) => exam.id));
  const activeAttemptsMap = new Map(
    activeExams.map((attempt) => [attempt.exam.id, attempt])
  );
  const completedAttemptsMap = new Map(
    completedExams.map((attempt) => [attempt.exam.id, attempt])
  );

  // 1. Prüfungen mit Status und Attempt anreichern
  const examsWithStatus = allExams.map((exam) => {
    let userExamStatus: UserExamStatus = "locked";
    let attempt: ExamAttempt | undefined = undefined;

    if (availableExamIds.has(exam.id)) {
      userExamStatus = "available";
    } else if (activeAttemptsMap.has(exam.id)) {
      userExamStatus = "started";
      attempt = activeAttemptsMap.get(exam.id);
    } else if (completedAttemptsMap.has(exam.id)) {
      attempt = completedAttemptsMap.get(exam.id);
      userExamStatus = attempt?.status === "graded" ? "graded" : "submitted";
    }
    return { exam, status: userExamStatus, attempt };
  });

  // NEU: Nach Suchbegriff filtern (Titel)
  const filteredExams = examsWithStatus.filter(({ exam }) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      (exam.exam_title || "").toLowerCase().includes(lowerSearchTerm)
    );
  });

  // Sortieren nach Status, dann Titel
  const sortedAndFilteredExams = filteredExams.sort((a, b) => {
    const orderA = getStatusOrder(a.status);
    const orderB = getStatusOrder(b.status);
    if (orderA !== orderB) return orderA - orderB;
    return a.exam.exam_title.localeCompare(b.exam.exam_title);
  });

  if (sortedAndFilteredExams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Keine Prüfungen entsprechen den aktuellen Kriterien.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedAndFilteredExams.map(({ exam, status, attempt }) => {
        const userExamStatus = status;
        const isLocked = userExamStatus === "locked";
        const maxScore =
          exam.criteria?.reduce((sum, c) => sum + c.max_points, 0) ?? null;

        return (
          <div
            key={exam.id}
            className={clsx(
              "bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col transition-all duration-200",
              {
                "hover:shadow-lg": !isLocked,
                "border-l-4 border-dsp-green": userExamStatus === "started",
                "border-l-4 border-dsp-blue":
                  userExamStatus === "submitted" || userExamStatus === "graded",
              }
            )}
          >
            <div
              className={clsx("p-5 flex-grow", {
                "opacity-40 grayscale": isLocked,
              })}
            >
              <div className="flex items-start justify-between mb-2">
                <h3
                  className={clsx(
                    "text-base font-semibold text-gray-800 leading-tight mr-2",
                    { "text-gray-500": isLocked }
                  )}
                >
                  {exam.exam_title || "Titel nicht verfügbar"}
                </h3>
                <div className="flex-shrink-0 mt-px">
                  {userExamStatus === "locked" && (
                    <IoLockClosedOutline
                      className="text-gray-400"
                      title="Gesperrt"
                    />
                  )}
                  {userExamStatus === "available" && (
                    <IoPlayOutline
                      className="text-lime-500"
                      title="Verfügbar"
                    />
                  )}
                  {userExamStatus === "started" && (
                    <IoHourglassOutline
                      className="text-yellow-500 animate-pulse"
                      title="In Bearbeitung"
                    />
                  )}
                  {userExamStatus === "submitted" && (
                    <IoCheckmarkCircleOutline
                      className="text-blue-500"
                      title="Abgegeben"
                    />
                  )}
                  {userExamStatus === "graded" && attempt && (
                    <TagScore score={attempt.score} maxScore={maxScore} />
                  )}
                </div>
              </div>

              <p
                className={clsx(
                  "text-xs text-gray-500 mb-3 h-10 overflow-hidden",
                  { italic: isLocked }
                )}
              >
                {isLocked
                  ? "Voraussetzungen noch nicht erfüllt oder bereits anderer Versuch gestartet/beendet."
                  : truncateText(exam.exam_description, 80)}
              </p>

              <div className="flex items-center text-xs text-gray-500 mb-1">
                <IoTimeOutline className="mr-1.5" /> {exam.exam_duration_week}{" "}
                {exam.exam_duration_week === 1 ? "Woche" : "Wochen"}
              </div>

              {attempt && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs space-y-1">
                  {userExamStatus === "started" && attempt.due_date && (
                    <div className="flex items-center text-red-600 font-medium">
                      <IoFlagOutline className="mr-1.5" /> Fällig:{" "}
                      {formatDate(attempt.due_date)}
                    </div>
                  )}
                  {(userExamStatus === "submitted" ||
                    userExamStatus === "graded") &&
                    attempt.submitted_at && (
                      <div className="flex items-center text-gray-600">
                        <IoCheckmarkDoneOutline className="mr-1.5 text-green-600" />{" "}
                        Abgegeben: {formatDate(attempt.submitted_at)}
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200">
              {userExamStatus === "locked" && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-500 italic mr-2">
                    Zum Freischalten Module absolvieren
                  </span>
                  <ButtonSecondary
                    title="Details anzeigen"
                    classNameButton="sm:w-auto text-sm"
                    onClick={() => onOpenPopup(exam)}
                  />
                </div>
              )}
              {userExamStatus === "available" && (
                <div className="flex justify-end w-full">
                  <ButtonPrimary
                    title="Details anzeigen"
                    classNameButton="w-full sm:w-auto text-sm"
                    onClick={() => onOpenPopup(exam)}
                  />
                </div>
              )}
              {userExamStatus === "started" && attempt && (
                <div className="flex justify-end w-full">
                  <ButtonPrimary
                    title="Details anzeigen"
                    classNameButton="w-full sm:w-auto text-sm"
                    onClick={() => onOpenPopup(exam, attempt)}
                  />
                </div>
              )}
              {userExamStatus === "submitted" && attempt && (
                <div className="flex justify-end w-full">
                  <ButtonPrimary
                    title="Details anzeigen"
                    classNameButton="w-full sm:w-auto text-sm"
                    onClick={() => onOpenPopup(exam, attempt)}
                  />
                </div>
              )}
              {userExamStatus === "graded" && attempt && (
                <div className="flex justify-end w-full">
                  <ButtonPrimary
                    title="Details anzeigen"
                    classNameButton="w-full sm:w-auto text-sm"
                    onClick={() => onOpenPopup(exam, attempt)}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Overview;
