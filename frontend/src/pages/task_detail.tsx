import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../components/ui_elements/buttons/button_secondary";
import {
  IoArrowForwardOutline,
  IoArrowBackOutline,
  IoBulbOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoCodeSlashOutline,
  IoListOutline,
  IoAlertCircleOutline,
  IoBookOutline,
  IoArrowBackSharp,
} from "react-icons/io5";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import CodeEditorWithOutput from "../components/ui_elements/code_editor/code_editor_with_output";
import TagDifficulty from "../components/tags/tag_difficulty";
import type { DifficultyLevel } from "../components/tags/tag_difficulty";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import SubBackground from "../components/layouts/SubBackground";
import { useModules, Module, Task } from "../context/ModuleContext";
import TaskSuccessModal from "../components/messages/TaskSuccessModal";
import MultipleChoice from "../components/ui_elements/MultipleChoice/multiple_choice.tsx";
import { api } from "../util/apis";

// Interface für Multiple-Choice-Aufgaben von der API
interface TaskMultipleChoiceQuestion {
  id: number;
  task: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: number;
  order: number;
}

// API-Funktion für Multiple-Choice-Fragen
const getTaskMultipleChoiceByTask = async (
  taskId: number,
): Promise<TaskMultipleChoiceQuestion[]> => {
  try {
    console.log(
      "🔍 [TaskDetail] Fetching multiple choice questions for task:",
      taskId,
    );
    const response = await api.get(
      `/modules/task-multiple-choice/list/?task_id=${taskId}`,
    );
    console.log("🔍 [TaskDetail] API response:", response.data);
    return response.data || [];
  } catch (error) {
    console.error(
      "❌ [TaskDetail] Error fetching multiple choice questions:",
      error,
    );
    throw error;
  }
};

