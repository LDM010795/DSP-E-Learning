import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
import {
  IoClose,
  IoRocketOutline,
  IoSparklesOutline,
  IoArrowForward,
} from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import ButtonPrimary from "../ui_elements/buttons/button_primary";
import { throttle } from "../../util/performance";

interface TaskSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  onNextTask: () => void;
  isLastTask?: boolean;
}

const TaskSuccessModal: React.FC<TaskSuccessModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  onNextTask,
  isLastTask = false,
}) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [confettiRunning, setConfettiRunning] = useState(false);

  // Aktualisiere Fensterdimensionen mit Throttling
  useEffect(() => {
    // Throttled Event Handler für bessere Performance (120ms für Resize)
    const throttledHandleResize = throttle(() => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 120);

    window.addEventListener("resize", throttledHandleResize, { passive: true });
    return () => window.removeEventListener("resize", throttledHandleResize);
  }, []);

  // Starte Konfetti, wenn das Modal geöffnet wird
  useEffect(() => {
    if (isOpen) {
      setConfettiRunning(true);
      // Stoppe Konfetti nach 5 Sekunden
      const timer = setTimeout(() => {
        setConfettiRunning(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  const rocketVariants = {
    hover: {
      y: [0, -8, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Konfetti mit z-index 50 */}
          {confettiRunning && (
            <div className="fixed inset-0 z-50 pointer-events-none">
              <ReactConfetti
                width={windowDimensions.width}
                height={windowDimensions.height}
                recycle={false}
                numberOfPieces={400}
                gravity={0.25}
                initialVelocityY={15}
                tweenDuration={5000}
                colors={[
                  "#FF5722",
                  "#FFC107",
                  "#2196F3",
                  "#4CAF50",
                  "#9C27B0",
                  "#E91E63",
                  "#FFEB3B",
                  "#03A9F4",
                ]}
                confettiSource={{
                  x: windowDimensions.width / 2,
                  y: windowDimensions.height / 4,
                  w: 0,
                  h: 0,
                }}
                drawShape={(ctx: CanvasRenderingContext2D) => {
                  // Zufällig verschiedene Formen zeichnen
                  const randomShape = Math.random();
                  if (randomShape < 0.33) {
                    // Standard-Rechteck (Original-Konfetti)
                    ctx.fillRect(0, 0, 10, 10);
                  } else if (randomShape < 0.66) {
                    // Kreise
                    ctx.beginPath();
                    ctx.arc(5, 5, 5, 0, 2 * Math.PI);
                    ctx.fill();
                  } else {
                    // Sterne
                    const spikes = 5;
                    const outerRadius = 5;
                    const innerRadius = 2;

                    let rot = (Math.PI / 2) * 3;
                    let x = 5;
                    let y = 5;
                    const step = Math.PI / spikes;

                    ctx.beginPath();
                    ctx.moveTo(x, y - outerRadius);

                    for (let i = 0; i < spikes; i++) {
                      x = 5 + Math.cos(rot) * outerRadius;
                      y = 5 + Math.sin(rot) * outerRadius;
                      ctx.lineTo(x, y);
                      rot += step;

                      x = 5 + Math.cos(rot) * innerRadius;
                      y = 5 + Math.sin(rot) * innerRadius;
                      ctx.lineTo(x, y);
                      rot += step;
                    }

                    ctx.lineTo(5, 5 - outerRadius);
                    ctx.closePath();
                    ctx.fill();
                  }
                }}
              />
            </div>
          )}

          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose} // Schließen bei Klick auf Hintergrund
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col items-center p-8 text-center"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Klick im Modal verhindert Schließen
            >
              {/* Schließen-Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 hover:scale-110 hover:rotate-90 transition-all duration-200 ease-in-out cursor-pointer"
                aria-label="Schließen"
              >
                <IoClose size={24} />
              </button>

              {/* Success Icon */}
              <FaCheckCircle className="text-6xl text-green-500 mb-4" />

              {/* Titel */}
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Wow!</h2>

              {/* Nachricht */}
              <p className="text-gray-600 mb-4">
                Du hast die Aufgabe "
                <span className="font-semibold">{taskTitle}</span>" erfolgreich
                abgeschlossen.
              </p>

              {/* Raketen Animation */}
              <motion.div
                className="relative mb-6"
                variants={rocketVariants}
                animate="hover" // Startet die Schwebe-Animation
              >
                <IoRocketOutline className="text-7xl text-dsp-orange -rotate-45" />
              </motion.div>

              {/* Motivationsnachricht */}
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-8">
                <IoSparklesOutline className="text-dsp-orange" />
                <span>Weiter so! Du machst großartige Fortschritte.</span>
              </div>

              {/* Button */}
              <ButtonPrimary
                title={
                  isLastTask
                    ? "Zur Modulübersicht"
                    : "Weiter zur nächsten Aufgabe"
                }
                icon={!isLastTask ? <IoArrowForward size={20} /> : undefined}
                onClick={onNextTask} // Diese Funktion muss die Navigation handhaben
                classNameButton="w-full justify-center text-base py-2.5"
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskSuccessModal;
