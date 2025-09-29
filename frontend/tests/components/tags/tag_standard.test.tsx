/**
 * Tests for TagScore component:
 * - Ensure correct rendering of the score tag in different scenarios.
 * - Covers edge cases like invalid scores, missing maxScore, and string inputs.
 * - Verifies formatting (decimal rounding, percentage calculation).
 * - Confirms that custom CSS classes are applied correctly.
 *
 * What is tested:
 * 1. Invalid scores → display "N/A".
 * 2. Valid numeric score and maxScore → formatted as "<score> / <max>".
 * 3. String-based score parsing → works and percentage is calculated correctly.
 * 4. Missing/invalid maxScore → falls back to "<score> Pkt.".
 * 5. Custom className → applied to the rendered tag element.
 *
 * Author: DSP Development Team
 * Date: 26-09-2025
 */

import { render, screen } from "@testing-library/react";
import TagScore from "../../../src/components/tags/tag_standard";

describe("TagScore", () => {
  test('shows "N/A" when score is invalid', () => {
    render(<TagScore score={null} maxScore={50} />);
    expect(screen.getByText("Ergebnis:")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  test('renders "<score> / <max>" when both are valid (number)', () => {
    render(<TagScore score={42} maxScore={50} />);
    expect(screen.getByText("Ergebnis:")).toBeInTheDocument();
    expect(screen.getByText("42.0 / 50")).toBeInTheDocument();
  });

  test("parses string score and can show percentage", () => {
    render(<TagScore score="12.5" maxScore={25} showPercentage />);
    expect(screen.getByText("12.5 / 25")).toBeInTheDocument();
    // 12.5 / 25 = 50%
    expect(screen.getByText("(50%)")).toBeInTheDocument();
  });

  test('falls back to "<score> Pkt." if maxScore is missing/invalid', () => {
    render(<TagScore score={17.25} maxScore={null} />);
    expect(screen.getByText("17.3 Pkt.")).toBeInTheDocument(); // rounded to one decimal
  });

  test("applies custom className", () => {
    render(
      <TagScore
        score={10}
        maxScore={20}
        className="bg-blue-100 text-blue-800"
      />,
    );
    const tag = screen.getByText("10.0 / 20");
    expect(tag.className).toContain("bg-blue-100");
    expect(tag.className).toContain("text-blue-800");
  });
});
