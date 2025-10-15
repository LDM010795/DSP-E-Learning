import React from "react";
import LogoDSP from "../../assets/dsp_no_background.png";

type PlaybackOverlayProps = {
  className?: string;
  showLogo?: boolean;
};

const PlaybackOverlay: React.FC<PlaybackOverlayProps> = ({
  className,
  showLogo = true,
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 select-none ${className ?? ""}`}
      aria-hidden
    >
      {/* Soft vignette/gradient edges */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Subtle brand watermark */}
      {showLogo && (
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <img
            src={LogoDSP}
            alt="DataSmart Logo"
            className="h-7 w-auto opacity-80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
          />
          <span className="text-white/85 text-xs font-medium tracking-wide">
            DSP E-Learning Academy
          </span>
        </div>
      )}
    </div>
  );
};

export default PlaybackOverlay;
