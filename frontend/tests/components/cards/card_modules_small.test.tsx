/**
 * These tests verify the correct rendering and behavior of the CardModulesSmall component:
 *  - Renders title, difficultyTag, status text, and progress percentage
 *  - Triggers the onClick callback when the card is clicked
 *  - Applies the correct icon, icon background color, status text color,
 *    and progress bar color depending on the `status` prop
 *
 * Status values tested:
 *  - "Nicht begonnen" → gray styling with play icon
 *  - "In Bearbeitung" → orange styling with hourglass icon
 *  - "Abgeschlossen" → green styling with checkmark icon
 *
 * Author: DSP Development Team
 * Date: 25-09-2025
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardModulesSmall from '../../../src/components/cards/card_modules_small.tsx';

describe('CardModulesSmall', () => {
  test('renders title, difficultyTag, status and progress', () => {
    render(
      <CardModulesSmall
        title="Module 1"
        progress={65}
        status="In Bearbeitung"
        difficultyTag={<span>Easy</span>}
      />
    );

    expect(screen.getByText('Module 1')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('In Bearbeitung')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  test('click triggers onClick', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(
      <CardModulesSmall
        title="Module 2"
        progress={0}
        status="Nicht begonnen"
        difficultyTag={<span>Medium</span>}
        onClick={fn}
      />
    );
    await user.click(screen.getByText('Module 2'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // verify icon + colors based on status (no component changes needed)
  test('applies correct icon + colors for each status', () => {
      const cases: Array<{
      status: 'Nicht begonnen' | 'In Bearbeitung' | 'Abgeschlossen';
      progress: number;
      expectIconBoxHas: string;    // bg-* class on the icon container
      expectSvgHas: string;        // text-* class on the <svg> icon
      expectStatusTextHas: string; // text-* class on the status text span
      expectBarHas: string;        // bg-* class on the progress bar
    }> = [
      {
        status: 'Nicht begonnen',
        progress: 0,
        expectIconBoxHas: 'bg-gray-200',
        expectSvgHas: 'text-gray-600',
        expectStatusTextHas: 'text-gray-600',
        expectBarHas: 'bg-gray-300',
      },
      {
        status: 'In Bearbeitung',
        progress: 40,
        expectIconBoxHas: 'bg-dsp-orange',
        expectSvgHas: 'text-white',
        expectStatusTextHas: 'text-dsp-orange',
        expectBarHas: 'bg-dsp-orange',
      },
      {
        status: 'Abgeschlossen',
        progress: 100,
        expectIconBoxHas: 'bg-green-500',
        expectSvgHas: 'text-white',
        expectStatusTextHas: 'text-green-600',
        expectBarHas: 'bg-green-500',
      },
    ];

    for (const c of cases) {
      const { container, unmount } = render(
        <CardModulesSmall
          title="Probe"
          progress={c.progress}
          status={c.status}
          difficultyTag={<span />}
        />
      );

      // status text element
      const statusEl = screen.getByText(c.status);
      expect(statusEl.className).toContain(c.expectStatusTextHas);

      // icon box = the small square with width/height 10
      const iconBox = container.querySelector('div.w-10.h-10.rounded-xl') as HTMLDivElement;
      expect(iconBox).toBeTruthy();
      expect(iconBox!.className).toContain(c.expectIconBoxHas);

      // inside icon box there is an <svg> icon with a text-* color class
      const iconSvg = iconBox!.querySelector('svg') as SVGElement;
      expect(iconSvg).toBeTruthy();
      expect(iconSvg.getAttribute('class') || '').toContain(c.expectSvgHas);

      // progress bar div (the inner moving bar)
      const progressBar = container.querySelector(
        'div[class*="h-1.5"][class*="rounded-full"][class*="transition-all"]'
      ) as HTMLDivElement;
      expect(progressBar).toBeTruthy();
      expect(progressBar!.className).toContain(c.expectBarHas);

      unmount();
    }
  });
});
