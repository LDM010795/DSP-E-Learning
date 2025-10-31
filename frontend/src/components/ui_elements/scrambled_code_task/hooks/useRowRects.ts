import { useRef, useCallback } from "react";

export type RowRect = { id: string; top: number; bottom: number; height: number };

export function useRowRects() {
  const mapRef = useRef<Record<string, HTMLDivElement | null>>({});
  const rectsRef = useRef<RowRect[]>([]);

  // Zuweisung der Refs
  const setRowRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    mapRef.current[id] = el;
  }, []);

  // Vermisst aktuelle DOM-Positionen
  const measureAll = useCallback((): RowRect[] => {
    const rects: RowRect[] = [];
    for (const [id, el] of Object.entries(mapRef.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      rects.push({ id, top: r.top, bottom: r.bottom, height: r.height });
    }
    rects.sort((a, b) => a.top - b.top);
    rectsRef.current = rects;
    return rects;
  }, []);

  // Zugriff auf letzten Messwert
  const getRects = useCallback(() => rectsRef.current, []);

  // Optional: reset bei Bedarf
  const resetRects = useCallback(() => {
    rectsRef.current = [];
  }, []);

  return { setRowRef, measureAll, getRects, resetRects };
}
