import React, { useState, useMemo } from "react";
import clsx from "clsx";
import {
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoShieldCheckmarkOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { formatDate } from "../../util/helpers/formatDate";

// Typdefinition für User (spiegelt admin_panel.tsx)
// TODO: Idealerweise aus einer zentralen Typdatei importieren
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null; // Kann null sein
}

// Typdefinition für Statistiken (spiegelt admin_panel.tsx)
interface UserStats {
  totalUsers: number;
  staffUsers: number;
  superUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

type SortDirection = "asc" | "desc" | "none";
type SortableUserColumn =
  | "username"
  | "email"
  | "full_name"
  | "is_active"
  | "is_staff"
  | "date_joined"
  | "last_login";

// Props für die Tabelle
interface TableUserListProps {
  users: User[];
  isLoading: boolean; // Ladezustand berücksichtigen
  onDelete: (userId: number) => void; // Funktion für Klick auf Löschen-Button
  stats: UserStats; // Statistiken hinzufügen
}

// Helper für Status Badges
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      )}
    >
      {isActive ? (
        <IoCheckmarkCircleOutline className="mr-1 h-3 w-3" />
      ) : (
        <IoCloseCircleOutline className="mr-1 h-3 w-3" />
      )}
      {isActive ? "Aktiv" : "Inaktiv"}
    </span>
  );
};

const RoleBadge: React.FC<{ isStaff: boolean; isSuperuser: boolean }> = ({
  isStaff,
  isSuperuser,
}) => {
  if (isSuperuser) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
        title="Superuser"
      >
        <IoShieldCheckmarkOutline className="mr-1 h-3 w-3" />
        Admin
      </span>
    );
  }
  if (isStaff) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        title="Staff"
      >
        <IoShieldCheckmarkOutline className="mr-1 h-3 w-3" />
        Staff
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
      title="Standard User"
    >
      User
    </span>
  );
};

