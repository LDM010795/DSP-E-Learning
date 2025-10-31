import { useState, useRef, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Prism from "prismjs";
import { useDragListener } from "./hooks/useDragListener";
import { useRowRects } from "./hooks/useRowRects";
import { useReorderPreview } from "./hooks/useReorderPreview";
import { commitReordering } from "./hooks/commitReordering";
import { mapLanguage } from "./helper/codeLinesHelper";
import { useInsertIndex } from "./hooks/useInsertIndex";

export interface DraggableCodeLine {
  id: string;
  code: string;
}

export type DraggableLinesCodeEditorProps = {
  lines: DraggableCodeLine[];
  codeLanguage: string;
  filename?: string;
  className?: string;
  onChange?: (lines: DraggableCodeLine[]) => void;
};

export default function DraggableLinesCodeEditor({
  lines: initial,
  codeLanguage = "typescript",
  filename = "snippet.ts",
  className,
  onChange,
}: DraggableLinesCodeEditorProps) {
  const language = mapLanguage(codeLanguage);

  // die durcheinandergewürfelten Codezeilen
  const [lines, setLines] = useState<DraggableCodeLine[]>(initial);

  // ID der aktuell gedraggden Codezeile
  const [dragId, setDragId] = useState<string | null>(null);

  // ID der Zeile, über die gerade gedragged (noch nicht gedropped!) wird
  const [targetDragIndex, setTargetDragIndex] = useState<number | null>(null);

  // Mess-System zur dynamischen, animierten Code-Verschiebung
  const { setRowRef, measureAll, getRects, resetRects } = useRowRects();

  // CodeEditor-Div (fürs Draggen darüber hinaus)
  const containerRef = useRef<HTMLDivElement | null>(null);

  // temporäre Vorschau der Codezeilen während Drag
  const visibleLines = useReorderPreview(lines, dragId, targetDragIndex);

  // Aus Mauszeiger-Position targetDragIndex berechnen
  const { updateFromY } = useInsertIndex({
    getRects,
    getDraggedId: () => dragId,
    onIndex: (i) => setTargetDragIndex(prev => prev === i ? prev : i),
  });

  // Wenn gedroppt wird, Lines neu anordnen
  const commitReorder = commitReordering({
    dragId,
    targetDragIndex,
    setLines,
    onChange,
    onAfterCommit: () => {
      setDragId(null);
      setTargetDragIndex(null);
      resetRects();
    },
  });

  useEffect(() => setLines(initial), [initial]);

  useDragListener({
    active: !!dragId, // nur aktiv, solange wirklich gezogen wird
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault();
      commitReorder();
    },
  });

  // Measure geometry on drag start
  const measureOnDragStart = (draggedId: string) => {
    measureAll();
    setDragId(draggedId);
  };

  // Handle drag end reset
  const handleDragEndReset = () => {
    setDragId(null);
    setTargetDragIndex(null);
    resetRects();
  };

  return (
    <div
      className={`rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 mb-4 ${className || ""}`}
      data-testid="scrambled-code-ui"
    >
      {/* Header */}
      <div className="flex items-center h-9 px-2 border-b border-neutral-800 bg-neutral-950/60">
        <div className="px-3 h-7 flex items-center rounded-t-md bg-neutral-900 border border-neutral-800 border-b-transparent">
          <span className="text-xs text-neutral-200">{filename}</span>
        </div>
        <span className="ml-auto text-[11px] text-neutral-500 pr-2">{codeLanguage}</span>
      </div>

      {/* Code lines */}
      <div className="font-mono text-sm px-2 py-1">
        <div
          ref={containerRef}
          className="flex flex-col gap-0"
          onDragOver={(e) => {
            if (dragId) {
              e.preventDefault();
              updateFromY(e.clientY);
            }
          }}
        >
          {visibleLines.map((line, idx) => (
            <CodeRow
              key={line.id}
              index={idx}
              line={line}
              language={language}
              onDragStartMeasure={measureOnDragStart}
              onDragEndReset={handleDragEndReset}
              setRowRef={setRowRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Single code line row
function CodeRow({
  line,
  index,
  language,
  onDragStartMeasure,
  onDragEndReset,
  setRowRef,
}: {
  line: DraggableCodeLine;
  index: number;
  language: string;
  onDragStartMeasure: (draggedId: string) => void;
  onDragEndReset: () => void;
  setRowRef: (id: string) => (el: HTMLDivElement | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const highlightedCodeHtml = useMemo(() => {
    const lang = (Prism.languages as any)[language] || Prism.languages.javascript;
    return Prism.highlight(line.code || "\u00A0", lang, language);
  }, [line.code, language]);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 600, damping: 40 }}
      className="grid grid-cols-[max-content_1fr] items-center"
      ref={setRowRef(line.id)}
    >
      {/* Line number */}
      <div className="select-none text-neutral-500/80 tabular-nums pr-4 pl-3 h-7 leading-7 flex items-center">
        {index + 1}{index + 1 < 10 ? "\u00A0" : ""}
      </div>

      {/* Code line */}
      <div
        className={`whitespace-pre text-neutral-100 px-3 h-7 leading-7 flex items-center font-mono select-none bg-neutral-900 rounded-lg border border-transparent cursor-grab active:cursor-grabbing ${isDragging ? "ring-2 ring-indigo-400 opacity-80" : "hover:border-neutral-700"
          }`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";

          // Transparent drag preview
          const img = new Image(); // invisible 1x1-SVG
          img.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=";

          e.dataTransfer.setDragImage(img, 0, 0);
          onDragStartMeasure(line.id);
          setIsDragging(true);
        }}
        onDragEnd={() => {
          setIsDragging(false);
          onDragEndReset();
        }}
        data-testid={`draggable-code-line-${line.id}`}
      >
        <div dangerouslySetInnerHTML={{ __html: highlightedCodeHtml }} />
      </div>
    </motion.div>
  );
}