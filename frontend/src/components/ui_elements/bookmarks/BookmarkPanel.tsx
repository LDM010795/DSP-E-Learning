import React from "react";
import { Bookmark } from "./types";

type BookmarkPanelProps = {
  bookmarks: Bookmark[];
  selecting: boolean;
  onToggleSelecting: () => void;
  notesOpen: boolean;
  onToggleNotes: () => void;
  onClose: () => void;
  onClearAll: () => void;
  editingId: string | null;
  editValue: string;
  onChangeEditValue: (val: string) => void;
  onStartEdit: (id: string, current?: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: (id: string) => void;
  onJump: (y: number, path?: string) => void;
};

const BookmarkPanel: React.FC<BookmarkPanelProps> = ({
  bookmarks,
  selecting,
  onToggleSelecting,
  notesOpen,
  onToggleNotes,
  onClose,
  onClearAll,
  editingId,
  editValue,
  onChangeEditValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
  onJump,
}) => {
  return (
    <div
      id="bm-popover"
      className="absolute bottom-14 right-0 max-h-80 w-[28rem] overflow-auto rounded-xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur"
    >
      {/* Mini-Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--color-dsp-orange_medium)] bg-[var(--color-dsp-orange)] px-2 py-1">
        <div className="text-xs font-semibold text-white">Lesezeichen</div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSelecting}
            className={[
              "rounded px-2 py-1 text-xs",
              selecting
                ? "bg-white/20 text-white ring-1 ring-white/40"
                : "text-white hover:bg-white/10",
            ].join(" ")}
            aria-pressed={selecting}
            aria-label="Lesezeichen an Position im Text setzen"
            title={
              selecting
                ? "Setzmodus aktiv – Klicke in den Text"
                : "Lesezeichen setzen"
            }
          >
            Setzen
          </button>
          <button
            onClick={onToggleNotes}
            className={[
              "rounded px-2 py-1 text-xs",
              notesOpen
                ? "bg-white/20 text-white ring-1 ring-white/40"
                : "text-white hover:bg-white/10",
            ].join(" ")}
            aria-pressed={notesOpen}
            aria-label="Notizen ein-/ausblenden"
            title="Notizen"
          >
            Notizen
          </button>
          <button
            onClick={onClearAll}
            className="rounded px-2 py-1 text-xs text-white hover:bg-white/10"
            aria-label="Alle Lesezeichen löschen"
            title="Alle löschen"
          >
            Leeren
          </button>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-xs text-white hover:bg-white/10"
            aria-label="Schließen"
            title="Schließen"
          >
            Schließen
          </button>
        </div>
      </div>

      <div className="p-2">
        {/* Bookmarks List */}
        <ul className="space-y-1">
          {bookmarks.map((b, i) => (
            <li key={b.id} className="flex items-stretch gap-1">
              {editingId === b.id ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => onChangeEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSaveEdit();
                      if (e.key === "Escape") onCancelEdit();
                    }}
                    className="flex-1 rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder={`Lesezeichen ${i + 1}`}
                    aria-label="Lesezeichen umbenennen"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveEdit();
                    }}
                    className="rounded-md px-2 py-1 text-xs text-amber-700 hover:bg-amber-50"
                    aria-label="Speichern"
                    title="Speichern"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelEdit();
                    }}
                    className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                    aria-label="Abbrechen"
                    title="Abbrechen"
                  >
                    Abbrechen
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onJump(b.y, b.path)}
                    className="flex-1 rounded-md px-2 py-1 text-left text-sm text-gray-800 hover:bg-amber-50 cursor-pointer"
                    title={b.label ?? `Position ${b.y}px`}
                    aria-label={`Zu Lesezeichen ${i + 1} springen`}
                  >
                    {b.label?.trim() ? b.label : `Lesezeichen ${i + 1}`}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEdit(b.id, b.label);
                    }}
                    aria-label="Lesezeichen umbenennen"
                    className="rounded-md px-2 py-1 text-xs text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Umbenennen"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(b.id);
                    }}
                    aria-label="Lesezeichen entfernen"
                    className="rounded-md px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50"
                    title="Entfernen"
                  >
                    ×
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* Keine Inline-Notizen mehr – Notizen öffnen als eigenes Fenster */}
      </div>
    </div>
  );
};

export default BookmarkPanel;
