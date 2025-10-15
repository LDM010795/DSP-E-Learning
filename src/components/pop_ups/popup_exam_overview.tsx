import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import clsx from "clsx";
import {
  IoChatbubbleEllipsesOutline,
  IoCheckmarkDoneOutline,
  IoRocketOutline,
} from "react-icons/io5";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Timer,
  ListChecks,
  FileText,
  Award,
  ChevronRight,
  X,
  Info,
  BookOpen,
} from "lucide-react";
import {
  Exam,
  ExamAttempt,
  Criterion,
  ExamRequirement,
} from "../../context/ExamContext"; // Pfad anpassen, falls nötig, ExamRequirement importieren
import { useModules } from "../../context/ModuleContext"; // Import useModules
import ButtonPrimary from "../ui_elements/buttons/button_primary";
import ButtonSecondary from "../ui_elements/buttons/button_secondary";

// Hilfsfunktionen (ggf. auslagern oder importieren)
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getDifficultyLabel = (difficulty: string | undefined): string => {
  switch (difficulty) {
    case "easy":
      return "Einfach";
    case "medium":
      return "Mittel";
    case "hard":
      return "Schwer";
    default:
      return "Unbekannt";
  }
};

const getDifficultyColor = (difficulty: string | undefined): string => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "hard":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTotalMaxPoints = (criteria: Criterion[] | undefined): number => {
  if (!criteria || criteria.length === 0) return 0;
  return criteria.reduce(
    (sum, criterion) => sum + (criterion.max_points || 0),
    0,
  );
};

interface PopupExamOverviewProps {
  exam: Exam;
  attempt?: ExamAttempt | null;
  onClose: () => void;
  onStartExam?: (examId: number) => void;
  onPrepareSubmission?: (attemptId: number) => void;
}

