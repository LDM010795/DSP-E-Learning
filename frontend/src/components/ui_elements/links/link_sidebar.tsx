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
          "flex items-center gap-3 px-8 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative overflow-hidden",
          {
            // Active state - enhanced with subtle animations
            "bg-gradient-to-r from-dsp-orange to-[#fa8c45] text-white shadow-sm shadow-dsp-orange/20":
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
        {isActive && (
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm"
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
            className={clsx("relative z-10", {
              "text-white": isActive,
              "text-gray-500 group-hover:text-dsp-orange": !isActive,
            })}
            whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {icon}
          </motion.span>
        )}

        {/* Text content */}
        <motion.span
          className="relative z-10"
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {children}
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
