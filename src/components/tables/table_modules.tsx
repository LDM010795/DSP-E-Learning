import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  IoCheckmarkCircleOutline,
  IoHourglassOutline,
  IoPlayOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
} from "react-icons/io5";
import TagCalculatedDifficulty from "../tags/tag_calculated_difficulty";
import type { Module } from "../../context/ModuleContext"; // Nur Module importieren

type ModuleStatus = "Nicht begonnen" | "In Bearbeitung" | "Abgeschlossen";
type SortDirection = "asc" | "desc" | "none";
type SortableColumn =
  | "status"
  | "title"
  | "category"
  | "difficulty"
  | "progress";

// Helper function (duplicate from modules.tsx, consider moving to a shared utils file)
const getModuleStatus = (module: Module): ModuleStatus => {
  const tasks = module.tasks || [];
  if (tasks.length === 0) {
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

// Helper für Sortierreihenfolge
const getModuleStatusOrder = (status: ModuleStatus): number => {
  switch (status) {
    case "Abgeschlossen":
      return 1;
    case "In Bearbeitung":
      return 2;
    case "Nicht begonnen":
      return 3;
    default:
      return 4;
  }
};

const getDifficultyOrder = (difficulty: string | null): number => {
  if (difficulty === "Einfach") return 1;
  if (difficulty === "Mittel") return 2;
  if (difficulty === "Schwer") return 3;
  return 4; // Fallback für unbekannt/null
};

const calculateDifficultyForSort = (module: Module): string | null => {
  const tasks = module.tasks;
  if (!tasks || tasks.length === 0) return null;
  const difficultyMap: Record<string, number> = {
    Einfach: 1,
    Mittel: 2,
    Schwer: 3,
  };
  const totalDifficultyScore = tasks.reduce(
    (sum, task) => sum + (difficultyMap[task.difficulty] || 0),
    0,
  );
  const averageScore = totalDifficultyScore / tasks.length;
  if (averageScore < 1.7) return "Einfach";
  else if (averageScore <= 2.3) return "Mittel";
  else return "Schwer";
};

const calculateProgress = (module: Module): number => {
  const tasks = module.tasks || [];
  const totalTasks = tasks.length;
  if (totalTasks === 0) return 0;
  const completedTasks = tasks.filter((t) => t.completed).length;
  return Math.round((completedTasks / totalTasks) * 100);
};

// Props für die Tabelle
interface TableModulesProps {
  modules: Module[]; // Erwartet die bereits sortierte/gefilterte Liste
}

const TableModules: React.FC<TableModulesProps> = ({ modules }) => {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<SortableColumn>("status"); // Default Sort
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleRowClick = (moduleId: number) => {
    navigate(`/modules/${moduleId}`);
  };

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection("none");
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedModules = useMemo(() => {
    if (sortDirection === "none") {
      return modules;
    }
    return [...modules].sort((a, b) => {
      let compareResult = 0;
      const valA =
        sortColumn === "status"
          ? getModuleStatusOrder(getModuleStatus(a))
          : sortColumn === "difficulty"
            ? getDifficultyOrder(calculateDifficultyForSort(a))
            : sortColumn === "progress"
              ? calculateProgress(a)
              : (a[sortColumn as keyof Module] ?? ""); // Handle potential undefined/null
      const valB =
        sortColumn === "status"
          ? getModuleStatusOrder(getModuleStatus(b))
          : sortColumn === "difficulty"
            ? getDifficultyOrder(calculateDifficultyForSort(b))
            : sortColumn === "progress"
              ? calculateProgress(b)
              : (b[sortColumn as keyof Module] ?? "");

      if (typeof valA === "number" && typeof valB === "number") {
        compareResult = valA - valB;
      } else if (typeof valA === "string" && typeof valB === "string") {
        compareResult = valA.localeCompare(valB);
      }
      // Handle other types if necessary

      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  }, [modules, sortColumn, sortDirection]);

  const getStatusInfo = (status: ModuleStatus) => {
    switch (status) {
      case "Abgeschlossen":
        return {
          icon: <IoCheckmarkCircleOutline className="h-5 w-5 text-green-600" />,
          progressColor: "bg-green-500",
        };
      case "In Bearbeitung":
        return {
          icon: <IoHourglassOutline className="h-5 w-5 text-dsp-orange" />,
          progressColor: "bg-dsp-orange",
        };
      case "Nicht begonnen":
      default:
        return {
          icon: <IoPlayOutline className="h-5 w-5 text-gray-400" />,
          progressColor: "bg-gray-300",
        };
    }
  };

  // Helper für Sortier-Icons
  const renderSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column || sortDirection === "none") {
      return (
        <span className="ml-1 text-gray-400 group-hover:text-gray-500 flex flex-col -space-y-1.5">
          <IoArrowUpOutline className="h-2.5 w-2.5" />
          <IoArrowDownOutline className="h-2.5 w-2.5" />
        </span>
      );
    }
    return (
      <span className="ml-1 text-dsp-orange">
        {sortDirection === "asc" ? (
          <IoArrowUpOutline className="h-3 w-3" />
        ) : (
          <IoArrowDownOutline className="h-3 w-3" />
        )}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status {renderSortIcon("status")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center">
                Titel {renderSortIcon("title")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("category")}
            >
              <div className="flex items-center">
                Kategorie {renderSortIcon("category")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("difficulty")}
            >
              <div className="flex items-center">
                Schwierigkeit {renderSortIcon("difficulty")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("progress")}
            >
              <div className="flex items-center">
                Fortschritt {renderSortIcon("progress")}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedModules.map((module) => {
            const status = getModuleStatus(module);
            const { icon, progressColor } = getStatusInfo(status);
            const tasks = module.tasks || [];
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter((t) => t.completed).length;
            const progress =
              totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const roundedProgress = Math.round(progress);

            return (
              <tr
                key={module.id}
                onClick={() => handleRowClick(module.id)}
                className="hover:bg-dsp-orange_light cursor-pointer transition-colors duration-150"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center">{icon}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {module.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {module.category?.name || "Keine Kategorie"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* Difficulty Tag direkt rendern */}
                  <TagCalculatedDifficulty tasks={tasks} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={clsx("h-2 rounded-full", progressColor)}
                        style={{ width: `${roundedProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">
                      {roundedProgress}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Optional: Pagination Controls hier einfügen */}
      {/* Beispiel: <Pagination ... /> */}
    </div>
  );
};

export default TableModules;
