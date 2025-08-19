import React from "react";
import { ContentImportantProps } from "./types";

const ContentImportant: React.FC<ContentImportantProps> = ({ text }) => {
  return (
    <aside className="not-prose my-4 rounded-xl border px-4 py-3 text-sm border-amber-300/60 bg-amber-50/60">
      <div className="flex items-start gap-2">
        <svg
          className="mt-0.5 h-5 w-5 text-amber-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-gray-800">
          <strong>Wichtig:</strong> {text}
        </p>
      </div>
    </aside>
  );
};

export default ContentImportant;
