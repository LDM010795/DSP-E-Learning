import React from "react";
import { ContentLearningObjectivesProps } from "./types";

const ContentLearningObjectives: React.FC<ContentLearningObjectivesProps> = ({
  items,
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">Lernziele</h3>
      <ul className="list-disc list-inside space-y-2 text-blue-800">
        {items.map((objective, index) => (
          <li key={index} className="leading-relaxed">
            {objective}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentLearningObjectives;
