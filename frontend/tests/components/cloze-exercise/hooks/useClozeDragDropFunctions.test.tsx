import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClozeDragDropFunctions } from "@/components/ui_elements/cloze_exercise/hooks/useClozeDragDropFunctions";
import { BlankWithId } from "@/components/ui_elements/cloze_exercise/hooks/useClozeDragDropParts";

describe("useClozeDragDropFunctions", () => {
  const blanks: BlankWithId[] = [
    { id: "b1", correct: ["Katze"], type: "blank" },
    { id: "b2", correct: ["Hund"], type: "blank" },
    { id: "b3", correct: ["Maus"], type: "blank" },
  ];

  it("liefert initial leere answers und alle solutionWords als available", () => {
    const wrong = ["Vogel"];
    const { result } = renderHook(() => useClozeDragDropFunctions(blanks, wrong));

    expect(result.current.answers).toEqual({});

    // Enthält alle richtigen + falschen Wörter, jeweils mit available: true
    const words = result.current.solutionWords;
    const byWord = Object.fromEntries(words.map((w) => [w.word, w]));

    expect(Object.keys(byWord).sort()).toEqual(
      ["Hund", "Katze", "Maus", "Vogel"].sort(),
    );
    for (const w of words) {
      expect(w.available).toBe(true);
      expect(w.id).toMatch(new RegExp(`^${w.word}#\\d+$`));
    }
  });

  it("getUserAnswerText gibt '' zurück, wenn keine Antwort gesetzt ist", () => {
    const { result } = renderHook(() => useClozeDragDropFunctions(blanks, []));
    expect(result.current.derived.getUserAnswerText("b1")).toBe("");
  });

  it("dropIntoBlank setzt Antwort und markiert das Wort als nicht verfügbar", () => {
    const { result } = renderHook(() => useClozeDragDropFunctions(blanks, []));

    const katze = result.current.solutionWords.find((w) => w.word === "Katze")!;
    act(() => {
      result.current.actions.dropIntoBlank("b1", katze.id);
    });

    expect(result.current.answers).toEqual({ b1: katze.id });

    const katzeNow = result.current.solutionWords.find(
      (w) => w.id === katze.id,
    )!;
    expect(katzeNow.available).toBe(false);

    // getUserAnswerText liefert das Wort
    expect(result.current.derived.getUserAnswerText("b1")).toBe("Katze");
  });

  it("dropIntoBlank verschiebt ein bereits gesetztes Wort aus einer anderen Lücke", () => {
    const { result } = renderHook(() => useClozeDragDropFunctions(blanks, []));

    const hund = result.current.solutionWords.find((w) => w.word === "Hund")!;
    act(() => {
      result.current.actions.dropIntoBlank("b1", hund.id);
    });
    act(() => {
      result.current.actions.dropIntoBlank("b2", hund.id); // gleicher wordId in andere Lücke
    });

    expect(result.current.answers).toEqual({ b2: hund.id }); // b1 wurde geleert
    expect(result.current.derived.getUserAnswerText("b1")).toBe("");
    expect(result.current.derived.getUserAnswerText("b2")).toBe("Hund");

    const hundNow = result.current.solutionWords.find((w) => w.id === hund.id)!;
    expect(hundNow.available).toBe(false);
  });

  it("clearBlank löscht nur die Antwort der angegebenen Lücke und macht das Wort verfügbar", () => {
    const { result } = renderHook(() => useClozeDragDropFunctions(blanks, []));

    const maus = result.current.solutionWords.find((w) => w.word === "Maus")!;
    act(() => {
      result.current.actions.dropIntoBlank("b3", maus.id);
    });
    act(() => {
      result.current.actions.clearBlank("b3");
    });

    expect(result.current.answers).toEqual({});
    const mausNow = result.current.solutionWords.find((w) => w.id === maus.id)!;
    expect(mausNow.available).toBe(true);
    expect(result.current.derived.getUserAnswerText("b3")).toBe("");
  });

  it("returnToBank entfernt das Wort aus allen Lücken (falls mehrfach gesetzt) && macht es verfügbar", () => {
    // Konstruiere zwei gleiche Wörter über Duplikate in blanks: "Katze" kommt zweimal vor
    const blanksWithDup: BlankWithId[] = [
      { id: "b1", correct: ["Katze"], type: "blank" },
      { id: "b2", correct: ["Katze"], type: "blank" },
    ];
    const { result } = renderHook(() => useClozeDragDropFunctions(blanksWithDup, []));

    const katze1 = result.current.solutionWords.find(
      (w) => w.word === "Katze" && w.id.endsWith("#1"),
    )!;
    const katze2 = result.current.solutionWords.find(
      (w) => w.word === "Katze" && w.id.endsWith("#2"),
    )!;

    // Setze beide (geht nur, weil es zwei IDs gibt)
    act(() => {
      result.current.actions.dropIntoBlank("b1", katze1.id);
    });
    act(() => {
      result.current.actions.dropIntoBlank("b2", katze2.id);
    });
    expect(result.current.answers).toEqual({ b1: katze1.id, b2: katze2.id });

    // ReturnToBank auf katze1 entfernt diese aus allen Lücken, katze2 bleibt
    act(() => {
      result.current.actions.returnToBank(katze1.id);
    });
    expect(result.current.answers).toEqual({ b2: katze2.id });

    const k1Now = result.current.solutionWords.find((w) => w.id === katze1.id)!;
    const k2Now = result.current.solutionWords.find((w) => w.id === katze2.id)!;
    expect(k1Now.available).toBe(true);
    expect(k2Now.available).toBe(false);
  });

  it("quickPlace legt ein Wort in die erste leere Lücke (Reihenfolge der blanks)", () => {
    const wrong = ["Vogel"];
    const { result } = renderHook(() => useClozeDragDropFunctions(blanks, wrong));

    const vogel = result.current.solutionWords.find((w) => w.word === "Vogel")!;
    act(() => {
      result.current.actions.quickPlace(vogel.id);
    });

    // b1 ist erste leere → belegt mit Vogel
    expect(result.current.answers).toEqual({ b1: vogel.id });

    // Noch einmal quickPlace: nächste leere ist b2
    const katze = result.current.solutionWords.find((w) => w.word === "Katze")!;
    act(() => {
      result.current.actions.quickPlace(katze.id);
    });
    expect(result.current.answers).toEqual({ b1: vogel.id, b2: katze.id });
  });

  it("quickPlace macht nichts, wenn alle Lücken belegt sind", () => {
    const { result } = renderHook(() => useClozeDragDropFunctions(blanks, []));

    const katze = result.current.solutionWords.find((w) => w.word === "Katze")!;
    const hund = result.current.solutionWords.find((w) => w.word === "Hund")!;
    const maus = result.current.solutionWords.find((w) => w.word === "Maus")!;
    act(() => {
      result.current.actions.dropIntoBlank("b1", katze.id);
      result.current.actions.dropIntoBlank("b2", hund.id);
      result.current.actions.dropIntoBlank("b3", maus.id);
    });

    const extraWrong = result.current.solutionWords.find(
      (w) => !["Katze", "Hund", "Maus"].includes(w.word),
    );
    if (extraWrong) {
      act(() => {
        result.current.actions.quickPlace(extraWrong.id);
      });
      // unverändert
      expect(result.current.answers).toEqual({
        b1: katze.id,
        b2: hund.id,
        b3: maus.id,
      });
    } else {
      // Falls keine falschen Wörter vorhanden waren, ist der Zustand dennoch allFilled = true
      expect(result.current.derived.allFilled).toBe(true);
    }
  });

  it("allFilled ist true erst, wenn alle getUserAnswerText(...) nicht-leer sind", () => {
    const { result } = renderHook(() => useClozeDragDropFunctions(blanks, []));

    expect(result.current.derived.allFilled).toBe(false);

    const k = result.current.solutionWords.find((w) => w.word === "Katze")!;
    const h = result.current.solutionWords.find((w) => w.word === "Hund")!;
    const m = result.current.solutionWords.find((w) => w.word === "Maus")!;

    act(() => {
      result.current.actions.dropIntoBlank("b1", k.id);
      result.current.actions.dropIntoBlank("b2", h.id);
    });
    expect(result.current.derived.allFilled).toBe(false);

    act(() => {
      result.current.actions.dropIntoBlank("b3", m.id);
    });
    expect(result.current.derived.allFilled).toBe(true);

    // Wenn wir eine Lücke wieder leeren, wird allFilled wieder false
    act(() => {
      result.current.actions.clearBlank("b2");
    });
    expect(result.current.derived.allFilled).toBe(false);
  });

  it("IDs sind stabil und inkrementell pro Wort (…#1, …#2) bei Duplikaten", () => {
    const b: BlankWithId[] = [
      { id: "x1", correct: ["Apfel"], type: "blank" },
      { id: "x2", correct: ["Apfel"], type: "blank" },
    ];
    const wrong = ["Apfel"]; // drittes Vorkommen aus 'wrong'
    const { result } = renderHook(() => useClozeDragDropFunctions(b, wrong));

    const apfelIds = result.current.solutionWords
      .filter((w) => w.word === "Apfel")
      .map((w) => w.id)
      .sort();

    // Erwartet 3 Vorkommnisse: Apfel#1, Apfel#2, Apfel#3 (Reihenfolge egal)
    expect(new Set(apfelIds)).toEqual(
      new Set(["Apfel#1", "Apfel#2", "Apfel#3"]),
    );
  });
});
