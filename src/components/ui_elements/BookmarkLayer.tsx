import React from "react";
import { createPortal } from "react-dom";

export type Bookmark = {
  id: string;
  y: number; // absolute document offset in px
  label?: string;
  createdAt: number;
};

type BookmarkLayerProps = {
  bookmarks: Bookmark[];
  containerMaxWidth?: number; // e.g. 1100
};

const BookmarkLayer: React.FC<BookmarkLayerProps> = ({
  bookmarks,
  containerMaxWidth = 1100,
}) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {bookmarks.map((b) => (
        <div
          key={`bm-${b.id}`}
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-40"
          style={{ top: b.y, width: `min(90vw, ${containerMaxWidth}px)` }}
        >
          <div className="h-0 border-t-2 border-amber-400/70" />
          <div className="mt-1 inline-block rounded bg-amber-500/80 px-2 py-0.5 text-[10px] text-white shadow">
            Lesezeichen
          </div>
        </div>
      ))}
    </>,
    document.body,
  );
};

export default BookmarkLayer;
