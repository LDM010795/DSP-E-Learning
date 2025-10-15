import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
// import clsx from "clsx"; // Entfernt
import {
  // IoCalendarOutline, // Entfernt
  // IoTimeOutline, // Entfernt
  IoDocumentTextOutline,
  IoCodeSlashOutline,
  IoServerOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoHourglassOutline,
  IoArrowBackOutline,
  IoDownloadOutline,
  IoSaveOutline,
  IoContractOutline,
  IoExpandOutline,
} from "react-icons/io5";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import {
  useExams,
  ExamAttempt as ContextExamAttempt,
  ExamAttachment as ContextExamAttachment,
  Criterion,
} from "../../context/ExamContext";
import LoadingSpinner from "../../components/ui_elements/loading_spinner";
import TableExamsAssessed from "../../components/tables/table_exams_assessed";
import ButtonFilterSimple from "../../components/ui_elements/buttons/button_filter_simple";
import FilterHead from "../../components/filter/filter_head";
import { toast } from "sonner";
import DspNotification from "../../components/toaster/notifications/DspNotification";

// --- Lokale Typdefinitionen --- //
// Entfernt: Lokale Definitionen, da sie Konflikte verursachen
// interface ExamAttachment {
//   id: number;
//   file: string;
//   file_type: "pdf" | "csv" | "py" | "db" | "other"; // Dieses Feld fehlt im Kontext-Typ
//   uploaded_at?: string;
// }
// interface ExamAttempt extends ContextExamAttempt {
//   attachments?: ExamAttachment[]; // Verwendet den lokalen Typ
//   exam: ContextExamAttempt["exam"] & {
//     total_max_points?: number;
//     exam_title?: string;
//   };
// }

// Verwende den importierten Typ direkt
type ExamAttempt = ContextExamAttempt;
type ExamAttachment = ContextExamAttachment;

// --- Hilfskomponenten --- //
// KORREKTUR: Passe getFileType an, um den Typ aus dem Kontext zu verwenden
//           Da file_type nicht im Kontext existiert, muss diese Logik angepasst
//           oder der Typ im Kontext erweitert werden. Vorerst: Dateiendung direkt prüfen.
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "other";
};

// KORREKTUR: Passe FileIcon an, um Dateiendung statt file_type zu nutzen
const FileIcon: React.FC<{ filename: string }> = ({ filename }) => {
  const extension = getFileExtension(filename);
  switch (extension) {
    case "pdf":
      return <IoDocumentTextOutline className="text-red-500 mr-1 shrink-0" />;
    case "csv":
      return <IoServerOutline className="text-green-500 mr-1 shrink-0" />;
    case "py":
      return <IoCodeSlashOutline className="text-blue-500 mr-1 shrink-0" />;
    default:
      return <IoDocumentTextOutline className="text-gray-500 mr-1 shrink-0" />;
  }
};

