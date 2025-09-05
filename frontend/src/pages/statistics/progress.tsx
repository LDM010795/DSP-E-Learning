import React from "react";
import { motion } from "framer-motion";
import {
  IoCalendarOutline,
  IoTrophyOutline,
  IoTimeOutline,
} from "react-icons/io5";
import VerticalBarChart from "../../components/charts/VerticalBarChart";
import LazyLoadChartWrapper from "../../components/common/LazyLoadChartWrapper";
import SubBackground from "../../components/layouts/SubBackground";

// Platzhalterdaten (Beispiele)
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
        <div className="p-2 rounded-lg bg-[#ffe7d4]">
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

const Progress: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Lernstreak"
          subtitle="Deine tägliche Lernaktivität"
          icon={IoCalendarOutline}
          index={0}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {streakData.current}
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Aktuelle Tage
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {streakData.longest}
                </div>
                <div className="text-sm text-blue-700 font-medium">
                  Längster Streak
                </div>
              </div>
            </div>

            {/* Streak Calendar Visualization */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Letzte 14 Tage
              </h4>
              <div className="grid grid-cols-7 gap-1">
                {streakData.dates.map((date, index) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 1 + index * 0.05 }}
                    className="w-8 h-8 flex items-center justify-center text-xs font-medium rounded-lg border-2 border-green-200 bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200"
                  >
                    {date.split(".")[0]}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Zertifikatsfortschritt"
          subtitle="Dein Weg zu Zertifikaten"
          icon={IoTrophyOutline}
          index={1}
        >
          <div className="space-y-4">
            {certificateProgressData.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="group"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-sm text-gray-800 group-hover:text-dsp-orange transition-colors duration-200">
                    {cert.name}
                  </h4>
                  <span className="text-xs font-bold text-gray-600">
                    {cert.progress}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  {cert.completed} von {cert.total} Modulen abgeschlossen
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-dsp-orange to-[#fa8c45] h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${cert.progress}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.6 + index * 0.2,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Zeitaufwand nach Themen"
        subtitle="Wie viel Zeit du in verschiedene Themen investiert hast"
        icon={IoTimeOutline}
        index={2}
      >
        <LazyLoadChartWrapper
          component={VerticalBarChart}
          minHeight={300}
          chartProps={{ data: timeByTopicData, xAxisLabel: "Stunden" }}
        />
      </ChartCard>
    </div>
  );
};

export default Progress;
