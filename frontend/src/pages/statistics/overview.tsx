import React from "react";
import {
  IoCheckmarkCircleOutline,
  IoListOutline,
  IoTimeOutline,
  IoRibbonOutline,
} from "react-icons/io5";
import LearningTimeChart from "../../components/charts/LearningTimeChart";
import ProgressOverTimeChart from "../../components/charts/ProgressOverTimeChart";
import SkillDistributionChart from "../../components/charts/SkillDistributionChart";
import LazyLoadChartWrapper from "../../components/common/LazyLoadChartWrapper";

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

// --- Hilfskomponenten ---
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

const Overview: React.FC = () => {
  return (
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
};

export default Overview;
