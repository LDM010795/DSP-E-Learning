import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import { IoPlay } from "react-icons/io5";
import clsx from "clsx";

// ✨ Props Interface
type ImageMode = "none" | "auto";
interface CardPreviewSmallProps {
  imageSrc?: string;
  youtubeId?: string;
  title: string;
  description?: string;
  progress?: number;
  onClick?: () => void;
  imageMode?: ImageMode; // default: "none"

  // Custom ClassNames
  className?: string;
  classNameTitle?: string;
  classNameDescription?: string;
  classNameImage?: string;
  classNameContentWrapper?: string;
  classNameProgressWrapper?: string;
  classNameProgressBar?: string;
  classNameProgressText?: string;
  /** chip/badge below the title (e.g., difficulty) */
  badge?: ReactNode;
}

const CardPreviewSmall: React.FC<CardPreviewSmallProps> = ({
  imageSrc,
  youtubeId,
  title,
  description,
  progress = 0,
  onClick,
  imageMode = "none",
  className,
  classNameTitle,
  classNameDescription,
  classNameImage,
  classNameContentWrapper,
  classNameProgressWrapper,
  classNameProgressBar,
  classNameProgressText,
  badge,
}) => {
  const displayImage = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : imageSrc;
  const showImage = imageMode !== "none" && !!displayImage;

  const status =
    progress >= 100
      ? "completed"
      : progress > 0
        ? "in-progress"
        : "not-started";
  const statusText =
    status === "completed"
      ? "Abgeschlossen"
      : status === "in-progress"
        ? "In Bearbeitung"
        : "Nicht begonnen";
  const statusColor =
    status === "completed"
      ? "text-green-600"
      : status === "in-progress"
        ? "text-dsp-orange"
        : "text-gray-500";

  return (
    <motion.div
      className={clsx(
        "group relative isolate cursor-pointer",
        "rounded-xl overflow-hidden h-40 flex flex-col",
        "border border-gray-200/50 backdrop-blur-sm",
        "bg-gradient-to-br from-white via-white/98 to-white/95",
        "transition-all duration-500 hover:border-dsp-orange/30 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]",
        className,
      )}
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Optional image header (disabled by default via imageMode="none") */}
      {showImage && (
        <div
          className={clsx(
            "relative w-full h-24 overflow-hidden flex-shrink-0",
            "bg-gradient-to-br from-gray-100 to-gray-200",
            classNameImage,
          )}
        >
          <img
            src={displayImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
          {/* white overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />

          {/* center play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm grid place-items-center shadow">
              <IoPlay className="h-5 w-5 text-dsp-orange" />
            </div>
          </div>
        </div>
      )}
      {/* Hover gradient + glow */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-dsp-orange/5 via-transparent to-emerald-400/5" />
      <div className="absolute -inset-0.5 rounded-xl -z-10 pointer-events-none opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 bg-gradient-to-br from-dsp-orange/20 to-emerald-400/20" />

      {/* Content */}
      <div
        className={clsx(
          "relative p-4 flex-1 flex flex-col",
          classNameContentWrapper,
        )}
      >
        {/* Header row: title + play */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3
            className={clsx(
              "ds-title leading-tight",
              "group-hover:text-dsp-orange transition-colors duration-300",
              "line-clamp-2",
              classNameTitle,
            )}
            title={title}
          >
            {title}
          </h3>
          <button
            className="shrink-0 h-10 w-10 rounded-full bg-gray-100 hover:bg-dsp-orange hover:text-white transition-all duration-300 grid place-items-center shadow-sm"
            aria-label="Starten"
            type="button"
          >
            <IoPlay className="h-5 w-5" />
          </button>
        </div>
        {badge && <div className="mt-1">{badge}</div>}

        {description && (
          <p
            className={clsx(
              "text-sm text-gray-600 mt-2 line-clamp-2",
              classNameDescription,
            )}
          >
            {description}
          </p>
        )}

        {/* Status + progress */}
        <div className={clsx("mt-auto space-y-2", classNameProgressWrapper)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "relative inline-flex h-3 w-3 rounded-full",
                  status === "completed"
                    ? "bg-green-600"
                    : status === "in-progress"
                      ? "bg-dsp-orange"
                      : "bg-gray-400",
                )}
              >
                {status === "in-progress" && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-dsp-orange" />
                )}
              </span>
              <span className={clsx("text-xs font-medium", statusColor)}>
                {statusText}
              </span>
            </div>
            <span
              className={clsx(
                "text-xs font-semibold",
                statusColor,
                "bg-gray-100 px-2 py-0.5 rounded-md",
                classNameProgressText,
              )}
            >
              {Math.round(progress)}%
            </span>
          </div>

          {/* Gradient progress bar with shine */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
              <motion.div
                className={clsx(
                  "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden",
                  "bg-gradient-to-r from-dsp-orange via-orange-300 to-emerald-400",
                  classNameProgressBar,
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* (Glow handled above with two layers) */}
    </motion.div>
  );
};

export default CardPreviewSmall;
