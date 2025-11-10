import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { ClozePartDragDrop } from "@/components/ui_elements/cloze_exercise/ClozeExerciseBase";
import { useClozeDragDropParts } from "@/components/ui_elements/cloze_exercise/hooks/useClozeDragDropParts";

describe("useClozeParts", () => {
  const baseCloze: ClozePartDragDrop[] = [
    { type: "text", text: "Die " },
    { type: "blank", correct: ["Katze"] },
    { type: "text", text: " frisst " },
    { type: "blank", correct: ["Fisch"] },
    { type: "text", text: "." },
  ];

  it("vergibt IDs nur an Blanks mit standard prefix 'b' und inkrementiert ab 0", () => {
    const { result } = renderHook(() => useClozeDragDropParts(baseCloze));

    const { partsWithIds, blanks } = result.current;

    expect(partsWithIds).toHaveLength(baseCloze.length);

    // Text-Parts bleiben Text und unverändert
    expect(partsWithIds[0]).toEqual({ type: "text", text: "Die " });
    expect(partsWithIds[2]).toEqual({ type: "text", text: " frisst " });
    expect(partsWithIds[4]).toEqual({ type: "text", text: "." });

    // Blank-Parts bekommen IDs b-0, b-1 …
    const b1 = partsWithIds[1];
    const b2 = partsWithIds[3];
    expect(b1).toMatchObject({ type: "blank", id: "b-0", correct: ["Katze"] });
    expect(b2).toMatchObject({ type: "blank", id: "b-1", correct: ["Fisch"] });

    // blanks enthält nur Blanks in der gleichen Reihenfolge
    expect(blanks.map((b) => b.id)).toEqual(["b-0", "b-1"]);
    expect(blanks.every((b) => b.type === "blank")).toBe(true);
  });

  it("respektiert den prefix aus opts", () => {
    const { result } = renderHook(() =>
      useClozeDragDropParts(baseCloze, { prefix: "x" }),
    );
    const { partsWithIds, blanks } = result.current;

    expect((partsWithIds[1] as any).id).toBe("x-0");
    expect((partsWithIds[3] as any).id).toBe("x-1");
    expect(blanks.map((b) => b.id)).toEqual(["x-0", "x-1"]);
  });

  it("hält Referenzen stabil, wenn clozeText und prefix gleich bleiben", () => {
    const cloze = baseCloze; // gleiche Referenz
    const { result, rerender } = renderHook(
      ({ c, p }: { c: ClozePartDragDrop[]; p?: string }) =>
        useClozeDragDropParts(c, { prefix: p }),
      { initialProps: { c: cloze, p: "b" } },
    );

    const firstParts = result.current.partsWithIds;
    const firstBlanks = result.current.blanks;

    // Re-render mit denselben Props -> gleiche Referenzen (useMemo hit)
    rerender({ c: cloze, p: "b" });

    expect(result.current.partsWithIds).toBe(firstParts);
    expect(result.current.blanks).toBe(firstBlanks);
  });

  it("recomputet und vergibt neue IDs, wenn prefix geändert wird", () => {
    const { result, rerender } = renderHook(
      ({ p }: { p: string }) => useClozeDragDropParts(baseCloze, { prefix: p }),
      { initialProps: { p: "b" } },
    );

    const before = result.current.partsWithIds;
    expect((before[1] as any).id).toBe("b-0");

    rerender({ p: "pfx" });

    const after = result.current.partsWithIds;
    expect(after).not.toBe(before);
    expect((after[1] as any).id).toBe("pfx-0");
    expect(result.current.blanks.map((b) => b.id)).toEqual(["pfx-0", "pfx-1"]);
  });

  it("recomputet, wenn clozeText-Referenz sich ändert (IDs starten wieder bei 0)", () => {
    const { result, rerender } = renderHook(
      ({ c }: { c: ClozePartDragDrop[] }) => useClozeDragDropParts(c),
      { initialProps: { c: baseCloze } },
    );

    const first = result.current.partsWithIds;
    expect((first[1] as any).id).toBe("b-0");

    // neue Array-Referenz, gleicher Inhalt
    const newCloze = [...baseCloze];
    rerender({ c: newCloze });

    const second = result.current.partsWithIds;
    expect(second).not.toBe(first); // useMemo invalidiert
    expect((second[1] as any).id).toBe("b-0"); // Zähler beginnt wieder bei 0
  });

  it("mutiert Original-Parts nicht: Text bleibt by-ref, Blank wird kopiert", () => {
    const local: ClozePartDragDrop[] = [
      { type: "text", text: "A" },
      { type: "blank", correct: ["B"] },
    ];
    const { result } = renderHook(() => useClozeDragDropParts(local));

    const parts = result.current.partsWithIds;

    // Text-Teil ist unverändert und gleiche Referenz
    expect(parts[0]).toBe(local[0]);

    // Blank-Teil ist ein NEUES Objekt (wegen spread + id) und Original hat keine 'id'
    expect(parts[1]).not.toBe(local[1]);
    expect((parts[1] as any).id).toBe("b-0");
    expect((local[1] as any).id).toBeUndefined();
  });

  it("blanks-Array enthält ausschließlich die Blank-Objekte inklusive IDs", () => {
    const { result } = renderHook(() =>
      useClozeDragDropParts(baseCloze, { prefix: "bb" }),
    );
    const { blanks } = result.current;

    expect(blanks).toHaveLength(2);
    expect(blanks.every((b) => b.type === "blank")).toBe(true);
    expect(blanks.map((b) => b.id)).toEqual(["bb-0", "bb-1"]);
    expect(blanks[0].correct).toEqual(["Katze"]);
    expect(blanks[1].correct).toEqual(["Fisch"]);
  });
});
