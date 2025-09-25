/**
 * CardBadge Component Tests
 *
 * These tests verify the rendering and styling of the CardBadge component:
 *  - Renders the provided text inside the badge
 *  - Applies the correct default color scheme classes (e.g., gray)
 *  - Applies custom color scheme classes when `colorScheme` is provided
 *
 * Example checks:
 *  - "Gray" → contains Tailwind class `bg-gray-100`
 *  - "Orange" with `colorScheme="dsp-orange"` → contains class `bg-dsp-orange`
 *
 * Author: DSP Development Team
 * Date: 25-09-2025
 */

import { render, screen } from "@testing-library/react";
import CardBadge from "../../../src/components/cards/card_badge.tsx";

describe("CardBadge", () => {
  test("renders text", () => {
    render(<CardBadge text="New" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  test("applies color scheme classes", () => {
    const { rerender } = render(<CardBadge text="Gray" />);
    const span1 = screen.getByText("Gray");
    expect(span1.className).toMatch(/bg-gray-100/);

    rerender(<CardBadge text="Orange" colorScheme="dsp-orange" />);
    const span2 = screen.getByText("Orange");
    expect(span2.className).toMatch(/bg-dsp-orange/);
  });
});
