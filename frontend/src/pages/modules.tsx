// Modules.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CardPreviewSmall from "../components/cards/card_preview_small";
import FilterHead from "../components/filter/filter_head";
import TagCalculatedDifficulty from "../components/tags/tag_calculated_difficulty";
import type { DifficultyLevel } from "../components/tags/tag_difficulty";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import { useModules, Module, Task } from "../context/ModuleContext";
import ButtonFilterSimple from "../components/ui_elements/buttons/button_filter_simple";
import { IoGridOutline, IoListOutline } from "react-icons/io5";
import TableModules from "../components/tables/table_modules";
import ButtonFilterCategory from "../components/ui_elements/buttons/button_filter_category";
import clsx from "clsx";

// NEU: Typ für den Modulstatus
type ModuleStatus = "Nicht begonnen" | "In Bearbeitung" | "Abgeschlossen";

// NEU: Typ für den Ansichtsmodus - "compact" wird zu "table"
type ViewMode = "standard" | "table";

function Modules() {
  const { modules, loading, error, fetchModules } = useModules();
  const [activeFilters, setActiveFilters] = useState<DifficultyLevel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  // NEU: State für Statusfilter
  const [activeStatusFilters, setActiveStatusFilters] = useState<
    ModuleStatus[]
  >([]);
  // NEU: State für Kategorie-Filter
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<string[]>(
    []
  );
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
      modules.length
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

  const handleFilterChange = (difficulty: DifficultyLevel) => {
    setActiveFilters((prevFilters) => {
      if (prevFilters.includes(difficulty)) {
        return prevFilters.filter((f) => f !== difficulty);
      } else {
        return [...prevFilters, difficulty];
      }
    });
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

  const handleStatusFilterChange = (status: ModuleStatus) => {
    setActiveStatusFilters((prevFilters) => {
      if (prevFilters.includes(status)) {
        return prevFilters.filter((f) => f !== status);
      } else {
        return [...prevFilters, status];
      }
    });
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
      .map((module) => module.category)
      .filter((category): category is string => Boolean(category)); // Filtere null/undefined und sorge für string[] Typ
    return [...new Set(categories)];
  }, [modules]);

  // Benenne Variable um und füge Sortierung wieder hinzu
  const sortedAndFilteredModules = [...modules]
    .filter((module: Module) => {
      const calculateDifficultyForFilter = (
        tasksForFilter?: Task[]
      ): DifficultyLevel | null => {
        if (!tasksForFilter || tasksForFilter.length === 0) return null;
        const difficultyMap: Record<string, number> = {
          Einfach: 1,
          Mittel: 2,
          Schwer: 3,
        };
        const totalDifficultyScore = tasksForFilter.reduce(
          (sum, task) => sum + (difficultyMap[task.difficulty] || 0),
          0
        );
        const averageScore = totalDifficultyScore / tasksForFilter.length;
        if (averageScore < 1.7) return "Einfach";
        else if (averageScore <= 2.3) return "Mittel";
        else return "Schwer";
      };
      const difficultyMatch = (() => {
        if (activeFilters.length === 0) return true;
        const avgDifficulty = calculateDifficultyForFilter(module.tasks);
        return avgDifficulty !== null && activeFilters.includes(avgDifficulty);
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
          typeof module.category === "string" &&
          activeCategoryFilters.includes(module.category)
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
      <div className="p-6 flex justify-center items-center h-64">
        <p className="text-lg text-gray-600">Lade Module...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Modulübersicht
        </h1>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Fehler beim Laden!</strong>
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

  return (
    <div className="p-6">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      <h1 className="text-3xl font-bold text-gray-800">Modulübersicht</h1>
      <p className="text-base text-gray-600 mb-6">
        Entdecke unsere Lernmodule und filtere nach deinen Interessen.
      </p>


        <FilterHead
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Module durchsuchen..."
          className="mb-8"
        >
          <ButtonFilterSimple
            label="Status:"
            options={["Nicht begonnen", "In Bearbeitung", "Abgeschlossen"]}
            activeOptions={activeStatusFilters}
            onOptionClick={handleStatusFilterChange}
            onClearClick={() => setActiveStatusFilters([])}
            activeClassName="bg-dsp-orange text-white border-dsp-orange"
          />
          <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
          <ButtonFilterSimple
            label="Schwierigkeit:"
            options={["Einfach", "Mittel", "Schwer"]}
            activeOptions={activeFilters}
            onOptionClick={handleFilterChange}
            onClearClick={() => setActiveFilters([])}
            activeClassName="bg-dsp-orange text-white border-dsp-orange"
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

        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-md shadow-sm bg-white border border-gray-300">
            <button
              onClick={() => setViewMode("standard")}
              className={clsx(
                "relative inline-flex items-center px-3 py-1.5 rounded-l-md border-r border-gray-300 text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-dsp-orange focus:border-dsp-orange",
                "cursor-pointer",
                viewMode === "standard"
                  ? "bg-dsp-orange text-white"
                  : "text-gray-500 bg-white hover:bg-dsp-orange_light"
              )}
              aria-label="Standardansicht"
              title="Standardansicht"
            >
              <IoGridOutline className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={clsx(
                "relative inline-flex items-center px-3 py-1.5 rounded-r-md text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-dsp-orange focus:border-dsp-orange",
                "cursor-pointer",
                viewMode === "table"
                  ? "bg-dsp-orange text-white"
                  : "text-gray-500 bg-white hover:bg-dsp-orange_light"
              )}
              aria-label="Tabellenansicht"
              title="Tabellenansicht"
            >
              <IoListOutline className="h-4 w-4" />
            </button>
          </div>
        </div>

      <div className="mt-6">
        {viewMode === "standard" ? (
          <div
            className={clsx(
              "grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            )}
          >
            {sortedAndFilteredModules.length > 0 ? (
              sortedAndFilteredModules.map((module: Module) => {
                const moduleTasks = module.tasks || [];
                const totalTasksInModule = moduleTasks.length;
                const completedTasksInModule = moduleTasks.filter(
                  (task) => task.completed
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
                    className={clsx("block relative")}
                  >
                    <CardPreviewSmall
                      title={module.title}
                      youtubeId={getFirstYoutubeId(module)}
                      progress={roundedProgressPercent}
                      className="w-full h-full hover:bg-dsp-orange_light transition-all duration-300 ease-in-out border border-gray-300"
                      classNameTitle="text-left text-2xl"
                    />
                    {module.tasks && module.tasks.length > 0 && (
                      <div className="absolute top-4 right-4">
                        {difficultyTagElement}
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <p className="text-gray-600 md:col-span-2 xl:col-span-3">
                Keine Module gefunden, die den Filterkriterien entsprechen.
              </p>
            )}
          </div>
        ) : sortedAndFilteredModules.length > 0 ? (
          <TableModules modules={sortedAndFilteredModules} />
        ) : (
          <p className="text-gray-600 text-center py-8">
            Keine Module gefunden, die den Filterkriterien entsprechen.
          </p>
        )}
      </div>
    </div>
  );
}

export default Modules;
