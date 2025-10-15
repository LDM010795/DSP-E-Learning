import React from "react";
// import { IoStarOutline } from 'react-icons/io5'; // Entfernt

interface TagScoreProps {
  score: number | string | null;
  maxScore: number | null;
  // Optionale Props für detailliertere Darstellung
  showPercentage?: boolean;
  className?: string;
}

const TagScore: React.FC<TagScoreProps> = ({
  score,
  maxScore,
  showPercentage = false, // Standardmäßig keine Prozentanzeige
  className = "bg-green-100 text-green-800", // Standard: Grün (für bestanden/bewertet)
}) => {
  // Prüfe, ob gültige Scores vorhanden sind
  const numericScore = typeof score === "string" ? parseFloat(score) : score;
  const numericMaxScore = maxScore;

  const isValidScore = typeof numericScore === "number" && !isNaN(numericScore);
  const isValidMaxScore =
    typeof numericMaxScore === "number" &&
    !isNaN(numericMaxScore) &&
    numericMaxScore > 0;

  let scoreText = "N/A"; // Fallback für die reine Score-Anzeige
  let percentage: number | null = null;

  if (isValidScore && isValidMaxScore) {
    scoreText = `${numericScore.toFixed(1)} / ${numericMaxScore.toFixed(0)}`;
    percentage = Math.round((numericScore / numericMaxScore) * 100);
  } else if (isValidScore) {
    scoreText = `${numericScore.toFixed(1)} Pkt.`; // Nur Punkte anzeigen, wenn Max unklar
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${className}`}
    >
      {/* <IoStarOutline className="mr-1.5" /> */} {/* Icon entfernt */}
      <span className="mr-1">Ergebnis:</span> {/* Text hinzugefügt */}
      {scoreText} {/* Angezeigter Score-Text */}
      {showPercentage && percentage !== null && (
        <span className="ml-1.5">({percentage}%)</span>
      )}
    </span>
  );
};

export default TagScore;
