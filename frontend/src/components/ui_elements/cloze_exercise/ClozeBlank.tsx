import { memo, useState } from "react";
import { SolutionWord } from "./SolutionWordBank";

export interface ClozeBlankProps {
  id: string;
  showSolutionWords: boolean;

  // Drag&Drop-Modus
  currentWord?: Pick<SolutionWord, "id" | "word"> | null;
  onDropWord?: (wordId: string) => void; // Drop aus Wordbank => in diese Lücke
  onCtrlClear?: (wordId: string) => void; // Ctrl/Cmd-Klick auf belegte Lücke => leeren

  // Eingabemodus
  inputValue?: string;
  onInputChange?: (value: string) => void;

  dataTestId?: string;
}

const ClozeBlank = memo<ClozeBlankProps>(
  ({
    id,
    showSolutionWords,
    currentWord = null,
    onDropWord,
    onCtrlClear,
    inputValue = "",
    onInputChange,
  }) => {
    // Lokaler Hover-State (ersetzt den bisherigen parent-state für visuelle Hervorhebung)
    const [hovered, setHovered] = useState(false);

    // Hilfsfunktionen für DnD
    const handleDragStart = (
      e: React.DragEvent<HTMLDivElement>,
      wordId: string,
    ) => {
      e.dataTransfer.setData("wordId", wordId);
    };

    const handleDropEvent = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setHovered(false);
      const wordId = e.dataTransfer.getData("wordId");
      if (wordId && onDropWord) onDropWord(wordId);
    };

    if (showSolutionWords) {
      // --- Drag & Drop Modus ---
      return (
        <div
          key={id}
          data-testid={`blank-${id}`}
          onDragEnter={() => setHovered(true)}
          onDragLeave={() => setHovered(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropEvent}
          onClick={(e) => {
            if ((e.ctrlKey || e.metaKey) && currentWord?.id && onCtrlClear) {
              e.preventDefault();
              onCtrlClear(currentWord.id);
            }
          }}
          className={`inline-flex items-center justify-center min-w-[60px] min-h-[2.4rem] border-b-2 border-gray-400 text-center transition-colors ${
            hovered ? "bg-dsp-orange_light/50" : ""
          }`}
        >
          {currentWord && (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, currentWord.id)}
              className="px-2 py-1 bg-dsp-orange_light/50 border border-dsp-orange_medium/60 rounded-xl cursor-grab select-none text-base"
            >
              {currentWord.word}
            </div>
          )}
        </div>
      );
    }

    // --- Eingabe-Modus ---
    return (
      <div
        key={id}
        className="inline-flex items-center justify-center border-b-2 border-gray-400 text-center align-baseline px-0.5"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            const value = e.currentTarget.value;
            if (onInputChange) onInputChange(value);
            // dynamische Breite wie bisher
            e.currentTarget.style.width = `${Math.max(6, value.length)}ch`;
          }}
          style={{
            width: `${Math.max(6, inputValue?.length ?? 0)}ch`,
          }}
          className="text-center bg-transparent focus:outline-none text-gray-700 placeholder-gray-300 transition-[width] duration-150 ease-in-out"
        />
      </div>
    );
  },
);

ClozeBlank.displayName = "ClozeBlank";
export default ClozeBlank;
