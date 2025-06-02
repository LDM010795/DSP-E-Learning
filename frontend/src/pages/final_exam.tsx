import React, { useState, useRef, useEffect } from "react";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../components/ui_elements/buttons/button_secondary";
import {
  IoTimeOutline,
  IoCalendarOutline,
  IoFlagOutline,
  IoCheckmarkDoneOutline,
  IoCloseOutline,
  IoLockClosedOutline,
  IoPlayOutline,
  IoHourglassOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { useExams, Exam, ExamAttempt } from "../context/ExamContext";
import PopupExamOverview from "../components/pop_ups/popup_exam_overview";
import clsx from "clsx";
import TagScore from "../components/tags/tag_standard";
import FilterHead from "../components/filter/filter_head";
import { toast } from "sonner";
import DspNotification from "../components/toaster/notifications/DspNotification";

type TabState = "übersicht" | "verfügbar" | "inBearbeitung" | "abgeschlossen";
type UserExamStatus =
  | "locked"
  | "available"
  | "started"
  | "submitted"
  | "graded";

// NEU: Mapping für Tab-Beschriftungen
const tabLabels: Record<TabState, string> = {
  übersicht: "Übersicht",
  verfügbar: "Verfügbar",
  inBearbeitung: "In Bearbeitung", // Korrekte Beschriftung
  abgeschlossen: "Abgeschlossen",
};

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

function FinalExam() {
  const [activeTab, setActiveTab] = useState<TabState>("übersicht");
  const [sliderStyle, setSliderStyle] = useState({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComment, setSubmissionComment] = useState("");
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(
    null
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedExamForPopup, setSelectedExamForPopup] = useState<Exam | null>(
    null
  );
  const [selectedAttemptForPopup, setSelectedAttemptForPopup] =
    useState<ExamAttempt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ExamContext-Daten und Funktionen abrufen
  const {
    availableExams,
    activeExams,
    completedExams,
    loadingUserExams,
    errorUserExams,
    startExam,
    submitExam,
    refreshUserExams,
    allExams,
    loadingAllExams,
    errorAllExams,
  } = useExams();

  // DEBUG: Log des ExamContext beim Mount und wenn sich availableExams ändert
  useEffect(() => {
    console.log("FinalExam Component: ExamContext Daten geladen:", {
      availableExamsCount: availableExams.length,
      activeExamsCount: activeExams.length,
      completedExamsCount: completedExams.length,
      loadingStatus: loadingUserExams,
      errorStatus: errorUserExams,
    });

    // Detaillierte Ausgabe der verfügbaren Prüfungen
    if (availableExams.length > 0) {
      console.log("Verfügbare Prüfungen:", availableExams);
      console.log("Erste Prüfung:", {
        id: availableExams[0].id,
        title: availableExams[0].exam_title,
        description: availableExams[0].exam_description,
        difficulty: availableExams[0].exam_difficulty,
        duration: availableExams[0].exam_duration_week,
        criteria: availableExams[0].criteria,
      });
    } else {
      console.log("Keine verfügbaren Prüfungen vorhanden");
    }
  }, [
    availableExams,
    activeExams,
    completedExams,
    loadingUserExams,
    errorUserExams,
  ]);

  // --- Breadcrumb Items ---
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Abschlussprüfungen" },
  ];

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    const activeButton = container.querySelector<HTMLButtonElement>(
      `[data-tab="${activeTab}"]`
    );
    if (activeButton) {
      setSliderStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab]);

  // Tab-Rendering-Funktion - jetzt mit Label-Mapping
  const renderTabs = () => (
    <div
      ref={tabsRef}
      className="relative flex space-x-1 border border-gray-300 p-1 rounded-lg bg-gray-100 mb-8 self-start"
    >
      <div
        className="absolute inset-y-0 bg-dsp-orange rounded-md shadow-sm transition-all duration-300 ease-out pointer-events-none"
        style={sliderStyle}
      />
      {(Object.keys(tabLabels) as TabState[]).map((tab) => (
        <button
          key={tab}
          data-tab={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative z-10 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer 
            ${
              activeTab === tab
                ? "text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
        >
          {tabLabels[tab]} {/* Verwende das Label aus dem Mapping */}
        </button>
      ))}
    </div>
  );

  // Funktion zum Starten einer Prüfung
  const handleStartExam = async (examId: number) => {
    console.log(`Starting exam ${examId}`);
    try {
      const result = await startExam(examId);
      console.log("Prüfung starten Ergebnis:", result);
      if (result) {
        setActiveTab("inBearbeitung");
        await refreshUserExams();
        // ERFOLG-TOAST
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="success"
            title="Prüfung gestartet"
            message={`Du hast die Prüfung '${
              result.exam?.exam_title || `#${examId}`
            }' erfolgreich gestartet.`}
          />
        ));
      } else {
        // FEHLER-TOAST (wenn result null/false ist)
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="error"
            title="Start fehlgeschlagen"
            message={`Die Prüfung konnte nicht gestartet werden. Möglicherweise ist sie nicht mehr verfügbar.`}
          />
        ));
      }
    } catch (error) {
      console.error("Fehler beim Starten der Prüfung:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      // FEHLER-TOAST (bei Exception)
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="error"
          title="Start fehlgeschlagen"
          message={`Ein Fehler ist aufgetreten: ${errorMsg}`}
        />
      ));
    }
  };

  // Funktion zum Abgeben einer Prüfung
  const handleSubmitExam = async () => {
    if (selectedAttemptId !== null) {
      console.log(
        `Submitting exam attempt ${selectedAttemptId} with ${uploadedFiles.length} files`
      );
      try {
        const success = await submitExam(selectedAttemptId, uploadedFiles);
        if (success) {
          setIsSubmitting(false);
          setUploadedFiles([]);
          setSubmissionComment("");
          const submittedAttemptTitle =
            activeExams.find((a) => a.id === selectedAttemptId)?.exam
              .exam_title || `#${selectedAttemptId}`;
          setSelectedAttemptId(null);
          await refreshUserExams();
          setActiveTab("abgeschlossen");
          // ERFOLG-TOAST
          toast.custom((t) => (
            <DspNotification
              id={t}
              type="success"
              title="Prüfung abgegeben"
              message={`Deine Einreichung für '${submittedAttemptTitle}' wurde erfolgreich übermittelt.`}
            />
          ));
        } else {
          // FEHLER-TOAST
          toast.custom((t) => (
            <DspNotification
              id={t}
              type="error"
              title="Abgabe fehlgeschlagen"
              message="Deine Prüfung konnte nicht abgegeben werden. Bitte versuche es erneut."
            />
          ));
        }
      } catch (error) {
        console.error("Fehler beim Abgeben der Prüfung:", error);
        const errorMsg =
          error instanceof Error ? error.message : "Unbekannter Fehler";
        // FEHLER-TOAST (bei Exception)
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="error"
            title="Abgabe fehlgeschlagen"
            message={`Ein Fehler ist aufgetreten: ${errorMsg}`}
          />
        ));
      }
    }
  };

  // Öffnen des Abgabe-Dialogs
  const openSubmissionDialog = (attemptId: number) => {
    setSelectedAttemptId(attemptId);
    setIsSubmitting(true);
  };

  // Datei-Upload-Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  // NEU: Handler für Popup
  const handleOpenPopup = (exam: Exam, attempt?: ExamAttempt) => {
    console.log("Öffne Popup für:", { exam, attempt });
    setSelectedExamForPopup(exam);
    setSelectedAttemptForPopup(attempt || null);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedExamForPopup(null);
    setSelectedAttemptForPopup(null);
  };

  // ================================
  // NEU: Rendering für Übersichtstab
  // ================================
  const renderOverviewTab = () => {
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
                    userExamStatus === "submitted" ||
                    userExamStatus === "graded",
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
                      onClick={() => handleOpenPopup(exam)}
                    />
                  </div>
                )}
                {userExamStatus === "available" && (
                  <div className="flex justify-end w-full">
                    <ButtonPrimary
                      title="Details anzeigen"
                      classNameButton="w-full sm:w-auto text-sm"
                      onClick={() => handleOpenPopup(exam)}
                    />
                  </div>
                )}
                {userExamStatus === "started" && attempt && (
                  <div className="flex justify-end w-full">
                    <ButtonPrimary
                      title="Details anzeigen"
                      classNameButton="w-full sm:w-auto text-sm"
                      onClick={() => handleOpenPopup(exam, attempt)}
                    />
                  </div>
                )}
                {userExamStatus === "submitted" && attempt && (
                  <div className="flex justify-end w-full">
                    <ButtonPrimary
                      title="Details anzeigen"
                      classNameButton="w-full sm:w-auto text-sm"
                      onClick={() => handleOpenPopup(exam, attempt)}
                    />
                  </div>
                )}
                {userExamStatus === "graded" && attempt && (
                  <div className="flex justify-end w-full">
                    <ButtonPrimary
                      title="Details anzeigen"
                      classNameButton="w-full sm:w-auto text-sm"
                      onClick={() => handleOpenPopup(exam, attempt)}
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

  // Verfügbare Prüfungen rendern
  const renderAvailableExams = () => {
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
                    <IoPlayOutline
                      className="text-lime-500"
                      title="Verfügbar"
                    />
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
                    onClick={() => handleOpenPopup(exam)}
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

  // In Bearbeitung befindliche Prüfungen rendern
  const renderInProgressExams = () => {
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
                  onClick={() => handleOpenPopup(attempt.exam, attempt)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Abgeschlossene Prüfungen rendern
  const renderCompletedExams = () => {
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
                onClick={() => handleOpenPopup(attempt.exam, attempt)}
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

  return (
    <div className="p-6 min-h-screen">
      <div>
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        <h1 className="text-3xl font-bold text-gray-800">Abschlussprüfungen</h1>
        <p className="text-base text-gray-600 mb-6">
          Hier findest du alle verfügbaren Abschlussprüfungen und kannst deine
          Prüfungsunterlagen hochladen.
        </p>

        <FilterHead
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Prüfungen durchsuchen..."
          className="mb-6"
        />

        {renderTabs()}

        <div className="mt-6">
          {activeTab === "übersicht" && renderOverviewTab()}
          {activeTab === "verfügbar" && renderAvailableExams()}
          {activeTab === "inBearbeitung" && renderInProgressExams()}
          {activeTab === "abgeschlossen" && renderCompletedExams()}
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl z-50 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsSubmitting(false)}
                className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Schließen"
              >
                <IoCloseOutline size={24} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Prüfung abgeben
              </h2>
              <div className="mb-6">
                <label
                  htmlFor="fileUpload"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Dateien hochladen
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {uploadedFiles.length}{" "}
                    {uploadedFiles.length === 1 ? "Datei" : "Dateien"}{" "}
                    ausgewählt
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="submissionCommentPopup"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kommentar
                </label>
                <textarea
                  id="submissionCommentPopup"
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  value={submissionComment}
                  onChange={(e) => setSubmissionComment(e.target.value)}
                ></textarea>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <ButtonSecondary
                  title="Abbrechen"
                  onClick={() => setIsSubmitting(false)}
                />
                <ButtonPrimary title="Absenden" onClick={handleSubmitExam} />
              </div>
            </div>
          </div>
        )}

        {isPopupOpen && selectedExamForPopup && (
          <PopupExamOverview
            exam={selectedExamForPopup}
            attempt={selectedAttemptForPopup}
            onClose={handleClosePopup}
            onStartExam={handleStartExam}
            onPrepareSubmission={openSubmissionDialog}
          />
        )}
      </div>
    </div>
  );
}

export default FinalExam;
