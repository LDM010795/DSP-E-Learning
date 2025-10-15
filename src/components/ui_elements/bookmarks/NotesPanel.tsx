import React from "react";
import NotesEditor from "./NotesEditor";

type NotesPanelProps = {
  value: string;
  onChange: (val: string) => void;
  onExport: () => void;
  onClear: () => void;
};

const NotesPanel: React.FC<NotesPanelProps> = ({
  value,
  onChange,
  onExport,
  onClear,
}) => {
  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-2 py-1">
        <div className="text-xs font-medium text-gray-700">Notizen</div>
        <div className="text-[10px] text-gray-400">{value.length} Zeichen</div>
      </div>
      <div className="p-2">
        <NotesEditor
          value={value}
          onChange={onChange}
          toolbarRight={
            <div className="flex items-center gap-2">
              <button
                onClick={onClear}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                Leeren
              </button>
              <button
                onClick={onExport}
                className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-500"
              >
                Exportieren
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default NotesPanel;
