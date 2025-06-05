import React from "react";
import ExercisePerformanceChart from "../../components/charts/ExercisePerformanceChart";
import VerticalBarChart from "../../components/charts/VerticalBarChart";
import LazyLoadChartWrapper from "../../components/common/LazyLoadChartWrapper";

// --- Platzhalterdaten (Beispiele) ---
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

const Performance: React.FC = () => {
  return (
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
};

export default Performance;
