import React from "react";
import DraggableResizableWindow from "../overlays/DraggableResizableWindow";
import NotesEditor from "./NotesEditor";

type NotesWindowProps = {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  initialWidth?: number;
  initialHeight?: number;
};

const NotesWindow: React.FC<NotesWindowProps> = ({
  open,
  onClose,
  value,
  onChange,
  maxWidth = 794,
  maxHeight = 1123,
  initialWidth = 794,
  initialHeight = 1123,
}) => {
  return (
    <DraggableResizableWindow
      title="Notizen"
      open={open}
      onClose={onClose}
      initialWidth={initialWidth}
      initialHeight={initialHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      minWidth={360}
      minHeight={240}
    >
      <NotesEditor
        value={value}
        onChange={onChange}
        toolbarRight={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange("")}
              className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            >
              Leeren
            </button>
            <button
              onClick={() => {
                const doc = `<!doctype html><html><head><meta charset='utf-8'><title>Notizen</title></head><body>${value}</body></html>`;
                const blob = new Blob([doc], {
                  type: "text/html;charset=utf-8",
                });
                const a = document.createElement("a");
                const date = new Date().toISOString().slice(0, 10);
                const path = location.pathname
                  .replace(/\W+/g, "-")
                  .replace(/^-+|-+$/g, "");
                a.href = URL.createObjectURL(blob);
                a.download = `notizen-${path || "seite"}-${date}.html`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(a.href);
                a.remove();
              }}
              className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-500"
            >
              Exportieren
            </button>
          </div>
        }
      />
      <div className="mt-2 text-right text-xs text-gray-500">
        {value.replace(/<[^>]*>/g, "").length} Zeichen
      </div>
    </DraggableResizableWindow>
  );
};

export default NotesWindow;
