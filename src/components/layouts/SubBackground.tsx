import { ReactNode } from "react";
import clsx from "clsx";

interface SubBackgroundProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl";
  blur?: "sm" | "md" | "lg" | "xl";
}

const SubBackground = ({
  children,
  className = "",
  padding = "md",
  rounded = "xl",
  blur = "md",
}: SubBackgroundProps) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const roundedClasses = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-2xl",
    "2xl": "rounded-3xl",
  };

  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  return (
    <div
      className={clsx(
        // Base glassmorphism styling - milky white, less transparent
        "bg-white/50",
        blurClasses[blur],
        "border border-white/50",
        "shadow-sm",
        roundedClasses[rounded],
        paddingClasses[padding],
        // Optional hover effect
        "transition-all duration-300",
        "hover:bg-white/60",
        "hover:border-white/60",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default SubBackground;
