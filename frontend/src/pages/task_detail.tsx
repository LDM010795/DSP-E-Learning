import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../components/ui_elements/buttons/button_secondary";
import { IoIosArrowRoundForward, IoIosArrowRoundBack } from "react-icons/io";
import { IoBulbOutline, IoInformationCircleOutline } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import CodeEditorWithOutput from "../components/ui_elements/code_editor/code_editor_with_output";
import TagDifficulty from "../components/tags/tag_difficulty";
import type { DifficultyLevel } from "../components/tags/tag_difficulty";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import { useModules, Module, Task } from "../context/ModuleContext";
import TaskSuccessModal from "../components/messages/TaskSuccessModal";
// import { toast } from "sonner";
// import DspNotification from "../components/toaster/notifications/DspNotification";

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
    [tasks, currentTaskIndex]
  );
  const nextTask = useMemo(
    () =>
      currentTaskIndex < tasks.length - 1
        ? tasks[currentTaskIndex + 1]
        : undefined,
    [tasks, currentTaskIndex]
  );
  const isFirstTask = useMemo(() => currentTaskIndex === 0, [currentTaskIndex]);
  const isLastTask = useMemo(
    () => currentTaskIndex === tasks.length - 1,
    [tasks, currentTaskIndex]
  );

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

  // TODO: Implementierung für Task-Completion Toggle wenn Backend verfügbar ist
  // const handleToggleComplete = async () => {
  //   if (!currentTask || !module) return;
  //   try {
  //     const updatedTask = await toggleTaskCompletion(
  //       currentTask.id,
  //       !currentTask.completed
  //     );
  //     if (updatedTask) {
  //       setIsSuccessModalOpen(false);
  //       setIsCompleted(updatedTask.completed);
  //       toast.custom((t) => (
  //         <DspNotification
  //           id={t}
  //           type="success"
  //           title="Status geändert"
  //           message={`Aufgabe '${currentTask.title}' wurde als ${
  //             updatedTask.completed ? "abgeschlossen" : "offen"
  //           } markiert.`}
  //         />
  //       ));
  //     } else {
  //       toast.custom((t) => (
  //         <DspNotification
  //           id={t}
  //           type="error"
  //           title="Fehler"
  //           message="Aufgabenstatus konnte nicht geändert werden."
  //         />
  //       ));
  //     }
  //   } catch (error) {
  //     console.error("Fehler beim Ändern des Aufgabenstatus:", error);
  //     const errorMsg =
  //       error instanceof Error ? error.message : "Unbekannter Fehler";
  //     toast.custom((t) => (
  //       <DspNotification
  //         id={t}
  //         type="error"
  //         title="Fehler"
  //         message={`Status konnte nicht geändert werden: ${errorMsg}`}
  //       />
  //     ));
  //   }
  // };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <LoadingSpinner message="Lade Module..." />
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
      <div className="p-6">
        <Breadcrumbs items={errorBreadcrumbs} className="mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Fehler</h1>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Fehler beim Laden der Module!</strong>
          <span className="block sm:inline"> {error.message}</span>
          <button
            onClick={fetchModules}
            className="ml-4 mt-2 sm:mt-0 px-3 py-1 text-sm bg-red-200 text-red-800 rounded hover:bg-red-300"
          >
            Erneut versuchen
          </button>
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
      <div className="p-6">
        <Breadcrumbs items={moduleNotFoundErrorBreadcrumbs} className="mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Modul nicht gefunden
        </h1>
        <p className="text-gray-600">
          Das angeforderte Modul (ID: {moduleId}) konnte nicht gefunden werden.
          <Link to="/modules" className="text-blue-600 hover:underline ml-2">
            Zurück zur Modulübersicht
          </Link>
        </p>
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
      <div className="p-6">
        <Breadcrumbs items={taskNotFoundErrorBreadcrumbs} className="mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Aufgabe nicht gefunden
        </h1>
        <p className="text-gray-600">
          Die angeforderte Aufgabe (ID: {taskId}) konnte im Modul "
          {module.title}" nicht gefunden werden.
          <Link
            to={`/modules/${moduleId}`}
            className="text-blue-600 hover:underline ml-2"
          >
            Zurück zur Moduldetailseite
          </Link>
        </p>
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
    <div className="p-6 flex flex-col">
      {breadcrumbItems.length > 0 && (
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      )}

      {isPageLoading ? (
        <div className="flex-grow flex items-center justify-center min-h-[400px]">
          <LoadingSpinner message="Lade Aufgabe..." />
        </div>
      ) : currentTask && module ? (
        <>
          <div className="flex flex-col lg:flex-row gap-6 min-h-0 flex-grow">
            <div className="w-full lg:w-1/3 bg-white p-6 rounded-lg border border-gray-300 shadow-sm flex flex-col min-h-0">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 mr-2">
                  <h2 className="text-xl font-bold text-gray-800">
                    {currentTask.title}
                  </h2>
                  {currentTask.completed && (
                    <span
                      className="flex items-center text-green-600"
                      title="Aufgabe abgeschlossen"
                    >
                      <FaCheckCircle size={18} />
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0 ml-auto">
                  <TagDifficulty
                    difficulty={currentTask.difficulty as DifficultyLevel}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Löse diese Aufgabe, um dein Verständnis zu testen.
              </p>
              <div className="overflow-y-auto flex-grow mb-4 pr-2">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {currentTask.description}
                </p>
              </div>
              {currentTask.hint && (
                <div className="mt-auto border-t border-gray-200 pt-4">
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out mb-4 ${
                      isHintVisible
                        ? "max-h-[200px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-4 rounded-lg bg-dsp-orange_light border border-dsp-orange">
                      <div className="flex items-center gap-2 text-dsp-orange font-semibold mb-2">
                        <IoBulbOutline size={20} />
                        <span>Hinweis</span>
                      </div>
                      <p className="text-sm text-gray-800">
                        {currentTask.hint}
                      </p>
                    </div>
                  </div>
                  <ButtonSecondary
                    title={
                      isHintVisible ? "Hinweis ausblenden" : "Hinweis anzeigen"
                    }
                    icon={<IoInformationCircleOutline size={20} />}
                    onClick={() => setIsHintVisible(!isHintVisible)}
                    classNameButton="w-full text-sm justify-center py-1.5"
                    iconPosition="left"
                  />
                </div>
              )}
            </div>
            <div className="w-full lg:w-2/3 flex flex-col min-h-0">
              <CodeEditorWithOutput
                taskId={currentTask.id}
                className="flex-grow"
                onSuccess={handleTaskSuccess}
              />
            </div>
          </div>
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
            <ButtonSecondary
              title="Vorherige Aufgabe"
              icon={<IoIosArrowRoundBack size={30} />}
              onClick={handleNavigateToPreviousOnPage}
              disabled={isFirstTask || isPageLoading}
              classNameButton={`flex-row-reverse ${
                isFirstTask ? "opacity-50 cursor-not-allowed" : ""
              }`}
              iconPosition="left"
            />
            <ButtonPrimary
              title="Nächste Aufgabe"
              icon={<IoIosArrowRoundForward size={30} />}
              onClick={handleNavigateToNextOnPage}
              disabled={isLastTask || isPageLoading}
              classNameButton={`${
                isLastTask ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </>
      ) : null}

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
