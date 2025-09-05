import React from "react";
import { sanitizeHtmlBasic } from "./utils";

type NotesEditorProps = {
  value: string; // HTML
  onChange: (val: string) => void;
  className?: string;
  toolbarRight?: React.ReactNode; // e.g., Clear/Export buttons
};

const NotesEditor: React.FC<NotesEditorProps> = ({
  value,
  onChange,
  className = "",
  toolbarRight,
}) => {
  const divRef = React.useRef<HTMLDivElement | null>(null);

  const exec = (command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    // sync back
    if (divRef.current) onChange(divRef.current.innerHTML);
  };

  const listUnordered = () => exec("insertUnorderedList");
  const listOrdered = () => exec("insertOrderedList");
  const indent = () => exec("indent");
  const outdent = () => exec("outdent");
  const undo = () => exec("undo");
  const redo = () => exec("redo");
  const removeFormat = () => exec("removeFormat");

  return (
    <div className={["w-full", className].join(" ")}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => exec("bold")}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Fett"
            aria-label="Fett"
          >
            B
          </button>
          <button
            onClick={() => exec("italic")}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Kursiv"
            aria-label="Kursiv"
          >
            I
          </button>
          <button
            onClick={() => exec("underline")}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Unterstreichen"
            aria-label="Unterstreichen"
          >
            U
          </button>
          <span className="mx-1 h-5 w-px bg-gray-200" />
          <button
            onClick={listUnordered}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Aufzählung"
            aria-label="Aufzählung"
          >
            •
          </button>
          <button
            onClick={listOrdered}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Nummerierung"
            aria-label="Nummerierung"
          >
            1.
          </button>
          <button
            onClick={indent}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Einrücken"
            aria-label="Einrücken"
          >
            »
          </button>
          <button
            onClick={outdent}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Ausrücken"
            aria-label="Ausrücken"
          >
            «
          </button>
          <span className="mx-1 h-5 w-px bg-gray-200" />
          <button
            onClick={() => exec("foreColor", "var(--color-dsp-orange)")}
            className="h-6 w-6 rounded-full border border-white shadow ring-1 ring-orange-300"
            style={{ backgroundColor: "var(--color-dsp-orange)" }}
            title="Textfarbe DSP-Orange"
            aria-label="Textfarbe DSP-Orange"
          />
          <button
            onClick={() => exec("foreColor", "#2563eb")}
            className="h-6 w-6 rounded-full border border-white shadow ring-1 ring-blue-300"
            style={{ backgroundColor: "#2563eb" }}
            title="Textfarbe Blau"
            aria-label="Textfarbe Blau"
          />
          <button
            onClick={removeFormat}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Formatierung entfernen"
            aria-label="Formatierung entfernen"
          >
            Clear
          </button>
          <span className="mx-1 h-5 w-px bg-gray-200" />
          <button
            onClick={undo}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Rückgängig"
            aria-label="Rückgängig"
          >
            ↶
          </button>
          <button
            onClick={redo}
            className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            title="Wiederholen"
            aria-label="Wiederholen"
          >
            ↷
          </button>
        </div>
        {toolbarRight}
      </div>
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          if (!divRef.current) return;
          const html = divRef.current.innerHTML;
          onChange(sanitizeHtmlBasic(html));
        }}
        className="h-[70vh] w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 prose prose-sm max-w-none whitespace-pre-wrap"
        dir="ltr"
        dangerouslySetInnerHTML={{ __html: value }}
        aria-label="Eigene Notizen"
        onPaste={(e) => {
          e.preventDefault();
          const data = e.clipboardData;
          if (!data || !divRef.current) return;
          const html = data.getData("text/html") || data.getData("text/plain");
          const cleaned = sanitizeHtmlBasic(html);
          document.execCommand("insertHTML", false, cleaned);
          // Sync back
          const current = divRef.current.innerHTML;
          onChange(current);
        }}
      />
    </div>
  );
};

export default NotesEditor;
