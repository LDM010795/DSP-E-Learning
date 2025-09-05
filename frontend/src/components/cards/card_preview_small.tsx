import React from "react";
import { motion } from "framer-motion";
import {
  IoPlayCircleOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import clsx from "clsx";

// ✨ Props Interface
interface CardPreviewSmallProps {
  imageSrc?: string;
  youtubeId?: string;
  title: string;
  description?: string;
  progress?: number;
  onClick?: () => void;

  // Custom ClassNames
  className?: string;
  classNameTitle?: string;
  classNameDescription?: string;
  classNameImage?: string;
  classNameContentWrapper?: string;
  classNameProgressWrapper?: string;
  classNameProgressBar?: string;
  classNameProgressText?: string;
}

const CardPreviewSmall: React.FC<CardPreviewSmallProps> = ({
  imageSrc,
  youtubeId,
  title,
  description,
  progress = 0,
  onClick,
  className,
  classNameTitle,
  classNameDescription,
  classNameImage,
  classNameContentWrapper,
  classNameProgressWrapper,
  classNameProgressBar,
  classNameProgressText,
}) => {
  const displayImage = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : imageSrc;

  // Determine module status based on progress
  const getModuleStatus = () => {
    if (progress >= 100) return "completed";
    if (progress > 0) return "in-progress";
    return "not-started";
  };

  const status = getModuleStatus();

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <IoTimeOutline className="w-5 h-5 text-dsp-orange" />;
      default:
        return <IoPlayCircleOutline className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-dsp-orange";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <motion.div
      className={clsx(
        // Base card styling - professional SaaS look
        "relative group cursor-pointer",
        "bg-white/90 backdrop-blur-sm",
        "border border-gray-200/60 hover:border-dsp-orange/30",
        "rounded-xl overflow-hidden",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200 ease-in-out",
        "hover:scale-[1.02] hover:-translate-y-1",
        className,
      )}
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Professional Image Container */}
      {displayImage && (
        <div
          className={clsx(
            "relative w-full aspect-video overflow-hidden",
            "bg-gradient-to-br from-gray-100 to-gray-200",
            classNameImage,
          )}
        >
          <img
            src={displayImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Professional overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Video play indicator */}
          {youtubeId && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                <IoPlayCircleOutline className="w-8 h-8 text-dsp-orange" />
              </div>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
              {getStatusIcon()}
            </div>
          </div>
        </div>
      )}

      {/* Professional Content Area */}
      <div className={clsx("p-4", classNameContentWrapper)}>
        {/* Title Section */}
        <div className="mb-3">
          <h3
            className={clsx(
              "font-semibold text-gray-900 text-base leading-tight",
              "group-hover:text-dsp-orange transition-colors duration-200",
              "line-clamp-2",
              classNameTitle,
            )}
          >
            {title}
          </h3>

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
        </div>

        {/* Professional Progress Section */}
        <div className={clsx("space-y-2", classNameProgressWrapper)}>
          {/* Progress header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-xs font-medium text-gray-700">
                {status === "completed"
                  ? "Abgeschlossen"
                  : status === "in-progress"
                    ? "In Bearbeitung"
                    : "Nicht begonnen"}
              </span>
            </div>
            <span
              className={clsx(
                "text-xs font-semibold",
                status === "completed"
                  ? "text-green-600"
                  : status === "in-progress"
                    ? "text-dsp-orange"
                    : "text-gray-500",
                classNameProgressText,
              )}
            >
              {progress}%
            </span>
          </div>

          {/* Professional progress bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className={clsx(
                  "h-2 rounded-full transition-all duration-300",
                  getProgressBarColor(),
                  classNameProgressBar,
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            {/* Progress glow effect */}
            {progress > 0 && (
              <div
                className={clsx(
                  "absolute top-0 left-0 h-2 rounded-full opacity-50 blur-sm",
                  getProgressBarColor(),
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Subtle hover glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-dsp-orange/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </motion.div>
  );
};

export default CardPreviewSmall;
