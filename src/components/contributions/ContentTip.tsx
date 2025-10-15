import React from "react";
import { ContentTipProps } from "./types";

const ContentTip: React.FC<ContentTipProps> = ({ text }) => {
  return (
    <aside className="not-prose my-4 rounded-xl border px-4 py-3 text-sm border-emerald-300/60 bg-emerald-50/60">
      <div className="flex items-start gap-2">
        <svg
          className="mt-0.5 h-5 w-5 text-emerald-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-gray-800">
          <strong>Tipp:</strong> {text}
        </p>
      </div>
    </aside>
  );
};

export default ContentTip;
