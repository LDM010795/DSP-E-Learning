import React from "react";
import { IoSyncOutline } from "react-icons/io5"; // Lade-Icon

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Laden...",
  size = "medium",
}) => {
  const sizeClasses = {
    small: "text-3xl",
    medium: "text-5xl",
    large: "text-7xl",
  };

  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-500">
      <IoSyncOutline
        className={`animate-spin ${sizeClasses[size]} text-dsp-orange mb-4`}
      />
      {message && (
        <p className="text-lg font-medium text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
