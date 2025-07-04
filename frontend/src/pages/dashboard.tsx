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
import SubBackground from "../components/layouts/SubBackground";
import { ProgressBar } from "../components/ui_elements/progress";

function Dashboard() {
  const { modules, loading, error, fetchModules } = useModules();

  const [showAllModules, setShowAllModules] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <SubBackground>
          <div className="text-center">
            <LoadingSpinner message="Lade Dashboard Daten..." />
          </div>
        </SubBackground>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: "Dashboard" }]} className="mb-6" />

            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-[#ff863d] bg-clip-text text-transparent mb-4">
                Dashboard
              </h1>
            </div>

            <SubBackground className="max-w-2xl mx-auto">
              <div className="text-center">
                <IoAlertCircleOutline className="text-6xl text-red-500 mb-6 mx-auto" />
                <h2 className="text-2xl font-bold text-red-700 mb-4">
                  Fehler beim Laden des Dashboards
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {error.message ||
                    "Es gab ein Problem beim Abrufen der Moduldaten."}
                </p>
                <button
                  onClick={() => fetchModules()}
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative px-4 py-8">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-[#ff863d] bg-clip-text text-transparent mb-4">
                Dashboard Übersicht
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Willkommen zurück! Hier ist dein Lernfortschritt.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-[95vw] mx-auto space-y-6">
          {/* Statistics Cards */}
          <SubBackground>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Meine Module"
                value={totalModules}
                icon={<IoLibraryOutline size={24} className="text-[#ff863d]" />}
                accentColor="bg-[#ffe7d4]"
              />
              <StatCard
                title="Lektionen Gesamt"
                value={totalLessons}
                description={`Ø ${averageLessonsPerModule} pro Modul`}
                icon={<IoSchoolOutline size={24} className="text-[#ff863d]" />}
                accentColor="bg-[#ffe7d4]"
              />
              <StatCard
                title="Aufgaben Gesamt"
                value={totalTasks}
                description={`Ø ${averageTasksPerModule} pro Modul`}
                icon={<IoListOutline size={24} className="text-[#ff863d]" />}
                accentColor="bg-[#ffe7d4]"
              />
              <StatCard
                title="Aufgabenverteilung"
                value={`${tasksByDifficulty["Einfach"] || 0} / ${
                  tasksByDifficulty["Mittel"] || 0
                } / ${tasksByDifficulty["Schwer"] || 0}`}
                description="Einfach / Mittel / Schwer"
                icon={
                  <IoStatsChartOutline size={24} className="text-[#ff863d]" />
                }
                accentColor="bg-[#ffe7d4]"
              />
            </div>
          </SubBackground>

          {/* Module Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SubBackground className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-[#ffe7d4]">
                  <BsSpeedometer2 size={20} className="text-[#ff863d]" />
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
            </SubBackground>

            <SubBackground className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-[#ffe7d4]">
                  <IoListOutline size={20} className="text-[#ff863d]" />
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
            </SubBackground>
          </div>

          {/* Upcoming Deadlines */}
          <div className="relative">
            <SubBackground>
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Anstehende Fristen
                </h2>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className="flex items-center bg-white/60 p-4 rounded-lg border border-white/40 backdrop-blur-sm"
                      >
                        <div className="p-3 rounded-full bg-[#ffe7d4] mr-4 flex-shrink-0">
                          <IoTimeOutline size={20} className="text-[#ff863d]" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-md font-semibold text-gray-800">
                            {deadline.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {deadline.context}
                          </p>
                          <p className="text-sm font-medium text-red-600 mt-1">
                            {deadline.dueDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 bg-white/60 p-4 rounded-lg border border-white/40 backdrop-blur-sm">
                    Aktuell keine anstehenden Fristen.
                  </p>
                )}
              </div>
            </SubBackground>

            <ComingSoonOverlaySmall subMessage="(Die Anstehenden Fristen sind bald verfügbar)" />
          </div>

          {/* Module Overview */}
          {modules.length > 0 && (
            <SubBackground>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Deine Module
              </h2>
              <div
                className={`space-y-3 overflow-y-auto transition-[max-height] duration-700 ease-in-out ${
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
                      className="block bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/40 shadow-sm hover:shadow-md hover:border-[#ff863d]/30 transition duration-200 ease-in-out group flex flex-col hover:bg-white/80"
                    >
                      <div className="flex items-center w-full mb-3">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={`${module.title} thumbnail`}
                            className="w-16 h-10 object-cover rounded mr-4 flex-shrink-0 bg-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
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
                          <h3 className="text-md font-semibold text-gray-800 group-hover:text-[#ff863d] mb-1">
                            {module.title}
                          </h3>
                        </div>
                        <IoPlayCircleOutline
                          size={28}
                          className="text-[#ff863d] flex-shrink-0"
                        />
                      </div>
                      {totalTasksInModule > 0 && (
                        <div className="w-full mt-3">
                          <ProgressBar
                            value={progressPercent}
                            size="sm"
                            label={`${completedTasksInModule}/${totalTasksInModule} Aufgaben`}
                            showIcon={true}
                            className="mt-2"
                          />
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
                  className="block w-full mt-4 text-center bg-white/60 backdrop-blur-sm py-3 px-4 rounded-lg border border-white/40 shadow-sm hover:bg-white/80 text-gray-700 font-medium transition duration-150 ease-in-out"
                >
                  {showAllModules ? "Weniger anzeigen" : "Mehr anzeigen"}
                </button>
              )}
            </SubBackground>
          )}

          {modules.length === 0 && !loading && (
            <SubBackground>
              <div className="text-center text-gray-500">
                <p>Dir sind aktuell keine Module zugewiesen.</p>
              </div>
            </SubBackground>
          )}
        </div>
      </div>
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
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg border border-white/40 shadow-sm flex flex-col justify-between h-full hover:bg-white/80 transition-colors duration-200">
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
