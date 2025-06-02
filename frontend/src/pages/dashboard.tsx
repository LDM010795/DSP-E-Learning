import React, { useState /*, useEffect*/ } from "react";
import { Link } from "react-router-dom";
import TagDifficulty from "../components/tags/tag_difficulty";
import type { DifficultyLevel } from "../components/tags/tag_difficulty";
import {
  useModules,
  Task as ContextTask /*, Content as ContextContent*/,
} from "../context/ModuleContext";
import {
  IoLibraryOutline,
  IoStatsChartOutline,
  IoListOutline,
  IoSchoolOutline,
  IoPlayCircleOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import { BsSpeedometer2 } from "react-icons/bs";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import ComingSoonOverlaySmall from "../components/messages/coming_soon_overlay_small";

function Dashboard() {
  const { modules, loading, error, fetchModules } = useModules();

  const [showAllModules, setShowAllModules] = useState(false);

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Lade Dashboard Daten..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen flex flex-col items-center justify-center text-center">
        <IoAlertCircleOutline className="text-5xl text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">
          Fehler beim Laden des Dashboards
        </h2>
        <p className="text-gray-600 mb-4">
          {error.message || "Es gab ein Problem beim Abrufen der Moduldaten."}
        </p>
        <button
          onClick={() => fetchModules()}
          className="px-4 py-2 bg-dsp-orange text-white rounded hover:bg-dsp-orange-dark transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  const totalModules = modules.length;

  const allTasks: ContextTask[] = modules.flatMap((m) => m.tasks || []);
  const totalTasks = allTasks.length;
  const averageTasksPerModule =
    totalModules > 0 ? (totalTasks / totalModules).toFixed(1) : "0.0";

  const totalLessons = modules.reduce(
    (sum, m) => sum + (m.contents?.length || 0),
    0
  );
  const averageLessonsPerModule =
    totalModules > 0 ? (totalLessons / totalModules).toFixed(1) : "0.0";

  const tasksByDifficulty = allTasks.reduce((acc, task) => {
    const level = task.difficulty as DifficultyLevel;
    if (level === "Einfach" || level === "Mittel" || level === "Schwer") {
      acc[level] = (acc[level] || 0) + 1;
    }
    return acc;
  }, {} as Record<DifficultyLevel, number>);

  const calculateModuleDifficulty = (
    tasks?: ContextTask[]
  ): DifficultyLevel | null => {
    if (!tasks || tasks.length === 0) return null;
    const difficultyMap: Record<string, number> = {
      Einfach: 1,
      Mittel: 2,
      Schwer: 3,
    };
    const validTasks = tasks.filter(
      (task) => difficultyMap[task.difficulty] !== undefined
    );
    if (validTasks.length === 0) return null;

    const totalDifficultyScore = validTasks.reduce(
      (sum, task) => sum + difficultyMap[task.difficulty],
      0
    );
    const averageScore = totalDifficultyScore / validTasks.length;

    if (averageScore < 1.7) return "Einfach";
    if (averageScore <= 2.3) return "Mittel";
    return "Schwer";
  };

  const modulesByAvgDifficulty = modules.reduce((acc, module) => {
    const avgDifficulty = calculateModuleDifficulty(module.tasks);
    if (avgDifficulty) {
      acc[avgDifficulty] = (acc[avgDifficulty] || 0) + 1;
    }
    return acc;
  }, {} as Record<DifficultyLevel, number>);

  let maxTasks = -1,
    minTasks = Infinity;
  let modulesWithMostTasks: string[] = [];
  let modulesWithLeastTasks: string[] = [];

  modules.forEach((module) => {
    const taskCount = module.tasks?.length || 0;
    if (taskCount > maxTasks) {
      maxTasks = taskCount;
      modulesWithMostTasks = [module.title];
    } else if (taskCount === maxTasks) {
      modulesWithMostTasks.push(module.title);
    }
    if (taskCount > 0 && taskCount < minTasks) {
      minTasks = taskCount;
      modulesWithLeastTasks = [module.title];
    } else if (taskCount > 0 && taskCount === minTasks) {
      modulesWithLeastTasks.push(module.title);
    }
  });
  if (minTasks === Infinity) minTasks = 0;

  const getYouTubeVideoId = (url: string | undefined | null): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (
        urlObj.hostname.includes("youtube.com") ||
        urlObj.hostname.includes("youtu.be")
      ) {
        if (urlObj.pathname.includes("/embed/")) {
          return urlObj.pathname.split("/embed/")[1].split(/[?&]/)[0];
        }
        if (urlObj.searchParams.has("v")) {
          return urlObj.searchParams.get("v");
        }
      }
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.substring(1).split(/[?&]/)[0];
      }
    } catch (e) {
      console.error("Error parsing video URL:", e);
      return null;
    }
    return null;
  };

  const upcomingDeadlines = [
    {
      id: "deadline1",
      title: "Python Projekt einreichen",
      context: "Python Grundlagen",
      dueDate: "15. Okt 2024",
    },
    {
      id: "deadline2",
      title: "Excel Abschlusstest",
      context: "Excel Fortgeschritten",
      dueDate: "30. Okt 2024",
    },
  ];

  const breadcrumbItems = [{ label: "Dashboard" }];

  return (
    <div className="p-6 min-h-screen">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Übersicht</h1>
      <p className="text-base text-gray-600 mb-6">
        Willkommen zurück! Hier ist dein Lernfortschritt.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Meine Module"
          value={totalModules}
          icon={<IoLibraryOutline size={24} className="text-dsp-orange" />}
          accentColor="bg-dsp-orange_light"
        />
        <StatCard
          title="Lektionen Gesamt"
          value={totalLessons}
          description={`Ø ${averageLessonsPerModule} pro Modul`}
          icon={<IoSchoolOutline size={24} className="text-dsp-orange" />}
          accentColor="bg-dsp-orange_light"
        />
        <StatCard
          title="Aufgaben Gesamt"
          value={totalTasks}
          description={`Ø ${averageTasksPerModule} pro Modul`}
          icon={<IoListOutline size={24} className="text-dsp-orange" />}
          accentColor="bg-dsp-orange_light"
        />
        <StatCard
          title="Aufgabenverteilung"
          value={`${tasksByDifficulty["Einfach"] || 0} / ${
            tasksByDifficulty["Mittel"] || 0
          } / ${tasksByDifficulty["Schwer"] || 0}`}
          description="Einfach / Mittel / Schwer"
          icon={<IoStatsChartOutline size={24} className="text-dsp-orange" />}
          accentColor="bg-dsp-orange_light"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-dsp-orange_light">
              <BsSpeedometer2 size={20} className="text-dsp-orange" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              Module nach Ø Schwierigkeit
            </h2>
          </div>
          <div className="space-y-3">
            {(["Einfach", "Mittel", "Schwer"] as DifficultyLevel[]).map(
              (level) =>
                modulesByAvgDifficulty[level] > 0 && (
                  <div
                    key={level}
                    className="flex items-center justify-between text-sm"
                  >
                    <TagDifficulty difficulty={level} />
                    <span className="font-medium text-gray-800">
                      {modulesByAvgDifficulty[level]} Modul(e)
                    </span>
                  </div>
                )
            )}
            {Object.keys(modulesByAvgDifficulty).length === 0 && (
              <p className="text-sm text-gray-500">
                Keine Module mit bewertbaren Aufgaben.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-dsp-orange_light">
              <IoListOutline size={20} className="text-dsp-orange" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              Aufgaben pro Modul
            </h2>
          </div>
          <div className="space-y-3 text-sm">
            {maxTasks > -1 && (
              <div>
                <p className="font-semibold mb-1">
                  Meiste Aufgaben ({maxTasks}):
                </p>
                <p className="text-gray-500">
                  {modulesWithMostTasks.join(", ")}
                </p>
              </div>
            )}
            {minTasks < Infinity && minTasks > 0 && (
              <div className="mt-3">
                <p className="font-semibold mb-1">
                  Wenigste Aufgaben ({minTasks}):
                </p>
                <p className="text-gray-500">
                  {modulesWithLeastTasks.join(", ")}
                </p>
              </div>
            )}
            {minTasks === 0 && maxTasks <= 0 && (
              <p className="text-sm text-gray-500">
                Keine Aufgaben in den Modulen gefunden.
              </p>
            )}
          </div>
        </div>
      </div>
      {/* --- Anstehende Fristen mit ausgelagertem Overlay --- */}
      <div className="mt-12 relative">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Anstehende Fristen
          </h2>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="p-3 rounded-full bg-dsp-orange_light mr-4 flex-shrink-0">
                    <IoTimeOutline size={20} className="text-dsp-orange" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-md font-semibold text-gray-800">
                      {deadline.title}
                    </p>
                    <p className="text-sm text-gray-500">{deadline.context}</p>
                    <p className="text-sm font-medium text-red-600 mt-1">
                      {deadline.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              Aktuell keine anstehenden Fristen.
            </p>
          )}
        </div>

        <ComingSoonOverlaySmall subMessage="(Die Anstehenden Fristen sind bald verfügbar)" />
      </div>
      {/* ------------------------------------------------------- */}

      {modules.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Deine Module
          </h2>
          <div
            className={`space-y-3 overflow-y-auto p-4 transition-[max-height] duration-700 ease-in-out ${
              showAllModules ? "max-h-[800px]" : "max-h-80"
            }`}
          >
            {modules.map((module) => {
              const firstContent = module.contents?.[0];
              const videoId = getYouTubeVideoId(firstContent?.video_url);
              const thumbnailUrl = videoId
                ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                : null;

              const moduleTasks = module.tasks || [];
              const totalTasksInModule = moduleTasks.length;
              const completedTasksInModule = moduleTasks.filter(
                (task) => task.completed
              ).length;
              const progressPercent =
                totalTasksInModule > 0
                  ? (completedTasksInModule / totalTasksInModule) * 100
                  : 0;

              return (
                <Link
                  key={module.id}
                  to={`/modules/${module.id}`}
                  className="block bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-dsp-orange transition duration-200 ease-in-out group flex flex-col"
                >
                  <div className="flex items-center w-full mb-3">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={`${module.title} thumbnail`}
                        className="w-16 h-10 object-cover rounded mr-4 flex-shrink-0 bg-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          const placeholder = document.createElement("div");
                          placeholder.className =
                            "w-16 h-10 bg-gray-200 rounded mr-4 flex-shrink-0";
                          (
                            e.target as HTMLImageElement
                          ).parentNode?.insertBefore(
                            placeholder,
                            e.target as HTMLImageElement
                          );
                        }}
                      />
                    ) : (
                      <div className="w-16 h-10 bg-gray-200 rounded mr-4 flex-shrink-0"></div>
                    )}
                    <div className="flex-grow mr-4">
                      <h3 className="text-md font-semibold text-gray-800 group-hover:text-dsp-orange mb-1">
                        {module.title}
                      </h3>
                    </div>
                    <IoPlayCircleOutline
                      size={28}
                      className="text-dsp-orange flex-shrink-0"
                    />
                  </div>
                  {totalTasksInModule > 0 && (
                    <div className="w-full mt-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          Fortschritt ({completedTasksInModule}/
                          {totalTasksInModule})
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          {progressPercent.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-dsp-orange h-1.5 rounded-full transition-[width] duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {modules.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllModules(!showAllModules)}
              className="block w-full mt-4 text-center bg-white py-3 px-4 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition duration-150 ease-in-out"
            >
              {showAllModules ? "Weniger anzeigen" : "Mehr anzeigen"}
            </button>
          )}
        </div>
      )}
      {modules.length === 0 && !loading && (
        <div className="mt-12 text-center text-gray-500">
          <p>Dir sind aktuell keine Module zugewiesen.</p>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  accentColor = "bg-gray-100",
  description,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center gap-4 mb-2">
        <div className={`p-3 rounded-full ${accentColor}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
};

export default Dashboard;