const PopupExamOverview: React.FC<PopupExamOverviewProps> = ({
  exam,
  attempt,
  onClose,
  onStartExam,
  onPrepareSubmission,
}) => {
  const { modules: userModules } = useModules(); // ModuleContext für User-Module nutzen
  const totalMaxPoints = getTotalMaxPoints(exam.criteria);
  const status = attempt ? attempt.status : "available";

  // Animationsvarianten für Framer Motion
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const handleStartClick = () => {
    if (onStartExam && exam) {
      onStartExam(exam.id);
      onClose();
    }
  };

  const handlePrepareSubmissionClick = () => {
    if (onPrepareSubmission && attempt) {
      onPrepareSubmission(attempt.id);
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        variants={popupVariants}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-dsp-orange/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-dsp-orange/15">
                <Info className="h-4 w-4 text-dsp-orange" />
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(
                  exam.exam_difficulty,
                )} border-current`}
              >
                {getDifficultyLabel(exam.exam_difficulty)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {exam.exam_title || "Prüfungstitel"}
          </h2>
        </div>

        {/* Content Grid */}
        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Linke Spalte */}
          <div className="md:col-span-3 space-y-6">
            {/* Beschreibung */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-dsp-orange" />
                <h3 className="font-semibold text-lg text-gray-800">
                  Beschreibung
                </h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 space-y-2 border border-gray-200">
                {(exam.exam_description || "Keine Beschreibung verfügbar.")
                  .split("\n")
                  .map((paragraph, index) => (
                    <p key={index} className={paragraph.trim() ? "" : "h-4"}>
                      {paragraph.trim()}
                    </p>
                  ))}
              </div>
            </section>

            {/* Anforderungen */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="h-5 w-5 text-dsp-orange" />
                <h3 className="font-semibold text-lg text-gray-800">
                  Anforderungen
                </h3>
              </div>
              <ul className="bg-gray-50 p-4 rounded-md space-y-2 border border-gray-200">
                {exam.requirements && exam.requirements.length > 0 ? (
                  exam.requirements
                    .sort(
                      (a: ExamRequirement, b: ExamRequirement) =>
                        a.order - b.order,
                    )
                    .map((req: ExamRequirement) => (
                      <li
                        key={req.id}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <ChevronRight className="h-4 w-4 text-dsp-orange mt-0.5 flex-shrink-0" />
                        <span>{req.description}</span>
                      </li>
                    ))
                ) : (
                  <li className="text-sm text-gray-500 italic">
                    Keine spezifischen Anforderungen definiert.
                  </li>
                )}
              </ul>
            </section>
          </div>

          {/* Rechte Spalte */}
          <div className="md:col-span-2 space-y-6">
            {/* Voraussetzungen (Module) */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-dsp-orange" />
                <h3 className="font-semibold text-lg text-gray-800">
                  Voraussetzungen
                </h3>
              </div>
              <ul className="bg-gray-50 p-4 rounded-md space-y-2 border border-gray-200">
                {exam.modules && exam.modules.length > 0 ? (
                  exam.modules.map((mod) => {
                    // Finde das passende Modul im User-Context
                    const userModuleData = userModules.find(
                      (um) => um.id === mod.id,
                    );
                    let isModuleCompleted = false;
                    if (userModuleData) {
                      const tasks = userModuleData.tasks || [];
                      if (tasks.length === 0) {
                        // Module ohne Tasks gelten hier als abgeschlossen
                        isModuleCompleted = true;
                      } else {
                        // Prüfe, ob ALLE Tasks im Modul abgeschlossen sind
                        isModuleCompleted = tasks.every(
                          (task) => task.completed,
                        );
                      }
                    }

                    return (
                      <li key={mod.id} className="text-sm">
                        <Link
                          to={`/modules/${mod.id}`}
                          onClick={onClose}
                          // KORREKTUR: Klassen für dsp-orange und line-through (konditional)
                          className={clsx(
                            "text-dsp-orange hover:text-dsp-orange hover:underline",
                            isModuleCompleted && "line-through", // Durchstreichen wenn abgeschlossen
                          )}
                        >
                          {mod.title}
                        </Link>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-sm text-gray-500 italic">
                    Keine Modul-Voraussetzungen.
                  </li>
                )}
              </ul>
            </section>

            {/* Status-Informationen */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-dsp-orange" />
                <h3 className="font-semibold text-lg text-gray-800">Details</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-md space-y-2.5 border border-gray-200 text-sm">
                <InfoLine
                  icon={<Timer className="h-4 w-4 text-gray-500" />}
                  label="Bearbeitungszeit"
                  value={`${exam.exam_duration_week} Woche${
                    exam.exam_duration_week !== 1 ? "n" : ""
                  }`}
                />
                {attempt && (
                  <>
                    <hr className="border-gray-200" />
                    <InfoLine
                      icon={<Calendar className="h-4 w-4 text-gray-500" />}
                      label="Gestartet am"
                      value={formatDate(attempt.started_at)}
                    />
                    {attempt.status === "started" && (
                      <InfoLine
                        icon={
                          <CalendarClock className="h-4 w-4 text-gray-500" />
                        }
                        label="Fällig am"
                        value={formatDate(attempt.due_date)}
                        valueClass="text-red-600 font-medium"
                      />
                    )}
                    {(attempt.status === "submitted" ||
                      attempt.status === "graded") && (
                      <InfoLine
                        icon={
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        }
                        label="Abgegeben am"
                        value={formatDate(attempt.submitted_at)}
                      />
                    )}
                    {attempt.status === "graded" && (
                      <>
                        <InfoLine
                          icon={<Calendar className="h-4 w-4 text-gray-500" />}
                          label="Bewertet am"
                          value={formatDate(attempt.graded_at)}
                        />
                        <InfoLine
                          icon={<Award className="h-4 w-4 text-gray-500" />}
                          label="Ergebnis"
                          value={
                            typeof attempt.score === "number" ||
                            typeof attempt.score === "string"
                              ? `${attempt.score} / ${totalMaxPoints} Pkt.`
                              : "N/A"
                          }
                          valueClass="text-dsp-blue font-semibold"
                        />
                        {attempt.feedback && (
                          <div className="pt-1">
                            <p className="text-xs text-gray-500 mb-1 flex items-center">
                              <IoChatbubbleEllipsesOutline className="mr-1" />{" "}
                              Feedback:
                            </p>
                            <p className="text-gray-700 whitespace-pre-wrap bg-gray-100 px-2 py-1 rounded text-xs">
                              {attempt.feedback}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Bewertungskriterien */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-dsp-orange" />
                <h3 className="font-semibold text-lg text-gray-800">
                  Bewertungskriterien
                </h3>
              </div>
              <ul className="bg-gray-50 p-4 rounded-md space-y-2 border border-gray-200 text-sm">
                {exam.criteria && exam.criteria.length > 0 ? (
                  exam.criteria.map((criterion) => (
                    <li
                      key={criterion.id}
                      className="flex justify-between items-start"
                    >
                      <span className="text-gray-700 mr-2">
                        {criterion.title}
                      </span>
                      <span className="text-gray-600 font-medium whitespace-nowrap">
                        {criterion.max_points} Pkt.
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 italic">
                    Keine Kriterien definiert.
                  </li>
                )}
                {totalMaxPoints > 0 && (
                  <li className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold">
                    <span>Gesamt</span>
                    <span>{totalMaxPoints} Pkt.</span>
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t flex flex-col sm:flex-row justify-end gap-3">
          <ButtonSecondary
            title="Schließen"
            onClick={onClose}
            classNameButton="w-full sm:w-auto"
          />
          {status === "available" && onStartExam && (
            <ButtonPrimary
              icon={<IoRocketOutline className="mr-1.5" />}
              title="Prüfung jetzt starten"
              onClick={handleStartClick}
              classNameButton="w-full sm:w-auto"
            />
          )}
          {status === "started" && onPrepareSubmission && (
            <ButtonPrimary
              icon={<IoCheckmarkDoneOutline className="mr-1.5" />}
              title="Abgabe vorbereiten"
              onClick={handlePrepareSubmissionClick}
              classNameButton="w-full sm:w-auto"
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Hilfskomponente für Info-Zeilen in der rechten Spalte
interface InfoLineProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  valueClass?: string;
}
const InfoLine: React.FC<InfoLineProps> = ({
  icon,
  label,
  value,
  valueClass = "text-gray-800",
}) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center text-gray-600">
      {icon}
      <span className="ml-1.5">{label}</span>
    </span>
    <span className={`font-medium ${valueClass}`}>{value ?? "N/A"}</span>
  </div>
);

export default PopupExamOverview;
