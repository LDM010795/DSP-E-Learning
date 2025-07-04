import React from "react";

interface TOCItem {
  title: string;
  level?: number;
}

interface ContentTableOfContentsProps {
  items: TOCItem[];
}

const ContentTableOfContents: React.FC<ContentTableOfContentsProps> = ({
  items,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Inhaltsverzeichnis
      </h3>

      <ol className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className={`flex items-start ${item.level === 2 ? "ml-4" : ""}`}
          >
            <span className="text-gray-700 font-medium mr-2 mt-0.5">
              {index + 1}.
            </span>
            <span className="text-gray-700 hover:text-dsp-orange cursor-pointer transition-colors duration-200">
              {item.title}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ContentTableOfContents;
