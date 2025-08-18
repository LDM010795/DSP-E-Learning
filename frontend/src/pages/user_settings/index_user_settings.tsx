import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/ui_elements/breadcrumbs";
import SubBackground from "../../components/layouts/SubBackground";
import Profile from "./profile";
import Account from "./account";
import Notifications from "./notifications";
import Design from "./design";
import clsx from "clsx";

type TabState = "profil" | "konto" | "benachrichtigungen" | "design";

// Tab Labels Mapping für bessere Übersicht
const tabLabels: Record<TabState, string> = {
  profil: "Profil",
  konto: "Konto",
  benachrichtigungen: "Benachrichtigungen",
  design: "Design",
};

const IndexUserSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabState>("profil");
  const [sliderStyle, setSliderStyle] = useState({});
  const tabsRef = useRef<HTMLDivElement>(null);

  // Breadcrumb Items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Einstellungen" }, // Aktuelle Seite
  ];

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    const activeButton = container.querySelector<HTMLButtonElement>(
      `[data-tab="${activeTab}"]`
    );
    if (activeButton) {
      setSliderStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab]);

  const renderTabs = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm p-2 mb-6">
      <div ref={tabsRef} className="relative flex space-x-1">
        <div
          className="absolute inset-y-0 bg-[#ff863d] rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
          style={sliderStyle}
        />
        {(Object.keys(tabLabels) as TabState[]).map((tab) => (
          <button
            key={tab}
            data-tab={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer",
              activeTab === tab
                ? "text-white"
                : "text-gray-600 hover:text-[#ff863d] hover:bg-[#ff863d]/5"
            )}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative px-3 pt-3 pb-6">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-3" />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
                Einstellungen
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Verwalte und personalisiere dein Konto nach deinen Wünschen.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-[95vw] mx-auto">
          {/* Tabs Container */}
          <SubBackground className="mb-6">{renderTabs()}</SubBackground>

          {/* Content Area */}
          <SubBackground>
            <div className="mt-0">
              {activeTab === "profil" && <Profile />}
              {activeTab === "konto" && <Account />}
              {activeTab === "benachrichtigungen" && <Notifications />}
              {activeTab === "design" && <Design />}
            </div>
          </SubBackground>
        </div>
      </div>
    </div>
  );
};

export default IndexUserSettings;
