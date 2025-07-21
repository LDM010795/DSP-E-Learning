import React, { useState } from "react";
import MultipleChoice, { MultipleChoiceOption } from "../components/ui_elements/MultipleChoice/multiple_choice";

// Example question and options
const question = "Was ist Python?";
const options: MultipleChoiceOption[] = [
  { id: "1", answer: "Python ist eine interpretierte Sprache" },
  { id: "2", answer: "Python ist eine kompilierte Sprache" },
  { id: "3", answer: "Python ist eine Maschinensprache" },
  { id: "4", answer: "Python ist eine Hardware-Sprache" },
];
const correctAnswer = "1";
const explanation = "Python wird zur Laufzeit interpretiert, nicht kompiliert.";

const MultipleChoiceDemo: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowResult(true);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Multiple Choice Demo</h2>
      <MultipleChoice
        question={question}
        options={options}
        selectedId={selectedId}
        onSelect={handleSelect}
        disabled={!!selectedId}
      />
      {showResult && (
        <div className="mt-6">
          {selectedId === correctAnswer ? (
            <div className="text-green-600 font-semibold">Richtig!</div>
          ) : (
            <div className="text-red-600 font-semibold">Falsch!</div>
          )}
          <div className="mt-2 text-gray-700">
            <strong>Erklärung:</strong> {explanation}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceDemo;
