import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";
import { preloadOnHover } from "../../../util/performance";

interface LinkSidebarProps {
  to: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const LinkSidebar: React.FC<LinkSidebarProps> = ({
  to,
  icon,
  children,
  className = "",
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const hasIcon = !!icon;

  // Determine what to preload based on route
  const handleMouseEnter = () => {
    if (to.includes("/user-stats") || to.includes("/statistics")) {
      preloadOnHover("charts");
    } else if (to.includes("/modules") || to.includes("/tasks")) {
      preloadOnHover("monaco");
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link
        to={to}
        onMouseEnter={handleMouseEnter}
        className={clsx(
          // flex row with min-w-0 so the text can truncate
          // NOTE: When active AND no icon, add extra left padding to make room for the dot.
          hasIcon
            ? "flex items-center gap-3 px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative overflow-hidden"
            : clsx(
                "flex items-center gap-3 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative overflow-hidden",
                isActive
                  ? "pl-8 sm:pl-9 md:pl-10 pr-3 sm:pr-4 md:pr-6 lg:pr-8"
                  : "px-3 sm:px-4 md:px-6 lg:px-8",
              ),
          {
            // Active state - enhanced with subtle animations
            "bg-gradient-to-r from-dsp-orange to-dsp-orange-gradient text-white shadow-sm shadow-dsp-orange/20":
              isActive,
            // Inactive state - subtle hover effects
            "text-gray-700 hover:text-dsp-orange hover:bg-dsp-orange/5 border border-transparent hover:border-dsp-orange/20":
              !isActive,
          },
          className,
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {/* Active indicator dot */}
        {isActive && !hasIcon && (
          <motion.div
            // Place the dot within the left padding area and keep it behind text.
            className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm z-0 pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Background gradient effect for hover */}
        {!isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-dsp-orange/0 via-dsp-orange/5 to-dsp-orange/0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Icon with enhanced animations */}
        {icon && (
          <motion.span
            className={clsx("relative z-10 shrink-0", {
              "text-white": isActive,
              "text-gray-500 group-hover:text-dsp-orange": !isActive,
            })}
            whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {icon}
          </motion.span>
        )}

        {/* Text content (truncate on one line) */}
        <motion.span
          className="relative z-10 min-w-0 flex-1"
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span
            className={clsx(
              // prevent wrapping & show ellipsis when narrow
              "block truncate whitespace-nowrap",
              // responsive max widths to balance truncation vs. readability
              "max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[260px]",
            )}
            title={typeof children === "string" ? children : undefined}
          >
            {children}
          </span>
        </motion.span>

        {/* Ripple effect on click */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-xl"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{
            scale: 1,
            opacity: [0, 0.3, 0],
            transition: { duration: 0.3 },
          }}
        />
      </Link>
    </motion.div>
  );
};

export default LinkSidebar;
