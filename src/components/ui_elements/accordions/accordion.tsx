import React, { useState, ReactNode, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "react-icons/io5";
import clsx from "clsx";

// --- Context für den Akkordeon-Status ---
interface AccordionContextType {
  openItemId: string | null;
  setOpenItemId: (id: string | null) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined,
);

// --- Accordion Wrapper Komponente ---
interface AccordionProps {
  children: ReactNode;
  className?: string;
  defaultOpenId?: string | null; // Optional: ID des standardmäßig geöffneten Items
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  className,
  defaultOpenId = null,
}) => {
  const [openItemId, setOpenItemId] = useState<string | null>(defaultOpenId);

  return (
    <AccordionContext.Provider value={{ openItemId, setOpenItemId }}>
      <div className={clsx("space-y-1", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

// --- Accordion Item Komponente ---
interface AccordionItemProps {
  id: string; // Eindeutige ID für dieses Item
  title: ReactNode;
  icon?: React.ElementType; // Icon-Komponente (z.B. von react-icons)
  children: ReactNode; // Inhalt, der angezeigt wird, wenn geöffnet
  headerClassName?: string;
  contentClassName?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  icon: HeaderIcon,
  children,
  headerClassName,
  contentClassName,
}) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "AccordionItem muss innerhalb eines Accordion verwendet werden",
    );
  }
  const { openItemId, setOpenItemId } = context;
  const isOpen = openItemId === id;

  const toggleOpen = () => {
    setOpenItemId(isOpen ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={toggleOpen}
        className={clsx(
          "flex items-center justify-between w-full p-4 text-left transition-colors duration-150 ease-in-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-dsp-orange",
          isOpen
            ? "bg-gradient-to-r from-dsp-orange/15 to-transparent hover:bg-dsp-orange/20"
            : "bg-white hover:bg-dsp-orange_light",
          headerClassName,
        )}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
      >
        <div className="flex items-center space-x-3 flex-grow min-w-0">
          {HeaderIcon && (
            <HeaderIcon className="w-5 h-5 text-dsp-orange flex-shrink-0" />
          )}
          <div className="font-medium text-gray-800 truncate">{title}</div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-4 flex-shrink-0"
        >
          <Icons.IoChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
            id={`accordion-content-${id}`}
            role="region"
            aria-labelledby={`accordion-header-${id}`}
          >
            <div
              className={clsx(
                "p-4 border-t border-gray-200 bg-white",
                contentClassName,
              )}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
