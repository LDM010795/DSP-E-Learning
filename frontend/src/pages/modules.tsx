// Modules.tsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CardPreviewSmall from "../components/cards/card_preview_small";
import FilterHead from "../components/filter/filter_head";
import TagCalculatedDifficulty from "../components/tags/tag_calculated_difficulty";
import type { DifficultyLevel } from "../components/tags/tag_difficulty";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import { useModules, Module, Task } from "../context/ModuleContext";
import ButtonFilterSimple from "../components/ui_elements/buttons/button_filter_simple";
import {
  IoGridOutline,
  IoListOutline,
  IoLibraryOutline,
  IoSearchOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import TableModules from "../components/tables/table_modules";
import ButtonFilterCategory from "../components/ui_elements/buttons/button_filter_category";
import SubBackground from "../components/layouts/SubBackground";
import clsx from "clsx";
import LoadingSpinner from "../components/ui_elements/loading_spinner";

// NEU: Typ für den Modulstatus
type ModuleStatus = "Nicht begonnen" | "In Bearbeitung" | "Abgeschlossen";

// NEU: Typ für den Ansichtsmodus - "compact" wird zu "table"
type ViewMode = "standard" | "table";

function Modules() {
  const { modules, loading, error, fetchModules } = useModules();
    const [searchTerm, setSearchTerm] = useState<string>("");
  // NEU: State für Schwierigkeitsfilter
  const [activeDifficultyFilters, setActiveDifficultyFilters] = useState<DifficultyLevel[]>([]);
  // NEU: State für Statusfilter
  const [activeStatusFilters, setActiveStatusFilters] = useState<ModuleStatus[]>([]);
  // NEU: State für Kategorie-Filter
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<string[]>([],);

  // NEU: State für den Ansichtsmodus - Default bleibt "standard"
  const [viewMode, setViewMode] = useState<ViewMode>("standard");

  console.log("Modules-Komponente: rendering", {
    moduleCount: modules.length,
    loading,
    hasError: !!error,
  });

  useEffect(() => {
    console.log(
      "Modules-Komponente: Aktualisierte Module erhalten",
      modules.length,
    );
  }, [modules]);

  const getFirstYoutubeId = (module: Module): string | undefined => {
    const firstContentWithVideo = module.contents?.find((c) => c.video_url);
    const videoUrl = firstContentWithVideo?.video_url;
    if (!videoUrl) return undefined;
    const patterns = [
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /watch\?v=([a-zA-Z0-9_-]{11})/,
      /embed\/([a-zA-Z0-9_-]{11})/,
      /v\/([a-zA-Z0-9_-]{11})/,
      /\/([a-zA-Z0-9_-]{11})($|\?|#)/,
    ];
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    console.warn(`Could not extract YouTube ID from URL: ${videoUrl}`);
    return undefined;
  };

  // NEU: Hilfsfunktion zur Bestimmung des Modulstatus
  const getModuleStatus = (module: Module): ModuleStatus => {
    const tasks = module.tasks || [];
    if (tasks.length === 0) {
      // Module ohne Aufgaben gelten als "Nicht begonnen" oder eine andere Kategorie?
      // Hier erstmal als "Nicht begonnen" behandelt.
      return "Nicht begonnen";
    }
    const completedTasks = tasks.filter((task) => task.completed).length;
    if (completedTasks === 0) {
      return "Nicht begonnen";
    }
    if (completedTasks === tasks.length) {
      return "Abgeschlossen";
    }
    return "In Bearbeitung";
  };

  // NEU: Handler für Kategorie-Filter
  const handleCategoryFilterChange = (category: string, isChecked: boolean) => {
    setActiveCategoryFilters((prevFilters) => {
      if (isChecked) {
        return [...prevFilters, category];
      } else {
        return prevFilters.filter((f) => f !== category);
      }
    });
  };

  // Füge die Sortierfunktion wieder hinzu für die Standard-Sortierung
  const getModuleStatusOrder = (status: ModuleStatus): number => {
    switch (status) {
      case "Abgeschlossen":
        return 1;
      case "In Bearbeitung":
        return 2;
      case "Nicht begonnen":
        return 3;
      default:
        return 4; // Fallback
    }
  };

  // NEU: Extrahiere alle einzigartigen Kategorien aus den Modulen
  const allCategories = useMemo(() => {
    const categories = modules
      .map((module) => module.category?.name)
      .filter((categoryName): categoryName is string => Boolean(categoryName));
    return [...new Set(categories)];
  }, [modules]);

  // Benenne Variable um und füge Sortierung wieder hinzu
  const sortedAndFilteredModules = [...modules]
    .filter((module: Module) => {
      const calculateDifficultyForFilter = (
        tasksForFilter?: Task[],
      ): DifficultyLevel | null => {
        if (!tasksForFilter || tasksForFilter.length === 0) return null;
        const difficultyMap: Record<string, number> = {
          Einfach: 1,
          Mittel: 2,
          Schwer: 3,
        };
        const totalDifficultyScore = tasksForFilter.reduce(
          (sum, task) => sum + (difficultyMap[task.difficulty] || 0),
          0,
        );
        const averageScore = totalDifficultyScore / tasksForFilter.length;
        if (averageScore < 1.7) return "Einfach";
        else if (averageScore <= 2.3) return "Mittel";
        else return "Schwer";
      };
      const difficultyMatch = (() => {
        if (activeDifficultyFilters.length === 0) return true;
        const avgDifficulty = calculateDifficultyForFilter(module.tasks);
        return avgDifficulty !== null && activeDifficultyFilters.includes(avgDifficulty);
      })();
      const searchMatch =
        searchTerm === "" ||
        module.title.toLowerCase().includes(searchTerm.toLowerCase());

      // NEU: Status-Filter-Logik
      const statusMatch = (() => {
        if (activeStatusFilters.length === 0) return true;
        const moduleStatus = getModuleStatus(module);
        return activeStatusFilters.includes(moduleStatus);
      })();

      // NEU: Kategorie-Filter-Logik
      const categoryMatch = (() => {
        if (activeCategoryFilters.length === 0) return true;
        // Stelle sicher, dass module.category existiert und ein String ist
        return (
          typeof module.category?.name === "string" &&
          activeCategoryFilters.includes(module.category.name)
        );
      })();

      return difficultyMatch && searchMatch && statusMatch && categoryMatch;
    })
    // Sortiere NACH dem Filtern
    .sort((a, b) => {
      const statusA = getModuleStatus(a);
      const statusB = getModuleStatus(b);
      const orderA = getModuleStatusOrder(statusA);
      const orderB = getModuleStatusOrder(statusB);

      if (orderA !== orderB) {
        return orderA - orderB; // Nach Status sortieren
      }
      // Bei gleichem Status nach Titel sortieren
      return a.title.localeCompare(b.title);
    });

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Module" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <LoadingSpinner
          message="Lade Module..."
          size="lg"
          variant="spinner"
          showBackground={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />

            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
                Modulübersicht
              </h1>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-white/20 p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <IoAlertCircleOutline className="text-6xl text-red-500 mb-6 mx-auto" />
                <h2 className="text-2xl font-bold text-red-700 mb-4">
                  Fehler beim Laden!
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative px-3 pt-3 pb-6">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-3" />

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
                Modulübersicht
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Entdecke unsere Lernmodule und filtere nach deinen Interessen.
              </p>

              {/* Stats indicator */}
              <div className="mt-6 inline-flex items-center space-x-6 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
                <div className="flex items-center space-x-2">
                  <IoLibraryOutline className="text-[#ff863d] w-5 h-5" />
                  <span className="text-sm font-medium text-gray-700">
                    {modules.length} Module verfügbar
                  </span>
                </div>
                <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Alle aktuell
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 pb-6">
        <div className="max-w-[95vw] mx-auto">
          {/* Module Count & Filter Status */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-sm font-medium text-gray-600">
              {sortedAndFilteredModules.length} von {modules.length} Modulen
            </span>
            {(activeDifficultyFilters.length > 0 ||
              activeStatusFilters.length > 0 ||
              activeCategoryFilters.length > 0 ||
              searchTerm) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff863d]/10 text-[#ff863d] border border-[#ff863d]/20">
                  <IoSearchOutline className="w-3 h-3 mr-1" />
                  Gefiltert
                </span>
              )}
          </div>

          {/* Combined Filter & Content Area */}
          <SubBackground>
            {/* Filter Section with View Mode Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex-1">
                <FilterHead
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  searchPlaceholder="Module durchsuchen..."
                  className="mb-0"
                >
                  <ButtonFilterSimple
                    label="Status:"
                    options={[
                      "Nicht begonnen",
                      "In Bearbeitung",
                      "Abgeschlossen",
                    ]}
                    activeOptions={activeStatusFilters}
                    onOptionClick={setActiveStatusFilters}
                    onClearClick={() => setActiveStatusFilters([])}
                    multiSelectEnabled={false}
                    activeClassName="bg-[#ff863d] text-white border-[#ff863d]"
                  />
                  <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
                  <ButtonFilterSimple
                    label="Schwierigkeit:"
                    options={["Einfach", "Mittel", "Schwer"]}
                    activeOptions={activeDifficultyFilters}
                    onOptionClick={setActiveDifficultyFilters}
                    onClearClick={() => setActiveDifficultyFilters([])}
                    multiSelectEnabled={true}
                    activeClassName="bg-[#ff863d] text-white border-[#ff863d]"
                  />
                  <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
                  {allCategories.length > 0 && (
                    <ButtonFilterCategory
                      allCategories={allCategories}
                      activeCategories={activeCategoryFilters}
                      onCategoryChange={handleCategoryFilterChange}
                      onClearClick={() => setActiveCategoryFilters([])}
                    />
                  )}
                </FilterHead>
              </div>

              {/* View Mode Toggle - rechts angeordnet */}
              <div className="flex-shrink-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm p-1">
                  <div className="flex items-center">
                    <button
                      onClick={() => setViewMode("standard")}
                      className={clsx(
                        "relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        "focus:z-10 focus:outline-none focus:ring-2 focus:ring-[#ff863d]/20",
                        viewMode === "standard"
                          ? "bg-[#ff863d] text-white shadow-sm"
                          : "text-gray-600 hover:text-[#ff863d] hover:bg-[#ff863d]/5",
                      )}
                      aria-label="Standardansicht"
                      title="Standardansicht"
                    >
                      <IoGridOutline className="h-4 w-4 mr-2" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={clsx(
                        "relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        "focus:z-10 focus:outline-none focus:ring-2 focus:ring-[#ff863d]/20",
                        viewMode === "table"
                          ? "bg-[#ff863d] text-white shadow-sm"
                          : "text-gray-600 hover:text-[#ff863d] hover:bg-[#ff863d]/5",
                      )}
                      aria-label="Tabellenansicht"
                      title="Tabellenansicht"
                    >
                      <IoListOutline className="h-4 w-4 mr-2" />
                      Tabelle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            {viewMode === "standard" ? (
              <div
                className={clsx(
                  "grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
                )}
              >
                {sortedAndFilteredModules.length > 0 ? (
                  sortedAndFilteredModules.map((module: Module) => {
                    const moduleTasks = module.tasks || [];
                    const totalTasksInModule = moduleTasks.length;
                    const completedTasksInModule = moduleTasks.filter(
                      (task) => task.completed,
                    ).length;
                    const progressPercent =
                      totalTasksInModule > 0
                        ? (completedTasksInModule / totalTasksInModule) * 100
                        : 0;

                    const roundedProgressPercent = Math.round(progressPercent);
                    const difficultyTagElement = (
                      <TagCalculatedDifficulty tasks={module.tasks} />
                    );

                    return (
                      <Link
                        key={module.id}
                        to={`/modules/${module.id}`}
                        className={clsx("block relative group")}
                      >
                        <div className="relative overflow-hidden rounded-xl border border-white/40 hover:border-[#ff863d]/30 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-white/60 backdrop-blur-sm hover:bg-white/80">
                          <CardPreviewSmall
                            title={module.title}
                            youtubeId={getFirstYoutubeId(module)}
                            progress={roundedProgressPercent}
                            className="w-full h-full border-0 bg-transparent hover:bg-transparent"
                            classNameTitle="text-left text-xl group-hover:text-[#ff863d] transition-colors duration-200"
                          />
                          {module.tasks && module.tasks.length > 0 && (
                            <div className="absolute top-4 right-4 z-10">
                              {difficultyTagElement}
                            </div>
                          )}

                          {/* Enhanced hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#ff863d]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5 text-center py-12">
                    <IoSearchOutline className="mx-auto text-6xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">
                      Keine Module gefunden
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Keine Module entsprechen den aktuellen Filterkriterien.
                      Versuche andere Filter oder entferne bestehende Filter.
                    </p>
                  </div>
                )}
              </div>
            ) : sortedAndFilteredModules.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-white/40">
                <TableModules modules={sortedAndFilteredModules} />
              </div>
            ) : (
              <div className="text-center py-12">
                <IoSearchOutline className="mx-auto text-6xl text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Keine Module gefunden
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Keine Module entsprechen den aktuellen Filterkriterien.
                  Versuche andere Filter oder entferne bestehende Filter.
                </p>
              </div>
            )}
          </SubBackground>
        </div>
      </div>
    </div>
  );
}

export default Modules;