const TableUserList: React.FC<TableUserListProps> = ({
  users,
  isLoading,
  onDelete,
  stats,
}) => {
  const [sortColumn, setSortColumn] =
    useState<SortableUserColumn>("date_joined");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortableUserColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc"
      );
      if (sortDirection === "desc") {
        // Reset auf Default, wenn 'none' erreicht wird
        setSortColumn("date_joined");
        setSortDirection("desc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedUsers = useMemo(() => {
    if (sortDirection === "none" || !users) {
      // Wenn keine Sortierung, Default (oder Original?) - hier Default: neueste zuerst
      return [...(users ?? [])].sort(
        (a, b) =>
          new Date(b.date_joined).getTime() - new Date(a.date_joined).getTime()
      );
    }
    return [...users].sort((a, b) => {
      let compareResult = 0;
      let valA: string | number | boolean | null | undefined;
      let valB: string | number | boolean | null | undefined;
      const fullNameA = `${a.first_name || ""} ${a.last_name || ""}`.trim();
      const fullNameB = `${b.first_name || ""} ${b.last_name || ""}`.trim();

      switch (sortColumn) {
        case "username":
          valA = a.username.toLowerCase();
          valB = b.username.toLowerCase();
          break;
        case "email":
          valA = a.email.toLowerCase();
          valB = b.email.toLowerCase();
          break;
        case "full_name":
          valA = fullNameA.toLowerCase();
          valB = fullNameB.toLowerCase();
          break;
        case "is_active":
          valA = a.is_active;
          valB = b.is_active;
          break;
        case "is_staff": // Sortiert Superuser wie Staff
          valA = a.is_staff || a.is_superuser;
          valB = b.is_staff || b.is_superuser;
          break;
        case "date_joined":
          valA = new Date(a.date_joined).getTime();
          valB = new Date(b.date_joined).getTime();
          break;
        case "last_login":
          valA = a.last_login ? new Date(a.last_login).getTime() : 0;
          valB = b.last_login ? new Date(b.last_login).getTime() : 0;
          break;
        default:
          return 0;
      }

      // Vergleichslogik
      if (typeof valA === "number" && typeof valB === "number") {
        compareResult = valA - valB;
      } else if (typeof valA === "string" && typeof valB === "string") {
        compareResult = valA.localeCompare(valB);
      } else if (typeof valA === "boolean" && typeof valB === "boolean") {
        compareResult = valA === valB ? 0 : valA ? -1 : 1; // true zuerst
      } else if (valA === null || valA === undefined) {
        compareResult = 1; // Null/undefined ans Ende
      } else if (valB === null || valB === undefined) {
        compareResult = -1; // Null/undefined ans Ende
      }

      // Fallback: Wenn Werte gleich sind, nach Username sortieren für Konsistenz
      if (compareResult === 0) {
        compareResult = a.username.localeCompare(b.username);
      }

      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  }, [users, sortColumn, sortDirection]);

  // Helper für Sortier-Icons
  const renderSortIcon = (column: SortableUserColumn) => {
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
    <div>
      {/* Statistik-Anzeige */}
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500 uppercase">Gesamt</div>
          <div className="text-xl font-semibold text-gray-800">
            {stats.totalUsers}
          </div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xs text-green-600 uppercase">Aktiv</div>
          <div className="text-xl font-semibold text-green-800">
            {stats.activeUsers}
          </div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xs text-red-600 uppercase">Inaktiv</div>
          <div className="text-xl font-semibold text-red-800">
            {stats.inactiveUsers}
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-600 uppercase">Staff</div>
          <div className="text-xl font-semibold text-blue-800">
            {stats.staffUsers}
          </div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-xs text-purple-600 uppercase">Admins</div>
          <div className="text-xl font-semibold text-purple-800">
            {stats.superUsers}
          </div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Spaltenköpfe */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                onClick={() => handleSort("username")}
              >
                <div className="flex items-center">
                  <IoPersonOutline className="mr-1.5 h-4 w-4 text-gray-400" />
                  Username {renderSortIcon("username")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                onClick={() => handleSort("full_name")}
              >
                <div className="flex items-center">
                  Name {renderSortIcon("full_name")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  <IoMailOutline className="mr-1.5 h-4 w-4 text-gray-400" />
                  E-Mail {renderSortIcon("email")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                onClick={() => handleSort("is_active")}
              >
                <div className="flex items-center">
                  Status {renderSortIcon("is_active")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                onClick={() => handleSort("is_staff")}
              >
                <div className="flex items-center">
                  Rolle {renderSortIcon("is_staff")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                onClick={() => handleSort("date_joined")}
              >
                <div className="flex items-center">
                  <IoCalendarOutline className="mr-1.5 h-4 w-4 text-gray-400" />
                  Registriert {renderSortIcon("date_joined")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                onClick={() => handleSort("last_login")}
              >
                <div className="flex items-center">
                  <IoCalendarOutline className="mr-1.5 h-4 w-4 text-gray-400" />
                  Letzter Login {renderSortIcon("last_login")}
                </div>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Aktionen</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  Lade Benutzer...
                </td>
              </tr>
            ) : sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-dsp-orange_light cursor-pointer transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.first_name || user.last_name ? (
                      `${user.first_name || ""} ${user.last_name || ""}`.trim()
                    ) : (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge isActive={user.is_active} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge
                      isStaff={user.is_staff}
                      isSuperuser={user.is_superuser}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.date_joined, {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? (
                      formatDate(user.last_login)
                    ) : (
                      <span className="text-gray-400 italic">Nie</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Aktionsbutton (Löschen) */}
                    {/* Nur anzeigen, wenn User kein Admin/Staff ist */}
                    {!(user.is_staff || user.is_superuser) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Verhindert Klick auf Zeile, falls später implementiert
                          onDelete(user.id);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Benutzer löschen"
                      >
                        <IoTrashOutline className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Keine Benutzer gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableUserList;
