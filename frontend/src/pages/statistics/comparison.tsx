import React from "react";
import { IoPeopleOutline } from "react-icons/io5";
import ComparisonBar from "../../components/charts/ComparisonBar";

// --- Platzhalterdaten (Beispiele) ---
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

const Comparison: React.FC = () => {
  return (
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
};

export default Comparison;
