import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Breadcrumbs from "../../components/ui_elements/breadcrumbs";
import SubBackground from "../../components/layouts/SubBackground";
import UserList from "./user_list";
import CreateUser from "./create_user";
import AdminPanelExamReviewSection from "./exam_review";
import { toast } from "sonner";
import clsx from "clsx";
import {
  IoShieldCheckmarkOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
import DspNotification from "../../components/toaster/notifications/DspNotification";

type TabState = "benutzerliste" | "benutzer-erstellen" | "abschlussprüfungen";

// Tab-Konfiguration mit Icons
const tabConfig: Record<
  TabState,
  { label: string; icon: React.ElementType; description: string }
> = {
  benutzerliste: {
    label: "Benutzerliste",
    icon: IoPeopleOutline,
    description: "Alle Benutzer verwalten",
  },
  "benutzer-erstellen": {
    label: "Benutzer erstellen",
    icon: IoPersonAddOutline,
    description: "Neue Benutzer hinzufügen",
  },
  abschlussprüfungen: {
    label: "Abschlussprüfungen",
    icon: IoDocumentTextOutline,
    description: "Prüfungen bewerten",
  },
};

const IndexAdminPanel: React.FC = () => {
  const { user } = useAuth();

  const initialTab: TabState = user?.is_superuser
    ? "benutzerliste"
    : "abschlussprüfungen";
  const [activeTab, setActiveTab] = useState<TabState>(initialTab);
  const [sliderStyle, setSliderStyle] = useState({});
  const tabsRef = useRef<HTMLDivElement>(null);

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
      `[data-tab="${activeTab}"]`,
    );
    if (activeButton) {
      setSliderStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab, user?.is_superuser]);

  const handleUserCreated = () => {
    setActiveTab("benutzerliste");
  };

  const renderTabs = () => {
    const restrictedTabs: TabState[] = ["benutzerliste", "benutzer-erstellen"];

    return (
      <SubBackground className="p-1 mb-8">
        <div ref={tabsRef} className="relative flex space-x-1">
          <div
            className="absolute inset-y-1 bg-[#ff863d] rounded-lg shadow-sm transition-all duration-200 ease-out pointer-events-none"
            style={sliderStyle}
          />
          {(Object.keys(tabConfig) as TabState[]).map((tab) => {
            const { label, icon: Icon, description } = tabConfig[tab];
            const isRestricted = restrictedTabs.includes(tab);
            const isDisabled = isRestricted && !user?.is_superuser;

            return (
              <motion.button
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
                whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                className={clsx(
                  "relative z-10 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2",
                  activeTab === tab
                    ? "text-white"
                    : isDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-[#ff863d] hover:bg-[#ff863d]/5",
                  isDisabled ? "cursor-not-allowed" : "cursor-pointer",
                )}
                title={isDisabled ? "Nur für Administratoren" : description}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </motion.button>
            );
          })}
        </div>
      </SubBackground>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative px-4 py-8">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 rounded-xl bg-[#ffe7d4]">
                  <IoShieldCheckmarkOutline className="w-8 h-8 text-[#ff863d]" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-700">
                  Admin Panel
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Willkommen im Admin-Bereich. Hier können Sie Benutzer verwalten
                und Prüfungen bewerten.
              </p>

              {/* Admin Status Badge */}
              <div className="flex justify-center mt-6">
                <div
                  className={clsx(
                    "inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium",
                    user?.is_superuser
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200",
                  )}
                >
                  <IoShieldCheckmarkOutline className="w-4 h-4" />
                  <span>
                    {user?.is_superuser
                      ? "Vollzugriff Administrator"
                      : "Prüfungsbewerter"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-[95vw] mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">{renderTabs()}</div>

          {/* Tab Content */}
          <SubBackground className="overflow-hidden">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "benutzerliste" && <UserList />}
              {activeTab === "benutzer-erstellen" && (
                <CreateUser onUserCreated={handleUserCreated} />
              )}
              {activeTab === "abschlussprüfungen" && (
                <AdminPanelExamReviewSection />
              )}
            </motion.div>
          </SubBackground>
        </div>
      </div>
    </div>
  );
};

export default IndexAdminPanel;
