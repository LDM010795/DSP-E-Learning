/**
 *
 * These tests verify the correct rendering and behavior of the CardPreviewSmall component:
 *  - Renders title and description text
 *  - Uses the correct YouTube thumbnail if a youtubeId is provided
 *  - Displays the correct status text, icon, and color depending on the progress:
 *      - 0%   → "Nicht begonnen" (gray play icon)
 *      - 1–99% → "In Bearbeitung" (orange hourglass icon)
 *      - 100% → "Abgeschlossen" (green checkmark icon + 100% text)
 *  - Calls the onClick callback when the card is clicked
 *
 * Author: DSP Development Team
 * Date: 25-09-2025
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardPreviewSmall from "../../../src/components/cards/card_preview_small.tsx";

describe("CardPreviewSmall", () => {
  test("renders title + description", () => {
    render(
      <CardPreviewSmall
        title="Intro to DSP"
        description="Short teaser"
        progress={0}
      />,
    );
    expect(screen.getByText("Intro to DSP")).toBeInTheDocument();
    expect(screen.getByText("Short teaser")).toBeInTheDocument();
  });

  test("uses YouTube thumbnail when youtubeId is provided", () => {
    render(
      <CardPreviewSmall
        title="Video"
        youtubeId="abc123"
        progress={0}
        imageMode="auto"
      />,
    );
    const img = screen.getByAltText("Video") as HTMLImageElement;
    expect(img.src).toContain(
      "https://img.youtube.com/vi/abc123/hqdefault.jpg",
    );
  });

  test("shows correct status text + colors and gradient progress bar", () => {
    const { container, rerender } = render(
      <CardPreviewSmall title="X" progress={0} />,
    );

    const assertCurrent = (expected: {
      text: string;
      progress: number;
      statusClass: string; // color class on status text
      percentClass: string; // color class on % span
      dotClass: string; // bg-* class on status dot
    }) => {
      // status text + its dynamic color
      const statusEl = screen.getByText(expected.text);
      expect(statusEl).toBeInTheDocument();
      expect(statusEl.className).toContain(expected.statusClass);

      // percentage badge + its color
      const percentEl = screen.getByText(`${expected.progress}%`);
      expect(percentEl.className).toContain(expected.percentClass);

      // colored status dot
      const dot = container.querySelector(
        "span.inline-flex.h-3.w-3.rounded-full",
      ) as HTMLSpanElement;
      expect(dot).toBeTruthy();
      expect(dot.className).toContain(expected.dotClass);

      // gradient progress bar exists
      const gradientBar = container.querySelector(
        "div.bg-gradient-to-r",
      ) as HTMLDivElement;
      expect(gradientBar).toBeTruthy();
    };

    // 0% -> Nicht begonnen
    assertCurrent({
      text: "Nicht begonnen",
      progress: 0,
      statusClass: "text-gray-500",
      percentClass: "text-gray-500",
      dotClass: "bg-gray-400",
    });

    // 1–99% -> In Bearbeitung
    rerender(<CardPreviewSmall title="X" progress={40} />);
    assertCurrent({
      text: "In Bearbeitung",
      progress: 40,
      statusClass: "text-dsp-orange",
      percentClass: "text-dsp-orange",
      dotClass: "bg-dsp-orange",
    });

    // 100% -> Abgeschlossen
    rerender(<CardPreviewSmall title="X" progress={100} />);
    assertCurrent({
      text: "Abgeschlossen",
      progress: 100,
      statusClass: "text-green-600",
      percentClass: "text-green-600",
      dotClass: "bg-green-600",
    });
  });

  test("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<CardPreviewSmall title="Clickable" onClick={fn} />);
    await user.click(screen.getByText("Clickable"));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
