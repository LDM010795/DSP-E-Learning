import React, { useState, useMemo } from "react";
import clsx from "clsx";
import {
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoPersonOutline,
  IoCalendarClearOutline,
  IoDocumentTextOutline,
  IoBarChartOutline,
  IoManOutline, // Platzhalter für Bewerter
  IoCheckmarkCircleOutline, // Für 'graded'
  IoAlertCircleOutline, // Für 'submitted'
  IoHourglassOutline, // Für 'started' (falls benötigt)
} from "react-icons/io5";
import type { ExamAttempt } from "../../context/ExamContext"; // ExamAttempt importieren
import { formatDate } from "../../util/helpers/formatDate"; // Datumsformatierung importieren

type SortDirection = "asc" | "desc" | "none";
type SortableColumn =
  | "status"
  | "exam_title"
  | "student"
  | "submitted_at"
  | "score"
  | "grader"; // Bewerter (grader)

// NEU: Helper für Status-Sortierung und Anzeige
const getStatusOrder = (status: ExamAttempt["status"]): number => {
  switch (status) {
    case "submitted":
      return 1; // Eingereicht zuerst anzeigen?
    case "graded":
      return 2;
    case "started":
      return 3;
    default:
      return 4;
  }
};

const StatusDisplay: React.FC<{ status: ExamAttempt["status"] }> = ({
  status,
}) => {
  let bgColor, textColor, Icon, text;
  switch (status) {
    case "started":
      bgColor = "bg-orange-100";
      textColor = "text-orange-700";
      Icon = IoHourglassOutline;
      text = "Gestartet";
      break;
    case "submitted":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-700";
      Icon = IoAlertCircleOutline;
      text = "Eingereicht";
      break;
    case "graded":
      bgColor = "bg-green-100";
      textColor = "text-green-700";
      Icon = IoCheckmarkCircleOutline;
      text = "Bewertet";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-700";
      Icon = IoAlertCircleOutline;
      text = "Unbekannt";
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} whitespace-nowrap`}
      title={text}
    >
      <Icon className="mr-1" />
      <span className="hidden sm:inline">{text}</span>{" "}
      {/* Text auf kleinen Screens ausblenden? */}
    </span>
  );
};

// Props für die Tabelle
interface TableExamsAssessedProps {
  attempts: ExamAttempt[]; // Erwartet jetzt *alle* relevanten Versuche
  onRowClick: (attemptId: number) => void; // Funktion für Klick auf Zeile
}

const TableExamsAssessed: React.FC<TableExamsAssessedProps> = ({
  attempts,
  onRowClick,
}) => {
  const [sortColumn, setSortColumn] = useState<SortableColumn>("submitted_at"); // Default Sort: Einreichdatum
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); // Default: Neueste zuerst

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc",
      );
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getScoreValue = (attempt: ExamAttempt): number => {
    if (attempt.score === null || attempt.score === undefined) return -1; // Handle null/undefined score
    return typeof attempt.score === "string"
      ? parseFloat(attempt.score)
      : attempt.score;
  };

  const sortedAttempts = useMemo(() => {
    if (sortDirection === "none" || !attempts) {
      return attempts ?? [];
    }
    return [...attempts].sort((a, b) => {
      let compareResult = 0;
      let valA: string | number | null | undefined;
      let valB: string | number | null | undefined;

      switch (sortColumn) {
        case "status":
          valA = getStatusOrder(a.status);
          valB = getStatusOrder(b.status);
          break;
        case "exam_title":
          valA = a.exam?.exam_title?.toLowerCase() ?? "";
          valB = b.exam?.exam_title?.toLowerCase() ?? "";
          break;
        case "student":
          valA = a.user?.username?.toLowerCase() ?? "";
          valB = b.user?.username?.toLowerCase() ?? "";
          break;
        case "submitted_at":
          valA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
          valB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
          break;
        case "score":
          valA = getScoreValue(a);
          valB = getScoreValue(b);
          break;
        case "grader":
          // Hier Annahme: 'grader' existiert nicht, daher keine Sortierung
          valA = ""; // Placeholder
          valB = ""; // Placeholder
          break;
        default:
          return 0;
      }

      // Vergleichslogik
      if (typeof valA === "number" && typeof valB === "number") {
        compareResult = valA - valB;
      } else if (typeof valA === "string" && typeof valB === "string") {
        compareResult = valA.localeCompare(valB);
      } else if (valA === null || valA === undefined) {
        compareResult = 1; // Null/undefined ans Ende
      } else if (valB === null || valB === undefined) {
        compareResult = -1; // Null/undefined ans Ende
      }

      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  }, [attempts, sortColumn, sortDirection]);

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
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                <IoDocumentTextOutline className="mr-1.5 h-4 w-4 text-gray-400" />
                Status {renderSortIcon("status")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("exam_title")}
            >
              <div className="flex items-center">
                <IoDocumentTextOutline className="mr-1.5 h-4 w-4 text-gray-400" />
                Prüfungstitel {renderSortIcon("exam_title")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("student")}
            >
              <div className="flex items-center">
                <IoPersonOutline className="mr-1.5 h-4 w-4 text-gray-400" />
                Student {renderSortIcon("student")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("submitted_at")}
            >
              <div className="flex items-center">
                <IoCalendarClearOutline className="mr-1.5 h-4 w-4 text-gray-400" />
                Eingereicht am {renderSortIcon("submitted_at")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("score")}
            >
              <div className="flex items-center">
                <IoBarChartOutline className="mr-1.5 h-4 w-4 text-gray-400" />
                Ergebnis {renderSortIcon("score")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              onClick={() => handleSort("grader")}
            >
              <div className="flex items-center">
                <IoManOutline className="mr-1.5 h-4 w-4 text-gray-400" />{" "}
                {/* Platzhalter Icon */}
                Bewerter {renderSortIcon("grader")}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedAttempts.length > 0 ? (
            sortedAttempts.map((attempt) => {
              const score = getScoreValue(attempt);
              const maxScore =
                attempt.exam?.criteria?.reduce(
                  (sum, c) => sum + c.max_points,
                  0,
                ) ?? 0;
              const percentage =
                maxScore > 0 && score >= 0
                  ? Math.round((score / maxScore) * 100)
                  : 0;

              return (
                <tr
                  key={attempt.id}
                  onClick={() => onRowClick(attempt.id)}
                  className="hover:bg-dsp-orange_light cursor-pointer transition-colors duration-150"
                  title={`Klicken, um Details für Versuch ${attempt.id} anzuzeigen`}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusDisplay status={attempt.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {attempt.exam?.exam_title ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {attempt.user?.username ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {formatDate(attempt.submitted_at, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      {/* Nur Datum */}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={clsx(
                          "text-sm font-medium mr-2",
                          score >= 0 ? "text-gray-900" : "text-gray-400",
                        )}
                      >
                        {score >= 0
                          ? `${score.toFixed(2)} / ${maxScore.toFixed(0)}`
                          : "N/A"}
                      </span>
                      {score >= 0 && maxScore > 0 && (
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={clsx(
                              "h-2 rounded-full",
                              percentage >= 50 ? "bg-green-500" : "bg-red-500",
                            )}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      )}
                      {score >= 0 && maxScore > 0 && (
                        <span className="text-sm text-gray-500 w-10 text-right">
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attempt.status === "graded" ? (
                      <span className="text-sm text-gray-600">
                        {attempt.graded_by?.username ?? "N/A"}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">-</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={6} // Anzahl der Spalten angepasst (jetzt 6)
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                Keine bewerteten Prüfungen gefunden.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableExamsAssessed;
