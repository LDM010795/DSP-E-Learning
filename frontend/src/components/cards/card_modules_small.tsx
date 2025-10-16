import clsx from "clsx";
import { motion } from "framer-motion";
import { IoPlay } from "react-icons/io5";
import type { ReactNode } from "react";

type ModuleStatus = "Nicht begonnen" | "In Bearbeitung" | "Abgeschlossen";

interface CardModulesSmallProps {
  title: string;
  progress: number;
  difficultyTag: ReactNode;
  className?: string;
  onClick?: () => void;
}

const CardModulesSmall: React.FC<CardModulesSmallProps> = ({
  title,
  progress,
  difficultyTag,
  className,
  onClick,
}) => {
  const derivedStatus: ModuleStatus =
    progress >= 100
      ? "Abgeschlossen"
      : progress > 0
        ? "In Bearbeitung"
        : "Nicht begonnen";

  const statusColor =
    derivedStatus === "Abgeschlossen"
      ? "text-green-600"
      : derivedStatus === "In Bearbeitung"
        ? "text-dsp-orange"
        : "text-gray-600";

  return (
    <motion.div
      className={clsx(
        "group relative overflow-hidden isolate",
        "rounded-xl p-4 h-40 flex flex-col",
        "border border-gray-200/50",
        "bg-gradient-to-br from-white via-white/98 to-white/95",
        "transition-all duration-500 hover:border-dsp-orange/30 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]",
        "cursor-pointer",
        className,
      )}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      {/* Hover gradient + glow */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-dsp-orange/5 via-transparent to-emerald-400/5" />
      <div className="absolute -inset-0.5 rounded-xl -z-10 pointer-events-none opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 bg-gradient-to-br from-dsp-orange/20 to-emerald-400/20" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h3
          title={title}
          className={clsx(
            "ds-title leading-tight",
            "group-hover:text-dsp-orange transition-colors duration-300",
            "line-clamp-2",
          )}
        >
          {title}
        </h3>
        {/* Play button */}
        <button
          className="shrink-0 h-10 w-10 rounded-full bg-gray-100 hover:bg-dsp-orange hover:text-white transition-all duration-300 grid place-items-center shadow-sm"
          aria-label="Starten"
          type="button"
        >
          <IoPlay className="h-5 w-5" />
        </button>
      </div>

      {/* Optional difficulty pill */}
      {difficultyTag && <div className="mt-2">{difficultyTag}</div>}

      <div className="flex-1" />

      {/* Status + progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "relative inline-flex h-3 w-3 rounded-full",
                derivedStatus === "Abgeschlossen"
                  ? "bg-green-600"
                  : derivedStatus === "In Bearbeitung"
                    ? "bg-dsp-orange"
                    : "bg-gray-400",
              )}
            >
              {derivedStatus === "In Bearbeitung" && (
                <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-dsp-orange" />
              )}
            </span>
            <span className={clsx("text-xs font-medium", statusColor)}>
              {derivedStatus}
            </span>
          </div>
          <span
            className={clsx(
              "text-xs font-semibold",
              statusColor,
              "bg-gray-100 px-2 py-0.5 rounded-md",
            )}
          >
            {Math.round(progress)}%
          </span>
        </div>

        {/* Gradient progress bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden bg-gradient-to-r from-dsp-orange via-orange-300 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* (Glow handled by the two gradient layers at the top) */}
    </motion.div>
  );
};

export default CardModulesSmall;
