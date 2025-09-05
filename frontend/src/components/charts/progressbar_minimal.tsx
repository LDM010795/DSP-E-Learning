import React from "react";

interface ProgressbarMinimalProps {
  progressValue: number; // Wert zwischen 0 und 100
}

const ProgressbarMinimal: React.FC<ProgressbarMinimalProps> = ({
  progressValue,
}) => {
  return (
    <div className="w-full">
      <div className="relative w-full h-3 rounded-full bg-[#ffe7d4]">
        <div
          className="h-full rounded-full bg-dsp-orange"
          style={{ width: `${progressValue}%` }}
        />
        <div className="absolute left-0 -top-6 text-xs text-black">0%</div>
        <div className="absolute right-0 -top-6 text-xs text-black">100%</div>
      </div>
    </div>
  );
};

export default ProgressbarMinimal;