const StatusBadge: React.FC<{ status: ExamAttempt["status"] }> = ({
  status,
}) => {
  let bgColor, textColor, Icon, text;
  switch (status) {
    case "started":
      bgColor = "bg-orange-100";
      textColor = "text-orange-700";
      Icon = IoHourglassOutline;
      text = "Gestartet";
      break;
    case "submitted":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-700";
      Icon = IoAlertCircleOutline;
      text = "Eingereicht";
      break;
    case "graded":
      bgColor = "bg-green-100";
      textColor = "text-green-700";
      Icon = IoCheckmarkCircle;
      text = "Bewertet";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-700";
      Icon = IoAlertCircleOutline;
      text = "Unbekannt";
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} whitespace-nowrap`}
    >
      <Icon className="mr-1" />
      {text}
    </span>
  );
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Ungültiges Datum";
  }
};

// --- Detailansicht Komponente --- //
interface ExamReviewDetailProps {
  attempt: ExamAttempt;
  onBackToList: () => void;
}

const ExamReviewDetail: React.FC<ExamReviewDetailProps> = ({
  attempt,
  onBackToList,
}) => {
  const { gradeExam, refreshTeacherData } = useExams();
  const [isGrading, setIsGrading] = useState(false);

  const initialScores = useMemo(
    () =>
      attempt.exam.criteria.reduce(
        (acc, criterion) => {
          const existingScore = attempt.criterion_scores?.find(
            (s) => s.criterion.id === criterion.id,
          );
          acc[criterion.id] = existingScore
            ? parseFloat(existingScore.achieved_points.toString())
            : "";
          return acc;
        },
        {} as Record<number, number | string>,
      ),
    [attempt.exam.criteria, attempt.criterion_scores],
  );

  const [scores, setScores] =
    useState<Record<number, number | string>>(initialScores);
  const [feedback, setFeedback] = useState(attempt.feedback || "");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScores(initialScores);
    setFeedback(attempt.feedback || "");
  }, [attempt.id, initialScores, attempt.feedback]); // Reset state when attempt changes

  const maxScores = useMemo(
    () =>
      attempt.exam.criteria.reduce(
        (acc, criterion) => {
          acc[criterion.id] = criterion.max_points;
          return acc;
        },
        {} as Record<number, number>,
      ),
    [attempt.exam.criteria],
  );

  const handleScoreChange = (criterionId: number, value: string) => {
    const numValue = value === "" ? "" : parseFloat(value);
    const max = maxScores[criterionId];

    if (typeof numValue === "number" && !isNaN(numValue)) {
      if (max !== undefined && numValue > max) {
        setScores((prev) => ({ ...prev, [criterionId]: max }));
      } else if (numValue < 0) {
        setScores((prev) => ({ ...prev, [criterionId]: 0 }));
      } else {
        const roundedValue = Math.round(numValue * 100) / 100;
        setScores((prev) => ({ ...prev, [criterionId]: roundedValue }));
      }
    } else {
      setScores((prev) => ({ ...prev, [criterionId]: "" }));
    }
  };

  const handleSaveReview = async () => {
    setIsGrading(true);
    console.log("Bewertung speichern:", {
      attemptId: attempt.id,
      scores,
      feedback,
    });

    const formattedScores = Object.entries(scores)
      .map(([criterionIdStr, achievedPoints]) => {
        const points = parseFloat(achievedPoints.toString());
        if (achievedPoints === "" || isNaN(points)) {
          return null;
        }
        return {
          criterion_id: parseInt(criterionIdStr),
          achieved_points: points,
        };
      })
      .filter(
        (item): item is { criterion_id: number; achieved_points: number } =>
          item !== null,
      );

    const allCriteriaIds = attempt.exam.criteria.map((c) => c.id);
    const scoredCriteriaIds = formattedScores.map((s) => s.criterion_id);
    const missingCriteria = allCriteriaIds.filter(
      (id) => !scoredCriteriaIds.includes(id),
    );

    if (missingCriteria.length > 0) {
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="warning"
          title="Unvollständige Bewertung"
          message={`Bitte bewerten Sie alle Kriterien. Fehlend: ${missingCriteria.join(
            ", ",
          )}`}
        />
      ));
      setIsGrading(false);
      return;
    }

    try {
      const success = await gradeExam(attempt.id, formattedScores, feedback);
      if (success) {
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="success"
            title="Bewertung gespeichert"
            message={`Die Bewertung für Versuch #${attempt.id} wurde erfolgreich übermittelt.`}
          />
        ));
        await refreshTeacherData();
        onBackToList();
      } else {
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="error"
            title="Speichern fehlgeschlagen"
            message="Die Bewertung konnte nicht gespeichert werden. Bitte erneut versuchen."
          />
        ));
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Bewertung:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Ein unerwarteter Fehler ist aufgetreten.";
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="error"
          title="Speichern fehlgeschlagen"
          message={`Ein Fehler ist aufgetreten: ${errorMsg}`}
        />
      ));
    } finally {
      setIsGrading(false);
    }
  };

  const maxTotalScore = useMemo(
    () =>
      attempt.exam.criteria.reduce(
        (sum, criterion) => sum + criterion.max_points,
        0,
      ),
    [attempt.exam.criteria],
  );

  const numericScores = useMemo(
    () =>
      Object.values(scores).map((score) => {
        const num = parseFloat(score.toString());
        return isNaN(num) ? 0 : num;
      }),
    [scores],
  );

  const totalScore = useMemo(
    () => numericScores.reduce((sum, numScore) => sum + numScore, 0),
    [numericScores],
  );

  const totalPercentage =
    maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

  const [activeAttachment, setActiveAttachment] =
    useState<ExamAttachment | null>(attempt.attachments?.[0] || null);

  const toggleFullscreen = async () => {
    const elem = previewRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      try {
        await elem.requestFullscreen();
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
          );
        } else {
          console.error("An unknown error occurred while entering fullscreen");
        }
      }
    } else {
      if (document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(
              `Error attempting to exit full-screen mode: ${err.message} (${err.name})`,
            );
          } else {
            console.error("An unknown error occurred while exiting fullscreen");
          }
        }
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Reset active attachment when attempt changes
  useEffect(() => {
    setActiveAttachment(attempt.attachments?.[0] || null);
  }, [attempt.id, attempt.attachments]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md p-4 sm:p-6"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <button
          onClick={onBackToList}
          className="flex items-center text-sm text-gray-600 hover:text-dsp-orange bg-white px-3 py-1.5 rounded-md border border-gray-300 shadow-sm whitespace-nowrap"
        >
          <IoArrowBackOutline className="mr-1.5" />
          Zurück zur Übersicht
        </button>
        <div className="flex items-center space-x-2 flex-wrap justify-end ">
          <StatusBadge status={attempt.status} />
          {attempt.due_date && (
            <div className="text-sm text-gray-500 whitespace-nowrap">
              Fällig: {formatDate(attempt.due_date)}
            </div>
          )}
        </div>
      </div>
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {attempt.exam.exam_title || "Unbenannte Prüfung"}
        </h2>
        <p className="text-sm text-gray-600">
          Student: {attempt.user.username} | Modul:{" "}
          {attempt.exam.modules?.map((m) => m.title).join(", ") || "N/A"}
        </p>
      </div>

      {/* Hauptbereich */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Spalte: Dokumente (Anhänge) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Eingereichte Dokumente
          </h3>
          {attempt.attachments && attempt.attachments.length > 0 ? (
            <>
              <div className="flex space-x-1 border-b mb-4 overflow-x-auto pb-px -mx-4 sm:-mx-6 px-4 sm:px-6">
                {attempt.attachments.map((attachment: ExamAttachment) => (
                  <button
                    key={attachment.id}
                    onClick={() => setActiveAttachment(attachment)}
                    className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-150 shrink-0 ${
                      activeAttachment?.id === attachment.id
                        ? "border-dsp-orange text-dsp-orange"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <FileIcon filename={attachment.file} />
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                      {attachment.file.split("/").pop() || attachment.file}
                    </span>
                  </button>
                ))}
              </div>
              <div
                ref={previewRef}
                className="bg-gray-50 rounded-md p-6 min-h-[400px] flex flex-col justify-center items-center text-center border border-gray-200 relative group"
                style={{ backgroundColor: isFullscreen ? "white" : undefined }}
              >
                {activeAttachment ? (
                  <>
                    <FileIcon filename={activeAttachment.file} />
                    <p className="font-medium text-gray-700 mb-1 mt-2">
                      Vorschau nicht verfügbar{" "}
                    </p>
                    <p className="text-sm text-gray-500 mb-6 break-all">
                      {activeAttachment.file.split("/").pop() ||
                        activeAttachment.file}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={toggleFullscreen}
                        className="flex items-center text-sm bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 shadow-sm"
                      >
                        {isFullscreen ? (
                          <IoContractOutline className="mr-1.5" />
                        ) : (
                          <IoExpandOutline className="mr-1.5" />
                        )}
                        {isFullscreen ? "Vollbild verlassen" : "Vollbild"}
                      </button>
                      <a
                        href={activeAttachment.file}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 shadow-sm"
                      >
                        <IoDownloadOutline className="mr-1.5" /> Herunterladen
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Keine Datei ausgewählt.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Keine Dokumente eingereicht.</p>
          )}
        </div>

        {/* Rechte Spalte: Bewertung */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Bewertung
            </h3>
            <div className="space-y-4">
              {attempt.exam.criteria.map((criterion) => {
                const criterionId = criterion.id;
                const max = maxScores[criterionId];
                const currentScore = scores[criterionId] ?? "";
                const percentage =
                  max > 0 &&
                  typeof currentScore === "number" &&
                  currentScore >= 0
                    ? Math.round((currentScore / max) * 100)
                    : 0;

                return (
                  <div key={criterionId}>
                    <label
                      htmlFor={`criterion-${criterionId}`}
                      className="block text-sm font-medium text-gray-600 mb-1.5"
                    >
                      {criterion.title}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        id={`criterion-${criterionId}`}
                        name={`criterion-${criterionId}`}
                        value={currentScore}
                        onChange={(e) =>
                          handleScoreChange(criterionId, e.target.value)
                        }
                        min="0"
                        max={max}
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-dsp-orange focus:border-dsp-orange shadow-sm"
                        placeholder="0"
                        disabled={attempt.status === "graded"}
                      />
                      <div className="flex-grow bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            percentage > 0 ? "bg-dsp-orange" : "bg-transparent"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right shrink-0">
                        {" "}
                        Max: {max}
                      </span>
                      <span className="text-xs font-medium text-gray-700 w-10 text-right shrink-0">
                        {" "}
                        {percentage}%
                      </span>
                    </div>
                    {criterion.description && (
                      <p className="text-xs text-gray-500 mt-1 ml-22">
                        {" "}
                        {criterion.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t mt-6 pt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-gray-700">
                  Gesamtpunktzahl
                </span>
                <span className="text-sm font-bold text-dsp-orange">
                  {totalScore.toFixed(2)} / {maxTotalScore.toFixed(2)} Punkte
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    totalPercentage > 0 ? "bg-dsp-orange" : "bg-transparent"
                  }`}
                  style={{ width: `${totalPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-700 block text-right mt-1">
                {totalPercentage}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Kommentare & Feedback
            </h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-dsp-orange focus:border-dsp-orange shadow-sm mb-3"
              placeholder="Geben Sie hier Ihr Feedback ein..."
              disabled={attempt.status === "graded"}
            />
            <ButtonPrimary
              title={isGrading ? "Speichern..." : "Bewertung abschließen"}
              onClick={handleSaveReview}
              icon={<IoSaveOutline className="mr-1.5" />}
              disabled={isGrading || attempt.status === "graded"}
              classNameButton="w-full"
            />
            {attempt.status === "graded" && (
              <p className="text-sm text-green-600 mt-2 text-center">
                Diese Prüfung wurde bereits bewertet.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Hauptkomponente --- //
type StatusLabel = "Eingereicht" | "Bewertet";

const AdminPanelExamReviewSection: React.FC = () => {
  const {
    teacherSubmissions,
    loadingTeacherData,
    errorTeacherData,
    refreshTeacherData,
  } = useExams();
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(
    null,
  );
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusLabel[]>(
    [],
  );
  const [examSearchTerm, setExamSearchTerm] = useState("");

  useEffect(() => {
    refreshTeacherData();
  }, []); // Einmaliges Laden beim Mount

  useEffect(() => {
    if (errorTeacherData) {
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="error"
          title="Daten konnten nicht geladen werden"
          message={`Fehler beim Abrufen der Prüfungsabgaben: ${errorTeacherData}`}
        />
      ));
    }
  }, [errorTeacherData]);

  // Berechne max. Punkte für jede Prüfung nur einmal
  const examsWithTotalPoints = useMemo(() => {
    if (!teacherSubmissions) {
      return [];
    }
    // Verwende direkt den importierten Typ ExamAttempt
    return teacherSubmissions.map((attempt: ExamAttempt) => ({
      ...attempt,
      exam: {
        ...attempt.exam,
        total_max_points: attempt.exam.criteria?.reduce(
          // Verwende den importierten Typ Criterion
          (sum: number, c: Criterion) => sum + (c.max_points || 0),
          0,
        ),
      },
    }));
  }, [teacherSubmissions]);

  const handleSelectAttempt = (attemptId: number) => {
    const attempt = examsWithTotalPoints.find(
      (a: ExamAttempt) => a.id === attemptId,
    );
    setSelectedAttempt(attempt || null);
  };

  const handleBackToList = () => {
    setSelectedAttempt(null);
  };

  // Gefilterte und sortierte Versuche
  const filteredAndSortedAttempts = useMemo(() => {
    if (!Array.isArray(examsWithTotalPoints)) {
      return [];
    }
    // Verwende direkt den importierten Typ ExamAttempt
    return examsWithTotalPoints
      .filter((attempt: ExamAttempt) => {
        // Status Filter
        const statusMatch = (() => {
          if (activeStatusFilter.length === 0) return true;
          const attemptStatusLabel: StatusLabel | null =
            attempt.status === "submitted"
              ? "Eingereicht"
              : attempt.status === "graded"
                ? "Bewertet"
                : null;
          return (
            attemptStatusLabel !== null &&
            activeStatusFilter.includes(attemptStatusLabel)
          );
        })();

        // Such Filter (Prüfungstitel, Benutzername, Benutzer-Email)
        const term = examSearchTerm.toLowerCase();
        const searchMatch = (() => {
          if (!term) return true;
          const titleMatch = (attempt.exam?.exam_title || "")
            .toLowerCase()
            .includes(term);
          const userMatch =
            attempt.user?.username?.toLowerCase().includes(term) ||
            attempt.user?.email?.toLowerCase().includes(term);
          return titleMatch || userMatch;
        })();

        return statusMatch && searchMatch;
      })
      .sort((a: ExamAttempt, b: ExamAttempt) => {
        // Priorität für 'submitted'
        if (a.status === "submitted" && b.status !== "submitted") return -1;
        if (b.status === "submitted" && a.status !== "submitted") return 1;
        // Ansonsten nach Einreichungsdatum (neueste zuerst)
        const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
        const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
        return dateB - dateA;
      });
  }, [examsWithTotalPoints, activeStatusFilter, examSearchTerm]);

  if (selectedAttempt) {
    return (
      <ExamReviewDetail
        attempt={selectedAttempt}
        onBackToList={handleBackToList}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6"
    >
      <h2 className="text-xl font-semibold mb-6">
        Prüfungsabgaben zur Bewertung
      </h2>

      <FilterHead
        searchTerm={examSearchTerm}
        onSearchChange={setExamSearchTerm}
        searchPlaceholder="Suche (Prüfung, Benutzer)..."
        className="mb-6"
      >
        <ButtonFilterSimple
          label="Status:"
          options={["Eingereicht", "Bewertet"] as StatusLabel[]}
          activeOptions={activeStatusFilter}
          multiSelectEnabled={false}
          onOptionClick={setActiveStatusFilter}
          onClearClick={() => setActiveStatusFilter([])}
          activeClassName="bg-dsp-orange text-white border-dsp-orange"
        />
      </FilterHead>

      {loadingTeacherData && (
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">Lade Prüfungsabgaben...</p>
        </div>
      )}
      {errorTeacherData && (
        <p className="text-red-600 text-center py-10">
          Fehler beim Laden der Daten: {errorTeacherData}
        </p>
      )}
      {!loadingTeacherData && !errorTeacherData && (
        <TableExamsAssessed
          attempts={filteredAndSortedAttempts}
          onRowClick={handleSelectAttempt}
        />
      )}
    </motion.div>
  );
};

export default AdminPanelExamReviewSection;
