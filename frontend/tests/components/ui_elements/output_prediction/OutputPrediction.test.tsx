/**
 *
 * Tests for the <OutputPrediction /> component.
 *
 * The tests focus on verifying user interaction and grading logic:
 *  - Proper rendering of header, prompt, and code block
 *  - Prop propagation to <CodeReadOnly /> (language, filename, code)
 *  - Button enable/disable state depending on input content
 *  - Correct feedback display for right/wrong answers
 *  - Handling of single-line and multiline modes
 *  - Respect of normalization and case-sensitivity rules
 *
 * Mocks:
 *  - <SubBackground />, <Header />, <SubmitButton />, <SubmitFeedback />, <CodeReadOnly />
 *    are mocked to isolate OutputPrediction’s logic.
 *
 * Author: DSP development team
 * Date: 03-11-2025
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---- Mock lightweight layout container (SubBackground) ----
vi.mock("@/components/layouts", () => ({
  SubBackground: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="subbackground">{children}</div>
  ),
}));

// ---- Mock the small presentational layout bits so we focus on logic ----
vi.mock("@/components/ui_elements/output_prediction/layout", () => {
  return {
    Header: ({ title }: { title?: string }) => (
      <div data-testid="outpred-header">{title}</div>
    ),
    SubmitButton: ({
      allFilled,
      checkResults,
    }: {
      allFilled: boolean;
      checkResults: () => void;
    }) => (
      <button
        data-testid="outpred-submit"
        disabled={!allFilled}
        onClick={checkResults}
      >
        Prüfen
      </button>
    ),
    SubmitFeedback: ({
      feedback,
    }: {
      feedback: { type: any; message: string };
    }) =>
      feedback?.type ? (
        <div data-testid="outpred-feedback">{feedback.message}</div>
      ) : null,
  };
});

// ---- Mock CodeReadOnly but keep its props observable ----
const codeReadOnlySpy = vi.fn();
vi.mock("@/components/ui_elements/output_prediction/CodeReadOnly", async () => {
  const React = await import("react");
  return {
    __esModule: true,
    default: ({ code, language, filename }: any) => {
      codeReadOnlySpy({ code, language, filename });
      return (
        <div data-testid="code-readonly">
          {filename}::{language}
          <pre>{code}</pre>
        </div>
      );
    },
  };
});

// ---- Import SUT and helpers (real ones) ----
import OutputPrediction from "@/components/ui_elements/output_prediction/OutputPrediction";
import {
  compose,
  defaultOutputNormalizer,
  collapseWhitespace,
} from "@/components/ui_elements/output_prediction/helpers/normalizers";

describe("OutputPrediction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseProps = {
    title: "Output Prediction Test",
    prompt: "Was gibt dieser Code aus?",
    code: "a = 2\nb = 3\nprint(a + b)",
    language: "python",
    filename: "snippet.py",
    expectedAnswers: ["5", "5.0"],
  };

  it("renders header, code block and prompt", () => {
    render(<OutputPrediction {...baseProps} />);
    expect(screen.getByTestId("outpred-header")).toHaveTextContent(
      "Output Prediction Test",
    );
    expect(screen.getByTestId("code-readonly")).toBeInTheDocument();
    expect(screen.getByText("Was gibt dieser Code aus?")).toBeInTheDocument();
  });

  it("passes props to CodeReadOnly", () => {
    render(<OutputPrediction {...baseProps} />);
    expect(codeReadOnlySpy).toHaveBeenCalledWith({
      code: baseProps.code,
      language: baseProps.language,
      filename: baseProps.filename,
    });
  });

  it("single-line mode: enables button only when input has text; grades correct answer", () => {
    const onSubmit = vi.fn();
    const onCorrect = vi.fn();
    const onWrong = vi.fn();

    render(
      <OutputPrediction
        {...baseProps}
        onSubmit={onSubmit}
        onCorrect={onCorrect}
        onWrong={onWrong}
      />,
    );

    const input = screen.getByRole("textbox");
    const btn = screen.getByTestId("outpred-submit");

    // Initially disabled
    expect(btn).toBeDisabled();

    // Type correct answer "5"
    fireEvent.change(input, { target: { value: "5" } });
    expect(btn).toBeEnabled();

    fireEvent.click(btn);

    // Feedback & callbacks
    expect(screen.getByTestId("outpred-feedback")).toHaveTextContent(
      /Richtig/i,
    );
    expect(onSubmit).toHaveBeenCalledWith("5", true);
    expect(onCorrect).toHaveBeenCalledWith("5");
    expect(onWrong).not.toHaveBeenCalled();
  });

  it("single-line mode: wrong answer shows error and calls onWrong", () => {
    const onSubmit = vi.fn();
    const onWrong = vi.fn();

    render(
      <OutputPrediction {...baseProps} onSubmit={onSubmit} onWrong={onWrong} />,
    );

    const input = screen.getByRole("textbox");
    const btn = screen.getByTestId("outpred-submit");

    fireEvent.change(input, { target: { value: "6" } });
    fireEvent.click(btn);

    expect(screen.getByTestId("outpred-feedback")).toHaveTextContent(
      /Nicht ganz/i,
    );
    expect(onSubmit).toHaveBeenCalledWith("6", false);
    expect(onWrong).toHaveBeenCalledWith("6");
  });

  it("multiline mode: uses textarea and separate button; grading works", () => {
    const onSubmit = vi.fn();

    render(<OutputPrediction {...baseProps} multiline onSubmit={onSubmit} />);

    const textarea = screen.getByRole("textbox"); // textarea is also role="textbox"
    const btn = screen.getByTestId("outpred-submit");

    // Disabled until there is text
    expect(btn).toBeDisabled();

    fireEvent.change(textarea, { target: { value: "5.0\n" } });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);

    // default normalizer trims trailing newline → matches "5.0"
    expect(screen.getByTestId("outpred-feedback")).toHaveTextContent(
      /Richtig/i,
    );
    expect(onSubmit).toHaveBeenCalledWith("5.0\n", true);
  });

  it("respects caseSensitive=false by default; a custom normalizer can relax matching", () => {
    // Expected has no whitespace; user types with spaces/newlines
    // defaultOutputNormalizer shouldn't match; custom should
    const props = {
      ...baseProps,
      expectedAnswers: ["HelloWorld"],
      code: "print('HelloWorld')",
      language: "python",
    };

    // Custom normalizer that removes all whitespace
    const stripAllWhitespace = compose(defaultOutputNormalizer, (s: string) =>
      s.replace(/\s+/g, ""),
    );

    const { rerender } = render(
      <OutputPrediction {...props} normalize={defaultOutputNormalizer} />,
    );

    const input = screen.getByRole("textbox");
    const btn = screen.getByTestId("outpred-submit");

    // Type with spaces/newlines → should be WRONG with default normalizer
    fireEvent.change(input, { target: { value: " Hello \n World " } });
    fireEvent.click(btn);
    expect(screen.getByTestId("outpred-feedback")).toHaveTextContent(
      /Nicht ganz/i,
    );

    // Now rerender with relaxed normalizer → should be RIGHT
    rerender(<OutputPrediction {...props} normalize={stripAllWhitespace} />);

    const input2 = screen.getByRole("textbox");
    fireEvent.change(input2, { target: { value: " Hello \n World " } });
    fireEvent.click(screen.getByTestId("outpred-submit"));
    expect(screen.getByTestId("outpred-feedback")).toHaveTextContent(
      /Richtig/i,
    );
  });
});
