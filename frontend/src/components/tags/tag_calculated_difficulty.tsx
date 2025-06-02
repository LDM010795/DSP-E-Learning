import React from "react";
import TagDifficulty from "./tag_difficulty";
// Importiere DifficultyLevel Typ oder definiere ihn
import type { DifficultyLevel } from "./tag_difficulty"; // Annahme: TagDifficulty exportiert diesen Typ
// Importiere den Task-Typ aus dem Context
import type { Task } from "../../context/ModuleContext";

// Entferne die lokale Task-Definition
// export interface Task {
//   id: string;
//   title: string;
//   description: string;
//   difficulty: DifficultyLevel;
// }

interface TagCalculatedDifficultyProps {
  tasks?: Task[]; // Verwendet jetzt den importierten Task-Typ
}

const TagCalculatedDifficulty: React.FC<TagCalculatedDifficultyProps> = ({
  tasks,
}) => {
  // Funktion zur Berechnung (intern) - verwendet jetzt Task mit number ID (aber ID wird ignoriert)
  const calculateAverageDifficulty = (
    localTasks: Task[]
  ): DifficultyLevel | null => {
    if (!localTasks || localTasks.length === 0) {
      return null;
    }

    // Die Difficulty Strings sollten mit denen im Context Task übereinstimmen
    const difficultyMap: Record<string, number> = {
      Einfach: 1,
      Mittel: 2,
      Schwer: 3,
    };

    const totalDifficultyScore = localTasks.reduce(
      (sum, task) => sum + (difficultyMap[task.difficulty] || 0), // Greift auf task.difficulty zu
      0
    );

    const averageScore = totalDifficultyScore / localTasks.length;

    if (averageScore < 1.7) {
      return "Einfach";
    } else if (averageScore <= 2.3) {
      return "Mittel";
    } else {
      return "Schwer";
    }
  };

  const calculatedDifficulty = calculateAverageDifficulty(tasks || []);

  if (!calculatedDifficulty) {
    return null;
  }

  // Stelle sicher, dass TagDifficulty den Typ DifficultyLevel akzeptiert
  return <TagDifficulty difficulty={calculatedDifficulty} />;
};

export default TagCalculatedDifficulty;
