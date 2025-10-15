import React from "react";

// Definiert die möglichen Schwierigkeitsgrade
export type DifficultyLevel = "Einfach" | "Mittel" | "Schwer";

interface TagDifficultyProps {
  difficulty: DifficultyLevel;
}

const TagDifficulty: React.FC<TagDifficultyProps> = ({ difficulty }) => {
  // Bestimmt die Tailwind CSS Klassen basierend auf der Schwierigkeit
  const getDifficultyClasses = (level: DifficultyLevel): string => {
    switch (level) {
      case "Einfach":
        return "bg-green-100 text-green-800"; // Grüner Hintergrund, dunkler grüner Text
      case "Mittel":
        return "bg-yellow-100 text-yellow-800"; // Gelber Hintergrund, dunkler gelber Text
      case "Schwer":
        return "bg-red-100 text-red-800"; // Roter Hintergrund, dunkler roter Text
      default:
        return "bg-gray-100 text-gray-800"; // Standard-Fallback
    }
  };

  const difficultyClasses = getDifficultyClasses(difficulty);

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${difficultyClasses}`}
    >
      {difficulty}
    </span>
  );
};

export default TagDifficulty;
