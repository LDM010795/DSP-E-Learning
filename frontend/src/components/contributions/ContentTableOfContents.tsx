import React from "react";
import { ContentTableOfContentsProps } from "./types";

const ContentTableOfContents: React.FC<ContentTableOfContentsProps> = ({
  items,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Inhaltsverzeichnis
      </h3>
      <ul className="list-decimal list-inside space-y-2 text-gray-700">
        {items.map((item, index) => (
          <li key={index} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentTableOfContents;
