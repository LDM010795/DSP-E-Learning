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


import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardPreviewSmall from '../../../src/components/cards/card_preview_small.tsx';

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
    render(<CardPreviewSmall title="Video" youtubeId="abc123" progress={0} />);
    const img = screen.getByAltText("Video") as HTMLImageElement;
    expect(img.src).toContain(
      "https://img.youtube.com/vi/abc123/hqdefault.jpg",
    );
  });

  test('shows correct status text based on progress (and verifies icon + percentage color)', () => {
      const { container, rerender } = render(<CardPreviewSmall title="X" progress={0} />);

      // We verify:
      //  - status text (always visible, label is always gray-700 in component)
      //  - SVG icon color (varies with status)
      //  - percentage text color (varies with status)
      const assertCurrent = (expected: {
          text: string;            // status text
          progress: number;        // current progress (to find the % element)
          svgClass: string;        // color class on the <svg> icon
          percentClass: string;    // color class on the {progress}% span
          }) => {
          // status label text (no dynamic color assertion here — it's always gray-700)
          expect(screen.getByText(expected.text)).toBeInTheDocument();

          // icon color
          const svg = container.querySelector(
              `svg[class*="${expected.svgClass}"]`
          ) as SVGElement | null;
          expect(svg).toBeTruthy();

          // percentage color
          const percentEl = screen.getByText(`${expected.progress}%`);
          expect(percentEl.className).toContain(expected.percentClass);
      };

      // 0% -> Nicht begonnen
      assertCurrent({
          text: 'Nicht begonnen',
          progress: 0,
          svgClass: 'text-gray-500',
          percentClass: 'text-gray-500',
      });

      // 1–99% -> In Bearbeitung
      rerender(<CardPreviewSmall title="X" progress={40} />);
      assertCurrent({
          text: 'In Bearbeitung',
          progress: 40,
          svgClass: 'text-dsp-orange',
          percentClass: 'text-dsp-orange',
      });

      // 100% -> Abgeschlossen
      rerender(<CardPreviewSmall title="X" progress={100} />);
      assertCurrent({
          text: 'Abgeschlossen',
          progress: 100,
          svgClass: 'text-green-600',
          percentClass: 'text-green-600',
      });
  });



  test('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const fn = vi.fn();
      render(<CardPreviewSmall title="Clickable" onClick={fn} />);
      await user.click(screen.getByText('Clickable'));
      expect(fn).toHaveBeenCalledTimes(1);
  });
});
