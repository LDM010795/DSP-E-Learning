import React from "react";

interface ContentMetadataProps {
  author?: string;
  version?: string;
  date?: string;
}

const ContentMetadata: React.FC<ContentMetadataProps> = ({
  author = "Thomas Mühlmann",
  version = "1.0",
  date = "12.08.2024",
}) => {
  return (
    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
        <span>{author}</span>
      </div>

      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
        <span>Version {version}</span>
      </div>

      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
        <span>{date}</span>
      </div>
    </div>
  );
};

export default ContentMetadata;
