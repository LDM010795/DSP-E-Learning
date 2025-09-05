import { useState, useMemo, useCallback } from "react";
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
import type {
  MultipleChoiceConfig,
  TaskConfig,
} from "../context/ModuleContext";
import MultipleChoice, {
  MultipleChoiceOption,
} from "../components/ui_elements/MultipleChoice/multiple_choice.tsx";

// --- Type Guard ---
// Checks if the provided config object is of type MultipleChoiceConfig.
// This function is used to distinguish between different possible task configurations
// (such as MultipleChoiceConfig vs ProgrammingConfig) at runtime.
function isMultipleChoiceConfig(
  config: TaskConfig | undefined,
): config is MultipleChoiceConfig {
  return !!config && "options" in config && "correct_answer" in config;
}

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
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const [showResult, setShowResult] = useState(false);

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
    if (!moduleId || !taskId)
      return {
        module: undefined,
        currentTask: undefined,
        tasks: [],
        currentTaskIndex: -1,
      };
    const numericModuleId = parseInt(moduleId, 10);
    const numericTaskId = parseInt(taskId, 10);
    if (isNaN(numericModuleId) || isNaN(numericTaskId)) {
      return {
        module: undefined,
        currentTask: undefined,
        tasks: [],
        currentTaskIndex: -1,
      };
    }

    const foundModule = modules.find((mod) => mod.id === numericModuleId);
    if (!foundModule) {
      return {
        module: undefined,
        currentTask: undefined,
        tasks: [],
        currentTaskIndex: -1,
      };
    }

    const moduleTasks = foundModule.tasks || [];
    const taskIndex = moduleTasks.findIndex((t) => t.id === numericTaskId);
    const foundTask = taskIndex !== -1 ? moduleTasks[taskIndex] : undefined;

    return {
      module: foundModule,
      currentTask: foundTask,
      tasks: moduleTasks,
      currentTaskIndex: taskIndex,
    };
  }, [modules, moduleId, taskId]);

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

  // State variable to hold and display an error message for wrong answers in multiple choice tasks
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Add this to your state

  const handleSelectOption = (id: string) => {
    if (!showResult) {
      setSelectedOption(id);
      setErrorMessage(null); // Clear any previous error when a new option is selected
    }
  };

  const handleSubmit = async () => {
    // Only proceed if an option is selected and the config exists
    if (!selectedOption || !correctOptionId) return;
    setShowResult(true);

    if (selectedOption === correctOptionId) {
      // Correct answer selected
      try {
        // Example API call (replace with real API when available)
        await fetch("/api/save-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: currentTask?.id,
            userAnswer: selectedOption,
            result: "correct",
          }),
        });
        // Optionally: Show success modal or message here
        // setIsSuccessModalOpen(true);
      } catch (error) {
        // Handle API error (for now, you can log or show a message)
        console.error("Failed to save progress:", error);
      }
    } else {
      // Incorrect answer: let user try again
      setErrorMessage("Leider falsch. Bitte versuche es erneut."); // Show feedback
      setShowResult(false); // Optionally, you may allow another attempt immediately
    }
  };

  const handleTaskSuccess = useCallback(() => {
    setIsSuccessModalOpen(true);
  }, []);

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

  // Memorized extraction of multiple choice configuration from the current task
  // Returns undefined for non-multiple choice tasks
  const multipleChoiceConfig = useMemo(
    () =>
      isMultipleChoiceConfig(currentTask?.task_config)
        ? currentTask?.task_config
        : undefined,
    [currentTask],
  );

  // Memoized calculation of the question text (uses explanation or falls back to title)
  // If the explanation is present in the config, it is used as the question text
  // Only recalculates if 'multipleChoiceConfig' changes.
  const multipleChoiceQuestion = useMemo(
    () => multipleChoiceConfig?.explanation ?? currentTask?.title,
    [multipleChoiceConfig, currentTask],
  );

  // Memoized mapping of options for the MultipleChoice component
  // Returns undefined if 'correct_answer' is not specified.
  // Only recalculates if 'multipleChoiceConfig' changes.
  const multipleChoiceOptions: MultipleChoiceOption[] = useMemo(
    () =>
      multipleChoiceConfig?.options
        ? multipleChoiceConfig.options.map((option, index) => ({
            id: index.toString(),
            answer: option.answer,
          }))
        : [],
    [multipleChoiceConfig],
  );

  // Memoized calculation of the correct option's ID as a string
  const correctOptionId = useMemo(
    () =>
      multipleChoiceConfig?.correct_answer !== undefined
        ? multipleChoiceConfig.correct_answer.toString()
        : undefined,
    [multipleChoiceConfig],
  );

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
                  className="px-6 py-3 bg-dsp-orange text-white rounded-xl hover:bg-dsp-orange transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
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
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-dsp-orange text-white rounded-xl hover:bg-dsp-orange transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
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
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-dsp-orange text-white rounded-xl hover:bg-dsp-orange transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
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
                          <IoCodeSlashOutline className="w-6 h-6 text-dsp-orange" />
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
                          <IoListOutline className="w-4 h-4 text-dsp-orange" />
                          <span className="font-medium text-gray-700">
                            Aufgabe {currentTaskIndex + 1} von {tasks.length}
                          </span>
                        </div>
                        <TagDifficulty
                          difficulty={currentTask.difficulty as DifficultyLevel}
                        />
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
                              <IoInformationCircleOutline className="w-5 h-5 text-dsp-orange" />
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
                              <div className="p-4 rounded-xl bg-[#ffe7d4]/50 border border-dsp-orange/20">
                                <div className="flex items-center space-x-2 text-dsp-orange font-semibold mb-3">
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
                      {currentTask.task_type === "programming" ? (
                        <CodeEditorWithOutput
                          taskId={currentTask.id}
                          className="rounded-xl overflow-hidden"
                          onSuccess={handleTaskSuccess}
                        />
                      ) : currentTask.task_type === "multiple_choice" ? (
                        <div className="max-w-xl mx-auto">
                          <MultipleChoice
                            question={multipleChoiceQuestion ?? ""}
                            options={multipleChoiceOptions}
                            selectedId={selectedOption}
                            onSelect={handleSelectOption}
                            disabled={showResult || currentTask.completed}
                          />

                          {/* Show Submit Button if not completed */}
                          {!showResult && !currentTask.completed && (
                            <>
                              <ButtonPrimary
                                title="Antwort einreichen"
                                onClick={handleSubmit}
                                disabled={selectedOption === undefined}
                                classNameButton="mt-4 w-full"
                              />
                              {errorMessage && (
                                <div className="text-red-600 mt-2 font-semibold flex items-center space-x-2">
                                  <IoAlertCircleOutline className="w-5 h-5" />
                                  <span>{errorMessage}</span>
                                </div>
                              )}
                            </>
                          )}

                          {/* Show Result/Feedback after submission */}
                          {showResult && (
                            <div className="mt-4">
                              {selectedOption === correctOptionId ? (
                                <div className="text-green-600 font-semibold flex items-center space-x-2">
                                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                                  <span>
                                    Richtig!{" "}
                                    {multipleChoiceConfig?.explanation && (
                                      <span className="text-gray-700 ml-2">
                                        {multipleChoiceConfig.explanation}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-red-600 font-semibold flex items-center space-x-2">
                                  <IoAlertCircleOutline className="w-5 h-5" />
                                  <span>
                                    Leider falsch.{" "}
                                    {multipleChoiceConfig?.explanation && (
                                      <span className="text-gray-700 ml-2">
                                        {multipleChoiceConfig.explanation}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          {currentTask.completed && !showResult && (
                            <div className="mt-4 text-green-700 flex items-center space-x-2">
                              <IoCheckmarkCircleOutline className="w-5 h-5" />
                              <span>
                                Diese Aufgabe wurde bereits abgeschlossen.
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center min-h-[400px]">
                          <div className="text-center">
                            <IoCodeSlashOutline className="text-6xl text-gray-400 mb-6 mx-auto" />
                            <h2 className="text-2xl font-bold text-gray-600 mb-4">
                              Task-Typ nicht unterstützt
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                              Der Task-Typ "{currentTask.task_type}" wird noch
                              nicht unterstützt.
                            </p>
                            <div className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-sm font-medium text-gray-600">
                                Task-Type:
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {currentTask.task_type}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
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
