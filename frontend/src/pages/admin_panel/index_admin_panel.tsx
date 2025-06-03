import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Breadcrumbs from "../../components/ui_elements/breadcrumbs";
import UserList from "./user_list";
import CreateUser from "./create_user";
import AdminPanelExamReviewSection from "./exam_review";
import { toast } from "sonner";
import clsx from "clsx";
import DspNotification from "../../components/toaster/notifications/DspNotification";

type TabState = "benutzerliste" | "benutzer-erstellen" | "abschlussprüfungen";

const IndexAdminPanel: React.FC = () => {
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

  const handleUserCreated = () => {
    // Nach dem Erstellen eines Benutzers zur Benutzerliste wechseln
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
          Willkommen im Admin-Bereich. Hier können Sie Benutzer verwalten und
          Prüfungen bewerten.
        </p>
      </motion.div>

      {renderTabs()}

      {/* Tab Content */}
      {activeTab === "benutzerliste" && <UserList />}

      {activeTab === "benutzer-erstellen" && (
        <CreateUser onUserCreated={handleUserCreated} />
      )}

      {activeTab === "abschlussprüfungen" && <AdminPanelExamReviewSection />}
    </div>
  );
};

export default IndexAdminPanel;
