import React from "react";

interface RibbonProps {
  text?: string;
  color?: string;
  backgroundColor?: string;
  position?: "top-right" | "top-left";
}

const ComingSoonRibbon: React.FC<RibbonProps> = ({
  text = "Work in Progress",
  color = "white", // Textfarbe auf weiß
  backgroundColor = "#3b5998", // Dunkles Blau, hebt sich vom Orange ab
  position = "top-right",
}) => {
  // Positionierung je nach gewählter Option
  const positionStyles = {
    "top-right": {
      right: "-50px",
      top: "25px",
      transform: "rotate(45deg)",
      transformOrigin: "center",
    },
    "top-left": {
      left: "-50px",
      top: "25px",
      transform: "rotate(-45deg)",
      transformOrigin: "center",
    },
  };

  return (
    <div
      className="absolute overflow-visible z-50 w-full h-full pointer-events-none"
      style={{
        top: 0,
        left: 0,
      }}
    >
      <div
        className="absolute shadow-lg font-bold py-2 px-10 text-white text-sm uppercase tracking-wider"
        style={{
          backgroundColor: backgroundColor,
          color: color,
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.4)",
          width: "250px",
          textAlign: "center",
          ...positionStyles[position],
          borderTop: "2px solid rgba(255, 255, 255, 0.3)",
          borderBottom: "2px solid rgba(0, 0, 0, 0.2)",
        }}
      >
        <span className="relative" style={{ zIndex: 2 }}>
          {text}
        </span>
        {/* Schraffierte Linien für mehr Kontrast */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.5) 5px, rgba(255,255,255,0.5) 10px)",
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
};

export default ComingSoonRibbon;
