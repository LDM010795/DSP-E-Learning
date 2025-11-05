import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  within,
  createEvent,
} from "@testing-library/react";
import ClozeExerciseDragDrop from "@/components/ui_elements/cloze_exercise/ClozeExerciseDragDrop";
import { ClozeTextPart } from "@/components/ui_elements/cloze_exercise/ClozeExerciseBase";

/**
 * --- Stabile useId ---
 * Wir stabilisieren useId, damit exerciseId deterministisch ist: "cloze-abc123".
 */
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useId: () => "abc:123",
  };
});

// Hilfsdaten: 2 Lücken

const clozeText: ClozeTextPart[] = [
  { type: "text", text: "Die " },
  { type: "blank", correct: ["Katze"] },
  { type: "text", text: " frisst " },
  { type: "blank", correct: ["Hund"] },
  { type: "text", text: "." },
];

function createDataTransfer(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    setData: (type: string, val: string) => {
      store[type] = val;
    },
    getData: (type: string) => store[type] ?? "",
    clearData: (type?: string) => {
      if (!type) Object.keys(store).forEach((k) => delete store[k]);
      else delete store[type];
    },
  } as unknown as DataTransfer;
}

function dragWordIntoBlankByIndex(wordText: string, blankIndex: number) {
  const bank = screen.getByTestId("solution-wordbank"); // kommt aus deiner echten WordBank
  const wordEl = within(bank).getByText(wordText);

  const dt = createDataTransfer();
  // setzt {exerciseId, wordId} via onDragStart der WordBank
  fireEvent.dragStart(wordEl, { dataTransfer: dt });

  const blanks = screen.getAllByTestId(/^(blank-)/);
  const target = blanks[blankIndex];

  // echtes dragOver + drop (mit preventDefault im over)
  const overEvt = createEvent.dragOver(target);
  fireEvent(target, overEvt);

  const dropEvt = createEvent.drop(target, { dataTransfer: dt });
  fireEvent(target, dropEvt);
}

describe("ClozeExerciseDragDrop", () => {
  it("rendert im Text-Modus Header, WordBank, Blanks und Submit disabled wenn allFilled=false", () => {
    render(
      <ClozeExerciseDragDrop
        title="Fülle die Lücken"
        clozeText={clozeText}
        display_mode="text"
        languageLabel="Code"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Fülle die Lücken")).toBeInTheDocument();
    expect(screen.getByTestId("solution-wordbank")).toBeInTheDocument();

    // aus useId => "cloze-abc123" -> IDs: "cloze-abc123-0", "cloze-abc123-1"
    expect(screen.getByTestId("blank-cloze-abc123-0")).toBeInTheDocument();
    expect(screen.getByTestId("blank-cloze-abc123-1")).toBeInTheDocument();

    const submit = screen.getByTestId("cloze-submit");
    expect(submit).toBeDisabled();
  });

  it("im Code-Modus wird die Code-UI gerendert (languageLabel durchgereicht)", () => {
    render(
      <ClozeExerciseDragDrop
        title="Code Cloze"
        clozeText={clozeText}
        display_mode="code"
        languageLabel="TypeScript"
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByTestId("cloze-coding-ui")).toBeInTheDocument();
  });

  it("Drop in eine Lücke zeigt das Wort als Chip im Blank an", () => {
    render(
      <ClozeExerciseDragDrop
        title="DragDrop"
        clozeText={clozeText}
        display_mode="text"
        languageLabel="X"
        onSubmit={vi.fn()}
      />,
    );

    // „Katze“ in die erste Lücke ziehen
    dragWordIntoBlankByIndex("Katze", 0);

    // Im ersten Blank sollte jetzt ein Chip mit Text „Katze“ stehen
    const blank0 = screen.getByTestId("blank-cloze-abc123-0");
    expect(blank0).toHaveTextContent("Katze");
  });

  it("Submit: vollständig & korrekt → Erfolgstext und onSubmit() wird aufgerufen", () => {
    const onSubmit = vi.fn();
    render(
      <ClozeExerciseDragDrop
        title="Check"
        clozeText={clozeText}
        display_mode="text"
        languageLabel="X"
        onSubmit={onSubmit}
      />,
    );

    // Korrekt befüllen
    dragWordIntoBlankByIndex("Katze", 0);
    dragWordIntoBlankByIndex("Hund", 1);

    const submitBtn = screen.getByTestId("cloze-submit");
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    // Erfolgstext (genauer String aus der Komponente)
    expect(
      screen.getByText("🎉 Alles richtig! Super gemacht!"),
    ).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("zeigt 'Noch nicht ganz' wenn 0/2 richtig sind (Wörter vertauscht) und ruft onSubmit nicht auf", () => {
    const onSubmit = vi.fn();
    const clozeText = [
      { type: "text", text: "Die " },
      { type: "blank", correct: ["Katze"] },
      { type: "text", text: " frisst " },
      { type: "blank", correct: ["Hund"] },
      { type: "text", text: "." },
    ];

    render(
      <ClozeExerciseDragDrop
        title="Check"
        clozeText={clozeText as any}
        display_mode="text"
        languageLabel="X"
        onSubmit={onSubmit}
      />,
    );

    // beide Lücken füllen (falsch: vertauscht)
    dragWordIntoBlankByIndex("Hund", 0); // falsch für b0
    dragWordIntoBlankByIndex("Katze", 1); // falsch für b1

    // Button ist jetzt enabled
    const submitBtn = screen.getByTestId("cloze-submit");
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    // Feedback über Text prüfen (kein data-testid in echter Komponente)
    expect(screen.getByText(/Noch nicht ganz:/i)).toBeInTheDocument();
    expect(screen.getByText(/0 von 2/i)).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Teilweise falsch (1/2) → zeigt Fehler-Feedback mit 'Noch nicht ganz: 1 von 2'", () => {
    const onSubmit = vi.fn();

    render(
      <ClozeExerciseDragDrop
        title="Check"
        clozeText={clozeText}
        wrongSolutionWords={["Maus"]} // falsches Wort zur Bank hinzufügen
        display_mode="text"
        languageLabel="X"
        onSubmit={onSubmit}
      />,
    );

    // 1 richtig, 1 falsch befüllen
    dragWordIntoBlankByIndex("Katze", 0); // korrekt für b0
    dragWordIntoBlankByIndex("Maus", 1); // falsch für b1

    const submitBtn = screen.getByTestId("cloze-submit");
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    // Fehler-Feedback existiert und enthält die Teil-Ergebnis-Zeile
    const feedback = screen.getByTestId("cloze-feedback");
    expect(feedback).toBeInTheDocument();
    expect(feedback.textContent).toMatch(/Noch nicht ganz:/);
    expect(feedback.textContent).toMatch(/1 von 2/);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
