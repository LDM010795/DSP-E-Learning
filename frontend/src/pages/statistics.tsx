import React, { useState, useRef, useEffect } from "react";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import {
  IoCheckmarkCircleOutline,
  IoListOutline,
  IoTimeOutline,
  IoRibbonOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import ComingSoonOverlay from "../components/messages/coming_soon_overlay";

// Chart-Komponenten und Wrapper importieren
import LearningTimeChart from "../components/charts/LearningTimeChart";
import ProgressOverTimeChart from "../components/charts/ProgressOverTimeChart";
import SkillDistributionChart from "../components/charts/SkillDistributionChart";
import VerticalBarChart from "../components/charts/VerticalBarChart";
import ExercisePerformanceChart from "../components/charts/ExercisePerformanceChart";
import ComparisonBar from "../components/charts/ComparisonBar";
import LazyLoadChartWrapper from "../components/common/LazyLoadChartWrapper";

type TabState = "übersicht" | "fortschritt" | "leistung" | "vergleich";

// --- Platzhalterdaten (Beispiele) ---
const overviewStats = {
  modulesCompleted: "5/8",
  tasksSolved: 48,
  totalLearningTime: "42.5h",
  achievements: 7,
};

const learningTimeData = [
  { day: "Mo", Stunden: 1.8 },
  { day: "Di", Stunden: 2.1 },
  { day: "Mi", Stunden: 0.8 },
  { day: "Do", Stunden: 2.8 },
  { day: "Fr", Stunden: 0 },
  { day: "Sa", Stunden: 0 },
  { day: "So", Stunden: 1.2 },
];

const progressOverTimeData = [
  { month: "Jan", Fortschritt: 10 },
  { month: "Feb", Fortschritt: 20 },
  { month: "Mär", Fortschritt: 35 },
  { month: "Apr", Fortschritt: 75 },
  { month: "Mai", Fortschritt: 60 } /* ... */,
];

const moduleProgressData = [
  { name: "Python Grundlagen", value: 100 },
  { name: "Excel Grundlagen", value: 90 },
  { name: "Power BI Einführung", value: 80 },
  { name: "SQL Grundlagen", value: 80 },
  { name: "Fortgeschrittenes Python", value: 75 },
  { name: "Fortgeschrittenes Excel", value: 60 },
];

const skillDistributionData = [
  { name: "Python", value: 35, fill: "#FF8C00" },
  { name: "Excel", value: 25, fill: "#1E90FF" },
  { name: "SQL", value: 20, fill: "#32CD32" },
  { name: "Power BI", value: 15, fill: "#FFD700" },
  { name: "Tableau", value: 5, fill: "#FF6347" },
];

const streakData = {
  current: 5,
  longest: 7,
  dates: [
    "01.05",
    "02.05",
    "03.05",
    "04.05",
    "05.05",
    "06.05",
    "07.05",
    "08.05",
    "09.05",
    "10.05",
    "11.05",
    "12.05",
    "13.05",
    "14.05",
  ],
};

const certificateProgressData = [
  { name: "Data Analyst", completed: 6, total: 8, progress: 75 },
  { name: "Python Developer", completed: 3, total: 5, progress: 60 },
  { name: "BI Specialist", completed: 2, total: 5, progress: 40 },
];

const timeByTopicData = [
  { name: "Python", value: 15 },
  { name: "Excel", value: 10 },
  { name: "SQL", value: 8 },
  { name: "Power BI", value: 7 },
  { name: "Tableau", value: 3 },
];

const exercisePerformanceData = [
  { name: "Python", korrekt: 80, inkorrekt: 20 },
  { name: "Excel", korrekt: 90, inkorrekt: 10 },
  { name: "SQL", korrekt: 75, inkorrekt: 25 },
  { name: "Power BI", korrekt: 85, inkorrekt: 15 },
];

const learningSpeedData = [
  { name: "Python Grundlagen", value: 8 },
  { name: "Excel Grundlagen", value: 6 },
  { name: "SQL Grundlagen", value: 7 },
  { name: "Power BI Einführung", value: 5 },
  { name: "Fortgeschrittenes Python", value: 10 },
];

const strengths = [
  "Datenanalyse mit Excel",
  "Python Grundlagen",
  "SQL Abfragen",
];
const weaknesses = ["Fortgeschrittene Python-Konzepte", "Power BI Dashboards"];
const recommendations = [
  "Python für Datenanalyse",
  "Fortgeschrittene SQL-Abfragen",
];

const comparisonData = [
  { name: "Modulabschluss", average: 65, user: 85, maxValue: 100, unit: "%" },
  { name: "Gelöste Aufgaben", average: 42, user: 48, maxValue: 60, unit: "" },
  {
    name: "Lernzeit (Std./Woche)",
    average: 6.5,
    user: 7.2,
    maxValue: 10,
    unit: "h",
  },
];
const userPosition =
  "Du gehörst zu den oberen 25% der Lernenden auf dieser Plattform.";

function Statistics() {
  const [activeTab, setActiveTab] = useState<TabState>("übersicht");
  const [sliderStyle, setSliderStyle] = useState({});
  const [showOverlay, setShowOverlay] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Statistik" },
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

  // --- Rendering-Funktionen für Tabs ---

  const renderUebersicht = () => (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Abgeschlossene Module"
          value={overviewStats.modulesCompleted}
          icon={<IoCheckmarkCircleOutline className="text-green-600" />}
        />
        <StatCard
          title="Gelöste Aufgaben"
          value={overviewStats.tasksSolved}
          icon={<IoListOutline className="text-blue-600" />}
        />
        <StatCard
          title="Gesamte Lernzeit"
          value={overviewStats.totalLearningTime}
          icon={<IoTimeOutline className="text-purple-600" />}
        />
        <StatCard
          title="Errungenschaften"
          value={overviewStats.achievements}
          icon={<IoRibbonOutline className="text-yellow-600" />}
        />
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Lernzeit pro Tag"
          subtitle="Deine Lernzeit in den letzten 7 Tagen"
        >
          <LazyLoadChartWrapper
            component={LearningTimeChart}
            minHeight={250}
            chartProps={{ data: learningTimeData }}
          />
        </ChartCard>
        <ChartCard
          title="Fortschritt über Zeit"
          subtitle="Dein Gesamtfortschritt über die Monate"
        >
          <LazyLoadChartWrapper
            component={ProgressOverTimeChart}
            minHeight={250}
            chartProps={{ data: progressOverTimeData }}
          />
        </ChartCard>
        <ChartCard title="Modulabschluss" subtitle="Fortschritt in jedem Modul">
          <div className="space-y-2 pr-4">
            {moduleProgressData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-dsp-orange h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard
          title="Fähigkeitsverteilung"
          subtitle="Deine Stärken nach Themen"
        >
          <LazyLoadChartWrapper
            component={SkillDistributionChart}
            minHeight={300}
            chartProps={{ data: skillDistributionData }}
          />
        </ChartCard>
      </div>
    </div>
  );

  const renderFortschritt = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Lernstreak" subtitle="Deine tägliche Lernaktivität">
          <div className="mb-2 flex justify-between text-sm">
            <span>Aktueller Streak: {streakData.current} Tage</span>
            <span>Längster Streak: {streakData.longest} Tage</span>
          </div>
          {/* Calendar/Streak View Placeholder */}
          <div className="flex flex-wrap gap-1">
            {streakData.dates.map((date) => (
              <span
                key={date}
                className="w-8 h-8 flex items-center justify-center text-xs border border-gray-300 rounded bg-green-100 text-green-800"
              >
                {date.split(".")[0]}
              </span>
            ))}
          </div>
        </ChartCard>
        <ChartCard
          title="Zertifikatsfortschritt"
          subtitle="Dein Weg zu Zertifikaten"
        >
          <div className="space-y-4">
            {certificateProgressData.map((cert) => (
              <div key={cert.name}>
                <p className="font-semibold text-sm mb-1">{cert.name}</p>
                <p className="text-xs text-gray-500 mb-1">
                  {cert.completed} von {cert.total} Modulen abgeschlossen
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-dsp-orange h-2.5 rounded-full"
                    style={{ width: `${cert.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
      <ChartCard
        title="Zeitaufwand nach Themen"
        subtitle="Wie viel Zeit du in verschiedene Themen investiert hast"
      >
        <LazyLoadChartWrapper
          component={VerticalBarChart}
          minHeight={300}
          chartProps={{ data: timeByTopicData, xAxisLabel: "Stunden" }}
        />
      </ChartCard>
    </div>
  );

  const renderLeistung = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Übungsleistung"
          subtitle="Korrekte vs. Inkorrekte Antworten"
        >
          <LazyLoadChartWrapper
            component={ExercisePerformanceChart}
            minHeight={250}
            chartProps={{ data: exercisePerformanceData }}
          />
        </ChartCard>
        <ChartCard
          title="Lerngeschwindigkeit"
          subtitle="Zeit pro abgeschlossenem Modul (in Stunden)"
        >
          <LazyLoadChartWrapper
            component={VerticalBarChart}
            minHeight={250}
            chartProps={{ data: learningSpeedData, xAxisLabel: "Stunden" }}
          />
        </ChartCard>
      </div>
      <ChartCard
        title="Stärken und Schwächen"
        subtitle="Deine Leistung nach Themengebieten"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
            <h4 className="font-semibold text-green-800 mb-2">Stärken</h4>
            <ul className="space-y-1 text-sm text-green-700 list-disc list-inside">
              {strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Verbesserungspotenzial
            </h4>
            <ul className="space-y-1 text-sm text-yellow-700 list-disc list-inside">
              {weaknesses.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <h4 className="font-semibold text-blue-800 mb-2">Empfehlungen</h4>
            <ul className="space-y-1 text-sm text-blue-700 list-disc list-inside">
              {recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </ChartCard>
    </div>
  );

  const renderVergleich = () => (
    <div>
      <ChartCard
        title="Vergleich mit anderen Lernenden"
        subtitle="Wie du im Vergleich zu anderen Lernenden abschneidest"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {comparisonData.map((item) => (
            <div key={item.name} className="text-center">
              <p className="text-sm text-gray-600 mb-6">{item.name}</p>
              <div className="flex items-end justify-center gap-4 h-24">
                <ComparisonBar
                  value={item.average}
                  maxValue={item.maxValue}
                  colorClass="bg-gray-200"
                  label="Durchschnitt"
                  displayValue={`${item.average}${item.unit || ""}`}
                />
                <ComparisonBar
                  value={item.user}
                  maxValue={item.maxValue}
                  colorClass="bg-dsp-orange"
                  label="Du"
                  displayValue={`${item.user}${item.unit || ""}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-3">
          <IoPeopleOutline size={24} className="text-dsp-orange" />
          <div>
            <p className="font-semibold">Deine Position</p>
            <p className="text-sm text-gray-600">{userPosition}</p>
          </div>
        </div>
      </ChartCard>
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-background">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        Deine Statistik
      </h1>
      <p className="text-base text-gray-600 mb-6">
        Verfolge deinen Lernfortschritt und deine Leistungen.
      </p>
      {renderTabs()}
      <div className="mt-6">
        {activeTab === "übersicht" && renderUebersicht()}
        {activeTab === "fortschritt" && renderFortschritt()}
        {activeTab === "leistung" && renderLeistung()}
        {activeTab === "vergleich" && renderVergleich()}
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
}

// --- Hilfskomponenten (optional auslagern) ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
    <div className="p-3 rounded-full bg-gray-100 text-gray-600">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}
const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
    <div className="mt-4">{children}</div>
  </div>
);

export default Statistics;
