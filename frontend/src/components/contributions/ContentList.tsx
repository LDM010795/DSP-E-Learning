import React from "react";

interface ContentListProps {
  items: string[];
}

const ContentList: React.FC<ContentListProps> = ({ items }) => {
  return (
    <ul className="space-y-3 mb-6">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-gray-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
};

export default ContentList;
