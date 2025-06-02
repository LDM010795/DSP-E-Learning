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
        className="flex items-center space-x-2 border rounded-lg bg-dsp-orange_light p-1 hover:cursor-pointer focus:outline-none rotate-180"
      >
        {icon && <span className={classNameIcon}>{icon}</span>}
        {title && <span className="text-sm md:text-base">{title}</span>}
      </button>
    </div>
  );
};

export default ButtonToggleSmall;
