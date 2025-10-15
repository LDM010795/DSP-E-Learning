import React from "react";
import { motion, HoverHandlers } from "framer-motion";

interface ButtonSecondaryProps extends HoverHandlers {
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  classNameButton?: string;
  classNameIcon?: string;
  disabled?: boolean;
  iconPosition?: "left" | "right";
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  title,
  icon,
  onClick,
  classNameButton = "",
  classNameIcon = "",
  disabled,
  iconPosition = "right",
  onHoverStart,
  onHoverEnd,
}) => {
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const iconVariants = {
    initial: { x: 0, rotate: 0 },
    hover:
      iconPosition === "right" ? { x: 4, rotate: 0 } : { x: -4, rotate: 0 },
  };

  const isFlexReversed = iconPosition === "left";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className={`relative group flex items-center justify-center space-x-3 rounded-xl px-6 py-3
        bg-white/80 backdrop-blur-sm hover:bg-white/90
        text-gray-700 hover:text-dsp-orange font-semibold
        border-2 border-dsp-orange/40 hover:border-dsp-orange/60
        shadow-sm hover:shadow-lg hover:shadow-dsp-orange/10
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-dsp-orange/20 focus:ring-offset-2
        ${
          disabled
            ? "opacity-50 cursor-not-allowed hover:scale-100 hover:text-gray-700 hover:bg-white/80"
            : "hover:cursor-pointer active:shadow-sm"
        }
        ${isFlexReversed ? "flex-row-reverse space-x-reverse" : ""}
        ${classNameButton}`}
      variants={buttonVariants}
      initial="initial"
      whileHover={disabled ? "initial" : "hover"}
      whileTap={disabled ? "initial" : "tap"}
      whileFocus={{
        boxShadow: "0 0 0 3px rgba(255, 109, 37, 0.1)",
      }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-dsp-orange/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div
        className={`relative flex items-center space-x-3 ${isFlexReversed ? "flex-row-reverse space-x-reverse" : ""}`}
      >
        {title && (
          <span className="text-sm md:text-base font-bold tracking-wide">
            {title}
          </span>
        )}
        {icon && (
          <motion.span
            className={`${classNameIcon} flex-shrink-0 text-dsp-orange group-hover:text-dsp-orange_medium`}
            variants={iconVariants}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.span>
        )}
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-dsp-orange/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
      </div>
    </motion.button>
  );
};

export default ButtonSecondary;
