import React from "react";
import { IoPlayCircleOutline } from "react-icons/io5";
import LogoDSP from "../../assets/dsp_no_background.png";

type PrePlayOverlayProps = {
  onStart: () => void;
  previewImageSrc?: string;
  className?: string;
};

const PrePlayOverlay: React.FC<PrePlayOverlayProps> = ({
  onStart,
  previewImageSrc,
  className,
}) => {
  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-xl shadow-2xl ${className ?? ""}`}
    >
      <img
        src={previewImageSrc || LogoDSP}
        alt="Video Vorschau"
        className="w-full h-full object-cover filter blur-md scale-105 opacity-70"
      />
      {/* Leichter grauer Schleier wie auf der Landing Page */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 md:bg-black/30">
        <button
          type="button"
          onClick={onStart}
          className="relative flex items-center justify-center w-20 h-20 bg-white/80 rounded-full shadow-xl backdrop-blur-sm transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer hover:bg-white"
          aria-label="Video abspielen"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
          <IoPlayCircleOutline className="relative w-16 h-16 text-dsp-orange z-10" />
        </button>
      </div>
      {/* Dekorative Kreise an den Rändern (wie Landing Page) */}
      <div aria-hidden className="pointer-events-none select-none">
        <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg opacity-80 hidden md:block" />
        <div className="absolute -right-4 -top-4 w-12 h-12 bg-orange-100 rounded-full shadow-lg opacity-70 hidden md:block" />
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg opacity-80 hidden md:block" />
      </div>
    </div>
  );
};

export default PrePlayOverlay;
