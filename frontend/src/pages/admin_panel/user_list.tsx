import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import * as userAdminApi from "../../util/apis/userAdminApi";
import FilterHead from "../../components/filter/filter_head";
import TableUserList from "../../components/tables/table_user_list";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import DspNotification from "../../components/toaster/notifications/DspNotification";

// Benutzer Interface
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string;
}

const UserList: React.FC = () => {
  const { user } = useAuth();

  // Zustandsvariablen für die Benutzer
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Bestätigungsmodal für Löschvorgänge
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Daten laden
  const fetchUsers = async () => {
    if (!user?.is_superuser) {
      setUsers([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const usersResponse = await userAdminApi.getAllUsers();
      setUsers(usersResponse as User[]);
      setError(null);
    } catch (err) {
      console.error("Fehler beim Laden der Benutzer:", err);
      setError(
        "Benutzerdaten konnten nicht geladen werden. Bitte versuche es später erneut."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user?.is_superuser]);

  // Benutzer-Funktionen
  const handleDeleteUser = (userId: number) => {
    // Prüfen, ob der zu löschende Benutzer ein Admin oder Superuser ist
    const userToDelete = users.find((user) => user.id === userId);
    if (userToDelete && (userToDelete.is_staff || userToDelete.is_superuser)) {
      setError("Administratoren und Superuser können nicht gelöscht werden.");
      return;
    }
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete === null) return;

    try {
      setLoading(true);
      await userAdminApi.deleteUser(userToDelete);
      setUsers(users.filter((user) => user.id !== userToDelete));
      setShowDeleteConfirm(false);
      const deletedUserName =
        users.find((u) => u.id === userToDelete)?.username ||
        `ID ${userToDelete}`;
      setUserToDelete(null);
      // ERFOLG-TOAST
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="success"
          title="Benutzer gelöscht"
          message={`Der Benutzer '${deletedUserName}' wurde erfolgreich entfernt.`}
        />
      ));
    } catch (err) {
      console.error("Fehler beim Löschen des Benutzers:", err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setError("Benutzer konnte nicht gelöscht werden."); // Behalte ggf. den Fehler im State
      // FEHLER-TOAST
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="error"
          title="Löschen fehlgeschlagen"
          message={`Benutzer konnte nicht gelöscht werden: ${errorMsg}`}
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  // Berechne Statistiken
  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      staffUsers: users.filter((u) => u.is_staff).length,
      superUsers: users.filter((u) => u.is_superuser).length,
      activeUsers: users.filter((u) => u.is_active).length,
      inactiveUsers: users.filter((u) => !u.is_active).length,
    }),
    [users]
  );

  // Gefilterte Benutzerliste
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const term = userSearchTerm.toLowerCase();
        return (
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.first_name && user.first_name.toLowerCase().includes(term)) ||
          (user.last_name && user.last_name.toLowerCase().includes(term))
        );
      }),
    [users, userSearchTerm]
  );

  // Nur für Superuser zugänglich
  if (!user?.is_superuser) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          Zugriff verweigert. Nur Administratoren können Benutzer verwalten.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Benutzerliste</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <FilterHead
        searchTerm={userSearchTerm}
        onSearchChange={setUserSearchTerm}
        searchPlaceholder="Benutzer suchen (Name, E-Mail)..."
        showSearch={true}
        className="mb-6"
      />

      <TableUserList
        users={filteredUsers}
        isLoading={loading}
        onDelete={handleDeleteUser}
        stats={stats}
      />

      {/* Lösch-Bestätigungsmodal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-4">Benutzer löschen</h3>
            <p className="text-gray-600 mb-6">
              Möchten Sie diesen Benutzer wirklich löschen? Diese Aktion kann
              nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 cursor-pointer"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
              >
                Abbrechen
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
                onClick={confirmDeleteUser}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserList;
