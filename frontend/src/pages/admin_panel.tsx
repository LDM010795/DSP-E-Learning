import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import CreateUserForm from "../components/ui_elements/forms/create_user_form";
import * as userAdminApi from "../util/apis/userAdminApi";
import AdminPanelExamReviewSection from "./admin_panel_exam_review_section";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import FilterHead from "../components/filter/filter_head";
import TableUserList from "../components/tables/table_user_list";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import clsx from "clsx";
import DspNotification from "../components/toaster/notifications/DspNotification";

type TabState = "benutzerliste" | "benutzer-erstellen" | "abschlussprüfungen";

// Stellen Sie sicher, dass die Typen zwischen Frontend und API übereinstimmen
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

const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  // DEBUG: Logge den Superuser-Status
  useEffect(() => {
    console.log("AdminPanel User Status:", {
      is_superuser: user?.is_superuser,
      is_staff: user?.is_staff,
      username: user?.username,
    });
  }, [user]);

  const initialTab: TabState = user?.is_superuser
    ? "benutzerliste"
    : "abschlussprüfungen";
  const [activeTab, setActiveTab] = useState<TabState>(initialTab);
  const [sliderStyle, setSliderStyle] = useState({});
  const tabsRef = useRef<HTMLDivElement>(null);

  // Breadcrumbs-Items
  const breadcrumbItems = [{ label: "Admin Panel" }];

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

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    if (
      !user?.is_superuser &&
      (activeTab === "benutzerliste" || activeTab === "benutzer-erstellen")
    ) {
      setActiveTab("abschlussprüfungen");
      return;
    }

    const activeButton = container.querySelector<HTMLButtonElement>(
      `[data-tab="${activeTab}"]`
    );
    if (activeButton) {
      setSliderStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab, user?.is_superuser]);

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

  const handleUserCreated = () => {
    fetchUsers();
    setActiveTab("benutzerliste");
  };

  const renderTabs = () => {
    const restrictedTabs: TabState[] = ["benutzerliste", "benutzer-erstellen"];
    return (
      <div
        ref={tabsRef}
        className="relative flex space-x-1 border border-gray-300 p-1 rounded-lg bg-gray-100 mb-8 self-start"
      >
        <div
          className="absolute inset-y-0 bg-dsp-orange rounded-md shadow-sm transition-all duration-300 ease-out pointer-events-none"
          style={sliderStyle}
        />
        {(
          [
            "benutzerliste",
            "benutzer-erstellen",
            "abschlussprüfungen",
          ] as TabState[]
        ).map((tab) => {
          const isRestricted = restrictedTabs.includes(tab);
          const isDisabled = isRestricted && !user?.is_superuser;

          return (
            <button
              key={tab}
              data-tab={tab}
              onClick={() => {
                if (isDisabled) {
                  toast.custom((t) => (
                    <DspNotification
                      id={t}
                      type="error"
                      title="Zugriff verweigert"
                      message="Nur Administratoren können Benutzer verwalten."
                    />
                  ));
                } else {
                  setActiveTab(tab);
                }
              }}
              className={clsx(
                "relative z-10 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200",
                activeTab === tab
                  ? "text-white"
                  : isDisabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-800",
                isDisabled ? "cursor-not-allowed" : "cursor-pointer"
              )}
            >
              {tab === "benutzerliste"
                ? "Benutzerliste"
                : tab === "benutzer-erstellen"
                ? "Benutzer erstellen"
                : "Abschlussprüfungen"}
            </button>
          );
        })}
      </div>
    );
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

  // NEU: Gefilterte Benutzerliste
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

  return (
    <div className="p-6 min-h-screen bg-background">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-gray-600 mb-6">
          Willkommen im Admin-Bereich. Hier können Sie Benutzer verwalten.
        </p>
      </motion.div>

      {renderTabs()}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {activeTab === "benutzerliste" && user?.is_superuser && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Benutzerliste</h2>
          </div>

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
        </div>
      )}

      {activeTab === "benutzer-erstellen" && user?.is_superuser && (
        <div className="p-6">
          <CreateUserForm onUserCreated={handleUserCreated} />
        </div>
      )}

      {activeTab === "abschlussprüfungen" && <AdminPanelExamReviewSection />}

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
    </div>
  );
};

export default AdminPanel;
