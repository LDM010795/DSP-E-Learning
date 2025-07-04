import React from "react";

interface ContentImportantProps {
  content: string;
}

const ContentImportant: React.FC<ContentImportantProps> = ({ content }) => {
  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-6 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-orange-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-semibold text-orange-800 mb-1">
            Wichtig!
          </h4>
          <p className="text-sm text-orange-700 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default ContentImportant;
