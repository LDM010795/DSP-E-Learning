import React from "react";
import { motion } from "framer-motion";

interface ButtonSwipeProps {
  title?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  classNameButton?: string;
  classNameIcon?: string;
}

const ButtonSwipe: React.FC<ButtonSwipeProps> = ({
  title,
  icon,
  onClick,
  classNameButton = "",
  classNameIcon = "",
}) => {
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 },
  };

  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center space-x-2 rounded-full p-4 text-white bg-dsp-orange
       hover:cursor-pointer focus:outline-none hover:font-bold
        ${classNameButton}`}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
    >
      {title && <p className="text-sm md:text-base ">{title}</p>}
      {icon && <motion.span className={classNameIcon}>{icon}</motion.span>}
    </motion.button>
  );
};

export default ButtonSwipe;
