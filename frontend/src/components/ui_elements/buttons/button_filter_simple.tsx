import clsx from "clsx";

interface ButtonFilterSimpleProps<T extends string> {
  label: string;
  options: T[];
  activeOptions: T[];
  onOptionClick: (option: T) => void;
  onClearClick: () => void;
  activeClassName?: string;
  inactiveClassName?: string;
  buttonClassName?: string;
  clearButtonClassName?: string;
}

const ButtonFilterSimple = <T extends string>({
  label,
  options,
  activeOptions,
  onOptionClick,
  onClearClick,
  activeClassName = "bg-dsp-blue text-white border-dsp-blue", // Default active style
  inactiveClassName = "bg-white text-gray-600 border-gray-300 hover:bg-dsp-orange_light hover:border-gray-400", // Default inactive style
  buttonClassName = "px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer",
  clearButtonClassName = "ml-1 text-xs text-gray-500 hover:text-dsp-orange underline",
}: ButtonFilterSimpleProps<T>) => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-gray-700 mr-1">{label}</span>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onOptionClick(option)}
          className={clsx(
            buttonClassName,
            activeOptions.includes(option)
              ? activeClassName
              : inactiveClassName,
          )}
        >
          {option}
        </button>
      ))}
      {activeOptions.length > 0 && (
        <button onClick={onClearClick} className={clearButtonClassName}>
          Löschen
        </button>
      )}
    </div>
  );
};

export default ButtonFilterSimple;
