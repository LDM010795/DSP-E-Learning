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
