import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/ui_elements/breadcrumbs";
import ComingSoonOverlay from "../../components/messages/coming_soon_overlay";
import Overview from "./overview";
import Progress from "./progress";
import Performance from "./performance";
import Comparison from "./comparison";

type TabState = "übersicht" | "fortschritt" | "leistung" | "vergleich";

const IndexStatistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabState>("übersicht");
  const [sliderStyle, setSliderStyle] = useState({});
  const [showOverlay, setShowOverlay] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Breadcrumb Items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Statistik" }, // Aktuelle Seite
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

  // Automatisch Overlay beim Laden der Seite anzeigen
  useEffect(() => {
    // Kurze Verzögerung, damit die Seite zuerst geladen wird
    const timer = setTimeout(() => {
      setShowOverlay(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleOverlayClose = () => {
    console.log("Overlay geschlossen");
    setShowOverlay(false);
    // Keine Navigation zum Dashboard mehr
  };

  const renderTabs = () => (
    <div
      ref={tabsRef}
      className="relative flex space-x-1 border border-gray-300 p-1 rounded-lg bg-gray-100 mb-8 self-start"
    >
      <div
        className="absolute inset-y-0 bg-dsp-orange rounded-md shadow-sm transition-all duration-300 ease-out pointer-events-none"
        style={sliderStyle}
      />
      {(
        ["übersicht", "fortschritt", "leistung", "vergleich"] as TabState[]
      ).map((tab) => (
        <button
          key={tab}
          data-tab={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative z-10 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer 
            ${
              activeTab === tab
                ? "text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-background">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          Deine Statistik
        </h1>
        <p className="text-base text-gray-600 mt-1">
          Verfolge deinen Lernfortschritt und deine Leistungen.
        </p>
      </motion.div>

      {renderTabs()}

      <div className="mt-6">
        {activeTab === "übersicht" && <Overview />}
        {activeTab === "fortschritt" && <Progress />}
        {activeTab === "leistung" && <Performance />}
        {activeTab === "vergleich" && <Comparison />}
      </div>

      {showOverlay && (
        <ComingSoonOverlay
          daysUntilTarget={14}
          expectedFeatures={[
            "Individueller Lernfortschritt pro Thema",
            "Stärken- und Schwächenanalyse",
            "Prüfungsperformance im Vergleich",
          ]}
          onClose={handleOverlayClose}
        />
      )}
    </div>
  );
};

export default IndexStatistics;
