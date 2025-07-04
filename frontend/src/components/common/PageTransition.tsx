import React from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // Optimized page transition variants for better performance
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 15
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -15
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.2
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
