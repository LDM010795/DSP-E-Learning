import React from "react";
import clsx from "clsx";
import {
  IoCheckmarkOutline,
  IoHourglassOutline,
  IoPlayOutline,
} from "react-icons/io5";

type ModuleStatus = "Nicht begonnen" | "In Bearbeitung" | "Abgeschlossen";

interface CardModulesSmallProps {
  title: string;
  progress: number;
  difficultyTag: React.ReactNode;
  status: ModuleStatus;
  className?: string;
}

const CardModulesSmall: React.FC<CardModulesSmallProps> = ({
  title,
  progress,
  difficultyTag,
  status,
  className,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Abgeschlossen":
        return {
          icon: <IoCheckmarkOutline className="h-4 w-4 text-white" />,
          iconBgColor: "bg-green-500",
          progressColor: "bg-green-500",
        };
      case "In Bearbeitung":
        return {
          icon: <IoHourglassOutline className="h-4 w-4 text-white" />,
          iconBgColor: "bg-dsp-orange",
          progressColor: "bg-dsp-orange",
        };
      case "Nicht begonnen":
      default:
        return {
          icon: <IoPlayOutline className="h-4 w-4 text-gray-700" />,
          iconBgColor: "bg-gray-300",
          progressColor: "bg-gray-300",
        };
    }
  };

  const { icon, iconBgColor, progressColor } = getStatusStyles();

  return (
    <div
      className={clsx(
        "bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 flex gap-3 items-center",
        "hover:bg-dsp-orange_light",
        className
      )}
    >
      <div
        className={clsx(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          iconBgColor
        )}
      >
        {icon}
      </div>
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-medium text-gray-800 truncate pr-2">
            {title}
          </h3>
          <div className="flex-shrink-0">{difficultyTag}</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={clsx("h-1.5 rounded-full", progressColor)}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-right text-xs text-gray-500 mt-0.5">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default CardModulesSmall;
