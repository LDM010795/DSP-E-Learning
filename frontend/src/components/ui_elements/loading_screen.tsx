import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoDSP from "../../assets/dsp_no_background.png";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

interface TableDataItem {
  metric: string;
  value: number | string;
  change: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Authentifizierung läuft...",
  submessage = "Bitte haben Sie einen Moment Geduld",
}) => {
  const [currentDataIndex, setCurrentDataIndex] = useState(0);

  // Fake-Daten für spielerische Tabellenanalyse
  const tableData: TableDataItem[] = [
    { metric: "Benutzer online", value: 127, change: "+12%" },
    { metric: "Module absolviert", value: 1284, change: "+8%" },
    { metric: "Prüfungen heute", value: 43, change: "+15%" },
    { metric: "Erfolgsrate", value: "94%", change: "+2%" },
    { metric: "Aktive Kurse", value: 89, change: "+5%" },
    { metric: "Zertifikate", value: 567, change: "+18%" },
  ];

  const [animatedData, setAnimatedData] = useState<TableDataItem[]>(tableData);

  // Animiere die Tabellendaten
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDataIndex((prev) => (prev + 1) % tableData.length);

      // Simuliere sich ändernde Werte
      setAnimatedData(
        tableData.map((item) => ({
          ...item,
          value:
            typeof item.value === "number"
              ? item.value + Math.floor(Math.random() * 5) - 2
              : item.value,
          change:
            Math.random() > 0.5
              ? "+" + Math.floor(Math.random() * 20) + "%"
              : "-" + Math.floor(Math.random() * 5) + "%",
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAnimatedData(tableData);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Animierte Hintergrund-Kreise */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-orange-200/30 rounded-full filter blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-orange-300/20 rounded-full filter blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-orange-400/25 rounded-full filter blur-lg"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Hauptinhalt */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo mit Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <img
            src={LogoDSP}
            alt="DataSmart Point Logo"
            className="h-20 mx-auto"
          />
        </motion.div>

        {/* Titel und Nachricht */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
          <p className="text-gray-600">{submessage}</p>
        </motion.div>

        {/* Animierter Loading Spinner */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="relative mx-auto w-16 h-16">
            <motion.div className="absolute inset-0 border-4 border-orange-200 rounded-full" />
            <motion.div
              className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>

        {/* Spielerische Datenanalyse-Tabelle */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            📊 Live Analytics
          </h3>
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {animatedData
                .slice(currentDataIndex, currentDataIndex + 3)
                .map((item, index) => (
                  <motion.div
                    key={`${item.metric}-${currentDataIndex}-${index}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-gray-600">{item.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        {item.value}
                      </span>
                      <span
                        className={`px-1 py-0.5 rounded text-xs ${
                          item.change.startsWith("+")
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.change}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Fortschrittsbalken */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="mt-6 w-full bg-gray-200 rounded-full h-1 overflow-hidden"
        >
          <motion.div
            className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Status-Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-xs text-gray-500 mt-4"
        >
          Optimiert für schnellere Anmeldung ⚡
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;
