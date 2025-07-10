/**
 * Primary Button Component - E-Learning DSP Frontend
 *
 * Haupt-Button-Komponente mit erweiterten Animationen:
 * - Framer Motion Integration für flüssige Animationen
 * - DSP-Orange Gradient-Design
 * - Hover- und Tap-Effekte
 * - Glow- und Shine-Effekte
 * 
 * Features:
 * - Gradient-Hintergrund mit DSP-Farben
 * - Icon-Animationen
 * - Accessibility-Features
 * - Responsive Design
 * - Disabled-State-Handling
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import { motion } from "framer-motion";

/**
 * Props für ButtonPrimary Komponente
 */
interface ButtonPrimaryProps {
  title: string;
  icon?: React.ReactNode;
  onClick: () => void;
  classNameButton?: string;
  classNameIcon?: string;
  disabled?: boolean;
}

/**
 * Primary Button Komponente
 * 
 * Haupt-Button mit DSP-Orange Design und erweiterten
 * Animationen für wichtige Aktionen.
 */
const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  title,
  icon,
  onClick,
  classNameButton = "",
  classNameIcon = "",
  disabled,
}) => {
  // --- Animation Variants ---
  
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const iconVariants = {
    initial: { x: 0, rotate: 0 },
    hover: { x: 4, rotate: 0 },
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`relative group flex items-center justify-center space-x-3 rounded-xl px-6 py-3
        bg-gradient-to-r from-[#ff863d] to-[#fa8c45] 
        hover:from-[#fa8c45] hover:to-[#ff863d]
        text-white font-semibold
        shadow-lg shadow-[#ff863d]/25 hover:shadow-xl hover:shadow-[#ff863d]/30
        border border-[#ff863d]/20 hover:border-[#ff863d]/40
        backdrop-blur-sm
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#ff863d]/20 focus:ring-offset-2
        ${
          disabled
            ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-lg"
            : "hover:cursor-pointer active:shadow-md"
        }
        ${classNameButton}`}
      variants={buttonVariants}
      initial="initial"
      whileHover={disabled ? "initial" : "hover"}
      whileTap={disabled ? "initial" : "tap"}
      whileFocus={{
        boxShadow: "0 0 0 3px rgba(255, 134, 61, 0.1)",
      }}
    >
      {/* --- Background Glow Effect --- */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#ff863d] to-[#fa8c45] rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>

      {/* --- Content --- */}
      <div className="relative flex items-center space-x-3">
        {title && (
          <span className="text-sm md:text-base font-bold tracking-wide">
            {title}
          </span>
        )}
        {icon && (
          <motion.span
            className={`${classNameIcon} text-white flex-shrink-0`}
            variants={iconVariants}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.span>
        )}
      </div>

      {/* --- Shine Effect --- */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
      </div>
    </motion.button>
  );
};

export default ButtonPrimary;
