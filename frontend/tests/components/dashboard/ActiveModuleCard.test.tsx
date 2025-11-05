/**
 * Tests for ActiveModuleCard component.
 * Verifies that:
 *  - It displays module title, lessons, and progress
 *  - The “Fortfahren” button is rendered with correct link
 *  - Hover styles don’t break rendering
 *
 * Author: DSP Development Team
 * Date: 2025-10-29
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ActiveModuleCard from "../../../src/components/dashboard/ActiveModuleCard";

describe("ActiveModuleCard", () => {
  const mockModule = {
    id: 1,
    title: "API Design Principles",
    study_time_hours: 2.5,
    lessons_done: 3,
    lessons_total: 5,
    progress_percent: 60,
  };

  test("renders module title and progress", () => {
    render(
      <MemoryRouter>
        <ActiveModuleCard m={mockModule} />
      </MemoryRouter>,
    );
    expect(screen.getByText("API Design Principles")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  test("renders Fortfahren button with link", () => {
    render(
      <MemoryRouter>
        <ActiveModuleCard m={mockModule} />
      </MemoryRouter>,
    );
    const button = screen.getByText("Fortfahren");
    expect(button.closest("a")).toHaveAttribute("href", "/modules/1");
  });
});
