import React from "react";
import { motion } from "framer-motion";
import {
  IoSpeedometerOutline,
  IoFlagOutline,
  IoBulbOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
} from "react-icons/io5";
import ExercisePerformanceChart from "../../components/charts/ExercisePerformanceChart";
import VerticalBarChart from "../../components/charts/VerticalBarChart";
import LazyLoadChartWrapper from "../../components/common/LazyLoadChartWrapper";
import SubBackground from "../../components/layouts/SubBackground";

// Platzhalterdaten (Beispiele)
const exercisePerformanceData = [
  { exercise: "Python", score: 80, maxScore: 100 },
  { exercise: "Excel", score: 90, maxScore: 100 },
  { exercise: "SQL", score: 75, maxScore: 100 },
  { exercise: "Power BI", score: 85, maxScore: 100 },
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

// Hilfskomponente
interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  index: number;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  icon: Icon,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.2 }}
    whileHover={{ y: -2 }}
    className="group"
  >
    <SubBackground className="hover:bg-white/80 transition-all duration-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-dsp-orange_light">
          <Icon className="w-5 h-5 text-dsp-orange" />
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
      <div>{children}</div>
    </SubBackground>
  </motion.div>
);

const Performance: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Übungsleistung"
          subtitle="Korrekte vs. Inkorrekte Antworten"
          icon={IoFlagOutline}
          index={0}
        >
          <LazyLoadChartWrapper
            component={ExercisePerformanceChart}
            minHeight={250}
            chartProps={{ exerciseData: exercisePerformanceData }}
          />
        </ChartCard>

        <ChartCard
          title="Lerngeschwindigkeit"
          subtitle="Zeit pro abgeschlossenem Modul (in Stunden)"
          icon={IoSpeedometerOutline}
          index={1}
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
        icon={IoBulbOutline}
        index={2}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="group"
          >
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors duration-200">
              <div className="flex items-center space-x-2 mb-3">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Stärken</h4>
              </div>
              <ul className="space-y-2 text-sm text-green-700">
                {strengths.map((strength, index) => (
                  <motion.li
                    key={strength}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.8 + index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{strength}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="group"
          >
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-colors duration-200">
              <div className="flex items-center space-x-2 mb-3">
                <IoWarningOutline className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">
                  Verbesserungspotenzial
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-yellow-700">
                {weaknesses.map((weakness, index) => (
                  <motion.li
                    key={weakness}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 1.0 + index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span>{weakness}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="group"
          >
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
              <div className="flex items-center space-x-2 mb-3">
                <IoBulbOutline className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Empfehlungen</h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-700">
                {recommendations.map((recommendation, index) => (
                  <motion.li
                    key={recommendation}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 1.2 + index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{recommendation}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </ChartCard>
    </div>
  );
};

export default Performance;
