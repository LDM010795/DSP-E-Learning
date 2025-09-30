import React from "react";
import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5"; // Icon für Trenner

interface BreadcrumbItem {
  label: string;
  path?: string; // Pfad ist optional für das letzte Element
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string; // Für zusätzlichen Container-Style
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "" }) => {
  if (!items || items.length === 0) {
    return null; // Keine Breadcrumbs anzeigen, wenn keine Items vorhanden sind
  }

  return (
    <nav aria-label="breadcrumb" className={`mb-6 ${className}`}>
      <ol className="flex items-center space-x-1 text-sm text-gray-500">
        {items.map((item, index) => (
          <li key={item.label + index} className="flex items-center space-x-1">
            {item.path && index < items.length - 1 ? (
              // Klickbares Element (Link)
              <Link
                to={item.path}
                className="hover:text-dsp-orange hover:underline transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              // Nicht klickbares Element (letztes Item oder kein Pfad)
              <span
                className={
                  index === items.length - 1
                    ? "font-semibold text-gray-700"
                    : ""
                }
                aria-current={index === items.length - 1 ? "page" : undefined}
              >
                {item.label}
              </span>
            )}

            {/* Trenner anzeigen, außer nach dem letzten Element */}
            {index < items.length - 1 && (
              <IoChevronForward size={16} className="text-gray-400" data-testid="breadcrumb-separator"/>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
