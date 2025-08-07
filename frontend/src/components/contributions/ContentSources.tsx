import React from "react";
import { ContentSourcesProps } from "./types";

const ContentSources: React.FC<ContentSourcesProps> = ({ text }) => {
  // Parse sources from text (assuming they are separated by newlines or semicolons)
  const parseSources = (sourceText: string): string[] => {
    return sourceText
      .split(/[\n;]/)
      .map((source) => source.trim())
      .filter((source) => source.length > 0);
  };

  const sources = parseSources(text);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quellen</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        {sources.map((source, index) => (
          <li key={index} className="leading-relaxed">
            {source}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentSources;
