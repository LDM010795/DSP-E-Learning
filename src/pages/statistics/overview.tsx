import React from "react";
import { motion } from "framer-motion";
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
import SubBackground from "../../components/layouts/SubBackground";

// Platzhalterdaten (Beispiele)
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
  { month: "Mai", Fortschritt: 60 },
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
  { name: "Python", value: 35, fill: "#ff863d" },
  { name: "Excel", value: 25, fill: "#60a5fa" },
  { name: "SQL", value: 20, fill: "#34d399" },
  { name: "Power BI", value: 15, fill: "#fbbf24" },
  { name: "Tableau", value: 5, fill: "#f87171" },
];

// Hilfskomponenten
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorScheme: "orange" | "blue" | "purple" | "yellow";
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  colorScheme,
  index,
}) => {
  const colorConfig = {
    orange: {
      bg: "bg-dsp-orange_light",
      text: "text-dsp-orange",
      border: "border-dsp-orange/20",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border-yellow-200",
    },
  };

  const colors = colorConfig[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <SubBackground className="hover:bg-white/80 transition-all duration-200">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${colors.bg} ${colors.border} border group-hover:scale-110 transition-transform duration-200`}
          >
            <div className={`w-6 h-6 ${colors.text}`}>{icon}</div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-800 group-hover:text-dsp-orange transition-colors duration-200">
              {value}
            </p>
          </div>
        </div>
      </SubBackground>
    </motion.div>
  );
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  index: number;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
    whileHover={{ y: -2 }}
    className="group"
  >
    <SubBackground className="hover:bg-white/80 transition-all duration-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-dsp-orange_light">
          <IoTimeOutline className="w-5 h-5 text-dsp-orange" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-dsp-orange transition-colors duration-200">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </SubBackground>
  </motion.div>
);

const Overview: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Abgeschlossene Module"
          value={overviewStats.modulesCompleted}
          icon={<IoCheckmarkCircleOutline className="w-6 h-6" />}
          colorScheme="orange"
          index={0}
        />
        <StatCard
          title="Gelöste Aufgaben"
          value={overviewStats.tasksSolved}
          icon={<IoListOutline className="w-6 h-6" />}
          colorScheme="blue"
          index={1}
        />
        <StatCard
          title="Gesamte Lernzeit"
          value={overviewStats.totalLearningTime}
          icon={<IoTimeOutline className="w-6 h-6" />}
          colorScheme="purple"
          index={2}
        />
        <StatCard
          title="Errungenschaften"
          value={overviewStats.achievements}
          icon={<IoRibbonOutline className="w-6 h-6" />}
          colorScheme="yellow"
          index={3}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Lernzeit pro Tag"
          subtitle="Deine Lernzeit in den letzten 7 Tagen"
          index={0}
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
          index={1}
        >
          <LazyLoadChartWrapper
            component={ProgressOverTimeChart}
            minHeight={250}
            chartProps={{ data: progressOverTimeData }}
          />
        </ChartCard>

        <ChartCard
          title="Modulabschluss"
          subtitle="Fortschritt in jedem Modul"
          index={2}
        >
          <div className="space-y-4">
            {moduleProgressData.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + idx * 0.1 }}
                className="group"
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700 group-hover:text-dsp-orange transition-colors duration-200">
                    {item.name}
                  </span>
                  <span className="font-bold text-gray-800">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-dsp-orange to-dsp-orange-gradient h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.8 + idx * 0.1,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Fähigkeitsverteilung"
          subtitle="Deine Stärken nach Themen"
          index={3}
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
