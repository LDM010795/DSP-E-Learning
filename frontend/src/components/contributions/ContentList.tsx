import React from "react";
import { ContentListProps } from "./types";

const ContentList: React.FC<ContentListProps> = ({ items }) => {
  return (
    <ul className="list-disc list-inside space-y-2 my-4 text-gray-800 leading-7">
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
};

export default ContentList;
