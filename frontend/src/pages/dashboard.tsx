/**
 * Dashboard Page - E-Learning DSP Frontend
 *
 * Haupt-Dashboard für die E-Learning-Plattform:
 * - Übersicht über Module und Lernfortschritt
 * - Statistiken und Kennzahlen
 * - Schwierigkeitsgrad-Analyse
 * - Upcoming Deadlines
 * - Performance-Metriken
 *
 * Features:
 * - Modul-Übersicht mit Statistiken
 * - Schwierigkeitsgrad-Kategorisierung
 * - Progress-Tracking
 * - Responsive Design
 * - Error-Handling und Loading-States
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

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
// import { BsSpeedometer2 } from "react-icons/bs";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import ComingSoonOverlaySmall from "../components/messages/coming_soon_overlay_small";
import SubBackground from "../components/layouts/SubBackground";

/**
 * Dashboard Komponente
 *
 * Haupt-Dashboard mit Übersicht über Module, Statistiken
 * und Lernfortschritt des Benutzers.
 */
function Dashboard() {
  // --- State Management ---
  const { modules, loading, error, fetchModules } = useModules();
  const [showAllModules, setShowAllModules] = useState(false);
  // const navigate = useNavigate();

  // --- Loading State ---
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

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen">
        <div className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: "Dashboard" }]} className="mb-6" />

            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
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

  // --- Data Calculations ---

  const totalModules = modules.length;

  const allTasks: ContextTask[] = modules.flatMap((m) => m.tasks || []);
  const totalTasks = allTasks.length;
  const averageTasksPerModule =
    totalModules > 0 ? (totalTasks / totalModules).toFixed(1) : "0.0";

  const totalLessons = modules.reduce(
    (sum, m) => sum + (m.contents?.length || 0),
    0,
  );
  const averageLessonsPerModule =
    totalModules > 0 ? (totalLessons / totalModules).toFixed(1) : "0.0";

  // --- Difficulty Analysis ---

  const tasksByDifficulty = allTasks.reduce(
    (acc, task) => {
      const level = task.difficulty as DifficultyLevel;
      if (level === "Einfach" || level === "Mittel" || level === "Schwer") {
        acc[level] = (acc[level] || 0) + 1;
      }
      return acc;
    },
    {} as Record<DifficultyLevel, number>,
  );

  /**
   * Berechnet die durchschnittliche Schwierigkeit eines Moduls
   */
  const calculateModuleDifficulty = (
    tasks?: ContextTask[],
  ): DifficultyLevel | null => {
    if (!tasks || tasks.length === 0) return null;
    const difficultyMap: Record<string, number> = {
      Einfach: 1,
      Mittel: 2,
      Schwer: 3,
    };
    const validTasks = tasks.filter(
      (task) => difficultyMap[task.difficulty] !== undefined,
    );
    if (validTasks.length === 0) return null;

    const totalDifficultyScore = validTasks.reduce(
      (sum, task) => sum + difficultyMap[task.difficulty],
      0,
    );
    const averageScore = totalDifficultyScore / validTasks.length;

    if (averageScore < 1.7) return "Einfach";
    if (averageScore <= 2.3) return "Mittel";
    return "Schwer";
  };

  // Berechnung der Module nach durchschnittlicher Schwierigkeit (für zukünftige Verwendung)
  // const modulesByAvgDifficulty = modules.reduce((acc, module) => {
  //   const avgDifficulty = calculateModuleDifficulty(module.tasks);
  //   if (avgDifficulty) {
  //     acc[avgDifficulty] = (acc[avgDifficulty] || 0) + 1;
  //   }
  //   return acc;
  // }, {} as Record<DifficultyLevel, number>);

  // --- Module Analysis ---

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

  // --- Utility Functions ---

  /**
   * Extrahiert YouTube Video ID aus URL (für zukünftige Verwendung)
   */
  // const getYouTubeVideoId = (url: string | undefined | null): string | null => {
  //   if (!url) return null;
  //   try {
  //     const urlObj = new URL(url);
  //     if (
  //       urlObj.hostname.includes("youtube.com") ||
  //       urlObj.hostname.includes("youtu.be")
  //     ) {
  //       if (urlObj.pathname.includes("/embed/")) {
  //         return urlObj.pathname.split("/embed/")[1].split(/[?&]/)[0];
  //       }
  //       if (urlObj.searchParams.has("v")) {
  //         return urlObj.searchParams.get("v");
  //       }
  //     }
  //     if (urlObj.hostname === "youtu.be") {
  //       return urlObj.pathname.substring(1).split(/[?&]/)[0];
  //     }
  //   } catch (e) {
  //     console.error("Error parsing video URL:", e);
  //     return null;
  //   }
  //   return null;
  // };

  // --- Mock Data ---

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
      {/* --- Hero Section --- */}
      <div className="px-3 pt-3 pb-6">
        <div className="max-w-[95vw] mx-auto">
          <Breadcrumbs items={breadcrumbItems} className="mb-3" />

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
              Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Willkommen zurück! Hier findest du eine Übersicht über deine
              Lernfortschritte und verfügbare Module.
            </p>
          </div>

          {/* --- Statistics Cards (alter Stand) --- */}
          <SubBackground className="mb-12" padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <StatCard
                title="Verfügbare Module"
                value={totalModules}
                icon={<IoLibraryOutline className="text-2xl" />}
                accentColor="bg-blue-100"
                description={`${averageLessonsPerModule} Lektionen pro Modul`}
              />
              <StatCard
                title="Gesamtaufgaben"
                value={totalTasks}
                icon={<IoListOutline className="text-2xl" />}
                accentColor="bg-green-100"
                description={`${averageTasksPerModule} Aufgaben pro Modul`}
              />
            </div>
          </SubBackground>

          {/* --- Main Content Grid (alter Stand) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- Module Overview --- */}
            <div className="lg:col-span-2">
              <SubBackground>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                      <IoSchoolOutline className="mr-3 text-dsp-orange" />
                      Modul-Übersicht
                    </h2>
                    <button
                      onClick={() => setShowAllModules(!showAllModules)}
                      className="text-dsp-orange hover:text-dsp-orange font-medium transition-colors"
                    >
                      {showAllModules ? "Weniger anzeigen" : "Alle anzeigen"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(showAllModules ? modules : modules.slice(0, 3)).map(
                      (module) => (
                        <div
                          key={module.id}
                          className="bg-white rounded-xl p-4 border border-gray-200 hover:border-dsp-orange/30 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-2">
                                {module.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <IoPlayCircleOutline className="mr-1" />
                                  {module.contents?.length || 0} Lektionen
                                </span>
                                <span className="flex items-center">
                                  <IoListOutline className="mr-1" />
                                  {module.tasks?.length || 0} Aufgaben
                                </span>
                                {module.tasks && module.tasks.length > 0 && (
                                  <TagDifficulty
                                    difficulty={
                                      calculateModuleDifficulty(module.tasks) ||
                                      "Mittel"
                                    }
                                  />
                                )}
                              </div>
                            </div>
                            <Link
                              to={`/modules/${module.id}`}
                              className="px-4 py-2 bg-dsp-orange text-white rounded-lg hover:bg-dsp-orange transition-colors font-medium text-sm"
                            >
                              Öffnen
                            </Link>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {modules.length > 3 && (
                    <div className="mt-6 text-center">
                      <Link
                        to="/modules"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-dsp-orange to-dsp-orange-gradient text-white rounded-xl hover:from-dsp-orange-gradient hover:to-dsp-orange transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        <IoLibraryOutline className="mr-2" />
                        Alle Module anzeigen
                      </Link>
                    </div>
                  )}
                </div>
              </SubBackground>
            </div>

            {/* --- Sidebar --- */}
            <div className="space-y-6">
              {/* --- Difficulty Distribution --- */}
              <SubBackground>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <IoStatsChartOutline className="mr-2 text-dsp-orange" />
                    Schwierigkeitsgrad
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(tasksByDifficulty).map(
                      ([difficulty, count]) => (
                        <div
                          key={difficulty}
                          className="flex items-center justify-between"
                        >
                          <TagDifficulty
                            difficulty={difficulty as DifficultyLevel}
                          />
                          <span className="font-semibold text-gray-800">
                            {count}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </SubBackground>

              {/* --- Upcoming Deadlines with Coming Soon Overlay --- */}
              <SubBackground>
                <div className="p-6 relative">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <IoTimeOutline className="mr-2 text-dsp-orange" />
                    Anstehende Deadlines
                  </h3>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className="bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <h4 className="font-medium text-gray-800 text-sm mb-1">
                          {deadline.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {deadline.context}
                        </p>
                        <p className="text-xs text-dsp-orange font-medium">
                          Fällig: {deadline.dueDate}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Coming Soon Overlay positioned over the deadlines */}
                  <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center">
                    <ComingSoonOverlaySmall
                      message="Erweiterte Statistiken"
                      subMessage="Detaillierte Lernanalysen und Performance-Metriken"
                    />
                  </div>
                </div>
              </SubBackground>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- StatCard Component ---

/**
 * Props für StatCard Komponente
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: string;
  description?: string;
}

/**
 * StatCard Komponente für Dashboard-Statistiken
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  accentColor = "bg-gray-100",
  description,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-dsp-orange/30 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${accentColor}`}>
          <div className="text-dsp-orange">{icon}</div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
