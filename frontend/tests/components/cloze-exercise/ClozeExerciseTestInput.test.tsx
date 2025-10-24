import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import ClozeExerciseTextInput from "@/components/ui_elements/cloze_exercise/ClozeExerciseTextInput";
import type { ClozePartTextInput } from "@/components/ui_elements/cloze_exercise/ClozeExerciseBase";

const clozeText: ClozePartTextInput[] = [
  { type: "text", text: "Die " },
  { type: "blank", correct: ["Katze"], initialValue: "" },
  { type: "text", text: " frisst " },
  { type: "blank", correct: ["Hund"], initialValue: "" },
  { type: "text", text: "." },
];

describe("ClozeExerciseTextInput", () => {
  it("rendert im Text-Modus Header, zwei Inputs und Submit ist disabled bis alle gefüllt sind", () => {
    render(
      <ClozeExerciseTextInput
        title="Fülle die Lücken"
        clozeText={clozeText}
        display_mode="text"
        languageLabel="Code"
        onSubmit={vi.fn()}
      />,
    );

    // Header-Text vorhanden
    expect(screen.getByText("Fülle die Lücken")).toBeInTheDocument();

    // Zwei Textboxen (für zwei Blanks)
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue("");
    expect(inputs[1]).toHaveValue("");

    // Submit disabled, da nicht alle gefüllt
    const submit = screen.getByTestId("cloze-submit");
    expect(submit).toBeDisabled();

    // Nur eine füllen -> weiterhin disabled
    fireEvent.change(inputs[0], { target: { value: "Katze" } });
    expect(submit).toBeDisabled();
  });

  it("vollständig & korrekt → zeigt Erfolgs-Feedback und ruft onSubmit()", () => {
    const onSubmit = vi.fn();

    render(
      <ClozeExerciseTextInput
        title="Check"
        clozeText={clozeText}
        display_mode="text"
        languageLabel="X"
        onSubmit={onSubmit}
      />,
    );

    const [b0, b1] = screen.getAllByRole("textbox");

    // Korrekt füllen
    fireEvent.change(b0, { target: { value: "Katze" } });
    fireEvent.change(b1, { target: { value: "Hund" } });

    const submitBtn = screen.getByTestId("cloze-submit");
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    // Exakter Erfolgstext aus der Komponente
    const feedback = screen.getByTestId("cloze-feedback");
    expect(feedback).toHaveTextContent("🎉 Alles richtig! Super gemacht!");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("teilweise falsch (1/2) → zeigt Fehler-Feedback mit 'Noch nicht ganz: 1 von 2' und ruft onSubmit nicht auf", () => {
    const onSubmit = vi.fn();

    render(
      <ClozeExerciseTextInput
        title="Check"
        clozeText={clozeText}
        display_mode="text"
        languageLabel="X"
        onSubmit={onSubmit}
      />,
    );

    const [b0, b1] = screen.getAllByRole("textbox");

    // b0 korrekt, b1 falsch
    fireEvent.change(b0, { target: { value: "Katze" } });
    fireEvent.change(b1, { target: { value: "Maus" } });

    const submitBtn = screen.getByTestId("cloze-submit");
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    const feedback = screen.getByTestId("cloze-feedback");
    expect(feedback.textContent).toMatch(/Noch nicht ganz:/);
    expect(feedback.textContent).toMatch(/1 von 2/);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Feedback wird zurückgesetzt, sobald Antworten geändert werden", () => {
    render(
      <ClozeExerciseTextInput
        title="Reset"
        clozeText={clozeText}
        display_mode="text"
        languageLabel="X"
        onSubmit={vi.fn()}
      />,
    );

    const [b0, b1] = screen.getAllByRole("textbox");

    // Provoziere Fehler
    fireEvent.change(b0, { target: { value: "Katze" } });
    fireEvent.change(b1, { target: { value: "Maus" } });

    const submitBtn = screen.getByTestId("cloze-submit");
    fireEvent.click(submitBtn);

    expect(screen.getByTestId("cloze-feedback")).toBeInTheDocument();

    // Nutzer ändert eine Antwort → Feedback-Reset per useEffect
    fireEvent.change(b1, { target: { value: "Hund" } });
    expect(screen.queryByTestId("cloze-feedback")).toBeNull();
  });

  it("im Code-Modus wird ClozeCodingUi gerendert und Eingaben aktivieren den Submit", () => {
    const onSubmit = vi.fn();

    render(
      <ClozeExerciseTextInput
        title="Code Cloze"
        clozeText={clozeText}
        display_mode="code"
        languageLabel="TypeScript"
        onSubmit={onSubmit}
      />,
    );

    // Code-UI vorhanden
    expect(screen.getByTestId("cloze-coding-ui")).toBeInTheDocument();

    // Es sollten ebenfalls zwei Textboxen für die Blanks vorhanden sein
    const [b0, b1] = screen.getAllByRole("textbox");
    fireEvent.change(b0, { target: { value: "Katze" } });
    fireEvent.change(b1, { target: { value: "Hund" } });

    const submitBtn = screen.getByTestId("cloze-submit");
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);
    expect(screen.getByTestId("cloze-feedback")).toHaveTextContent(
      "🎉 Alles richtig! Super gemacht!",
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  const clozeTextPrefilledWrong: ClozePartTextInput[] = [
    { type: "text", text: "Die " },
    { type: "blank", correct: ["Katze"], initialValue: "Katz" }, // falsch
    { type: "text", text: " frisst " },
    { type: "blank", correct: ["Hund"], initialValue: "Dog" },   // falsch
    { type: "text", text: "." },
  ];

  const clozeTextMixed: ClozePartTextInput[] = [
    { type: "text", text: "Die " },
    { type: "blank", correct: ["Katze"], initialValue: "Katze" }, // korrekt
    { type: "text", text: " frisst " },
    { type: "blank", correct: ["Hund"], initialValue: "Dog" },    // falsch
    { type: "text", text: "." },
  ];

  it("übernimmt initialValue in die Inputs und lässt Submit sofort zu (alle befüllt)", () => {
    render(
      <ClozeExerciseTextInput
        title="Vorbefüllt"
        clozeText={clozeTextPrefilledWrong}
        display_mode="text"
        languageLabel="Text"
        onSubmit={vi.fn()}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue("Katz");
    expect(inputs[1]).toHaveValue("Dog");

    // Alle Inputs sind bereits befüllt → Submit sollte enabled sein
    const submit = screen.getByTestId("cloze-submit");
    expect(submit).toBeEnabled();
  });

  it("bei komplett falscher Vorbelegung: zeigt Fehler-Feedback 'Noch nicht ganz: 0 von 2' und ruft onSubmit nicht auf", () => {
    const onSubmit = vi.fn();

    render(
      <ClozeExerciseTextInput
        title="Fehlstart"
        clozeText={clozeTextPrefilledWrong}
        display_mode="text"
        languageLabel="Text"
        onSubmit={onSubmit}
      />,
    );

    const submit = screen.getByTestId("cloze-submit");
    expect(submit).toBeEnabled(); // alle befüllt (wenn auch falsch)

    fireEvent.click(submit);

    const feedback = screen.getByTestId("cloze-feedback");
    expect(feedback.textContent).toMatch(/Noch nicht ganz:/);
    expect(feedback.textContent).toMatch(/0 von 2/);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("bei gemischter Vorbelegung: 1 korrekt, 1 falsch → 'Noch nicht ganz: 1 von 2'", () => {
    const onSubmit = vi.fn();

    render(
      <ClozeExerciseTextInput
        title="Gemischt"
        clozeText={clozeTextMixed}
        display_mode="text"
        languageLabel="Text"
        onSubmit={onSubmit}
      />,
    );

    const [b0, b1] = screen.getAllByRole("textbox");
    expect(b0).toHaveValue("Katze"); // korrekt vorbelegt
    expect(b1).toHaveValue("Dog");   // falsch vorbelegt

    const submit = screen.getByTestId("cloze-submit");
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    const feedback = screen.getByTestId("cloze-feedback");
    expect(feedback.textContent).toMatch(/Noch nicht ganz:/);
    expect(feedback.textContent).toMatch(/1 von 2/);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Korrektur nach falscher Vorbelegung: nach Fix → Erfolgstext & onSubmit() wird aufgerufen", () => {
    const onSubmit = vi.fn();

    render(
      <ClozeExerciseTextInput
        title="Fix"
        clozeText={clozeTextPrefilledWrong}
        display_mode="text"
        languageLabel="Text"
        onSubmit={onSubmit}
      />,
    );

    const [b0, b1] = screen.getAllByRole("textbox");
    // falsche Vorbelegung korrigieren
    fireEvent.change(b0, { target: { value: "Katze" } });
    fireEvent.change(b1, { target: { value: "Hund" } });

    const submit = screen.getByTestId("cloze-submit");
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    const feedback = screen.getByTestId("cloze-feedback");
    expect(feedback).toHaveTextContent("🎉 Alles richtig! Super gemacht!");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("Feedback-Reset: nach gezeigtem Fehler-Feedback sorgt eine Änderung an einem Input für das Entfernen des Feedbacks", () => {
    render(
      <ClozeExerciseTextInput
        title="Reset"
        clozeText={clozeTextPrefilledWrong}
        display_mode="text"
        languageLabel="Text"
        onSubmit={vi.fn()}
      />,
    );

    const submit = screen.getByTestId("cloze-submit");
    fireEvent.click(submit);

    expect(screen.getByTestId("cloze-feedback")).toBeInTheDocument();

    // Eine Antwort ändern → Feedback verschwindet
    const [b0] = screen.getAllByRole("textbox");
    fireEvent.change(b0, { target: { value: "Katze" } });

    expect(screen.queryByTestId("cloze-feedback")).toBeNull();
  });

  it("Code-Modus: initialValue wird übernommen, Submit sofort möglich, falsche Vorbelegung ergibt Fehler-Feedback", () => {
    const onSubmit = vi.fn();

    render(
      <ClozeExerciseTextInput
        title="Code Cloze – Vorbefüllt"
        clozeText={clozeTextPrefilledWrong}
        display_mode="code"
        languageLabel="TypeScript"
        onSubmit={onSubmit}
      />,
    );

    // Code-UI vorhanden
    expect(screen.getByTestId("cloze-coding-ui")).toBeInTheDocument();

    const [b0, b1] = screen.getAllByRole("textbox");
    expect(b0).toHaveValue("Katz");
    expect(b1).toHaveValue("Dog");

    const submit = screen.getByTestId("cloze-submit");
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    const feedback = screen.getByTestId("cloze-feedback");
    expect(feedback.textContent).toMatch(/Noch nicht ganz:/);
    expect(feedback.textContent).toMatch(/0 von 2/);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Code-Modus: nach Korrektur beider Werte → Erfolgstext & onSubmit()", () => {
    const onSubmit = vi.fn();

    render(
      <ClozeExerciseTextInput
        title="Code Cloze – Fix"
        clozeText={clozeTextPrefilledWrong}
        display_mode="code"
        languageLabel="TypeScript"
        onSubmit={onSubmit}
      />,
    );

    const [b0, b1] = screen.getAllByRole("textbox");
    fireEvent.change(b0, { target: { value: "Katze" } });
    fireEvent.change(b1, { target: { value: "Hund" } });

    const submit = screen.getByTestId("cloze-submit");
    fireEvent.click(submit);

    expect(screen.getByTestId("cloze-feedback")).toHaveTextContent(
      "🎉 Alles richtig! Super gemacht!",
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
