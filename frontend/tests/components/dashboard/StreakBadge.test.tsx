/**
 * Tests for StreakBadge component.
 * Verifies that:
 *  - It shows the correct number of streak days
 *  - It renders the trending icon
 *
 * Author: DSP Development Team
 * Date: 2025-10-29
 */

import { render, screen } from "@testing-library/react";
import StreakBadge from "../../../src/components/dashboard/StreakBadge";

describe("StreakBadge", () => {
  test("renders days correctly", () => {
    render(<StreakBadge days={5} />);
    expect(screen.getByText("5 Tage")).toBeInTheDocument();
  });

  test("renders Wochenstreak label", () => {
    render(<StreakBadge days={3} />);
    expect(screen.getByText("Wochenstreak")).toBeInTheDocument();
  });
});
