/**
 * Loading Spinner Component - E-Learning DSP Frontend
 *
 * Vielseitige Loading-Komponente mit verschiedenen Animationen:
 * - Spinner, Dots, Hourglass und Pulse-Varianten
 * - Verschiedene Größen (xs, sm, md, lg, xl)
 * - Fullscreen und Overlay-Modi
 * - Framer Motion Integration
 *
 * Features:
 * - Multiple Loading-Varianten
 * - Responsive Design
 * - DSP-Branding-Farben
 * - Accessibility-Features
 * - Performance-optimierte Animationen
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { IoSyncOutline, IoHourglassOutline } from "react-icons/io5";

// --- Type Definitions ---

type LoadingVariant = "spinner" | "dots" | "hourglass" | "pulse";
type LoadingSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Props für LoadingSpinner Komponente
 */
interface LoadingSpinnerProps {
  message?: string;
  size?: LoadingSize;
  variant?: LoadingVariant;
  className?: string;
  fullScreen?: boolean;
  showBackground?: boolean;
}

/**
 * Loading Spinner Komponente
 *
 * Zeigt verschiedene Loading-Indikatoren mit Animationen an.
 * Unterstützt verschiedene Varianten, Größen und Modi.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Laden...",
  size = "md",
  variant = "spinner",
  className,
  fullScreen = false,
  showBackground = false,
}) => {
  // --- Size Configuration ---
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

  // --- Animation Configurations ---

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

  // --- Loading Indicator Renderer ---
  const renderLoadingIndicator = () => {
    switch (variant) {
      case "spinner":
        return (
          <motion.div animate={spinnerAnimation}>
            <IoSyncOutline className={clsx(config.icon, "text-[#FF6D25]")} />
          </motion.div>
        );

      case "hourglass":
        return (
          <motion.div animate={spinnerAnimation}>
            <IoHourglassOutline
              className={clsx(config.icon, "text-[#FF6D25]")}
            />
          </motion.div>
        );

      case "pulse":
        return (
          <motion.div
            className={clsx(
              "rounded-full bg-gradient-to-r from-[#FF6D25] to-[#FFB697]",
              config.icon,
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
                className="w-2 h-2 bg-[#FF6D25] rounded-full"
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
            <IoSyncOutline className={clsx(config.icon, "text-[#FF6D25]")} />
          </motion.div>
        );
    }
  };

  // --- Loading Content Component ---
  const LoadingContent = () => (
    <motion.div
      className={clsx(
        "flex flex-col items-center justify-center text-center",
        config.spacing,
        config.container,
        showBackground &&
          "bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/20",
        className,
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* --- Loading Indicator --- */}
      <div className="relative">
        {renderLoadingIndicator()}

        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-[#FF6D25]/20 rounded-full blur-lg opacity-50 -z-10" />
      </div>

      {/* --- Loading Message --- */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p
            className={clsx("font-medium text-gray-700 max-w-sm", config.text)}
          >
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
          className="h-full bg-gradient-to-r from-[#FF6D25] to-[#FFB697] rounded-full"
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

  // --- Render Logic ---
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50/95 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export default LoadingSpinner;
