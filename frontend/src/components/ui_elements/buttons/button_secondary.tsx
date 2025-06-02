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
    hover: { scale: 1.05 },
  };

  const iconVariants = {
    initial: { x: 0 },
    hover: { x: 6 },
  };

  const iconPositionClass = iconPosition === "left" ? "flex-row-reverse" : "";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className={`flex items-center space-x-2 rounded-lg  py-2 px-4 border-2 border-dsp-orange p-2
       hover:cursor-pointer focus:outline-none hover:font-bold
        ${iconPositionClass} ${classNameButton} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      variants={buttonVariants}
      initial="initial"
      whileTap="tap"
    >
      {title && <p className="text-sm md:text-base ">{title}</p>}
      {icon && (
        <motion.span
          className={classNameIcon}
          variants={iconVariants}
          transition={{ type: "spring", stiffness: 500 }}
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  );
};

export default ButtonSecondary;
