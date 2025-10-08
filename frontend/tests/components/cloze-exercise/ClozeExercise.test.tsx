import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ClozeExercise, {
  ClozeTextPart,
  ClozeResult,
} from "@/components/ui_elements/cloze_exercise/ClozeExercise";

// Layout-Komponente mocken (wir wollen nur die Kinder rendern)
vi.mock("@/components/layouts", () => ({
  SubBackground: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="subbackground">{children}</div>
  ),
}));

// Helfer für DataTransfer im DnD
function createDataTransfer(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    setData: vi.fn((k: string, v: string) => {
      store[k] = v;
    }),
    getData: vi.fn((k: string) => store[k]),
    dropEffect: "move",
    effectAllowed: "all",
    files: [],
    items: [],
    types: Object.keys(store),
  } as unknown as DataTransfer;
}

const baseText: ClozeTextPart[] = [
  { type: "text", content: "Das" },
  { type: "blank", correct: ["Haus"] },
  { type: "text", content: "ist" },
  { type: "blank", correct: ["groß", "gross"] },
  { type: "text", content: "." },
];

describe("ClozeExercise – Input-Modus (showSolutionWords=false)", () => {
  it("aktiviert den Submit-Button erst wenn alle Lücken gefüllt sind und ruft onSubmit nur bei korrekten Antworten", () => {
    const onSubmit = vi.fn();
    render(
      <ClozeExercise
        title="Fülle die Lücken aus:"
        clozeText={baseText}
        showSolutionWords={false}
        onSubmit={onSubmit}
      />,
    );

    // Button ist anfangs disabled
    const button = screen.getByRole("button", { name: "Prüfen" });
    expect(button).toBeDisabled();

    // Beide Inputs befüllen (1x absichtlich falsch)
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);

    // Erste Lücke falsch
    fireEvent.change(inputs[0], { target: { value: "falsch" } });
    // Zweite Lücke korrekt (case-insensitiv)
    fireEvent.change(inputs[1], { target: { value: "GROSS" } });

    // Jetzt sind alle gefüllt -> Button enabled
    expect(button).toBeEnabled();

    // Submit (falsch + korrekt) -> Label "False", onSubmit NICHT aufgerufen
    fireEvent.click(button);
    expect(onSubmit).not.toHaveBeenCalled();

    // Korrigieren und erneut submitten
    fireEvent.change(inputs[0], { target: { value: "Haus" } });
    fireEvent.click(screen.getByRole("button", { name: "Prüfen" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("ClozeExercise – Drag&Drop-Modus (showSolutionWords=true)", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("füllt Lücken via QuickPlace (Ctrl/Cmd-Klick)", () => {
    const onSubmit = vi.fn();
    render(
      <ClozeExercise
        clozeText={baseText}
        showSolutionWords={true}
        wrongSolutionWords={["Baum"]}
        onSubmit={onSubmit}
      />,
    );

    // Wordbank vorhanden, enthält mindestens die beiden korrekten Erstlösungen + evtl. falsches Wort
    const bank = screen.getByTestId("solution-words");
    const wordHaus = screen.getByText("Haus");
    const wordGross = screen.getByText("groß"); // aus correct[0] (falls es "groß" ist)
    expect(bank).toBeInTheDocument();
    expect(wordHaus).toBeInTheDocument();
    expect(wordGross).toBeInTheDocument();

    // QuickPlace: Ctrl-Klick auf "Haus" -> füllt erste freie Lücke
    fireEvent.click(wordHaus, { ctrlKey: true });

    const blank1 = screen.getByTestId("blank-1");
    const blank3 = screen.getByTestId("blank-3");
    expect(blank1).toHaveTextContent("Haus");

    // Zweites Wort via Drag & Drop in zweite Lücke
    const dtCapture = createDataTransfer();
    // dragStart am Bank-Wort triggert setData("wordId", "<id>")
    fireEvent.dragStart(wordGross, { dataTransfer: dtCapture });
    const setDataCall = (dtCapture.setData as unknown as any).mock.calls.find(
      (c: any[]) => c[0] === "wordId",
    );
    expect(setDataCall, "dragStart sollte wordId setzen").toBeTruthy();
    const grossId = setDataCall[1] as string;

    // Jetzt den Drop mit dieser ID auf die zweite Lücke ausführen
    const dtDrop = createDataTransfer({ wordId: grossId });
    fireEvent.dragOver(blank3, { dataTransfer: dtDrop });
    fireEvent.drop(blank3, { dataTransfer: dtDrop });

    // Beide Lücken sollten belegt sein
    expect(blank1).toHaveTextContent("Haus");
    expect(blank3).toHaveTextContent("groß");

    // Button aktiv -> Submit -> True & onSubmit aufgerufen
    const button = screen.getByRole("button", { name: "Prüfen" });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("Rückgabe in die Wordbank (Drop auf Bank) räumt die Lücke wieder leer", () => {
    render(
      <ClozeExercise
        clozeText={baseText}
        showSolutionWords={true}
        wrongSolutionWords={[]}
        onSubmit={() => {}}
      />,
    );

    const bank = screen.getByTestId("solution-words");
    const wordHaus = screen.getByTestId("wordbank-0");

    // Erst in erste Lücke packen (QuickPlace)
    fireEvent.click(wordHaus, { ctrlKey: true });
    const blank = screen.getByTestId("blank-1");
    expect(blank).toHaveTextContent("Haus");

    // Dann per Drop zurück in die Bank
    const word = within(blank).getByText("Haus");
    const dtCapture = createDataTransfer();
    fireEvent.dragStart(word, { dataTransfer: dtCapture });
    const setDataCall = (dtCapture.setData as unknown as any).mock.calls.find(
      (c: any[]) => c[0] === "wordId",
    );
    const id = setDataCall?.[1] as string;

    const dtDropBack = createDataTransfer({ wordId: id });
    fireEvent.dragOver(bank, { dataTransfer: dtDropBack });
    fireEvent.drop(bank, { dataTransfer: dtDropBack });

    expect(blank).toHaveTextContent("");
  });

  it("Ctrl/Cmd-Klick auf belegte Lücke: Wort wird aus der Lücke entfernt und in der Wordbank wieder verfügbar", () => {
    render(
      <ClozeExercise
        clozeText={baseText}
        showSolutionWords={true}
        wrongSolutionWords={[]}
        onSubmit={() => {}}
      />,
    );
    const wordHaus = screen.getByTestId("wordbank-0");

    // 1) QuickPlace: 'Haus' in die erste Lücke setzen
    fireEvent.click(wordHaus, { ctrlKey: true });
    const blank = screen.getByTestId("blank-1");
    expect(blank).toHaveTextContent("Haus");

    // In der Bank sollte 'Haus' jetzt nicht mehr draggable sein
    expect(screen.getByTestId("wordbank-0")).toHaveAttribute(
      "draggable",
      "false",
    );

    // 2) Ctrl-Klick auf die belegte Lücke => leeren
    fireEvent.click(blank, { ctrlKey: true });

    // Lücke wieder leer
    expect(blank).toHaveTextContent("");

    // 3) In der Bank ist 'Haus' wieder verfügbar (draggable=true)
    const hausInBank = screen.getByTestId("wordbank-0");
    expect(hausInBank).toHaveAttribute("draggable", "true");
  });
});
