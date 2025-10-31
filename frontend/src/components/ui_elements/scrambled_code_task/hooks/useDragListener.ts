import { useRef, useEffect } from "react";

type DragHandler = (e: DragEvent) => void;

export function useDragListener({
    onDragOver,
    onDrop,
    active,
}: {
    onDragOver?: DragHandler;
    onDrop?: DragHandler;
    active: boolean;
}) {
    // Immer die neuesten Handler speichern (verhindert Stale Closures)
    const dragOverRef = useRef<DragHandler | undefined>(undefined);
    const dropRef = useRef<DragHandler | undefined>(undefined);
    useEffect(() => {
        dragOverRef.current = onDragOver;
    }, [onDragOver]);
    useEffect(() => {
        dropRef.current = onDrop;
    }, [onDrop]);

    // Stabile Wrapper, die nie wechseln, aber jeweils aktuelle Handler aufrufen
    const dragOverWrapperRef = useRef<DragHandler | null>(null);
    const dropWrapperRef = useRef<DragHandler | null>(null);
    if (!dragOverWrapperRef.current) {
        dragOverWrapperRef.current = (e) => dragOverRef.current?.(e);
    }
    if (!dropWrapperRef.current) {
        dropWrapperRef.current = (e) => dropRef.current?.(e);
    }

    useEffect(() => {
        if (!active || typeof window === "undefined") return;

        const dragOverWrapper = dragOverWrapperRef.current!;
        const dropWrapper = dropWrapperRef.current!;

        window.addEventListener("dragover", dragOverWrapper as any, { passive: false });
        window.addEventListener("drop", dropWrapper as any, { passive: false });

        return () => {
            window.removeEventListener("dragover", dragOverWrapper as any);
            window.removeEventListener("drop", dropWrapper as any);
        };
    }, [active]);
}