/**
 *
 * Tests for the <SubmitButton /> component.
 *
 * The tests cover:
 *  - Rendering:
 *      • Verifies the button renders with default label "Prüfen".
 *  - State behavior:
 *      • Ensures the button is disabled when `allFilled` is false,
 *        and enabled when `allFilled` is true.
 *  - Interaction:
 *      • Confirms `checkResults` callback is triggered only when the
 *        button is enabled.
 *  - Styling validation:
 *      • Checks for correct Tailwind classes depending on state:
 *        `cursor-not-allowed` (disabled) vs. `cursor-pointer` (enabled).
 *
 * Author: DSP development team
 * Date: 03-11-2025
 */


import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SubmitButton } from "@/components/ui_elements/output_prediction/layout/SubmitButton";

describe("SubmitButton", () => {
  it("renders the button with default text", () => {
    render(<SubmitButton allFilled={false} checkResults={() => {}} />);
    const button = screen.getByTestId("outpred-submit");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Prüfen");
  });

  it("is disabled when allFilled is false", () => {
    render(<SubmitButton allFilled={false} checkResults={() => {}} />);
    const button = screen.getByTestId("outpred-submit");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("is enabled when allFilled is true", () => {
    render(<SubmitButton allFilled={true} checkResults={() => {}} />);
    const button = screen.getByTestId("outpred-submit");
    expect(button).toBeEnabled();
    expect(button).toHaveClass("cursor-pointer");
  });

  it("calls checkResults when clicked and enabled", () => {
    const mockCheck = vi.fn();
    render(<SubmitButton allFilled={true} checkResults={mockCheck} />);
    const button = screen.getByTestId("outpred-submit");
    fireEvent.click(button);
    expect(mockCheck).toHaveBeenCalledTimes(1);
  });

  it("does not call checkResults when disabled", () => {
    const mockCheck = vi.fn();
    render(<SubmitButton allFilled={false} checkResults={mockCheck} />);
    const button = screen.getByTestId("outpred-submit");
    fireEvent.click(button);
    expect(mockCheck).not.toHaveBeenCalled();
  });
});
