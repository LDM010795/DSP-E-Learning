import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClozeFeedbackState, ClozeHeader, ClozeSubmitButton, ClozeSubmitFeedback } from "@/components/ui_elements/cloze_exercise/ClozeLayout";


/* ----------------------------- ClozeHeader ----------------------------- */

describe("ClozeHeader", () => {
  it("rendert Standardtitel und Icon-Wrapper", () => {
    render(<ClozeHeader />);
    const container = screen.getByTestId("cloze-header");
    expect(container).toBeInTheDocument();

    // Standardtitel vorhanden
    expect(screen.getByText("Fülle die Lücken aus:")).toBeInTheDocument();

    // Icon-Wrapper (mit Hintergrund) vorhanden
    // (wir testen nicht das SVG selbst, nur dass der Container da ist)
    const iconWrap = container.querySelector("div > svg")?.parentElement;
    expect(iconWrap).toBeTruthy();
  });

  it("rendert einen benutzerdefinierten Titel", () => {
    render(<ClozeHeader title="Mein Titel" />);
    expect(screen.getByText("Mein Titel")).toBeInTheDocument();
  });
});

/* -------------------------- ClozeSubmitButton -------------------------- */

describe("ClozeSubmitButton", () => {
  it("ist disabled, wenn allFilled=false, und feuert checkResults nicht", () => {
    const onCheck = vi.fn();
    render(
      <ClozeSubmitButton allFilled={false} checkResults={onCheck} />
    );

    const btn = screen.getByTestId("cloze-submit");
    expect(btn).toBeDisabled();

    fireEvent.click(btn);
    expect(onCheck).not.toHaveBeenCalled();

    // Stil-Indikatoren für disabled vorhanden
    expect(btn).toHaveClass("cursor-not-allowed");
    expect(btn).toHaveClass("opacity-60");
  });

  it("ist enabled, wenn allFilled=true, und feuert checkResults", () => {
    const onCheck = vi.fn();
    render(<ClozeSubmitButton allFilled={true} checkResults={onCheck} />);

    const btn = screen.getByTestId("cloze-submit");
    expect(btn).toBeEnabled();

    fireEvent.click(btn);
    expect(onCheck).toHaveBeenCalledTimes(1);

    // Stil-Indikatoren für aktiv vorhanden
    expect(btn).toHaveClass("cursor-pointer");
    expect(btn).toHaveClass("bg-dsp-orange");
  });
});

/* -------------------------- ClozeSubmitFeedback ------------------------ */

describe("ClozeSubmitFeedback", () => {
  it("rendert nichts, wenn type=null", () => {
    const fb: ClozeFeedbackState = { type: null, message: "" };
    const { container } = render(<ClozeSubmitFeedback feedback={fb} />);

    // Kein Feedback-Container vorhanden
    expect(screen.queryByTestId("cloze-feedback")).toBeNull();
    // und auch kein role="status"
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it("rendert Success-Feedback mit korrekten Klassen und ARIA", () => {
    const fb: ClozeFeedbackState = {
      type: "success",
      message: "🎉 Alles richtig! Super gemacht!",
    };
    render(<ClozeSubmitFeedback feedback={fb} />);

    const box = screen.getByTestId("cloze-feedback");
    expect(box).toBeInTheDocument();
    expect(box).toHaveTextContent("🎉 Alles richtig! Super gemacht!");
    expect(box).toHaveAttribute("role", "status");
    expect(box).toHaveAttribute("aria-live", "polite");

    // Klasse für success-Zustand
    expect(box).toHaveClass("border-green-200");
    expect(box).toHaveClass("bg-green-50");
    expect(box).toHaveClass("text-green-700");
  });

  it("rendert Error-Feedback mit korrekten Klassen und ARIA", () => {
    const fb: ClozeFeedbackState = {
      type: "error",
      message: "Noch nicht ganz: 1 von 2 richtig.",
    };
    render(<ClozeSubmitFeedback feedback={fb} />);

    const box = screen.getByTestId("cloze-feedback");
    expect(box).toBeInTheDocument();
    expect(box).toHaveTextContent("Noch nicht ganz: 1 von 2 richtig.");
    expect(box).toHaveAttribute("role", "status");
    expect(box).toHaveAttribute("aria-live", "polite");

    // Klasse für error-Zustand
    expect(box).toHaveClass("border-red-200");
    expect(box).toHaveClass("bg-red-50");
    expect(box).toHaveClass("text-red-700");
  });
});
