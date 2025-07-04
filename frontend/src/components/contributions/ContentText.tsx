import React from "react";

interface ContentTextProps {
  content: string;
}

const ContentText: React.FC<ContentTextProps> = ({ content }) => {
  // Funktion zum Parsen von Markierungen im Text
  const parseHighlights = (text: string) => {
    const parts = text.split(/(==.*?==)/g);

    return parts.map((part, index) => {
      if (part.startsWith("==") && part.endsWith("==")) {
        // Entferne die == Markierungen und füge subtiles Code-Styling hinzu
        const highlightedText = part.slice(2, -2);
        return (
          <code 
            key={index} 
            className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200"
          >
            {highlightedText}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="mb-6">
      <p className="text-gray-700 leading-relaxed text-base">
        {parseHighlights(content)}
      </p>
    </div>
  );
};

export default ContentText;