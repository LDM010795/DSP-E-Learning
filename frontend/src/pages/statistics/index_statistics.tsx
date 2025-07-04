import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumbs from "../../components/ui_elements/breadcrumbs";
import Overview from "./overview";
import Comparison from "./comparison";
import Performance from "./performance";
import Progress from "./progress";
import SubBackground from "../../components/layouts/SubBackground";
import clsx from "clsx";
import { IoStatsChartOutline, IoTrendingUpOutline, IoPeopleOutline, IoAnalyticsOutline } from "react-icons/io5";

type TabType = "overview" | "comparison" | "performance" | "progress";

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: Tab[] = [
  {
    id: "overview",
    label: "Übersicht",
    icon: IoStatsChartOutline,
    description: "Allgemeine Statistiken und Kennzahlen"
  },
  {
    id: "comparison",
    label: "Vergleiche",
    icon: IoPeopleOutline,
    description: "Vergleiche mit anderen Nutzern"
  },
  {
    id: "performance",
    label: "Leistung",
    icon: IoTrendingUpOutline,
    description: "Detaillierte Leistungsanalyse"
  },
  {
    id: "progress",
    label: "Fortschritt",
    icon: IoAnalyticsOutline,
    description: "Lernfortschritt über die Zeit"
  }
];

function IndexStatistics() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Statistiken" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "comparison":
        return <Comparison />;
      case "performance":
        return <Performance />;
      case "progress":
        return <Progress />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative px-4 py-8">
          <div className="max-w-[95vw] mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />
            
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-[#ff863d] bg-clip-text text-transparent mb-4">
                Statistiken & Analytics
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Verfolge deinen Lernfortschritt und analysiere deine Leistung im Detail.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-[95vw] mx-auto">
          {/* Enhanced Tab Navigation */}
          <SubBackground className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "relative p-4 rounded-xl text-center transition-all duration-300",
                      "hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#ff863d]/20",
                      activeTab === tab.id
                        ? "bg-[#ff863d] text-white shadow-sm"
                        : "bg-white/60 text-gray-600 hover:bg-white/80 hover:text-[#ff863d] border border-white/40"
                    )}
                  >
                    <IconComponent className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium text-sm">{tab.label}</div>
                    <div className={clsx(
                      "text-xs mt-1 leading-tight",
                      activeTab === tab.id ? "text-white/80" : "text-gray-500"
                    )}>
                      {tab.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </SubBackground>

          {/* Content Area */}
          <SubBackground className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </SubBackground>
        </div>
      </div>
    </div>
  );
}

export default IndexStatistics;
