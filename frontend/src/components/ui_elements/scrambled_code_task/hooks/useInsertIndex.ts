// hooks/useInsertIndex.ts
import { useCallback, useEffect, useRef } from "react";
import type { RowRect } from "./useRowRects";

export function useInsertIndex(opts: {
  getRects: () => RowRect[];
  getDraggedId: () => string | null;
  onIndex: (i: number) => void; // z.B. setTargetDragIndex
}) {
  const { getRects, getDraggedId, onIndex } = opts;

  // immer aktuelles onIndex ohne Re-creates
  const onIndexRef = useRef(onIndex);
  useEffect(() => { onIndexRef.current = onIndex; }, [onIndex]);

  // rAF-Throttle: speichere letztes Y, rechne max. 1x pro Frame
  const frameRef = useRef<number | null>(null);
  const latestYRef = useRef<number | null>(null);

  const compute = useCallback((y: number): number | null => {
    const dragId = getDraggedId();
    if (!dragId)
        return null;

    const rects = getRects();
    if (!rects.length)
        return null;

    const list = rects.filter(r => r.id !== dragId);
    for (let i = 0; i < list.length; i++) {
      const mid = (list[i].top + list[i].bottom) / 2;
      if (y < mid)
        return i;
    }
    return list.length;
  }, [getRects, getDraggedId]);

  const updateFromY = useCallback((y: number) => {
    latestYRef.current = y;
    if (frameRef.current != null)
        return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const yy = latestYRef.current;
      if (yy == null)
        return;
      const idx = compute(yy);
      if (idx != null)
        onIndexRef.current(idx);
    });
  }, [compute]);

  // Cleanup fallbacks
  useEffect(() => {
    return () => {
      if (frameRef.current != null)
        cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      latestYRef.current = null;
    };
  }, []);

  return { updateFromY };
}
