import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoDSP from "../../assets/dsp_no_background.png";
import {
  IoStatsChart,
  IoTrendingUp,
  IoAnalytics,
  IoBarChart,
  IoCheckmark,
  IoSync,
  IoWarning,
} from "react-icons/io5";

interface LoadingScreenProps {
  isVisible: boolean;
  stage?:
    | "authenticating"
    | "loading_data"
    | "preparing_dashboard"
    | "complete";
  message?: string;
  onComplete?: () => void;
}

interface AnalyticsData {
  label: string;
  value: number;
  trend: "up" | "down" | "stable";
  change: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isVisible,
  stage = "authenticating",
  message,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentAnalytics, setCurrentAnalytics] = useState<AnalyticsData[]>([]);
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);

  // Simulierte Analytics-Daten
  const analyticsData: AnalyticsData[] = [
    { label: "Lernfortschritt", value: 87, trend: "up", change: "+12%" },
    { label: "Module abgeschlossen", value: 23, trend: "up", change: "+5" },
    { label: "Übungen gelöst", value: 156, trend: "up", change: "+28" },
    {
      label: "Durchschnittliche Bewertung",
      value: 92,
      trend: "stable",
      change: "±0%",
    },
    { label: "Lernzeit (Stunden)", value: 42, trend: "up", change: "+8h" },
    { label: "Zertifikate", value: 7, trend: "up", change: "+2" },
  ];

  // Stage-spezifische Nachrichten
  const stageMessages = {
    authenticating: "Authentifizierung läuft...",
    loading_data: "Daten werden geladen...",
    preparing_dashboard: "Dashboard wird vorbereitet...",
    complete: "Anmeldung erfolgreich!",
  };

  // Progress Animation basierend auf Stage
  useEffect(() => {
    const stageProgress = {
      authenticating: 30,
      loading_data: 65,
      preparing_dashboard: 90,
      complete: 100,
    };

    const targetProgress = stageProgress[stage];
    const startProgress = progress;
    const duration = 1500; // 1.5 Sekunden
    const steps = 60;
    const increment = (targetProgress - startProgress) / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(
        startProgress + increment * currentStep,
        targetProgress
      );
      setProgress(newProgress);

      if (currentStep >= steps || newProgress >= targetProgress) {
        clearInterval(interval);
        setProgress(targetProgress);

        // Auto-complete wenn 100% erreicht
        if (targetProgress === 100 && onComplete) {
          setTimeout(onComplete, 500);
        }
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [stage, onComplete]);

  // Analytics Animation
  useEffect(() => {
    if (!isVisible) return;

    // Initialisiere Analytics-Daten
    setCurrentAnalytics(analyticsData);
    setAnimatedValues(analyticsData.map(() => 0));

    // Animiere Werte nach und nach
    const animateValues = () => {
      analyticsData.forEach((item, index) => {
        setTimeout(() => {
          const steps = 30;
          const increment = item.value / steps;
          let currentStep = 0;

          const valueInterval = setInterval(() => {
            currentStep++;
            const newValue = Math.min(increment * currentStep, item.value);

            setAnimatedValues((prev) => {
              const newValues = [...prev];
              newValues[index] = newValue;
              return newValues;
            });

            if (currentStep >= steps) {
              clearInterval(valueInterval);
            }
          }, 50);
        }, index * 200); // Staggered animation
      });
    };

    // Periodische Werteänderungen für Dynamik
    const updateInterval = setInterval(() => {
      setCurrentAnalytics((prev) =>
        prev.map((item) => ({
          ...item,
          value: item.value + Math.floor(Math.random() * 3) - 1, // ±1 Variation
        }))
      );
    }, 3000);

    setTimeout(animateValues, 500);

    return () => clearInterval(updateInterval);
  }, [isVisible]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <IoTrendingUp className="text-green-500" />;
      case "down":
        return <IoTrendingUp className="text-red-500 transform rotate-180" />;
      default:
        return <IoAnalytics className="text-gray-500" />;
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case "authenticating":
        return <IoSync className="animate-spin text-dsp-orange" />;
      case "loading_data":
        return <IoBarChart className="text-dsp-orange" />;
      case "preparing_dashboard":
        return <IoStatsChart className="text-dsp-orange" />;
      case "complete":
        return <IoCheckmark className="text-green-500" />;
      default:
        return <IoSync className="animate-spin text-dsp-orange" />;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-sm"
      >
        <div className="w-full max-w-4xl mx-auto px-6">
          {/* Haupt-Container */}
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-dsp-orange to-dsp-orange_medium p-8 text-white relative overflow-hidden">
              {/* Hintergrund-Animation */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute top-4 left-4 text-6xl"
                >
                  <IoStatsChart />
                </motion.div>
                <motion.div
                  animate={{
                    x: [100, 0, 100],
                    y: [50, 0, 50],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 2,
                  }}
                  className="absolute bottom-4 right-4 text-5xl"
                >
                  <IoAnalytics />
                </motion.div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  src={LogoDSP}
                  alt="DataSmart Point Logo"
                  className="h-16 mx-auto mb-4"
                />

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold mb-2"
                >
                  DataSmart Point E-Learning
                </motion.h1>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-2 text-lg"
                >
                  {getStageIcon()}
                  <span>{message || stageMessages[stage]}</span>
                </motion.div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8 space-y-6">
              {/* Progress Bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Fortschritt</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-dsp-orange to-dsp-orange_medium rounded-full shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>

              {/* Analytics Dashboard */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <IoAnalytics className="text-dsp-orange" />
                  Live Analytics Dashboard
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentAnalytics.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 font-medium">
                          {item.label}
                        </span>
                        {getTrendIcon(item.trend)}
                      </div>

                      <div className="space-y-1">
                        <motion.div
                          className="text-2xl font-bold text-gray-800"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {Math.round(animatedValues[index] || 0)}
                          {item.label.includes("Bewertung") ||
                          item.label.includes("Lernfortschritt")
                            ? "%"
                            : ""}
                        </motion.div>

                        <div
                          className={`text-xs font-medium ${
                            item.trend === "up"
                              ? "text-green-600"
                              : item.trend === "down"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {item.change}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Status Messages */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-center space-y-2"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  {stage !== "complete" && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-dsp-orange border-t-transparent rounded-full"
                    />
                  )}
                  <span>
                    {stage === "complete"
                      ? "Anmeldung erfolgreich! Weiterleitung zum Dashboard..."
                      : "Dein personalisiertes Dashboard wird vorbereitet..."}
                  </span>
                </div>

                {stage === "authenticating" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 inline-flex items-center gap-1"
                  >
                    <IoWarning />
                    Beim ersten Start kann die Anmeldung bis zu 30 Sekunden
                    dauern
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
