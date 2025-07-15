import React, { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import clsx from "clsx";

interface ButtonFilterCategoryProps {
  allCategories: string[];
  activeCategories: string[];
  onCategoryChange: (category: string, isChecked: boolean) => void;
  onClearClick: () => void;
  contentClassName?: string;
  itemClassName?: string;
  labelClassName?: string;
  separatorClassName?: string;
  checkboxClassName?: string;
  checkboxLabelClassName?: string;
  clearButtonClassName?: string;
}

const ButtonFilterCategory: React.FC<ButtonFilterCategoryProps> = ({
  allCategories,
  activeCategories,
  onCategoryChange,
  onClearClick,
  contentClassName = "absolute z-10 mt-1 w-56 max-h-60 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1",
  itemClassName = "flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer",
  labelClassName = "px-3 py-2 text-xs font-semibold text-gray-500",
  separatorClassName = "border-t border-gray-200 mx-1 my-1",
  checkboxClassName = "h-3 w-3 rounded border-gray-300 text-[#FF6D25] focus:ring-[#FF6D25] cursor-pointer",
  checkboxLabelClassName = "ml-2 select-none",
  clearButtonClassName = "w-full text-left px-3 py-1.5 text-xs text-[#FF6D25] hover:bg-gray-100 hover:underline cursor-pointer",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hasActiveFilters = activeCategories.length > 0;
  const buttonLabel = `Kategorie${
    hasActiveFilters ? ` (${activeCategories.length})` : ""
  }`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, triggerRef]);

  const sortedCategories = [...allCategories]
    .filter((cat): cat is string => typeof cat === "string" && cat.trim() !== "")
    .sort((a, b) => a.localeCompare(b));

  const handleCheckboxChange = (category: string, isChecked: boolean) => {
    onCategoryChange(category, isChecked);
  };

  const handleClearClick = () => {
    onClearClick();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "inline-flex items-center justify-center px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer",
          {
            "bg-white text-gray-600 border-gray-300 hover:bg-[#FEDAC7] hover:border-[#FF6D25]":
              !hasActiveFilters,
            "bg-[#FF6D25] text-white border-[#FF6D25]": hasActiveFilters,
          }
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {buttonLabel}
        <IoChevronDown
          className={clsx("ml-1 h-3 w-3 transition-transform duration-200", {
            "rotate-180": isOpen,
          })}
        />
      </button>

      {isOpen && (
        <div
          className={contentClassName}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className={labelClassName} role="none">
            Nach Kategorie filtern
          </div>
          <hr className={separatorClassName} role="none" />
          <div role="none">
            {sortedCategories.map((category) => (
              <label
                key={category}
                className={clsx(itemClassName)}
                role="menuitemcheckbox"
                aria-checked={activeCategories.includes(category)}
              >
                <input
                  type="checkbox"
                  className={checkboxClassName}
                  checked={activeCategories.includes(category)}
                  onChange={(e) =>
                    handleCheckboxChange(category, e.target.checked)
                  }
                />
                <span className={checkboxLabelClassName}>{category}</span>
              </label>
            ))}
          </div>
          {hasActiveFilters && (
            <>
              <hr className={separatorClassName} role="none" />
              <button
                onClick={handleClearClick}
                className={clearButtonClassName}
                role="menuitem"
              >
                Filter löschen
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ButtonFilterCategory;
