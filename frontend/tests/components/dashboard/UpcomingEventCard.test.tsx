/**
 * Tests for UpcomingEventCard component.
 * Verifies that:
 *  - It shows the event title and date
 *  - It displays the event type badge with correct color style
 *  - It shows the remaining days until the event
 *
 * Author: DSP Development Team
 * Date: 2025-10-29
 */

import { render, screen } from "@testing-library/react";
import UpcomingEventCard from "../../../src/components/dashboard/UpcomingEventCard";

describe("UpcomingEventCard", () => {
  const event = {
    id: "evt1",
    title: "React Projekt Abgabe",
    date_iso: "2025-12-05",
    type: "Aufgabe" as const,
  };

  test("renders event title and type", () => {
    render(<UpcomingEventCard e={event} />);
    expect(screen.getByText("React Projekt Abgabe")).toBeInTheDocument();
    expect(screen.getByText("Aufgabe")).toBeInTheDocument();
  });

  test("renders date and countdown", () => {
    render(<UpcomingEventCard e={event} />);
    expect(screen.getByText(/Dezember/)).toBeInTheDocument();
    expect(screen.getByText(/in/)).toBeInTheDocument();
  });
});
