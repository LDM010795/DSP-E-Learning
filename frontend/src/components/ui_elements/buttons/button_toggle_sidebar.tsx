import React from "react";

interface ButtonToggleSmallProps {
  title?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  classNameButton?: string;
  classNameIcon?: string;
}

const ButtonToggleSmall: React.FC<ButtonToggleSmallProps> = ({
  title,
  icon,
  onClick,
  classNameButton,
  classNameIcon,
}) => {
  return (
    <div className={classNameButton}>
      <button
        onClick={onClick}
        aria-label={title || "Toggle menu"}
        className={
          "flex items-center space-x-2 border rounded-lg bg-dsp-orange_light " +
          // smaller on mobile, scale up on md+
          "px-2 py-1 text-xs md:px-3 md:py-1.5 md:text-sm " +
          // consistent icon sizing
          "[&>span_svg]:w-4 [&>span_svg]:h-4 md:[&>span_svg]:w-5 md:[&>span_svg]:h-5 " +
          // usability
          "hover:cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dsp-orange/50 " +
          // keep rotation
          "rotate-180"
            }
      >
        {icon && <span className={classNameIcon}>{icon}</span>}
          {title && (
              <span className="truncate whitespace-nowrap max-w-[120px] sm:max-w-[160px] md:max-w-none">
                  {title}
              </span>
          )}
      </button>
    </div>
  );
};

export default ButtonToggleSmall;
