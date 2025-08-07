import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
  IoPlayOutline,
  IoListOutline,
  IoVideocamOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import type { Chapter } from "../../context/ModuleContext";

interface CardChapterProps {
  chapter: Chapter;
  className?: string;
  onClick?: () => void;
}

const CardChapter: React.FC<CardChapterProps> = ({
  chapter,
  className,
  onClick,
}) => {
  const videoCount = chapter.contents.length;
  const taskCount = chapter.tasks.length;
  const completedTasks = chapter.tasks.filter((task) => task.completed).length;
  const progress =
    taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

  return (
    <motion.div
      className={clsx(
        // Base professional styling
        "group relative",
        "bg-white/90 backdrop-blur-sm",
        "border border-gray-200/60",
        "rounded-xl p-4",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200 ease-in-out",
        "cursor-pointer",
        "hover:border-[#ff863d]/30",
        "hover:bg-[#ffe7d4]",
        className
      )}
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      {/* Content Layout */}
      <div className="flex items-center gap-4">
        {/* Chapter Icon */}
        <motion.div
          className={clsx(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
            "shadow-sm border border-white/20",
            "bg-[#ff863d]"
          )}
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <IoListOutline className="h-4 w-4 text-white" />
        </motion.div>

        {/* Content Area */}
        <div className="flex-grow min-w-0">
          {/* Chapter Title */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 group-hover:text-[#ff863d] transition-colors">
            {chapter.title}
          </h3>

          {/* Chapter Description */}
          {chapter.description && (
            <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
              {chapter.description}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {/* Video Count */}
            <div className="flex items-center gap-1">
              <IoVideocamOutline className="h-3 w-3" />
              <span>
                {videoCount} Video{videoCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Task Count */}
            <div className="flex items-center gap-1">
              <IoCheckmarkCircleOutline className="h-3 w-3" />
              <span>
                {taskCount} Aufgabe{taskCount !== 1 ? "n" : ""}
              </span>
            </div>

            {/* Progress */}
            {taskCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[#ff863d] font-medium">
                  {progress}% abgeschlossen
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Arrow Icon */}
        <motion.div
          className="flex-shrink-0 text-gray-400 group-hover:text-[#ff863d] transition-colors"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}
        >
          <IoPlayOutline className="h-4 w-4" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CardChapter;
