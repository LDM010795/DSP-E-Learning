import React, { useState, useRef, useEffect } from "react";
import Breadcrumbs from "../../components/ui_elements/breadcrumbs";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import { IoCloseOutline } from "react-icons/io5";
import { useExams, Exam, ExamAttempt } from "../../context/ExamContext";
import PopupExamOverview from "../../components/pop_ups/popup_exam_overview";
import FilterHead from "../../components/filter/filter_head";
import SubBackground from "../../components/layouts/SubBackground";
import { toast } from "sonner";
import DspNotification from "../../components/toaster/notifications/DspNotification";
import Overview from "./overview";
import Available from "./available";
import InProgress from "./in_progress";
import Completed from "./completed";
import clsx from "clsx";

type TabState = "übersicht" | "verfügbar" | "inBearbeitung" | "abgeschlossen";

// NEU: Mapping für Tab-Beschriftungen
const tabLabels: Record<TabState, string> = {
  übersicht: "Übersicht",
  verfügbar: "Verfügbar",
  inBearbeitung: "In Bearbeitung", // Korrekte Beschriftung
  abgeschlossen: "Abgeschlossen",
};

const IndexFinalExam: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabState>("übersicht");
  const [sliderStyle, setSliderStyle] = useState({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComment, setSubmissionComment] = useState("");
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(
    null,
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedExamForPopup, setSelectedExamForPopup] = useState<Exam | null>(
    null,
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
      `[data-tab="${activeTab}"]`,
    );
    if (activeButton) {
      setSliderStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab]);

  // Tab-Rendering-Funktion - jetzt mit glasigen Design
  const renderTabs = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm p-2 mb-6">
      <div ref={tabsRef} className="relative flex space-x-1">
        <div
          className="absolute inset-y-0 bg-dsp-orange rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
          style={sliderStyle}
        />
        {(Object.keys(tabLabels) as TabState[]).map((tab) => (
          <button
            key={tab}
            data-tab={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer",
              activeTab === tab
                ? "text-white"
                : "text-gray-600 hover:text-dsp-orange hover:bg-dsp-orange/5",
            )}
          >
            {tabLabels[tab]} {/* Verwende das Label aus dem Mapping */}
          </button>
        ))}
      </div>
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
        `Submitting exam attempt ${selectedAttemptId} with ${uploadedFiles.length} files`,
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
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Hier findest du alle verfügbaren Abschlussprüfungen und kannst
                deine Prüfungsunterlagen hochladen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-[95vw] mx-auto">
          {/* Search & Tabs Container */}
          <SubBackground className="mb-6">
            <FilterHead
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Prüfungen durchsuchen..."
              className="mb-6"
            />

            {renderTabs()}
          </SubBackground>

          {/* Content Area */}
          <SubBackground>
            <div className="mt-0">
              {activeTab === "übersicht" && (
                <Overview
                  allExams={allExams}
                  availableExams={availableExams}
                  activeExams={activeExams}
                  completedExams={completedExams}
                  loadingAllExams={loadingAllExams}
                  loadingUserExams={loadingUserExams}
                  errorAllExams={errorAllExams}
                  errorUserExams={errorUserExams}
                  searchTerm={searchTerm}
                  onOpenPopup={handleOpenPopup}
                />
              )}
              {activeTab === "verfügbar" && (
                <Available
                  availableExams={availableExams}
                  loadingUserExams={loadingUserExams}
                  errorUserExams={errorUserExams}
                  searchTerm={searchTerm}
                  onOpenPopup={handleOpenPopup}
                />
              )}
              {activeTab === "inBearbeitung" && (
                <InProgress
                  activeExams={activeExams}
                  loadingUserExams={loadingUserExams}
                  errorUserExams={errorUserExams}
                  onOpenPopup={handleOpenPopup}
                />
              )}
              {activeTab === "abgeschlossen" && (
                <Completed
                  completedExams={completedExams}
                  loadingUserExams={loadingUserExams}
                  errorUserExams={errorUserExams}
                  onOpenPopup={handleOpenPopup}
                />
              )}
            </div>
          </SubBackground>
        </div>
      </div>

      {/* Submission Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 p-8 w-full max-w-3xl z-50 max-h-[90vh] overflow-y-auto">
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
                  {uploadedFiles.length === 1 ? "Datei" : "Dateien"} ausgewählt
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

      {/* Exam Popup */}
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
};

export default IndexFinalExam;
