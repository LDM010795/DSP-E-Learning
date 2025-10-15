import React from "react";
import clsx from "clsx";

interface CardBadgeProps {
  text: string;
  colorScheme?: "dsp-orange" | "dsp-light" | "blue" | "green" | "gray" | "red";
  className?: string;
}

const CardBadge: React.FC<CardBadgeProps> = ({
  text,
  colorScheme = "gray",
  className = "",
}) => {
  const colorClasses = {
    "dsp-orange": "bg-dsp-orange text-white",
    "dsp-light": "bg-dsp-orange_light text-dsp-orange]",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    gray: "bg-gray-100 text-gray-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm",
        colorClasses[colorScheme],
        className,
      )}
    >
      {text}
    </span>
  );
};

export default CardBadge;
