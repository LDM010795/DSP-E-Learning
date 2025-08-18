import React from "react";
import { createPortal } from "react-dom";

type DraggableResizableWindowProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  initialLeft?: number;
  initialTop?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  children: React.ReactNode;
  className?: string;
};

const DraggableResizableWindow: React.FC<DraggableResizableWindowProps> = ({
  title,
  open,
  onClose,
  initialWidth,
  initialHeight,
  initialLeft,
  initialTop,
  minWidth = 320,
  minHeight = 240,
  maxWidth,
  maxHeight,
  children,
  className = "",
}) => {
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;

  // Defaults to A4 portrait ~ 794 x 1123 @96dpi, clamped to viewport
  const defaultW = Math.min(
    initialWidth ?? 794,
    maxWidth ?? Number.POSITIVE_INFINITY,
    Math.max(minWidth, Math.floor(viewportW * 0.9)),
  );
  const defaultH = Math.min(
    initialHeight ?? 1123,
    maxHeight ?? Number.POSITIVE_INFINITY,
    Math.max(minHeight, Math.floor(viewportH * 0.9)),
  );

  const [rect, setRect] = React.useState({
    w: defaultW,
    h: defaultH,
    l: initialLeft ?? Math.max(16, Math.floor((viewportW - defaultW) / 2)),
    t: initialTop ?? Math.max(16, Math.floor((viewportH - defaultH) / 2)),
  });

  const dragState = React.useRef<{
    x: number;
    y: number;
    l: number;
    t: number;
  } | null>(null);
  const resizeState = React.useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const handleMouseDownHeader = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragState.current = { x: e.clientX, y: e.clientY, l: rect.l, t: rect.t };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd, { once: true });
  };

  const onDragMove = (e: MouseEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.x;
    const dy = e.clientY - dragState.current.y;
    const l = Math.min(Math.max(0, dragState.current.l + dx), viewportW - 80);
    const t = Math.min(Math.max(0, dragState.current.t + dy), viewportH - 48);
    setRect((r) => ({ ...r, l, t }));
  };

  const onDragEnd = () => {
    dragState.current = null;
    window.removeEventListener("mousemove", onDragMove);
  };

  const handleMouseDownResize = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    resizeState.current = { x: e.clientX, y: e.clientY, w: rect.w, h: rect.h };
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", onResizeEnd, { once: true });
  };

  const onResizeMove = (e: MouseEvent) => {
    if (!resizeState.current) return;
    const dx = e.clientX - resizeState.current.x;
    const dy = e.clientY - resizeState.current.y;
    const viewportLimitW = Math.max(0, viewportW - rect.l - 8);
    const viewportLimitH = Math.max(0, viewportH - rect.t - 8);
    const hardMaxW = Math.min(
      viewportLimitW,
      maxWidth ?? Number.POSITIVE_INFINITY,
    );
    const hardMaxH = Math.min(
      viewportLimitH,
      maxHeight ?? Number.POSITIVE_INFINITY,
    );
    const w = Math.min(
      Math.max(minWidth, resizeState.current.w + dx),
      hardMaxW,
    );
    const h = Math.min(
      Math.max(minHeight, resizeState.current.h + dy),
      hardMaxH,
    );
    setRect((r) => ({ ...r, w, h }));
  };

  // Clamp size if constraints change (e.g., props update)
  React.useEffect(() => {
    setRect((r) => {
      const viewportLimitW = Math.max(0, viewportW - r.l - 8);
      const viewportLimitH = Math.max(0, viewportH - r.t - 8);
      const hardMaxW = Math.min(
        viewportLimitW,
        maxWidth ?? Number.POSITIVE_INFINITY,
      );
      const hardMaxH = Math.min(
        viewportLimitH,
        maxHeight ?? Number.POSITIVE_INFINITY,
      );
      const w = Math.min(Math.max(minWidth, r.w), hardMaxW);
      const h = Math.min(Math.max(minHeight, r.h), hardMaxH);
      if (w !== r.w || h !== r.h) return { ...r, w, h };
      return r;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxWidth, maxHeight, minWidth, minHeight]);

  const onResizeEnd = () => {
    resizeState.current = null;
    window.removeEventListener("mousemove", onResizeMove);
  };

  React.useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mousemove", onResizeMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!open) return null;

  const node = (
    <div
      className="fixed inset-0 z-[60] pointer-events-none"
      aria-live="polite"
      role="presentation"
    >
      <div
        className={[
          "pointer-events-auto select-none rounded-xl border border-gray-200 bg-white/95 shadow-2xl backdrop-blur",
          "flex flex-col",
          className,
        ].join(" ")}
        style={{
          width: rect.w,
          height: rect.h,
          left: rect.l,
          top: rect.t,
          position: "fixed",
          maxWidth: maxWidth ?? undefined,
          maxHeight: maxHeight ?? undefined,
        }}
        role="dialog"
        aria-label={title}
        aria-modal={false}
      >
        <div
          className="cursor-move rounded-t-xl border-b border-[var(--color-dsp-orange_medium)] bg-[var(--color-dsp-orange)] px-3 py-2 text-sm font-medium text-white flex items-center justify-between"
          onMouseDown={handleMouseDownHeader}
          title="Zum Verschieben gedrückt halten"
        >
          <span>{title}</span>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-xs text-white/90 hover:bg-white/10"
            aria-label="Fenster schließen"
          >
            Schließen
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2">{children}</div>
        <button
          type="button"
          className="absolute bottom-2 right-2 h-7 w-7 cursor-se-resize rounded-full bg-[var(--color-dsp-orange)] text-white shadow-md hover:bg-[color-mix(in_oklab,var(--color-dsp-orange)_90%,white)] focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center justify-center"
          onMouseDown={handleMouseDownResize}
          aria-label="Größe ändern"
          title="Größe ändern"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
          >
            <path
              d="M6 14 L14 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 14 L14 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 14 L14 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(node, document.body);
};

export default DraggableResizableWindow;
