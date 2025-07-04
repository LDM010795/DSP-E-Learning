import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { IoSyncOutline, IoHourglassOutline, IoEllipsisHorizontalOutline } from "react-icons/io5";

type LoadingVariant = "spinner" | "dots" | "hourglass" | "pulse";
type LoadingSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LoadingSpinnerProps {
  message?: string;
  size?: LoadingSize;
  variant?: LoadingVariant;
  className?: string;
  fullScreen?: boolean;
  showBackground?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Laden...",
  size = "md",
  variant = "spinner",
  className,
  fullScreen = false,
  showBackground = false,
}) => {
  // Size configurations
  const sizeConfig = {
    xs: {
      icon: "w-4 h-4",
      text: "text-xs",
      spacing: "space-y-2",
      container: "p-2",
    },
    sm: {
      icon: "w-6 h-6",
      text: "text-sm",
      spacing: "space-y-3",
      container: "p-4",
    },
    md: {
      icon: "w-8 h-8",
      text: "text-base",
      spacing: "space-y-4",
      container: "p-6",
    },
    lg: {
      icon: "w-12 h-12",
      text: "text-lg",
      spacing: "space-y-5",
      container: "p-8",
    },
    xl: {
      icon: "w-16 h-16",
      text: "text-xl",
      spacing: "space-y-6",
      container: "p-10",
    },
  };

  const config = sizeConfig[size];

  // Loading spinner animation
  const spinnerAnimation = {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  };

  // Pulse animation
  const pulseAnimation = {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  // Dots animation
  const dotsAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  // Render loading indicator based on variant
  const renderLoadingIndicator = () => {
    switch (variant) {
      case "spinner":
        return (
          <motion.div animate={spinnerAnimation}>
            <IoSyncOutline className={clsx(config.icon, "text-[#ff863d]")} />
          </motion.div>
        );

      case "hourglass":
        return (
          <motion.div animate={spinnerAnimation}>
            <IoHourglassOutline className={clsx(config.icon, "text-[#ff863d]")} />
          </motion.div>
        );

      case "pulse":
        return (
          <motion.div
            className={clsx(
              "rounded-full bg-gradient-to-r from-[#ff863d] to-[#fa8c45]",
              config.icon
            )}
            animate={pulseAnimation}
          />
        );

      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-[#ff863d] rounded-full"
                animate={dotsAnimation}
                transition={{
                  ...dotsAnimation.transition,
                  delay: index * 0.15,
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <motion.div animate={spinnerAnimation}>
            <IoSyncOutline className={clsx(config.icon, "text-[#ff863d]")} />
          </motion.div>
        );
    }
  };

  const LoadingContent = () => (
    <motion.div
      className={clsx(
        "flex flex-col items-center justify-center text-center",
        config.spacing,
        config.container,
        showBackground && "bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/20",
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Loading indicator */}
      <div className="relative">
        {renderLoadingIndicator()}
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-[#ff863d]/20 rounded-full blur-lg opacity-50 -z-10" />
      </div>

      {/* Loading message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className={clsx(
            "font-medium text-gray-700 max-w-sm",
            config.text
          )}>
            {message}
          </p>
          
          {/* Loading dots after message */}
          <motion.span
            className="inline-block"
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ...
          </motion.span>
        </motion.div>
      )}

      {/* Progress indicator */}
      <motion.div
        className="w-full max-w-xs h-1 bg-gray-200 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-[#ff863d] to-[#fa8c45] rounded-full"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );

  // Full screen loading overlay
  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LoadingContent />
      </motion.div>
    );
  }

  // Inline loading component
  return <LoadingContent />;
};

export default LoadingSpinner;
