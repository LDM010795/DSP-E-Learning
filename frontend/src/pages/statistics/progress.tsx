import React from "react";
import VerticalBarChart from "../../components/charts/VerticalBarChart";
import LazyLoadChartWrapper from "../../components/common/LazyLoadChartWrapper";

// --- Platzhalterdaten (Beispiele) ---
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

// --- Hilfskomponente ---
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

const Progress: React.FC = () => {
  return (
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
};

export default Progress;
