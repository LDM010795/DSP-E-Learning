import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { IoCheckmarkCircleOutline, IoHourglassOutline, IoPlayCircleOutline } from "react-icons/io5";

type ProgressVariant = "default" | "success" | "warning" | "error";
type ProgressSize = "sm" | "md" | "lg";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  showIcon?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  striped?: boolean;
  glowEffect?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = true,
  showIcon = false,
  label,
  className,
  animated = true,
  striped = false,
  glowEffect = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Determine status based on percentage
  const getStatus = () => {
    if (percentage >= 100) return 'completed';
    if (percentage > 0) return 'in-progress';
    return 'not-started';
  };

  const status = getStatus();

  // Variant color configurations
  const variantConfig = {
    default: {
      bg: "bg-[#ff863d]",
      glow: "shadow-[#ff863d]/30",
      text: "text-[#ff863d]",
      track: "bg-gray-200",
    },
    success: {
      bg: "bg-green-500",
      glow: "shadow-green-500/30",
      text: "text-green-600",
      track: "bg-green-100",
    },
    warning: {
      bg: "bg-yellow-500",
      glow: "shadow-yellow-500/30",
      text: "text-yellow-600",
      track: "bg-yellow-100",
    },
    error: {
      bg: "bg-red-500",
      glow: "shadow-red-500/30",
      text: "text-red-600",
      track: "bg-red-100",
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      height: "h-1.5",
      text: "text-xs",
      icon: "w-3 h-3",
    },
    md: {
      height: "h-2",
      text: "text-sm",
      icon: "w-4 h-4",
    },
    lg: {
      height: "h-3",
      text: "text-base",
      icon: "w-5 h-5",
    },
  };

  const config = variantConfig[variant];
  const sizes = sizeConfig[size];

  const getStatusIcon = () => {
    const iconClasses = clsx(sizes.icon, config.text);
    
    switch (status) {
      case 'completed':
        return <IoCheckmarkCircleOutline className={clsx(iconClasses, "text-green-600")} />;
      case 'in-progress':
        return <IoHourglassOutline className={iconClasses} />;
      default:
        return <IoPlayCircleOutline className={clsx(iconClasses, "text-gray-500")} />;
    }
  };

  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={clsx("w-full", className)}>
      {/* Progress Header */}
      {(showLabel || showIcon) && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {showIcon && getStatusIcon()}
            <span className={clsx(
              "font-medium",
              sizes.text,
              status === 'completed' ? 'text-green-600' :
              status === 'in-progress' ? config.text : 'text-gray-500'
            )}>
              {status === 'completed' ? 'Abgeschlossen' : 
               status === 'in-progress' ? 'In Bearbeitung' : 'Nicht begonnen'}
            </span>
          </div>
          {showLabel && (
            <span className={clsx(
              "font-semibold",
              sizes.text,
              config.text
            )}>
              {displayLabel}
            </span>
          )}
        </div>
      )}

      {/* Progress Track & Bar Container */}
      <div className="relative">
        {/* Track */}
        <div className={clsx(
          "w-full rounded-full overflow-hidden",
          sizes.height,
          config.track
        )}>
          {/* Progress Bar */}
          <motion.div
            className={clsx(
              "rounded-full transition-all duration-300 relative overflow-hidden",
              sizes.height,
              config.bg,
              striped && "bg-stripe"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: animated ? 0.8 : 0,
              ease: "easeOut",
              delay: animated ? 0.1 : 0,
            }}
          >
            {/* Animated stripes */}
            {striped && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-pulse" />
            )}

            {/* Shimmer effect */}
            {animated && percentage > 0 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Glow effect */}
        {glowEffect && percentage > 0 && (
          <div 
            className={clsx(
              "absolute top-0 left-0 rounded-full opacity-50 blur-sm transition-all duration-300",
              sizes.height,
              config.bg,
              config.glow
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {/* Progress indicator for completed state */}
      {status === 'completed' && (
        <motion.div
          className="flex items-center justify-center mt-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <div className="flex items-center space-x-2 text-green-600">
            <IoCheckmarkCircleOutline className="w-4 h-4" />
            <span className="text-xs font-medium">Vollständig abgeschlossen</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressBar; 