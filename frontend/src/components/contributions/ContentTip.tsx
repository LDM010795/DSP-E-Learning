import React from "react";

interface ContentTipProps {
  content: string;
}

const ContentTip: React.FC<ContentTipProps> = ({ content }) => {
  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-green-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-semibold text-green-800 mb-1">Tipp:</h4>
          <p className="text-sm text-green-700 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default ContentTip;
