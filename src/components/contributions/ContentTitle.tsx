import React from "react";
import { ContentTitleProps } from "./types";

const ContentTitle: React.FC<ContentTitleProps> = ({ text, level = 1 }) => {
  // Debug: Title-Block Inhalt loggen
  console.log("📝 ContentTitle received:", { text, level });

  // Bereinige Titel-Text (entferne "Titel2$", "Titel3$" Marker)
  const cleanText = text
    .replace(/^Titel[23]?\$\s*/, "")
    .replace(/\s*Titel[23]?\$$/, "")
    .trim();

  const getTitleElement = () => {
    switch (level) {
      case 1:
        return (
          <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-6 leading-tight">
            {cleanText}
          </h1>
        );
      case 2:
        return (
          <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-5 leading-tight">
            {cleanText}
          </h2>
        );
      case 3:
        return (
          <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4 leading-tight">
            {cleanText}
          </h3>
        );
      default:
        return (
          <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6">
            {cleanText}
          </h1>
        );
    }
  };

  return getTitleElement();
};

export default ContentTitle;
