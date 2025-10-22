import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, createEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import SolutionWordBank, {
  SolutionWord,
} from "@/components/ui_elements/cloze_exercise/SolutionWordBank";


function createDataTransfer(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    setData: vi.fn((type: string, val: string) => { store[type] = val; }),
    getData: vi.fn((type: string) => store[type] ?? ""),
    clearData: vi.fn((type?: string) => {
      if (!type) Object.keys(store).forEach((k) => delete store[k]);
      else delete store[type];
    }),
  } as unknown as DataTransfer;
}

const words: SolutionWord[] = [
  { id: "w1", word: "Katze", available: true },
  { id: "w2", word: "Hund", available: false },
  { id: "w3", word: "Maus", available: true },
];

describe("SolutionWordBank", () => {
  it("rendert alle Wörter und markiert nur verfügbare als draggable", () => {
    render(
      <SolutionWordBank
        exerciseId="ex1"
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={vi.fn()}
      />,
    );

    const w1 = screen.getByTestId("wordbank-w1");
    const w2 = screen.getByTestId("wordbank-w2");
    const w3 = screen.getByTestId("wordbank-w3");

    expect(w1).toHaveTextContent("Katze");
    expect(w2).toHaveTextContent("Hund");
    expect(w3).toHaveTextContent("Maus");

    expect(w1).toHaveAttribute("draggable", "true");
    expect(w2).toHaveAttribute("draggable", "false");
    expect(w3).toHaveAttribute("draggable", "true");
  });

  it("dragstart setzt Payload { exerciseId, wordId } für verfügbare Wörter", () => {
    render(
      <SolutionWordBank
        exerciseId="ex1"
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={vi.fn()}
      />,
    );
    const w1 = screen.getByTestId("wordbank-w1"); // available
    const dt = createDataTransfer();

    fireEvent.dragStart(w1, { dataTransfer: dt });
    expect(dt.setData).toHaveBeenCalledTimes(1);
    const payload = (dt.setData as any).mock.calls[0][1] as string;
    expect(JSON.parse(payload)).toEqual({ exerciseId: "ex1", wordId: "w1" });

    // Unavailable: handler sollte setData NICHT rufen
    const w2 = screen.getByTestId("wordbank-w2");
    const dt2 = createDataTransfer();
    fireEvent.dragStart(w2, { dataTransfer: dt2 });
    expect(dt2.setData).not.toHaveBeenCalled();
  });

  it("dragover auf der Bank verhindert Standardverhalten", () => {
    render(
      <SolutionWordBank
        exerciseId="ex1"
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={vi.fn()}
      />,
    );

    const bank = screen.getByTestId("solution-wordbank");
    const evt = createEvent.dragOver(bank);
    const preventDefaultSpy = vi.spyOn(evt, "preventDefault");
    fireEvent(bank, evt);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("drop mit passender exerciseId ruft onReturnToBank(wordId) auf", () => {
    const onReturnToBank = vi.fn();

    render(
      <SolutionWordBank
        exerciseId="ex1"
        words={words}
        onReturnToBank={onReturnToBank}
        onQuickPlace={vi.fn()}
      />,
    );

    const bank = screen.getByTestId("solution-wordbank");
    const dt = createDataTransfer({
      wordId: JSON.stringify({ exerciseId: "ex1", wordId: "w3" }),
    });
    const dropEvt = createEvent.drop(bank, { dataTransfer: dt });
    const preventDefaultSpy = vi.spyOn(dropEvt, "preventDefault");

    fireEvent(bank, dropEvt);

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    expect(onReturnToBank).toHaveBeenCalledWith("w3");
  });

  it("drop ignoriert leere Payload oder fremde exerciseId", () => {
    const onReturnToBank = vi.fn();

    render(
      <SolutionWordBank
        exerciseId="ex1"
        words={words}
        onReturnToBank={onReturnToBank}
        onQuickPlace={vi.fn()}
      />,
    );

    const bank = screen.getByTestId("solution-wordbank");

    // 1) Leere Payload
    const dtEmpty = createDataTransfer();
    const dropEmpty = createEvent.drop(bank, { dataTransfer: dtEmpty });
    fireEvent(bank, dropEmpty);
    expect(onReturnToBank).not.toHaveBeenCalled();

    // 2) Falsche exerciseId
    const dtWrong = createDataTransfer({
      wordId: JSON.stringify({ exerciseId: "other", wordId: "w1" }),
    });
    const dropWrong = createEvent.drop(bank, { dataTransfer: dtWrong });
    fireEvent(bank, dropWrong);
    expect(onReturnToBank).not.toHaveBeenCalled();
  });

  it("Ctrl-Klick auf verfügbares Wort triggert onQuickPlace(wordId) und verhindert Default", () => {
    const onQuickPlace = vi.fn();

    render(
      <SolutionWordBank
        exerciseId="ex1"
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={onQuickPlace}
      />,
    );

    const w1 = screen.getByTestId("wordbank-w1"); // available
    const evt = createEvent.click(w1, { ctrlKey: true });
    const preventDefaultSpy = vi.spyOn(evt, "preventDefault");

    fireEvent(w1, evt);

    expect(onQuickPlace).toHaveBeenCalledWith("w1");
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("Meta-Klick (⌘) auf verfügbares Wort triggert ebenfalls onQuickPlace(wordId)", () => {
    const onQuickPlace = vi.fn();

    render(
      <SolutionWordBank
        exerciseId="ex1"
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={onQuickPlace}
      />,
    );

    const w3 = screen.getByTestId("wordbank-w3"); // available
    const evt = createEvent.click(w3, { metaKey: true });
    const preventDefaultSpy = vi.spyOn(evt, "preventDefault");

    fireEvent(w3, evt);

    expect(onQuickPlace).toHaveBeenCalledWith("w3");
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("Ctrl-/Meta-Klick auf NICHT verfügbares Wort macht nichts", () => {
    const onQuickPlace = vi.fn();

    render(
      <SolutionWordBank
        exerciseId="ex1"
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={onQuickPlace}
      />,
    );

    const w2 = screen.getByTestId("wordbank-w2"); // unavailable

    const evtCtrl = createEvent.click(w2, { ctrlKey: true });
    const spyCtrl = vi.spyOn(evtCtrl, "preventDefault");
    fireEvent(w2, evtCtrl);

    const evtMeta = createEvent.click(w2, { metaKey: true });
    const spyMeta = vi.spyOn(evtMeta, "preventDefault");
    fireEvent(w2, evtMeta);

    expect(onQuickPlace).not.toHaveBeenCalled();
    expect(spyCtrl).not.toHaveBeenCalled();
    expect(spyMeta).not.toHaveBeenCalled();
  });
});