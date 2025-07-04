import React from "react";

interface Source {
  title: string;
  url?: string;
}

interface ContentSourcesProps {
  sources: Source[];
}

const ContentSources: React.FC<ContentSourcesProps> = ({ sources }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <svg
          className="w-5 h-5 text-gray-600 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Quellen</h3>
      </div>

      <ul className="space-y-3">
        {sources.map((source, index) => (
          <li key={index} className="flex items-start">
            <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                >
                  {source.title}
                </a>
              ) : (
                <span className="text-gray-700">{source.title}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentSources;
