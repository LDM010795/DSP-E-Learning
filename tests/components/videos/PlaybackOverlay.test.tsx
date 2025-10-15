/**
 * PlaybackOverlay
 *
 * Verifies:
 * - Renders overlay container with aria-hidden and base classes
 * - Shows logo + academy label by default
 * - Hides logo when showLogo={false}
 * - Appends custom className
 *
 * Author: DSP development team
 * Date: 2024-09-29
 */

import { render, screen } from "@testing-library/react";
import PlaybackOverlay from "../../../src/components/videos/PlaybackOverlay";

// Mock the image asset import so tests don't depend on bundling static files
vi.mock("../../../src/assets/dsp_no_background.png", () => ({
  default: "mocked-logo-url.png",
}));

describe("PlaybackOverlay", () => {
  test("renders overlay container with aria-hidden and gradient edges", () => {
    const { container } = render(<PlaybackOverlay />);
    const overlay = container.firstElementChild as HTMLDivElement;

    expect(overlay).toBeInTheDocument();
    // Has aria-hidden (non-interactive overlay) and base positioning classes
    expect(overlay).toHaveAttribute("aria-hidden");
    expect(overlay.className).toMatch(/absolute/);
    expect(overlay.className).toMatch(/inset-0/);
    expect(overlay.className).toMatch(/pointer-events-none/);

    // Top/bottom gradient elements present
    // (we look for the two gradient divs that the component renders)
    const gradients = container.querySelectorAll(
      'div[class*="bg-gradient-to-"]',
    );
    expect(gradients.length).toBeGreaterThanOrEqual(2);
  });

  test("shows logo + academy label by default", () => {
    render(<PlaybackOverlay />);
    // Image and label text
    const logo = screen.getByAltText("DataSmart Logo") as HTMLImageElement;
    expect(logo).toBeInTheDocument();
    expect(logo.src).toContain("mocked-logo-url.png");

    expect(screen.getByText(/DSP E-Learning Academy/i)).toBeInTheDocument();
  });

  test("hides logo when showLogo={false}", () => {
    render(<PlaybackOverlay showLogo={false} />);
    expect(screen.queryByAltText("DataSmart Logo")).toBeNull();
    expect(screen.queryByText(/DSP E-Learning Academy/i)).toBeNull();
  });

  test("appends custom className", () => {
    const { container } = render(
      <PlaybackOverlay className="my-extra-class" />,
    );
    const overlay = container.firstElementChild as HTMLDivElement;
    expect(overlay.className).toContain("my-extra-class");
  });
});
