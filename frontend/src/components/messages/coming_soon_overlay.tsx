import React, { useState, useEffect, useMemo } from "react";
import ButtonPrimary from "../ui_elements/buttons/button_primary";
import {
  IoClose,
  IoMailOutline,
  IoCheckmarkCircleOutline,
  IoCalendarOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { FaCog } from "react-icons/fa";
import LogoDSP from "../../assets/dsp_no_background.png";
import "./coming_soon_overlay.css";

interface ComingSoonOverlayProps {
  daysUntilTarget: number; // Geändert: Anzahl Tage statt Datum
  expectedFeatures?: string[]; // Liste der erwarteten Funktionen
  onClose?: () => void; // Optionale Schließen-Funktion
}

const calculateTimeLeft = (targetDate: Date) => {
  const difference = +targetDate - +new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({
  daysUntilTarget,
  expectedFeatures = [
    "Interaktive Lernmodule mit praktischen Übungen",
    "Personalisierte Lernpfade für deine Karriereziele",
    "Echtzeit-Feedback zu deinem Fortschritt",
  ],
  onClose,
}) => {
  const targetDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + daysUntilTarget);
    return date;
  }, [daysUntilTarget]);

  const initialDifference = useMemo(
    () => +targetDate - +new Date(),
    [targetDate],
  );

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    const calculateAndUpdateProgress = () => {
      const currentDifference = +targetDate - +new Date();
      if (initialDifference <= 0) {
        setProgress(100); // Wenn Zieldatum schon erreicht/vergangen ist
      } else {
        const calculatedProgress =
          ((initialDifference - currentDifference) / initialDifference) * 100;
        setProgress(Math.min(100, Math.max(0, calculatedProgress))); // Begrenze auf 0-100
      }
      setTimeLeft(calculateTimeLeft(targetDate));
    };

    // Initial berechnen
    calculateAndUpdateProgress();

    // Timer für Countdown und Fortschritt
    const timer = setInterval(calculateAndUpdateProgress, 1000);

    // Cleanup
    return () => {
      clearTimeout(showTimer);
      clearInterval(timer);
    };
  }, [targetDate, initialDifference]);

  const handleClose = () => {
    if (onClose) {
      setIsVisible(false);
      setIsClosing(true);
      setTimeout(onClose, 300); // Warte auf Ausblendanimation
    }
  };

  // Wrapper-Funktion für ButtonPrimary onClick
  const triggerSubmit = () => {
    console.log("E-Mail für Benachrichtigung:", email);
    setEmail("");
    alert("Danke! Wir benachrichtigen dich.");
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out
        ${
          isVisible
            ? "backdrop-blur-sm bg-black/40"
            : "backdrop-blur-none bg-black/0"
        }
        ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={onClose ? handleClose : undefined}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-5xl flex overflow-hidden relative
          transition-all duration-300 ease-out transform
          ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          ${isClosing ? "scale-95 opacity-0" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hidden md:flex flex-col items-center justify-center w-2/5 bg-gradient-to-br from-gray-50 to-gray-200 p-10 relative overflow-hidden">
          <img
            src={LogoDSP}
            alt="DataSmart Point Logo"
            className="h-14 mb-10 z-10"
          />

          <div className="absolute inset-0 flex items-center justify-center opacity-60">
            <FaCog className="absolute text-gray-300/50 text-[180px] cog-spin-slow top-[20%] left-[15%]" />
            <FaCog className="absolute text-gray-300/50 text-[120px] cog-spin-medium-reverse bottom-[20%] right-[15%]" />
            <FaCog className="absolute text-gray-300/50 text-[90px] cog-spin-fast top-[60%] left-[30%] -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="w-full max-w-xs mt-auto z-10">
            <div className="w-full bg-gray-300 rounded-full h-2.5 overflow-hidden mb-2">
              <div
                className="bg-dsp-orange h-2.5 rounded-full transition-[width] duration-1000 ease-out"
                style={{ width: `${progress.toFixed(2)}%` }}
              ></div>
            </div>
            <p className="text-xs text-center text-gray-500 mb-1">
              {progress < 100 ? progress.toFixed(0) : "100"}% fertiggestellt
            </p>
            <p className="text-xs text-center text-yellow-600 bg-yellow-100 border border-yellow-200 rounded px-2 py-1 flex items-center justify-center gap-1">
              <IoWarningOutline /> Wir arbeiten mit Hochdruck an dieser
              Funktion.
            </p>
          </div>
        </div>

        <div className="w-full md:w-3/5 bg-white p-10 md:p-12 space-y-6 overflow-y-auto max-h-[80vh]">
          {onClose && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:scale-110 hover:rotate-90 transition-all duration-200 ease-in-out cursor-pointer"
              aria-label="Schließen"
            >
              <IoClose size={24} />
            </button>
          )}

          <h2 className="text-3xl font-bold text-gray-800">
            Neue Funktionen kommen bald!
          </h2>
          <p className="text-gray-600">
            Wir arbeiten an spannenden neuen Funktionen für unsere
            Lernplattform. Bleib dran und sei einer der Ersten, die sie
            ausprobieren können.
          </p>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1.5">
              <IoCalendarOutline /> Voraussichtlicher Start:
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {(Object.keys(timeLeft) as Array<keyof typeof timeLeft>).map(
                (interval) => (
                  <div
                    key={interval}
                    className="bg-gray-100 p-3 rounded-lg text-center flex-1 min-w-[60px]"
                  >
                    <span className="text-3xl font-bold text-dsp-orange">
                      {timeLeft[interval].toString().padStart(2, "0")}
                    </span>
                    <span className="block text-xs text-gray-500 capitalize">
                      {interval === "days"
                        ? "Tage"
                        : interval === "hours"
                          ? "Stunden"
                          : interval === "minutes"
                            ? "Minuten"
                            : "Sekunden"}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1.5">
              <IoMailOutline /> Erhalte eine Benachrichtigung, wenn wir live
              gehen:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse"
                required
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-dsp-orange focus:border-dsp-orange transition-colors"
              />
              <ButtonPrimary
                title="Benachrichtigen"
                onClick={triggerSubmit}
                classNameButton="whitespace-nowrap"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Wir respektieren deine Privatsphäre und werden deine
              E-Mail-Adresse niemals an Dritte weitergeben.
            </p>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">
              Was dich erwartet:
            </h3>
            <ul className="space-y-2">
              {expectedFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <IoCheckmarkCircleOutline className="text-dsp-orange mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonOverlay;
