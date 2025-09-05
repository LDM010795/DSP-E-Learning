import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
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
  onClick?: () => void;
}

const CardModulesSmall: React.FC<CardModulesSmallProps> = ({
  title,
  progress,
  difficultyTag,
  status,
  className,
  onClick,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "Abgeschlossen":
        return {
          icon: <IoCheckmarkOutline className="h-4 w-4 text-white" />,
          iconBgColor: "bg-green-500",
          progressColor: "bg-green-500",
          statusColor: "text-green-600",
          hoverBg: "hover:bg-green-50",
          borderHover: "hover:border-green-200",
        };
      case "In Bearbeitung":
        return {
          icon: <IoHourglassOutline className="h-4 w-4 text-white" />,
          iconBgColor: "bg-dsp-orange",
          progressColor: "bg-dsp-orange",
          statusColor: "text-dsp-orange",
          hoverBg: "hover:bg-dsp-orange_light",
          borderHover: "hover:border-dsp-orange/30",
        };
      case "Nicht begonnen":
      default:
        return {
          icon: <IoPlayOutline className="h-4 w-4 text-gray-600" />,
          iconBgColor: "bg-gray-200",
          progressColor: "bg-gray-300",
          statusColor: "text-gray-600",
          hoverBg: "hover:bg-gray-50",
          borderHover: "hover:border-gray-300",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      className={clsx(
        // Base professional styling
        "group relative",
        "bg-white/90 backdrop-blur-sm",
        "border border-gray-200/60",
        "rounded-xl p-4",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200 ease-in-out",
        "cursor-pointer",
        config.borderHover,
        config.hoverBg,
        className,
      )}
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      {/* Content Layout */}
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <motion.div
          className={clsx(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
            "shadow-sm border border-white/20",
            config.iconBgColor,
          )}
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {config.icon}
        </motion.div>

        {/* Content Area */}
        <div className="flex-grow min-w-0">
          {/* Header with title and difficulty */}
          <div className="flex items-start justify-between mb-2">
            <h3
              className={clsx(
                "font-semibold text-gray-900 text-sm leading-tight",
                "group-hover:text-dsp-orange transition-colors duration-200",
                "line-clamp-1 flex-1 pr-2",
              )}
            >
              {title}
            </h3>

            <div className="flex-shrink-0">{difficultyTag}</div>
          </div>

          {/* Professional Progress Section */}
          <div className="space-y-2">
            {/* Progress info */}
            <div className="flex items-center justify-between">
              <span className={clsx("text-xs font-medium", config.statusColor)}>
                {status}
              </span>
              <span
                className={clsx("text-xs font-semibold", config.statusColor)}
              >
                {progress}%
              </span>
            </div>

            {/* Enhanced progress bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-300",
                    config.progressColor,
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Progress glow effect */}
              {progress > 0 && (
                <div
                  className={clsx(
                    "absolute top-0 left-0 h-1.5 rounded-full opacity-40 blur-sm",
                    config.progressColor,
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle hover glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-dsp-orange/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* Professional border highlight on hover */}
      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-dsp-orange/20 transition-colors duration-200 pointer-events-none" />
    </motion.div>
  );
};

export default CardModulesSmall;
