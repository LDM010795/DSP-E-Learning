import React from "react";
import { IoSettingsOutline } from "react-icons/io5"; // Standard-Icon
// Importiere die zugehörige CSS-Datei
import "./ComingSoonOverlaySmall.css";

interface ComingSoonOverlaySmallProps {
  bannerText?: string;
  message?: string;
  subMessage?: string;
  icon?: React.ReactNode;
  className?: string; // Gesamt-Container
  bannerClassName?: string; // Banner spezifisch
  contentClassName?: string; // Inhalt spezifisch
}

const ComingSoonOverlaySmall: React.FC<ComingSoonOverlaySmallProps> = ({
  bannerText = "In Entwicklung",
  message = "Wir arbeiten mit Hochdruck an dieser Funktion.",
  subMessage,
  icon = (
    <IoSettingsOutline className="text-5xl text-dsp-orange mb-3 animate-spin-slow" />
  ),
  className = "",
  bannerClassName = "bg-dsp-orange text-white",
  contentClassName = "bg-white/50",
}) => {
  return (
    // Hauptcontainer: Positionierung, Blur, abgerundete Ecken, Flexbox (Spalte)
    <div
      className={`absolute inset-0 backdrop-blur-sm rounded-lg flex flex-col overflow-hidden shadow-md ${className}`}
      aria-hidden="true"
    >
      {/* Banner-Bereich */}
      {bannerText && (
        <div className={`py-2 px-4 text-center ${bannerClassName}`}>
          <span className="text-sm font-semibold">{bannerText}</span>
        </div>
      )}

      {/* Inhaltsbereich: Nimmt restlichen Platz ein, zentriert Inhalt */}
      <div
        className={`flex-grow flex flex-col items-center justify-center p-6 text-center ${contentClassName}`}
      >
        {icon}
        {message && (
          <p className="text-base font-semibold text-gray-700">{message}</p>
        )}
        {subMessage && (
          <p className="text-sm text-gray-500 mt-1">{subMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ComingSoonOverlaySmall;
