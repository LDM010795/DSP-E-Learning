// ClozeBlankDropSlot.test.tsx
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, createEvent } from "@testing-library/react";
import ClozeBlankDropSlot from "@/components/ui_elements/cloze_exercise/blanks/ClozeBlankDropSlot";
import { CLOZE_BLANK_STYLES } from "@/components/ui_elements/cloze_exercise/blanks/ClozeBlankBase";

const styles = CLOZE_BLANK_STYLES["text"];

function createDataTransfer(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    setData: vi.fn((type: string, val: string) => {
      store[type] = val;
    }),
    getData: vi.fn((type: string) => store[type] ?? ""),
    clearData: vi.fn((type?: string) => {
      if (!type) {
        Object.keys(store).forEach((k) => delete store[k]);
      } else {
        delete store[type];
      }
    }),
    get types() {
      return Object.keys(store);
    },
    dropEffect: "move",
    effectAllowed: "all",
    files: [] as File[],
    items: [] as unknown[],
  } as unknown as DataTransfer;
}

describe("ClozeBlankDropSlot", () => {
  it("rendert einen leeren Slot ohne Chip, wenn kein currentWord", () => {
    render(<ClozeBlankDropSlot id="b1" exerciseId="ex1" display_mode="text" />);
    const blank = screen.getByTestId("blank-b1");
    expect(blank).toBeInTheDocument();
    // Kein Chip im Inneren → kein Element mit draggable="true"
    expect(blank.querySelector('[draggable="true"]')).toBeNull();
  });

  it("rendert einen Chip, wenn currentWord gesetzt ist, und dieser ist draggable", () => {
    render(
      <ClozeBlankDropSlot
        id="b2"
        exerciseId="ex1"
        currentWord={{ id: "w1", word: "Hallo" }}
        display_mode="text"
      />,
    );
    const blank = screen.getByTestId("blank-b2");

    // Chip über Attribut finden (robuster als Klassen-Selektor)
    const chip = blank.querySelector('[draggable="true"]') as HTMLElement;
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent("Hallo");

    // DragStart schreibt korrekt in dataTransfer
    const dt = createDataTransfer();
    fireEvent.dragStart(chip, { dataTransfer: dt });
    expect(dt.setData).toHaveBeenCalledTimes(1);
    const payload = (dt.setData as any).mock.calls[0][1] as string;
    expect(JSON.parse(payload)).toEqual({ exerciseId: "ex1", wordId: "w1" });
  });

  it("setzt und entfernt Hover-Klasse bei DragEnter/DragLeave", () => {
    render(<ClozeBlankDropSlot id="b3" exerciseId="ex1" display_mode="text" />);
    const blank = screen.getByTestId("blank-b3");

    // Vorher/Nachher vergleichen
    fireEvent.dragEnter(blank);
    // Prüfen, dass mindestens ein Token aus bankHover gesetzt ist
    for (const token of (styles?.bankHover ?? "")
      .split(/\s+/)
      .filter(Boolean)) {
      expect(blank.classList.contains(token)).toBe(true);
    }

    fireEvent.dragLeave(blank);
    for (const token of (styles?.bankHover ?? "")
      .split(/\s+/)
      .filter(Boolean)) {
      expect(blank.classList.contains(token)).toBe(false);
    }
  });

  it("onDrop mit passender exerciseId ruft onDropWord(wordId) auf und entfernt Hover", () => {
    const onDropWord = vi.fn();
    render(
      <ClozeBlankDropSlot
        id="b4"
        exerciseId="ex1"
        onDropWord={onDropWord}
        display_mode="text"
      />,
    );
    const blank = screen.getByTestId("blank-b4");

    // Hover setzen
    fireEvent.dragEnter(blank);

    // Drop-Event explizit erzeugen, preventDefault spyon
    const dt = createDataTransfer({
      wordId: JSON.stringify({ exerciseId: "ex1", wordId: "w42" }),
    });
    const dropEvt = createEvent.drop(blank, { dataTransfer: dt });
    const preventDefaultSpy = vi.spyOn(dropEvt, "preventDefault");

    fireEvent(blank, dropEvt);

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    expect(onDropWord).toHaveBeenCalledWith("w42");

    // Hover-Klasse entfernt (Token-weise prüfen, falls mehrere Klassen)
    for (const token of (styles?.bankHover ?? "")
      .split(/\s+/)
      .filter(Boolean)) {
      expect(blank.classList.contains(token)).toBe(false);
    }
  });

  it("onDrop ignoriert Drops ohne Daten", () => {
    const onDropWord = vi.fn();
    render(
      <ClozeBlankDropSlot
        id="b5"
        exerciseId="ex1"
        onDropWord={onDropWord}
        display_mode="text"
      />,
    );
    const blank = screen.getByTestId("blank-b5");

    const dt = createDataTransfer(); // kein 'wordId' gesetzt
    fireEvent.drop(blank, { dataTransfer: dt, preventDefault: vi.fn() });
    expect(onDropWord).not.toHaveBeenCalled();
  });

  it("onDrop ignoriert Drops aus fremder ExerciseId", () => {
    const onDropWord = vi.fn();
    render(
      <ClozeBlankDropSlot
        id="b6"
        exerciseId="ex1"
        onDropWord={onDropWord}
        display_mode="text"
      />,
    );
    const blank = screen.getByTestId("blank-b6");

    const dt = createDataTransfer({
      wordId: JSON.stringify({ exerciseId: "other", wordId: "wX" }),
    });
    fireEvent.drop(blank, { dataTransfer: dt, preventDefault: vi.fn() });
    expect(onDropWord).not.toHaveBeenCalled();
  });

  it("DragOver verhindert Standardverhalten", () => {
    render(<ClozeBlankDropSlot id="b7" exerciseId="ex1" display_mode="text" />);
    const blank = screen.getByTestId("blank-b7");

    // echtes Event erzeugen
    const evt = createEvent.dragOver(blank);
    const preventDefaultSpy = vi.spyOn(evt, "preventDefault");

    fireEvent(blank, evt);

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("Ctrl-Klick auf den Slot ruft onCtrlClear(currentWord.id) auf", () => {
    const onCtrlClear = vi.fn();

    render(
      <ClozeBlankDropSlot
        id="b8"
        exerciseId="ex1"
        currentWord={{ id: "w7", word: "Foo" }}
        onCtrlClear={onCtrlClear}
        display_mode="text"
      />,
    );

    const blank = screen.getByTestId("blank-b8");

    // Explizit Event erzeugen
    const evt = createEvent.click(blank, { ctrlKey: true });
    const preventDefaultSpy = vi.spyOn(evt, "preventDefault");

    fireEvent(blank, evt);

    expect(onCtrlClear).toHaveBeenCalledWith("w7");
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("Meta-Klick (⌘) auf den Slot ruft ebenfalls onCtrlClear auf (macOS)", () => {
    const onCtrlClear = vi.fn();

    render(
      <ClozeBlankDropSlot
        id="b9"
        exerciseId="ex1"
        currentWord={{ id: "w9", word: "Bar" }}
        onCtrlClear={onCtrlClear}
        display_mode="text"
      />,
    );

    const blank = screen.getByTestId("blank-b9");

    // echtes Click-Event mit metaKey erzeugen
    const evt = createEvent.click(blank, { metaKey: true });
    const preventDefaultSpy = vi.spyOn(evt, "preventDefault");

    fireEvent(blank, evt);

    expect(onCtrlClear).toHaveBeenCalledWith("w9");
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });
});
