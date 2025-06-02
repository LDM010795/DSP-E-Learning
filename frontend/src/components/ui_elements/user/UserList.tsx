import React from "react";
import { motion } from "framer-motion";
import {
  IoTrash,
  IoLockClosedOutline,
  IoLockOpenOutline,
} from "react-icons/io5";

interface UserStats {
  totalUsers: number;
  staffUsers: number;
  superUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

interface UserListProps {
  users: {
    id: number;
    username: string;
    email: string;
    name_abbreviation?: string;
    is_staff?: boolean;
    is_superuser?: boolean;
    is_active?: boolean;
    date_joined?: string;
    last_login?: string;
  }[];
  isSimplified?: boolean;
  onDelete?: (userId: number) => void;
  isLoading?: boolean;
  stats?: UserStats;
}

const UserList: React.FC<UserListProps> = ({
  users,
  isSimplified = false,
  onDelete,
  isLoading = false,
  stats,
}) => {
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dsp-orange"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Keine Benutzer gefunden</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Statistiken über der Tabelle */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-700">
            Benutzerstatistiken
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm text-gray-500">Gesamt</div>
              <div className="text-xl font-semibold text-dsp-orange">
                {stats.totalUsers}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm text-gray-500">Aktiv</div>
              <div className="text-xl font-semibold text-green-600">
                {stats.activeUsers}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm text-gray-500">Inaktiv</div>
              <div className="text-xl font-semibold text-red-600">
                {stats.inactiveUsers}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm text-gray-500">Staff</div>
              <div className="text-xl font-semibold text-blue-600">
                {stats.staffUsers}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm text-gray-500">Admin</div>
              <div className="text-xl font-semibold text-purple-600">
                {stats.superUsers}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">
          {isSimplified ? "Benutzerliste (Vereinfacht)" : "Benutzerliste"}
        </h3>
      </div>

      <motion.table
        className="min-w-full divide-y divide-gray-200"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Benutzername
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              E-Mail
            </th>

            {isSimplified ? (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Namenskürzel
              </th>
            ) : (
              <>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                {users[0]?.date_joined && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Registriert am
                  </th>
                )}
                {users[0]?.last_login && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Letzter Login
                  </th>
                )}
              </>
            )}

            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <motion.tr
              key={user.id}
              variants={rowVariants}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {user.username}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>

              {isSimplified ? (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {user.name_abbreviation || "-"}
                  </div>
                </td>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.is_superuser ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Superuser
                        </span>
                      ) : user.is_staff ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Staff
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Benutzer
                        </span>
                      )}

                      {user.is_active === false && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inaktiv
                        </span>
                      )}
                    </div>
                  </td>

                  {user.date_joined && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.date_joined).toLocaleDateString("de-DE")}
                    </td>
                  )}

                  {user.last_login && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString("de-DE")
                        : "-"}
                    </td>
                  )}
                </>
              )}

              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center space-x-2">
                  {/* Status-Änderung (ausgegraut und durchgestrichen) */}
                  {typeof user.is_active !== "undefined" && (
                    <div
                      className="relative"
                      title={`Aktivieren/Deaktivieren (nicht verfügbar)`}
                    >
                      <button
                        disabled={true}
                        className={`p-1 rounded-full opacity-50 cursor-not-allowed ${
                          user.is_active ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user.is_active ? (
                          <IoLockOpenOutline size={18} />
                        ) : (
                          <IoLockClosedOutline size={18} />
                        )}
                      </button>
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-400 transform -rotate-45"></div>
                    </div>
                  )}

                  {/* Löschen (nur für normale Benutzer) */}
                  {onDelete && !user.is_staff && !user.is_superuser && (
                    <button
                      onClick={() => onDelete(user.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 cursor-pointer"
                      title="Löschen"
                    >
                      <IoTrash size={18} />
                    </button>
                  )}

                  {/* Deaktivierter Lösch-Button für Admins und Superuser */}
                  {onDelete && (user.is_staff || user.is_superuser) && (
                    <div
                      className="relative"
                      title="Administratoren können nicht gelöscht werden"
                    >
                      <button
                        disabled={true}
                        className="text-red-600 opacity-50 p-1 rounded-full cursor-not-allowed"
                      >
                        <IoTrash size={18} />
                      </button>
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-400 transform -rotate-45"></div>
                    </div>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
};

export default UserList;
