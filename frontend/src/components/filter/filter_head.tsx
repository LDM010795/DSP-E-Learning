import React from "react";
import { IoSearch } from "react-icons/io5";

interface FilterHeadProps {
  title?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  showSearch?: boolean;
  children?: React.ReactNode;
  className?: string;
  searchPlaceholder?: string;
}

const FilterHead: React.FC<FilterHeadProps> = ({
  title,
  searchTerm,
  onSearchChange,
  showSearch = true,
  children,
  className = "",
  searchPlaceholder = "Suchen...",
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-6 ${className}`}
    >
      {title && (
        <h2 className="text-xl font-semibold text-gray-700 flex-shrink-0">
          {title}
        </h2>
      )}

      <div className="flex-grow w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
        {showSearch && searchTerm !== undefined && onSearchChange && (
          <div className="relative w-full md:max-w-xs order-last md:order-first">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-transparent text-sm bg-white"
            />
          </div>
        )}

        {children && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center w-full md:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterHead;
