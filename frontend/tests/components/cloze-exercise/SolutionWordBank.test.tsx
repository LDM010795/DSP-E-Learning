import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import SolutionWordBank, {
  SolutionWord,
} from "@/components/ui_elements/cloze_exercise/SolutionWordBank";

// Helfer für DataTransfer
function createDataTransfer(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    setData: vi.fn((key: string, val: string) => {
      store[key] = val;
    }),
    getData: vi.fn((key: string) => store[key]),
    dropEffect: "move",
    effectAllowed: "all",
    files: [],
    items: [],
    types: Object.keys(store),
  } as unknown as DataTransfer;
}

const words: SolutionWord[] = [
  { id: "w1", word: "Haus", available: true },
  { id: "w2", word: "Baum", available: false },
];

describe("SolutionWordBank", () => {
  it("rendert alle Wörter und markiert data-testid='solution-words' auf dem Container", () => {
    render(
      <SolutionWordBank
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={vi.fn()}
      />,
    );
    expect(screen.getByTestId("solution-words")).toBeInTheDocument();
    expect(screen.getByText("Haus")).toBeInTheDocument();
    expect(screen.getByText("Baum")).toBeInTheDocument();
  });

  it("Ctrl/Cmd-Klick auf verfügbares Wort ruft onQuickPlace mit word.id auf", () => {
    const onQuickPlace = vi.fn();
    render(
      <SolutionWordBank
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={onQuickPlace}
      />,
    );

    const haus = screen.getByText("Haus");
    fireEvent.click(haus, { ctrlKey: true });

    expect(onQuickPlace).toHaveBeenCalledTimes(1);
    expect(onQuickPlace).toHaveBeenCalledWith("w1");
  });

  it("Ctrl/Cmd-Klick auf NICHT verfügbares Wort macht nichts", () => {
    const onQuickPlace = vi.fn();
    render(
      <SolutionWordBank
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={onQuickPlace}
      />,
    );

    const baum = screen.getByText("Baum");
    fireEvent.click(baum, { metaKey: true }); // macOS-Variante

    expect(onQuickPlace).not.toHaveBeenCalled();
  });

  it("Drop auf den Container ruft onReturnToBank mit wordId aus dataTransfer auf", () => {
    const onReturnToBank = vi.fn();
    render(
      <SolutionWordBank
        words={words}
        onReturnToBank={onReturnToBank}
        onQuickPlace={vi.fn()}
      />,
    );

    const container = screen.getByTestId("solution-words");
    const dt = createDataTransfer({ wordId: "w2" });

    fireEvent.dragOver(container, { dataTransfer: dt }); // damit drop akzeptiert wird
    fireEvent.drop(container, { dataTransfer: dt });

    expect(onReturnToBank).toHaveBeenCalledTimes(1);
    expect(onReturnToBank).toHaveBeenCalledWith("w2");
  });

  it("Drop ohne wordId triggert onReturnToBank NICHT (Edge Case)", () => {
    const onReturnToBank = vi.fn();
    render(
      <SolutionWordBank
        words={words}
        onReturnToBank={onReturnToBank}
        onQuickPlace={vi.fn()}
      />,
    );

    const container = screen.getByTestId("solution-words");
    const dt = createDataTransfer(); // leer

    fireEvent.dragOver(container, { dataTransfer: dt });
    fireEvent.drop(container, { dataTransfer: dt });

    expect(onReturnToBank).not.toHaveBeenCalled();
  });

  it("setzt draggable nur bei verfügbaren Wörtern", () => {
    render(
      <SolutionWordBank
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={vi.fn()}
      />,
    );

    const haus = screen.getByText("Haus");
    const baum = screen.getByText("Baum");

    // HTMLElement-Attribut 'draggable' ist ein String-Attribut im DOM
    expect(haus).toHaveAttribute("draggable", "true");
    expect(baum).toHaveAttribute("draggable", "false");
  });

  it("dragStart setzt dataTransfer.wordId nur bei verfügbaren Wörtern (implizit durch Handler-Gate)", () => {
    render(
      <SolutionWordBank
        words={words}
        onReturnToBank={vi.fn()}
        onQuickPlace={vi.fn()}
      />,
    );

    const dt = createDataTransfer();
    const haus = screen.getByText("Haus");
    fireEvent.dragStart(haus, { dataTransfer: dt });

    expect(dt.setData).toHaveBeenCalledWith("wordId", "w1");

    const dt2 = createDataTransfer();
    const baum = screen.getByText("Baum");
    // bei nicht verfügbaren gibt es zwar ein dragStart Event, aber das Element hat draggable=false,
    // Browser feuern i.d.R. kein echtes dragStart. Zur Sicherheit: unser Handler ist durch word.available gegated.
    fireEvent.dragStart(baum, { dataTransfer: dt2 });

    // keine SetData-Aufrufe für das nicht verfügbare Wort
    expect(dt2.setData).not.toHaveBeenCalled();
  });
});
