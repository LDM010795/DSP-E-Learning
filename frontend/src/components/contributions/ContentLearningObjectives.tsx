import React from "react";

interface ContentLearningObjectivesProps {
  objectives: string[];
}

const ContentLearningObjectives: React.FC<ContentLearningObjectivesProps> = ({
  objectives,
}) => {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-orange-900">Lernziele</h3>
      </div>

      <ul className="space-y-3">
        {objectives.map((objective, index) => (
          <li key={index} className="flex items-start">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <span className="text-gray-700 leading-relaxed">{objective}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentLearningObjectives;
