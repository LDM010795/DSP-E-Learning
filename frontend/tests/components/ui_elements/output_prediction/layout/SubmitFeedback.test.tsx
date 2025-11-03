/**
 *
 * Tests for the <SubmitFeedback /> component.
 *
 * The tests verify:
 *  - Conditional rendering:
 *      • Does not render when feedback.type is null.
 *  - Visual feedback behavior:
 *      • Displays correct message and styling for success and error states.
 *  - Styling validation:
 *      • Confirms Tailwind CSS classes (green for success, red for error).
 *  - Accessibility compliance:
 *      • Ensures proper use of role="status" and aria-live="polite".
 *
 * Author: DSP development team
 * Date: 03-11-2025
 */


import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SubmitFeedback, FeedbackState } from "@/components/ui_elements/output_prediction/layout/SubmitFeedback";

describe("SubmitFeedback", () => {
  it("renders nothing when feedback.type is null", () => {
    const feedback: FeedbackState = { type: null, message: "" };
    const { container } = render(<SubmitFeedback feedback={feedback} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders success message with green styling", () => {
    const feedback: FeedbackState = { type: "success", message: "Correct!" };
    render(<SubmitFeedback feedback={feedback} />);
    const box = screen.getByTestId("outpred-feedback");

    expect(box).toBeInTheDocument();
    expect(box).toHaveTextContent("Correct!");
    expect(box).toHaveClass("border-green-200");
    expect(box).toHaveClass("bg-green-50");
    expect(box).toHaveClass("text-green-700");
  });

  it("renders error message with red styling", () => {
    const feedback: FeedbackState = { type: "error", message: "Try again." };
    render(<SubmitFeedback feedback={feedback} />);
    const box = screen.getByTestId("outpred-feedback");

    expect(box).toBeInTheDocument();
    expect(box).toHaveTextContent("Try again.");
    expect(box).toHaveClass("border-red-200");
    expect(box).toHaveClass("bg-red-50");
    expect(box).toHaveClass("text-red-700");
  });

  it("has proper accessibility roles", () => {
    const feedback: FeedbackState = { type: "success", message: "Good job!" };
    render(<SubmitFeedback feedback={feedback} />);
    const box = screen.getByRole("status");

    expect(box).toHaveAttribute("aria-live", "polite");
    expect(box).toHaveTextContent("Good job!");
  });
});
