import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../components/ui_elements/buttons/button_secondary";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import SubBackground from "../components/layouts/SubBackground";
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
  IoSearchOutline,
  IoDocumentTextOutline,
  IoClipboardOutline,
  IoTrophyOutline,
  IoAlertCircleOutline,
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

// Tab-Konfiguration mit Icons
const tabConfig: Record<TabState, { label: string; icon: React.ElementType }> =
  {
    übersicht: { label: "Übersicht", icon: IoClipboardOutline },
    verfügbar: { label: "Verfügbar", icon: IoPlayOutline },
    inBearbeitung: { label: "In Bearbeitung", icon: IoHourglassOutline },
    abgeschlossen: { label: "Abgeschlossen", icon: IoTrophyOutline },
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

// Definiert die Reihenfolge für die Sortierung nach Status
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
      return 6;
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

  // Moderne Tab-Rendering-Funktion
  const renderTabs = () => (
    <div className="flex items-center justify-center mb-8">
      <SubBackground className="p-1">
        <div ref={tabsRef} className="relative flex space-x-1">
          <div
            className="absolute inset-y-1 bg-[#ff863d] rounded-lg shadow-sm transition-all duration-200 ease-out pointer-events-none"
            style={sliderStyle}
          />
          {(Object.keys(tabConfig) as TabState[]).map((tab) => {
            const { label, icon: Icon } = tabConfig[tab];
            return (
              <motion.button
                key={tab}
                data-tab={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer flex items-center space-x-2 ${
                  activeTab === tab
                    ? "text-white"
                    : "text-gray-600 hover:text-[#ff863d]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </motion.button>
            );
          })}
        </div>
      </SubBackground>
    </div>
  );

  // Funktion zum Starten einer Prüfung
  const handleStartExam = async (examId: number) => {
    try {
      const result = await startExam(examId);
      if (result) {
        setActiveTab("inBearbeitung");
        await refreshUserExams();
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
      const errorMsg =
        error instanceof Error ? error.message : "Unbekannter Fehler";
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
          toast.custom((t) => (
            <DspNotification
              id={t}
              type="success"
              title="Prüfung abgegeben"
              message={`Deine Einreichung für '${submittedAttemptTitle}' wurde erfolgreich übermittelt.`}
            />
          ));
        } else {
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
        const errorMsg =
          error instanceof Error ? error.message : "Unbekannter Fehler";
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

  const openSubmissionDialog = (attemptId: number) => {
    setSelectedAttemptId(attemptId);
    setIsSubmitting(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleOpenPopup = (exam: Exam, attempt?: ExamAttempt) => {
    setSelectedExamForPopup(exam);
    setSelectedAttemptForPopup(attempt || null);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedExamForPopup(null);
    setSelectedAttemptForPopup(null);
  };

  // Rendering für Übersichtstab
  const renderOverviewTab = () => {
    if (loadingAllExams || loadingUserExams) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner
            message="Lade Prüfungsübersicht..."
            size="lg"
            variant="pulse"
            showBackground={false}
          />
        </div>
      );
    }

    if (errorAllExams || errorUserExams) {
      return (
        <SubBackground className="text-center py-12">
          <IoAlertCircleOutline className="text-6xl text-red-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-red-700 mb-2">
            Fehler beim Laden der Prüfungsübersicht
          </h3>
          <p className="text-gray-600">{errorAllExams || errorUserExams}</p>
        </SubBackground>
      );
    }

    if (allExams.length === 0) {
      return (
        <SubBackground className="text-center py-12">
          <IoDocumentTextOutline className="text-6xl text-gray-400 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Keine Prüfungen gefunden
          </h3>
          <p className="text-gray-500">Keine Prüfungen im System gefunden.</p>
        </SubBackground>
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

    // Prüfungen mit Status und Attempt anreichern
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

    // Nach Suchbegriff filtern
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
        <SubBackground className="text-center py-12">
          <IoSearchOutline className="text-6xl text-gray-400 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Keine Prüfungen gefunden
          </h3>
          <p className="text-gray-500">
            Keine Prüfungen entsprechen den aktuellen Kriterien.
          </p>
        </SubBackground>
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
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -2 }}
              className={clsx(
                "group overflow-hidden border transition-all duration-200",
                {
                  "border-l-4 border-l-green-500": userExamStatus === "started",
                  "border-l-4 border-l-blue-500":
                    userExamStatus === "submitted" ||
                    userExamStatus === "graded",
                }
              )}
            >
              <SubBackground
                className={clsx("h-full", {
                  "opacity-60 grayscale": isLocked,
                })}
              >
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className={clsx(
                        "text-lg font-semibold leading-tight mr-2",
                        isLocked
                          ? "text-gray-500"
                          : "text-gray-800 group-hover:text-[#ff863d] transition-colors duration-200"
                      )}
                    >
                      {exam.exam_title || "Titel nicht verfügbar"}
                    </h3>
                    <div className="flex-shrink-0">
                      {userExamStatus === "locked" && (
                        <IoLockClosedOutline
                          className="text-gray-400 w-5 h-5"
                          title="Gesperrt"
                        />
                      )}
                      {userExamStatus === "available" && (
                        <IoPlayOutline
                          className="text-green-500 w-5 h-5"
                          title="Verfügbar"
                        />
                      )}
                      {userExamStatus === "started" && (
                        <IoHourglassOutline
                          className="text-[#ff863d] w-5 h-5 animate-pulse"
                          title="In Bearbeitung"
                        />
                      )}
                      {userExamStatus === "submitted" && (
                        <IoCheckmarkCircleOutline
                          className="text-blue-500 w-5 h-5"
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
                      "text-sm mb-4 text-gray-600 leading-relaxed",
                      { italic: isLocked }
                    )}
                  >
                    {isLocked
                      ? "Voraussetzungen noch nicht erfüllt oder bereits anderer Versuch gestartet/beendet."
                      : truncateText(exam.exam_description, 100)}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <IoTimeOutline className="mr-2 w-4 h-4" />
                    <span>
                      {exam.exam_duration_week}{" "}
                      {exam.exam_duration_week === 1 ? "Woche" : "Wochen"}
                    </span>
                  </div>

                  {attempt && (
                    <div className="pt-3 border-t border-gray-200 text-sm space-y-2">
                      {userExamStatus === "started" && attempt.due_date && (
                        <div className="flex items-center text-red-600 font-medium">
                          <IoFlagOutline className="mr-2 w-4 h-4" />
                          <span>Fällig: {formatDate(attempt.due_date)}</span>
                        </div>
                      )}
                      {(userExamStatus === "submitted" ||
                        userExamStatus === "graded") &&
                        attempt.submitted_at && (
                          <div className="flex items-center text-gray-600">
                            <IoCheckmarkDoneOutline className="mr-2 w-4 h-4 text-green-600" />
                            <span>
                              Abgegeben: {formatDate(attempt.submitted_at)}
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  {userExamStatus === "locked" && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 italic">
                        Zum Freischalten Module absolvieren
                      </span>
                      <ButtonSecondary
                        title="Details"
                        classNameButton="text-sm px-3 py-1"
                        onClick={() => handleOpenPopup(exam)}
                      />
                    </div>
                  )}
                  {userExamStatus !== "locked" && (
                    <ButtonPrimary
                      title="Details anzeigen"
                      classNameButton="w-full text-sm"
                      onClick={() => handleOpenPopup(exam, attempt)}
                    />
                  )}
                </div>
              </SubBackground>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Verfügbare Prüfungen rendern
  const renderAvailableExams = () => {
    if (loadingUserExams) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner
            message="Lade verfügbare Prüfungen..."
            size="lg"
            variant="spinner"
            showBackground={false}
          />
        </div>
      );
    }

    if (errorUserExams) {
      return (
        <SubBackground className="text-center py-12">
          <IoAlertCircleOutline className="text-6xl text-red-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-red-700 mb-2">
            Fehler beim Laden der Prüfungen
          </h3>
          <p className="text-gray-600">{errorUserExams}</p>
        </SubBackground>
      );
    }

    if (availableExams.length === 0) {
      return (
        <SubBackground className="text-center py-12">
          <IoPlayOutline className="text-6xl text-gray-400 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Keine verfügbaren Prüfungen
          </h3>
          <p className="text-gray-500">
            Derzeit sind keine Prüfungen verfügbar.
          </p>
        </SubBackground>
      );
    }

    // Nach Suchbegriff filtern
    const filteredAvailableExams = availableExams.filter((exam) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        !searchTerm ||
        (exam.exam_title || "").toLowerCase().includes(lowerSearchTerm)
      );
    });

    if (filteredAvailableExams.length === 0) {
      return (
        <SubBackground className="text-center py-12">
          <IoSearchOutline className="text-6xl text-gray-400 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Keine Prüfungen gefunden
          </h3>
          <p className="text-gray-500">
            Keine verfügbaren Prüfungen entsprechen den aktuellen Kriterien.
          </p>
        </SubBackground>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAvailableExams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="group"
          >
            <SubBackground className="h-full hover:bg-white/70 transition-all duration-200">
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 leading-tight mr-2 group-hover:text-[#ff863d] transition-colors duration-200">
                    {exam.exam_title || "Titel nicht verfügbar"}
                  </h3>
                  <div className="flex-shrink-0">
                    <IoPlayOutline
                      className="text-green-500 w-5 h-5"
                      title="Verfügbar"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {truncateText(exam.exam_description, 100)}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <IoTimeOutline className="mr-2 w-4 h-4" />
                  <span>
                    {exam.exam_duration_week}{" "}
                    {exam.exam_duration_week === 1 ? "Woche" : "Wochen"}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <ButtonPrimary
                  title="Details anzeigen"
                  onClick={() => handleOpenPopup(exam)}
                  classNameButton="w-full text-sm"
                />
              </div>
            </SubBackground>
          </motion.div>
        ))}
      </div>
    );
  };

  // In Bearbeitung befindliche Prüfungen rendern
  const renderInProgressExams = () => {
    if (loadingUserExams) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner
            message="Lade laufende Prüfungen..."
            size="lg"
            variant="spinner"
            showBackground={false}
          />
        </div>
      );
    }

    if (errorUserExams) {
      return (
        <SubBackground className="text-center py-12">
          <IoAlertCircleOutline className="text-6xl text-red-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-red-700 mb-2">
            Fehler beim Laden der Prüfungen
          </h3>
          <p className="text-gray-600">{errorUserExams}</p>
        </SubBackground>
      );
    }

    if (activeExams.length === 0) {
      return (
        <SubBackground className="text-center py-12">
          <IoHourglassOutline className="text-6xl text-gray-400 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Keine laufenden Prüfungen
          </h3>
          <p className="text-gray-500">
            Du hast derzeit keine Prüfungen in Bearbeitung.
          </p>
        </SubBackground>
      );
    }

    return (
      <div className="space-y-6">
        {activeExams.map((attempt, index) => (
          <motion.div
            key={attempt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="group"
          >
            <SubBackground className="hover:bg-white/70 transition-all duration-200">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-[#ff863d] transition-colors duration-200">
                        {attempt.exam.exam_title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {truncateText(attempt.exam.exam_description, 150)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-[#ffe7d4] border border-[#ff863d]/20 rounded-full">
                        <IoHourglassOutline
                          className="text-[#ff863d] w-4 h-4 animate-pulse"
                          title="In Bearbeitung"
                        />
                        <span className="text-sm font-medium text-[#ff863d]">
                          In Bearbeitung
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <IoCalendarOutline className="mr-2 w-4 h-4" />
                      <span>
                        <span className="font-medium">Gestartet:</span>{" "}
                        {formatDate(attempt.started_at)}
                      </span>
                    </div>
                    <div className="flex items-center text-red-600 font-medium">
                      <IoFlagOutline className="mr-2 w-4 h-4" />
                      <span>
                        <span className="font-medium">Fällig:</span>{" "}
                        {formatDate(attempt.due_date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <ButtonPrimary
                    title="Details anzeigen & Abgeben"
                    classNameButton="w-full lg:w-auto text-sm whitespace-nowrap"
                    onClick={() => handleOpenPopup(attempt.exam, attempt)}
                  />
                </div>
              </div>
            </SubBackground>
          </motion.div>
        ))}
      </div>
    );
  };

  // Abgeschlossene Prüfungen rendern
  const renderCompletedExams = () => {
    if (loadingUserExams) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner
            message="Lade abgeschlossene Prüfungen..."
            size="lg"
            variant="spinner"
            showBackground={false}
          />
        </div>
      );
    }

    if (errorUserExams) {
      return (
        <SubBackground className="text-center py-12">
          <IoAlertCircleOutline className="text-6xl text-red-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-red-700 mb-2">
            Fehler beim Laden der Prüfungen
          </h3>
          <p className="text-gray-600">{errorUserExams}</p>
        </SubBackground>
      );
    }

    if (completedExams.length === 0) {
      return (
        <SubBackground className="text-center py-12">
          <IoTrophyOutline className="text-6xl text-gray-400 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Noch keine abgeschlossenen Prüfungen
          </h3>
          <p className="text-gray-500">
            Du hast noch keine Prüfungen abgeschlossen.
          </p>
        </SubBackground>
      );
    }

    return (
      <div className="space-y-4">
        {completedExams.map((attempt, index) => {
          const maxScore =
            attempt.exam?.criteria?.reduce((sum, c) => sum + c.max_points, 0) ??
            null;
          const isGraded = attempt.status === "graded";

          return (
            <motion.div
              key={attempt.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -1 }}
              className="group cursor-pointer"
              onClick={() => handleOpenPopup(attempt.exam, attempt)}
            >
              <SubBackground className="hover:bg-white/70 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-[#ff863d] transition-colors duration-200">
                          {attempt.exam.exam_title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {truncateText(attempt.exam.exam_description, 150)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {isGraded ? (
                          <TagScore score={attempt.score} maxScore={maxScore} />
                        ) : (
                          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                            <IoCheckmarkCircleOutline
                              className="text-blue-500 w-4 h-4"
                              title="Abgegeben"
                            />
                            <span className="text-sm font-medium text-blue-700">
                              Abgegeben
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <IoCheckmarkDoneOutline className="mr-2 w-4 h-4 text-green-600" />
                      <span>
                        {isGraded ? (
                          <>
                            <span className="font-medium">Bewertet:</span>{" "}
                            {attempt.graded_at
                              ? formatDate(attempt.graded_at)
                              : "Unbekannt"}
                          </>
                        ) : (
                          <>
                            <span className="font-medium">Abgegeben:</span>{" "}
                            {attempt.submitted_at
                              ? formatDate(attempt.submitted_at)
                              : "Unbekannt"}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center">
                    <div className="text-xs text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full">
                      Details anzeigen
                    </div>
                  </div>
                </div>
              </SubBackground>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative px-3 pt-3 pb-6">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-3" />

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
                Abschlussprüfung
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Hier findest du alle verfügbaren Abschlussprüfungen und kannst
                deine Prüfungsunterlagen hochladen.
              </p>
            </div>

            <SubBackground className="mb-8">
              <FilterHead
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Prüfungen durchsuchen..."
                className=""
              />
            </SubBackground>

            {renderTabs()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 pb-6">
        <div className="max-w-[95vw] mx-auto">
          {activeTab === "übersicht" && renderOverviewTab()}
          {activeTab === "verfügbar" && renderAvailableExams()}
          {activeTab === "inBearbeitung" && renderInProgressExams()}
          {activeTab === "abgeschlossen" && renderCompletedExams()}
        </div>
      </div>

      {/* Submission Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <SubBackground className="p-8">
              <button
                onClick={() => setIsSubmitting(false)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-800 hover:bg-white/60 rounded-full transition-all duration-200"
                aria-label="Schließen"
              >
                <IoCloseOutline className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-xl bg-[#ffe7d4]">
                  <IoDocumentTextOutline className="w-6 h-6 text-[#ff863d]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Prüfung abgeben
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="fileUpload"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Dateien hochladen
                  </label>
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ff863d]/20 focus:border-[#ff863d] transition-all duration-200"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-sm text-green-700">
                        <IoCheckmarkCircleOutline className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                          {uploadedFiles.length}{" "}
                          {uploadedFiles.length === 1 ? "Datei" : "Dateien"}{" "}
                          ausgewählt
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="submissionCommentPopup"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Kommentar (optional)
                  </label>
                  <textarea
                    id="submissionCommentPopup"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ff863d]/20 focus:border-[#ff863d] transition-all duration-200 resize-none"
                    placeholder="Zusätzliche Anmerkungen zu deiner Abgabe..."
                    value={submissionComment}
                    onChange={(e) => setSubmissionComment(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <ButtonSecondary
                  title="Abbrechen"
                  onClick={() => setIsSubmitting(false)}
                  classNameButton="w-full sm:w-auto"
                />
                <ButtonPrimary
                  title="Prüfung abgeben"
                  onClick={handleSubmitExam}
                  classNameButton="w-full sm:w-auto"
                />
              </div>
            </SubBackground>
          </motion.div>
        </div>
      )}

      {/* Exam Details Popup */}
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
  );
}

export default FinalExam;
