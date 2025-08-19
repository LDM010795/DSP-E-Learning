import React, { useEffect, useState, useCallback } from "react";

type BackToTopButtonProps = {
  threshold?: number; // px scrollY ab der der Button erscheint
  className?: string;
};

const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  threshold = 400,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={handleScrollTop}
      aria-label="Nach oben scrollen"
      className={[
        "fixed bottom-6 right-6 z-40 rounded-full bg-gray-900 text-white",
        "shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900",
        "transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
        "h-11 w-11 flex items-center justify-center",
        className,
      ].join(" ")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 11-2 0V6.414L5.707 9.707A1 1 0 114.293 8.293l5-5A1 1 0 0110 3z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
};

export default BackToTopButton;
