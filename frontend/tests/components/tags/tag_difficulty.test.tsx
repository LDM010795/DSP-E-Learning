/**
 * Tests for TagDifficulty component:
 * - Verify that the difficulty tag renders correctly for each difficulty level.
 * - Ensure that the correct Tailwind CSS classes are applied to reflect the
 *   difficulty visually (background + text color).
 * - Confirm that shared base styles are always applied.
 *
 * What is tested:
 * 1. "Einfach" → green background & green text.
 * 2. "Mittel"  → yellow background & yellow text.
 * 3. "Schwer"  → red background & red text.
 * 4. All cases must include base classes: "rounded-full" and "text-xs".
 *
 *
 * - Uses Jest’s `test.each` to run the same test for all difficulty levels.
 * - Checks both the displayed text and the applied CSS classes.
 *
 * Author: DSP Development Team
 * Date: 26-09-2025
 */

import { render, screen } from "@testing-library/react";
import TagDifficulty, {
  type DifficultyLevel,
} from "../../../src/components/tags/tag_difficulty";

describe("TagDifficulty", () => {
  const cases: Array<{ level: DifficultyLevel; bg: string; text: string }> = [
    { level: "Einfach", bg: "bg-green-100", text: "text-green-800" },
    { level: "Mittel", bg: "bg-yellow-100", text: "text-yellow-800" },
    { level: "Schwer", bg: "bg-red-100", text: "text-red-800" },
  ];

  test.each(cases)("renders %s with correct classes", ({ level, bg, text }) => {
    render(<TagDifficulty difficulty={level} />);
    const tag = screen.getByText(level);
    expect(tag).toBeInTheDocument();
    expect(tag.className).toContain(bg);
    expect(tag.className).toContain(text);
    // shared base styles
    expect(tag.className).toContain("rounded-full");
    expect(tag.className).toContain("text-xs");
  });
});
