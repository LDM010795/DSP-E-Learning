import React, { useCallback, useEffect, useMemo, useState } from "react";
// no portal usage anymore
import { Bookmark } from "../bookmarks/types";
import { closestBlock, getCssPath } from "../bookmarks/utils";
import BookmarkPanel from "../bookmarks/BookmarkPanel";
import NotesWindow from "../bookmarks/NotesWindow";

type BookmarkButtonProps = {
  storageKey?: string; // key for localStorage scoping per page/module
  className?: string;
};

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  storageKey = "article-bookmarks",
  className = "",
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [open, setOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [notesWindowOpen, setNotesWindowOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Scope bookmarks by pathname to avoid collisions across pages
  const scopedKey = useMemo(
    () => `${storageKey}:${location.pathname}`,
    [storageKey]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(scopedKey);
      if (raw) setBookmarks(JSON.parse(raw));
    } catch (e) {
      console.warn("Bookmark load failed", e);
    }
    try {
      const storedNotes = localStorage.getItem(`${scopedKey}:notes`);
      if (typeof storedNotes === "string") setNotes(storedNotes);
    } catch (e) {
      console.warn("Notes load failed", e);
    }
  }, [scopedKey]);

  useEffect(() => {
    try {
      localStorage.setItem(scopedKey, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn("Bookmark save failed", e);
    }
  }, [bookmarks, scopedKey]);

  // Debounced notes save
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(`${scopedKey}:notes`, notes);
      } catch (e) {
        console.warn("Notes save failed", e);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [notes, scopedKey]);

  // keine Scroll-Tracking nötig – Marker werden absolut im Dokument verankert

  // util-Funktionen importiert

  // Selection mode: click anywhere to drop a bookmark at that text position
  useEffect(() => {
    if (!selecting) return;
    const onClick = (e: MouseEvent) => {
      // Ignore clicks on the control itself
      const target = e.target as HTMLElement;
      if (target.closest('[data-bookmark-controls="true"]')) return;
      const y = Math.max(0, Math.floor((window.scrollY || 0) + e.clientY));
      const anchor = closestBlock(target) || target;
      const path = getCssPath(anchor);
      const id = `${Date.now()}-${y}`;
      setBookmarks((prev) => [...prev, { id, y, path, createdAt: Date.now() }]);
      setSelecting(false);
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [selecting]);

  // 'handleAdd' wird durch die Toolbar ersetzt

  const handleJump = useCallback((y: number, path?: string) => {
    if (path) {
      const el = document.querySelector(path) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // kurze visuelle Bestätigung: Ring highlight für 1.2s
        el.classList.add(
          "ring-2",
          "ring-amber-400",
          "ring-offset-2",
          "ring-offset-transparent"
        );
        window.setTimeout(() => {
          el.classList.remove(
            "ring-2",
            "ring-amber-400",
            "ring-offset-2",
            "ring-offset-transparent"
          );
        }, 1200);
        return;
      }
    }
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  // Apply visual highlight to anchored elements
  useEffect(() => {
    // Clear previous highlights
    document.querySelectorAll("[data-bm-id]").forEach((n) => {
      n.removeAttribute("data-bm-id");
      (n as HTMLElement).classList.remove(
        "relative",
        "pl-2",
        "shadow-[inset_3px_0_0_#f59e0b]"
      );
    });
    bookmarks.forEach((b) => {
      if (!b.path) return;
      const el = document.querySelector(b.path) as HTMLElement | null;
      if (el) {
        el.setAttribute("data-bm-id", b.id);
        el.classList.add("relative", "pl-2", "shadow-[inset_3px_0_0_#f59e0b]");
      }
    });
    return () => {
      // cleanup on unmount
      document.querySelectorAll("[data-bm-id]").forEach((n) => {
        n.removeAttribute("data-bm-id");
        (n as HTMLElement).classList.remove(
          "relative",
          "pl-2",
          "shadow-[inset_3px_0_0_#f59e0b]"
        );
      });
    };
  }, [bookmarks]);

  const handleClear = useCallback(() => {
    setBookmarks([]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleStartEdit = useCallback((id: string, current?: string) => {
    setEditingId(id);
    setEditValue(current ?? "");
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId) return;
    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === editingId ? { ...b, label: editValue.trim() || b.label } : b
      )
    );
    setEditingId(null);
    setEditValue("");
  }, [editingId, editValue]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  return (
    <div
      data-bookmark-controls="true"
      className={["fixed bottom-6 right-6 z-50", className].join(" ")}
      aria-live="polite"
      aria-label="Lesezeichen-Steuerung"
    >
      {/* Edge pill button (icon only) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Lesezeichen öffnen/schließen"
        aria-expanded={open}
        className="group fixed right-0 bottom-6 h-12 w-12 -translate-x-1/3 rounded-l-full bg-amber-600 text-white shadow-lg hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M5 3a2 2 0 00-2 2v12l6-3 6 3V5a2 2 0 00-2-2H5z" />
        </svg>
      </button>

      {/* List popover */}
      {open && (
        <BookmarkPanel
          bookmarks={bookmarks}
          selecting={selecting}
          onToggleSelecting={() => setSelecting((v) => !v)}
          notesOpen={notesOpen}
          onToggleNotes={() => {
            setNotesOpen(true);
            setNotesWindowOpen(true);
          }}
          onClose={() => setOpen(false)}
          onClearAll={handleClear}
          editingId={editingId}
          editValue={editValue}
          onChangeEditValue={setEditValue}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onRemove={handleRemove}
          onJump={handleJump}
        />
      )}

      {/* Hinweis: visuelle Linien-Markierung entfernt; wir markieren stattdessen den Anker-Block selbst */}

      <NotesWindow
        open={notesWindowOpen}
        onClose={() => setNotesWindowOpen(false)}
        value={notes}
        onChange={setNotes}
        maxWidth={794}
        maxHeight={1123}
        initialWidth={794}
        initialHeight={1123}
      />
    </div>
  );
};

export default BookmarkButton;