function TaskDetails() {
  const { modules, loading, error, fetchModules } = useModules();
  const { moduleId, taskId } = useParams<{
    moduleId: string;
    taskId: string;
  }>();
  const navigate = useNavigate();
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Multiple-Choice spezifische States
  const [multipleChoiceQuestions, setMultipleChoiceQuestions] = useState<
    TaskMultipleChoiceQuestion[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{
    [questionId: number]: string;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Task Success Handler (muss vor anderen Funktionen definiert werden)
  const handleTaskSuccess = useCallback(() => {
    console.log("🔍 [TaskDetail] Task completed successfully!");
    setIsSuccessModalOpen(true);
  }, []);

  // Aktuelle Frage
  const currentQuestion = useMemo(() => {
    if (multipleChoiceQuestions.length === 0) return null;
    return multipleChoiceQuestions[currentQuestionIndex];
  }, [multipleChoiceQuestions, currentQuestionIndex]);

  // Optionen für die aktuelle Frage
  const multipleChoiceOptions = useMemo(() => {
    if (!currentQuestion) return [];

    return [
      { id: "1", answer: currentQuestion.option_1 },
      { id: "2", answer: currentQuestion.option_2 },
      { id: "3", answer: currentQuestion.option_3 },
      { id: "4", answer: currentQuestion.option_4 },
    ].filter((option) => option.answer.trim() !== "");
  }, [currentQuestion]);

  // Fortschritt in Prozent
  const progressPercentage = useMemo(() => {
    if (multipleChoiceQuestions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / multipleChoiceQuestions.length) * 100;
  }, [currentQuestionIndex, multipleChoiceQuestions.length]);

  // Option auswählen und automatisch einreichen
  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;

      console.log("🔍 [TaskDetail] Option selected:", {
        questionId: currentQuestion.id,
        optionId,
      });

      // Option setzen
      setSelectedOptions((prev) => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }));

      // Sofort die Antwort verarbeiten
      handleSubmitQuestion(currentQuestion.id, optionId);
    },
    [currentQuestion],
  );

  // Antwort verarbeiten
  const handleSubmitQuestion = useCallback(
    (questionId: number, optionId: string) => {
      if (!currentQuestion) return;

      console.log("🔍 [TaskDetail] Processing answer:", {
        questionId,
        optionId,
      });

      const isCorrect = optionId === currentQuestion.correct_answer.toString();
      console.log("🔍 [TaskDetail] Answer correct:", isCorrect);

      // Ergebnis anzeigen
      setShowResults(true);

      // Kurze Verzögerung für Feedback
      setTimeout(() => {
        if (isCorrect) {
          // Richtig - zur nächsten Frage
          if (currentQuestionIndex < multipleChoiceQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setShowResults(false);
          } else {
            // Alle Fragen beantwortet
            handleTaskSuccess();
          }
        } else {
          // Falsch - Frage bleibt aktiv für Wiederholung
          setShowResults(false);
          // Frage bleibt aktiv für Wiederholung
        }
      }, 1500); // 1.5 Sekunden Feedback anzeigen
    },
    [
      currentQuestion,
      currentQuestionIndex,
      multipleChoiceQuestions.length,
      handleTaskSuccess,
    ],
  );

  const {
    module,
    currentTask,
    tasks,
    currentTaskIndex,
  }: {
    module: Module | undefined;
    currentTask: Task | undefined;
    tasks: Task[];
    currentTaskIndex: number;
  } = useMemo(() => {
    console.log("🔍 [TaskDetail] useMemo triggered with:", {
      moduleId,
      taskId,
      modules,
    });

    if (!moduleId || !taskId) {
      console.log("❌ [TaskDetail] Missing moduleId or taskId");
      return {
        module: undefined,
        currentTask: undefined,
        tasks: [],
        currentTaskIndex: -1,
      };
    }

    const numericModuleId = parseInt(moduleId, 10);
    const numericTaskId = parseInt(taskId, 10);

    if (isNaN(numericModuleId) || isNaN(numericTaskId)) {
      console.log("❌ [TaskDetail] Invalid moduleId or taskId:", {
        moduleId,
        taskId,
      });
      return {
        module: undefined,
        currentTask: undefined,
        tasks: [],
        currentTaskIndex: -1,
      };
    }

    const foundModule = modules.find((mod) => mod.id === numericModuleId);
    console.log("🔍 [TaskDetail] Found module:", foundModule);

    if (!foundModule) {
      console.log("❌ [TaskDetail] Module not found for ID:", numericModuleId);
      return {
        module: undefined,
        currentTask: undefined,
        tasks: [],
        currentTaskIndex: -1,
      };
    }

    const moduleTasks = foundModule.tasks || [];
    console.log("🔍 [TaskDetail] Module tasks:", moduleTasks);

    const taskIndex = moduleTasks.findIndex((t) => t.id === numericTaskId);
    const foundTask = taskIndex !== -1 ? moduleTasks[taskIndex] : undefined;

    console.log("🔍 [TaskDetail] Found task:", foundTask);
    console.log("🔍 [TaskDetail] Task index:", taskIndex);
    console.log("🔍 [TaskDetail] Task task_type:", foundTask?.task_type);

    return {
      module: foundModule,
      currentTask: foundTask,
      tasks: moduleTasks,
      currentTaskIndex: taskIndex,
    };
  }, [modules, moduleId, taskId]);

  // Lade Multiple-Choice-Aufgaben wenn sich die Task ändert
  useEffect(() => {
    console.log(
      "🔍 [TaskDetail] useEffect triggered with currentTask:",
      currentTask,
    );

    if (currentTask && currentTask.task_type === "multiple_choice") {
      console.log(
        "🔍 [TaskDetail] Loading multiple choice questions for task:",
        currentTask.id,
      );
      setIsLoadingQuestions(true);
      getTaskMultipleChoiceByTask(currentTask.id)
        .then((data: TaskMultipleChoiceQuestion[]) => {
          console.log(
            "🔍 [TaskDetail] Loaded multiple choice questions:",
            data,
          );
          setMultipleChoiceQuestions(data || []);
          setCurrentQuestionIndex(0);
          setSelectedOptions({});
          setShowResults(false);
        })
        .catch((error: unknown) => {
          console.error(
            "❌ [TaskDetail] Error loading multiple choice questions:",
            error,
          );
          setMultipleChoiceQuestions([]);
        })
        .finally(() => {
          setIsLoadingQuestions(false);
        });
    } else {
      console.log(
        "🔍 [TaskDetail] Not loading multiple choice questions. Task type:",
        currentTask?.task_type,
      );
      setMultipleChoiceQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedOptions({});
      setShowResults(false);
    }
  }, [currentTask]);

  const previousTask = useMemo(
    () => (currentTaskIndex > 0 ? tasks[currentTaskIndex - 1] : undefined),
    [tasks, currentTaskIndex],
  );
  const nextTask = useMemo(
    () =>
      currentTaskIndex < tasks.length - 1
        ? tasks[currentTaskIndex + 1]
        : undefined,
    [tasks, currentTaskIndex],
  );
  const isFirstTask = useMemo(() => currentTaskIndex === 0, [currentTaskIndex]);
  const isLastTask = useMemo(
    () => currentTaskIndex === tasks.length - 1,
    [tasks, currentTaskIndex],
  );

  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  const handleGoToNextFromModal = useCallback(() => {
    setIsSuccessModalOpen(false);
    if (nextTask) {
      navigate(`/modules/${moduleId}/tasks/${nextTask.id}`);
    } else {
      navigate(`/modules/${moduleId}`);
    }
  }, [nextTask, moduleId, navigate]);

  const handleNavigateToNextOnPage = useCallback(() => {
    if (!nextTask || isPageLoading) return;
    setIsPageLoading(true);
    navigate(`/modules/${moduleId}/tasks/${nextTask.id}`);
    setTimeout(() => setIsPageLoading(false), 50);
  }, [nextTask, moduleId, navigate, isPageLoading]);

  const handleNavigateToPreviousOnPage = useCallback(() => {
    if (!previousTask || isPageLoading) return;
    setIsPageLoading(true);
    navigate(`/modules/${moduleId}/tasks/${previousTask.id}`);
    setTimeout(() => setIsPageLoading(false), 50);
  }, [previousTask, moduleId, navigate, isPageLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner
          message="Lade Aufgabendetails..."
          size="lg"
          variant="pulse"
          showBackground={true}
        />
      </div>
    );
  }

  if (error) {
    const errorBreadcrumbs = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Module", path: "/modules" },
      { label: "Fehler" },
    ];
    return (
      <div className="min-h-screen">
        <div className="px-3 pt-3 pb-6">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={errorBreadcrumbs} className="mb-3" />

            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
                Fehler beim Laden
              </h1>
            </div>

            <SubBackground className="max-w-2xl mx-auto">
              <div className="text-center">
                <IoAlertCircleOutline className="text-6xl text-red-500 mb-6 mx-auto" />
                <h2 className="text-2xl font-bold text-red-700 mb-4">
                  Fehler beim Laden der Module!
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {error.message}
                </p>
                <button
                  onClick={fetchModules}
                  className="px-6 py-3 bg-[#ff863d] text-white rounded-xl hover:bg-[#fa8c45] transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
                >
                  Erneut versuchen
                </button>
              </div>
            </SubBackground>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    const moduleNotFoundErrorBreadcrumbs = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Module", path: "/modules" },
      { label: "Nicht gefunden" },
    ];
    return (
      <div className="min-h-screen">
        <div className="px-3 pt-3 pb-6">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs
              items={moduleNotFoundErrorBreadcrumbs}
              className="mb-3"
            />

            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
                Modul nicht gefunden
              </h1>
            </div>

            <SubBackground className="max-w-2xl mx-auto">
              <div className="text-center">
                <IoBookOutline className="text-6xl text-gray-400 mb-6 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-600 mb-4">
                  Modul nicht gefunden
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Das angeforderte Modul (ID: {moduleId}) konnte nicht gefunden
                  werden.
                </p>
                <Link
                  to="/modules"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#ff863d] text-white rounded-xl hover:bg-[#fa8c45] transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
                >
                  <IoArrowBackSharp className="w-5 h-5" />
                  <span>Zurück zur Modulübersicht</span>
                </Link>
              </div>
            </SubBackground>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTask && !isPageLoading) {
    const taskNotFoundErrorBreadcrumbs = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Module", path: "/modules" },
      { label: module.title, path: `/modules/${moduleId}` },
      { label: "Nicht gefunden" },
    ];
    return (
      <div className="min-h-screen">
        <div className="px-3 pt-3 pb-6">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs
              items={taskNotFoundErrorBreadcrumbs}
              className="mb-3"
            />

            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
                Aufgabe nicht gefunden
              </h1>
            </div>

            <SubBackground className="max-w-2xl mx-auto">
              <div className="text-center">
                <IoListOutline className="text-6xl text-gray-400 mb-6 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-600 mb-4">
                  Aufgabe nicht gefunden
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Die angeforderte Aufgabe (ID: {taskId}) konnte im Modul "
                  {module.title}" nicht gefunden werden.
                </p>
                <Link
                  to={`/modules/${moduleId}`}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#ff863d] text-white rounded-xl hover:bg-[#fa8c45] transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
                >
                  <IoArrowBackSharp className="w-5 h-5" />
                  <span>Zurück zur Moduldetailseite</span>
                </Link>
              </div>
            </SubBackground>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = module
    ? [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Module", path: "/modules" },
        { label: module.title, path: `/modules/${module.id}` },
        ...(currentTask
          ? [{ label: currentTask.title }]
          : [{ label: "Lade Aufgabe..." }]),
      ]
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative px-3 pt-3 pb-6">
          <div className="max-w-[95vw] mx-auto">
            {breadcrumbItems.length > 0 && (
              <Breadcrumbs items={breadcrumbItems} className="mb-3" />
            )}

            {isPageLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner
                  message="Lade Aufgabe..."
                  size="lg"
                  variant="pulse"
                  showBackground={true}
                />
              </div>
            ) : currentTask && module ? (
              <>
                {/* Task Header */}
                <SubBackground className="mb-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 rounded-xl bg-[#ffe7d4]">
                          <IoCodeSlashOutline className="w-6 h-6 text-[#ff863d]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-700">
                              {currentTask.title}
                            </h1>
                            {currentTask.completed && (
                              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">
                                  Abgeschlossen
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-lg text-gray-600">
                            Löse diese Aufgabe, um dein Verständnis zu testen.
                          </p>
                        </div>
                      </div>

                      {/* Task Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full border border-white/40">
                          <IoListOutline className="w-4 h-4 text-[#ff863d]" />
                          <span className="font-medium text-gray-700">
                            Aufgabe {currentTaskIndex + 1} von {tasks.length}
                          </span>
                        </div>
                        <TagDifficulty
                          difficulty={currentTask.difficulty as DifficultyLevel}
                        />
                        {currentTask.task_type === "multiple_choice" &&
                          multipleChoiceQuestions.length > 0 && (
                            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                              <span className="font-medium text-blue-700">
                                {multipleChoiceQuestions.length} Fragen
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </SubBackground>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Task Description Sidebar */}
                  <div className="lg:col-span-1">
                    <SubBackground>
                      <div className="sticky top-8 space-y-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="p-2 rounded-lg bg-[#ffe7d4]">
                              <IoInformationCircleOutline className="w-5 h-5 text-[#ff863d]" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">
                              Aufgabenbeschreibung
                            </h2>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {currentTask.description}
                            </p>
                          </div>
                        </div>

                        {/* Hint Section */}
                        {currentTask.hint && (
                          <div className="border-t border-gray-200 pt-6">
                            <motion.div
                              initial={false}
                              animate={{
                                height: isHintVisible ? "auto" : 0,
                                opacity: isHintVisible ? 1 : 0,
                              }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: "hidden" }}
                              className="mb-4"
                            >
                              <div className="p-4 rounded-xl bg-[#ffe7d4]/50 border border-[#ff863d]/20">
                                <div className="flex items-center space-x-2 text-[#ff863d] font-semibold mb-3">
                                  <IoBulbOutline className="w-5 h-5" />
                                  <span>Hinweis</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {currentTask.hint}
                                </p>
                              </div>
                            </motion.div>
                            <ButtonSecondary
                              title={
                                isHintVisible
                                  ? "Hinweis ausblenden"
                                  : "Hinweis anzeigen"
                              }
                              icon={<IoBulbOutline className="w-4 h-4" />}
                              onClick={() => setIsHintVisible(!isHintVisible)}
                              classNameButton="w-full text-sm justify-center"
                              iconPosition="left"
                            />
                          </div>
                        )}
                      </div>
                    </SubBackground>
                  </div>

                  {/* Task Content Area - basierend auf task_type */}
                  <div className="lg:col-span-2">
                    <SubBackground>
                      {(() => {
                        console.log(
                          "🔍 [TaskDetail] Rendering task content. Task type:",
                          currentTask?.task_type,
                        );
                        console.log(
                          "🔍 [TaskDetail] Current task:",
                          currentTask,
                        );

                        if (currentTask?.task_type === "programming") {
                          console.log(
                            "🔍 [TaskDetail] Rendering programming task",
                          );
                          return (
                            <CodeEditorWithOutput
                              taskId={currentTask.id}
                              className="rounded-xl overflow-hidden"
                              onSuccess={handleTaskSuccess}
                            />
                          );
                        } else if (
                          currentTask?.task_type === "multiple_choice"
                        ) {
                          console.log(
                            "🔍 [TaskDetail] Rendering multiple choice task",
                          );
                          console.log(
                            "🔍 [TaskDetail] Multiple choice questions:",
                            multipleChoiceQuestions,
                          );
                          console.log(
                            "🔍 [TaskDetail] Loading questions:",
                            isLoadingQuestions,
                          );

                          return (
                            <div className="max-w-2xl mx-auto">
                              {isLoadingQuestions ? (
                                <div className="flex items-center justify-center min-h-[400px]">
                                  <LoadingSpinner
                                    message="Lade Fragen..."
                                    size="lg"
                                    variant="pulse"
                                    showBackground={false}
                                  />
                                </div>
                              ) : multipleChoiceQuestions.length === 0 ? (
                                <div className="text-center py-12">
                                  <IoListOutline className="text-6xl text-gray-400 mb-6 mx-auto" />
                                  <h2 className="text-2xl font-bold text-gray-600 mb-4">
                                    Keine Fragen verfügbar
                                  </h2>
                                  <p className="text-gray-600 mb-6 leading-relaxed">
                                    Für diese Aufgabe sind noch keine
                                    Multiple-Choice-Fragen verfügbar.
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {/* Progress Bar */}
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-[#ff863d] h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${progressPercentage}%`,
                                      }}
                                    ></div>
                                  </div>

                                  {/* Question Counter */}
                                  <div className="text-center text-sm text-gray-600">
                                    Frage {currentQuestionIndex + 1} von{" "}
                                    {multipleChoiceQuestions.length}
                                  </div>

                                  {/* Current Question */}
                                  <MultipleChoice
                                    question={currentQuestion?.question || ""}
                                    options={multipleChoiceOptions}
                                    selectedId={
                                      selectedOptions[currentQuestion?.id || 0]
                                    }
                                    onSelect={handleSelectOption}
                                    disabled={
                                      showResults || currentTask.completed
                                    }
                                  />

                                  {/* Result Feedback */}
                                  {showResults && currentQuestion && (
                                    <div className="mt-4 p-4 rounded-lg border">
                                      {selectedOptions[currentQuestion.id] ===
                                      currentQuestion.correct_answer.toString() ? (
                                        <div className="text-green-600 font-semibold flex items-center space-x-2">
                                          <IoCheckmarkCircleOutline className="w-5 h-5" />
                                          <span>
                                            Richtig! Weiter zur nächsten
                                            Frage...
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="text-red-600 font-semibold flex items-center space-x-2">
                                          <IoAlertCircleOutline className="w-5 h-5" />
                                          <span>
                                            Leider falsch. Versuche es nochmal!
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Completed Message */}
                                  {currentTask.completed && (
                                    <div className="mt-4 text-green-700 flex items-center space-x-2">
                                      <IoCheckmarkCircleOutline className="w-5 h-5" />
                                      <span>
                                        Diese Aufgabe wurde bereits
                                        abgeschlossen.
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          console.log(
                            "🔍 [TaskDetail] Rendering unsupported task type",
                          );
                          return (
                            <div className="flex items-center justify-center min-h-[400px]">
                              <div className="text-center">
                                <IoCodeSlashOutline className="text-6xl text-gray-400 mb-6 mx-auto" />
                                <h2 className="text-2xl font-bold text-gray-600 mb-4">
                                  Task-Typ nicht unterstützt
                                </h2>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                  Der Task-Typ "{currentTask?.task_type}" wird
                                  noch nicht unterstützt.
                                </p>
                                <div className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className="text-sm font-medium text-gray-600">
                                    Task-Type:
                                  </span>
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {currentTask?.task_type || "undefined"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </SubBackground>
                  </div>
                </div>

                {/* Navigation */}
                <SubBackground>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ButtonSecondary
                        title="Vorherige Aufgabe"
                        icon={<IoArrowBackOutline className="w-4 h-4" />}
                        onClick={handleNavigateToPreviousOnPage}
                        disabled={isFirstTask || isPageLoading}
                        classNameButton={`flex-row-reverse ${
                          isFirstTask ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        iconPosition="left"
                      />
                    </motion.div>

                    <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 rounded-full border border-white/40 text-sm font-medium text-gray-600">
                      <span>
                        {currentTaskIndex + 1} / {tasks.length}
                      </span>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ButtonPrimary
                        title="Nächste Aufgabe"
                        icon={<IoArrowForwardOutline className="w-4 h-4" />}
                        onClick={handleNavigateToNextOnPage}
                        disabled={isLastTask || isPageLoading}
                        classNameButton={`${
                          isLastTask ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      />
                    </motion.div>
                  </div>
                </SubBackground>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {currentTask && (
        <TaskSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleCloseSuccessModal}
          taskTitle={currentTask.title}
          onNextTask={handleGoToNextFromModal}
          isLastTask={isLastTask}
        />
      )}
    </div>
  );
}

export default TaskDetails;
