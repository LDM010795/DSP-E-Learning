import React from "react";
import { ContentTipProps } from "./types";

const ContentTip: React.FC<ContentTipProps> = ({ text }) => {
  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-700">
            <strong>Tipp:</strong> {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentTip;
