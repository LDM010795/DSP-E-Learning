import React from "react";

interface ContentNoteProps {
  content: string;
  className?: string;
}

const ContentNote: React.FC<ContentNoteProps> = ({
  content,
  className = "",
}) => {
  return (
    <div
      className={`bg-gray-50 border-l-4 border-gray-400 p-6 my-6 rounded-r-lg ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-gray-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-1">Exkurs:</h4>
          <p className="text-sm text-gray-700 leading-relaxed italic">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentNote;
