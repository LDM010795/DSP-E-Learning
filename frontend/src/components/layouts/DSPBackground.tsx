import React from "react";

const DSPBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background:
          "linear-gradient(135deg, #f8fafc 0%, #ffffff 25%, #ffe7d4 50%, #ffffff 75%, #f1f5f9 100%)",
      }}
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Modern Grid Pattern */}
            <pattern
              id="modern-grid"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="40" cy="40" r="2" fill="var(--color-dsp-orange)" opacity="0.12" />
              <circle cx="20" cy="20" r="1" fill="#fa8c45" opacity="0.08" />
              <circle cx="60" cy="20" r="1" fill="var(--color-dsp-orange)" opacity="0.08" />
              <circle cx="20" cy="60" r="1" fill="#fa8c45" opacity="0.08" />
              <circle cx="60" cy="60" r="1" fill="var(--color-dsp-orange)" opacity="0.08" />
              <circle cx="0" cy="0" r="0.5" fill="#ffe7d4" opacity="0.15" />
              <circle cx="80" cy="0" r="0.5" fill="#ffe7d4" opacity="0.15" />
              <circle cx="0" cy="80" r="0.5" fill="#ffe7d4" opacity="0.15" />
              <circle cx="80" cy="80" r="0.5" fill="#ffe7d4" opacity="0.15" />
            </pattern>

            {/* Elegant Wave Lines */}
            <pattern
              id="elegant-waves"
              x="0"
              y="0"
              width="200"
              height="200"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,100 Q50,60 100,100 T200,100"
                stroke="var(--color-dsp-orange)"
                strokeWidth="0.8"
                fill="none"
                opacity="0.06"
              />
              <path
                d="M0,120 Q50,80 100,120 T200,120"
                stroke="#fa8c45"
                strokeWidth="0.6"
                fill="none"
                opacity="0.05"
              />
              <path
                d="M100,0 Q150,40 200,0"
                stroke="#ffe7d4"
                strokeWidth="1"
                fill="none"
                opacity="0.08"
              />
            </pattern>

            {/* Premium Gradient Overlay */}
            <linearGradient
              id="premium-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "var(--color-dsp-orange)", stopOpacity: 0.02 }}
              />
              <stop
                offset="25%"
                style={{ stopColor: "#fa8c45", stopOpacity: 0.015 }}
              />
              <stop
                offset="50%"
                style={{ stopColor: "#ffe7d4", stopOpacity: 0.025 }}
              />
              <stop
                offset="75%"
                style={{ stopColor: "#fa8c45", stopOpacity: 0.015 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "var(--color-dsp-orange)", stopOpacity: 0.02 }}
              />
            </linearGradient>

            {/* Radial Accent */}
            <radialGradient id="radial-accent" cx="50%" cy="50%" r="50%">
              <stop
                offset="0%"
                style={{ stopColor: "var(--color-dsp-orange)", stopOpacity: 0.03 }}
              />
              <stop
                offset="70%"
                style={{ stopColor: "#fa8c45", stopOpacity: 0.01 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "transparent", stopOpacity: 0 }}
              />
            </radialGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#premium-gradient)" />
          <rect width="100%" height="100%" fill="url(#modern-grid)" />
          <rect width="100%" height="100%" fill="url(#elegant-waves)" />
          <ellipse
            cx="25%"
            cy="25%"
            rx="300"
            ry="200"
            fill="url(#radial-accent)"
          />
          <ellipse
            cx="75%"
            cy="75%"
            rx="250"
            ry="180"
            fill="url(#radial-accent)"
          />
        </svg>
      </div>

      {/* Subtle Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large rotating circle */}
        <div className="absolute -top-72 -left-72 w-[800px] h-[800px] bg-dsp-orange/5 rounded-full blur-2xl animate-[spin_120s_linear_infinite]" />

        {/* Medium rotating circle */}
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-[#fa8c45]/5 rounded-full blur-xl animate-[spin_180s_linear_infinite]" />

        {/* Subtle rotating ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border-2 border-[#ffe7d4]/10 rounded-full animate-[spin_160s_linear_reverse_infinite]" />
      </div>

      {/* Subtle Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, var(--color-dsp-orange) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #fa8c45 1px, transparent 1px)`,
          backgroundSize: "50px 50px, 80px 80px",
        }}
      />
    </div>
  );
};

export default DSPBackground;
