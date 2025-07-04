import React from "react";

const DSPBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 25%, #ffe7d4 50%, #ffffff 75%, #f1f5f9 100%)",
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
              <circle cx="40" cy="40" r="2" fill="#ff863d" opacity="0.12" />
              <circle cx="20" cy="20" r="1" fill="#fa8c45" opacity="0.08" />
              <circle cx="60" cy="20" r="1" fill="#ff863d" opacity="0.08" />
              <circle cx="20" cy="60" r="1" fill="#fa8c45" opacity="0.08" />
              <circle cx="60" cy="60" r="1" fill="#ff863d" opacity="0.08" />
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
                stroke="#ff863d"
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
                style={{ stopColor: "#ff863d", stopOpacity: 0.02 }}
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
                style={{ stopColor: "#ff863d", stopOpacity: 0.02 }}
              />
            </linearGradient>

            {/* Radial Accent */}
            <radialGradient
              id="radial-accent"
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#ff863d", stopOpacity: 0.03 }}
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
          <ellipse cx="25%" cy="25%" rx="300" ry="200" fill="url(#radial-accent)" />
          <ellipse cx="75%" cy="75%" rx="250" ry="180" fill="url(#radial-accent)" />
        </svg>
      </div>

      {/* Modern Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Enhanced Database Icons */}
        <div className="absolute top-20 left-10 w-10 h-10 text-[#ff863d] opacity-8 animate-pulse">
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path d="M12 2C8.3 2 5 3.1 5 4.5V6c0 1.4 3.3 2.5 7 2.5s7-1.1 7-2.5V4.5C19 3.1 15.7 2 12 2zM5 8v2.5c0 1.4 3.3 2.5 7 2.5s7-1.1 7-2.5V8c-1.3.9-4 1.5-7 1.5S6.3 8.9 5 8zM5 13v2.5c0 1.4 3.3 2.5 7 2.5s7-1.1 7-2.5V13c-1.3.9-4 1.5-7 1.5S6.3 13.9 5 13zM5 18v2.5c0 1.4 3.3 2.5 7 2.5s7-1.1 7-2.5V18c-1.3.9-4 1.5-7 1.5S6.3 18.9 5 18z"/>
          </svg>
        </div>

        <div className="absolute top-32 right-20 w-8 h-8 text-[#fa8c45] opacity-10 animate-bounce">
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path d="M3 3v18h18v-2H5V3H3zm4 14h2v-8H7v8zm4 0h2V9h-2v8zm4 0h2V5h-2v12z"/>
          </svg>
        </div>

        {/* Enhanced Chart Elements */}
        <div className="absolute bottom-32 left-1/4 w-12 h-12 text-[#ff863d] opacity-6">
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        </div>

        <div className="absolute top-60 right-1/3 w-10 h-10 text-[#ffe7d4] opacity-12 animate-pulse">
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
          </svg>
        </div>

        {/* New Learning Elements */}
        <div className="absolute bottom-20 right-10 w-8 h-8 text-[#fa8c45] opacity-8">
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#ff863d] opacity-6">
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      </div>

      {/* Subtle Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #ff863d 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #fa8c45 1px, transparent 1px)`,
          backgroundSize: '50px 50px, 80px 80px',
        }}
      />
    </div>
  );
};

export default DSPBackground;
