/**
 * These tests verify the correct rendering and behavior of the CardModulesSmall component:
 *  - Renders title, difficultyTag, *derived* status text, and progress percentage
 *  - Triggers the onClick callback when the card is clicked
 *  - Applies the correct icon, icon background color, status text color,
 *    and progress bar color depending on the *derived* status (from progress)
 *
 * Derived status rules:
 *  - progress = 0  → "Nicht begonnen" (gray, play icon)
 *  - 0 < progress < 100→ "In Bearbeitung" (orange, hourglass icon)
 *  - progress ≥ 100 → "Abgeschlossen" (green, checkmark icon)
 *
 * Author: DSP Development Team
 * Date: 25-09-2025
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardModulesSmall from "../../../src/components/cards/card_modules_small.tsx";

describe("CardModulesSmall (new design)", () => {
  test("renders title, difficultyTag, derived status and progress", () => {
    render(
      <CardModulesSmall
        title="Module 1"
        progress={65}
        difficultyTag={<span>Easy</span>}
      />,
    );

    expect(screen.getByText("Module 1")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();

    // status is derived from progress (65 -> "In Bearbeitung")
    expect(screen.getByText("In Bearbeitung")).toBeInTheDocument();
    expect(screen.getByText("65%")).toBeInTheDocument();

    // Play button is present in header
    expect(
      screen.getByRole("button", { name: /starten/i }),
    ).toBeInTheDocument();
  });

  test("click triggers onClick", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(
      <CardModulesSmall
        title="Module 2"
        progress={0}
        difficultyTag={<span>Medium</span>}
        onClick={fn}
      />,
    );
    await user.click(screen.getByText("Module 2"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // verify status styles and gradient progress bar (new design)
  test("applies correct status styles and renders gradient progress bar", () => {
    const cases: Array<{
      progress: number;
      expectedText: "Nicht begonnen" | "In Bearbeitung" | "Abgeschlossen";
      expectStatusTextHas: string; // text-* class on status text
      expectDotBgHas: string; // bg-* class on status dot
      expectedPercent: string;
    }> = [
      {
        progress: 0,
        expectedText: "Nicht begonnen",
        expectStatusTextHas: "text-gray-600",
        expectDotBgHas: "bg-gray-400",
        expectedPercent: "0%",
      },
      {
        progress: 40,
        expectedText: "In Bearbeitung",
        expectStatusTextHas: "text-dsp-orange",
        expectDotBgHas: "bg-dsp-orange",
        expectedPercent: "40%",
      },
      {
        progress: 100,
        expectedText: "Abgeschlossen",
        expectStatusTextHas: "text-green-600",
        expectDotBgHas: "bg-green-600",
        expectedPercent: "100%",
      },
    ];

    for (const c of cases) {
      const { container, unmount } = render(
        <CardModulesSmall
          title="Probe"
          progress={c.progress}
          difficultyTag={<span />}
        />,
      );

      // status text + color
      const statusEl = screen.getByText(c.expectedText);
      expect(statusEl).toBeInTheDocument();
      expect(statusEl.className).toContain(c.expectStatusTextHas);

      // percent badge
      expect(screen.getByText(c.expectedPercent)).toBeInTheDocument();

      // status dot element
      const dot = container.querySelector(
        "span.inline-flex.h-3.w-3.rounded-full",
      ) as HTMLSpanElement;
      expect(dot).toBeTruthy();
      expect(dot.className).toContain(c.expectDotBgHas);

      // gradient progress bar (new design)
      const gradientBar = container.querySelector(
        "div.bg-gradient-to-r",
      ) as HTMLDivElement;
      expect(gradientBar).toBeTruthy();

      unmount();
    }
  });
});
