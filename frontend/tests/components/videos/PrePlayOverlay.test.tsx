/**
 * PrePlayOverlay
 *
 * Verifies:
 * - Renders with default logo when no previewImageSrc is given
 * - Renders with provided preview image when supplied
 * - Calls onStart when play button is clicked
 * - Applies custom className to root container
 * - Decorative circles and blur overlay exist
 *
 * Author: DSP development team
 * Date: 2025-09-29
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrePlayOverlay from "../../../src/components/videos/PrePlayOverlay";

// mock static asset (logo)
vi.mock("../../../src/assets/dsp_no_background.png", () => ({
  default: "mocked-logo.png",
}));

describe("PrePlayOverlay", () => {
  test("renders with default logo when no previewImageSrc is provided", () => {
    render(<PrePlayOverlay onStart={vi.fn()} />);
    const img = screen.getByAltText("Video Vorschau") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("mocked-logo.png");
  });

  test("renders with custom previewImageSrc when provided", () => {
    render(
      <PrePlayOverlay onStart={vi.fn()} previewImageSrc="custom-preview.png" />,
    );
    const img = screen.getByAltText("Video Vorschau") as HTMLImageElement;
    expect(img.src).toContain("custom-preview.png");
  });

  test("calls onStart when play button is clicked", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();

    render(<PrePlayOverlay onStart={onStart} />);
    const button = screen.getByRole("button", { name: /video abspielen/i });
    await user.click(button);

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  test("applies custom className to root element", () => {
    const { container } = render(
      <PrePlayOverlay onStart={vi.fn()} className="extra-class" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("extra-class");
  });

  test("renders decorative elements and blur overlay", () => {
    const { container } = render(<PrePlayOverlay onStart={vi.fn()} />);
    // overlay container
    const overlay = container.querySelector(
      "div.bg-black\\/20, div.bg-black\\/30",
    );
    expect(overlay).toBeTruthy();

    // decorative circles (hidden on small screens but still in DOM)
    const circles = container.querySelectorAll("div.rounded-full");
    expect(circles.length).toBeGreaterThanOrEqual(3);
  });
});
