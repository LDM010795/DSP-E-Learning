/**
 * Page Transition Component - E-Learning DSP Frontend
 *
 * Framer Motion-basierte Seitenübergangs-Komponente:
 * - Optimierte Animationen für bessere Performance
 * - Sanfte Ein- und Ausblend-Effekte
 * - Konfigurierbare Übergangszeiten
 * 
 * Features:
 * - Framer Motion Integration
 * - Performance-optimierte Animationen
 * - Responsive Design
 * - TypeScript-Typisierung
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import { motion } from "framer-motion";

/**
 * Props für PageTransition Komponente
 */
interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Page Transition Komponente
 * 
 * Wrapper für Seitenübergänge mit Framer Motion.
 * Bietet sanfte Ein- und Ausblend-Animationen.
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // --- Animation Configuration ---
  
  // Optimierte page transition variants für bessere Performance
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
