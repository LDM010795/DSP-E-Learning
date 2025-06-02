import React from "react";

interface ComparisonBarProps {
  value: number;
  maxValue: number;
  colorClass: string; // z.B. 'bg-dsp-orange' oder 'bg-gray-200'
  label: string; // z.B. 'Du' oder 'Durchschnitt'
  displayValue: string | number; // Der Wert, der unter dem Balken angezeigt wird
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({
  value,
  maxValue,
  colorClass,
  label,
  displayValue,
}) => {
  const maxVisualHeight = 96; // Entspricht h-24 in Pixel
  // Stelle sicher, dass wir nicht durch 0 teilen und der Wert nicht über max liegt
  const validMaxValue = maxValue > 0 ? maxValue : 1;
  const validValue = Math.min(Math.max(value, 0), validMaxValue);
  const barHeight = (validValue / validMaxValue) * maxVisualHeight;

  return (
    <div className="flex flex-col items-center">
      {/* Der Balken selbst */}
      <div
        className={`w-12 rounded-t-md ${colorClass}`}
        style={{ height: `${barHeight}px` }}
      ></div>
      {/* Label unter dem Balken */}
      <span className="text-xs mt-1 text-gray-600">{label}</span>
      {/* Angezeigter Wert */}
      <span className="text-sm font-semibold text-gray-800">
        {displayValue}
      </span>
    </div>
  );
};

export default ComparisonBar;
