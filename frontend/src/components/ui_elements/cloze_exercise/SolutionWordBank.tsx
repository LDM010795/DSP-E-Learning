import { memo } from "react";

export type SolutionWord = { id: string; word: string; available: boolean };

export interface SolutionWordBankProps {
  words: SolutionWord[];
  exerciseId: string; // damit kein Drag'n'Drop in eine andere Exercise möglich ist
  onReturnToBank: (wordId: string) => void;
  onQuickPlace: (wordId: string) => void; // Ctrl/Cmd-Klick: erstes freies Blank füllen
}

const SolutionWordBank = memo<SolutionWordBankProps>(
  ({ words, onReturnToBank, onQuickPlace, exerciseId }) => {
    
    const handleDragStart = (
      e: React.DragEvent<HTMLDivElement>,
      wordId: string,
    ) => {
      e.dataTransfer.setData("wordId", JSON.stringify({ exerciseId, wordId }));
    };

    const handleReturnToBankEvent = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      
      const raw = e.dataTransfer.getData("wordId");
      if (!raw)
        return;

      const { exerciseId: src, wordId } = JSON.parse(raw);
      if (src !== exerciseId)
        return; // Wort einer fremden Cloze Exercise → ignorieren

      if (wordId)
        onReturnToBank(wordId);
    };

    return (
      <div
        className="flex flex-wrap gap-2 mb-4"
        data-testid="solution-wordbank"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleReturnToBankEvent}
      >
        {words.map((word) => {
          const handleCtrlClick = (e: React.MouseEvent) => {
            if ((e.ctrlKey || e.metaKey) && word.available) {
              e.preventDefault();
              onQuickPlace(word.id);
            }
          };

          return (
            <div
              key={word.id}
              draggable={word.available}
              onDragStart={(e) => word.available && handleDragStart(e, word.id)}
              onClick={handleCtrlClick}
              data-testid={`wordbank-${word.id}`}
              className={`px-3 py-1 border rounded-xl select-none transition-colors ${word.available
                ? "bg-dsp-orange_light/50 border-dsp-orange_medium/60 cursor-grab hover:text-dsp-orange"
                : "bg-gray-100 border-gray-100 text-gray-500 cursor-not-allowed"
                }`}
            >
              {word.word}
            </div>
          );
        })}
      </div>
    );
  },
);

SolutionWordBank.displayName = "SolutionWordBank";
export default SolutionWordBank;
