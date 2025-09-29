import { render, screen, fireEvent, act } from "@testing-library/react";
import ComingSoonOverlay from "@components/messages/coming_soon_overlay.tsx";
import { vi } from "vitest";

describe("ComingSoonOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders default features", () => {
    render(<ComingSoonOverlay daysUntilTarget={10} />);
    expect(
      screen.getByText("Neue Funktionen kommen bald!"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Interaktive Lernmodule/)).toBeInTheDocument();
  });

  it("shows countdown values", () => {
    render(<ComingSoonOverlay daysUntilTarget={1} />);
    expect(screen.getByText(/Tage/)).toBeInTheDocument();
    expect(screen.getByText(/Stunden/)).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<ComingSoonOverlay daysUntilTarget={1} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Schließen"));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("updates email input and submits", () => {
    render(<ComingSoonOverlay daysUntilTarget={1} />);
    const input = screen.getByPlaceholderText(
      "Deine E-Mail-Adresse",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(input.value).toBe("test@example.com");

    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    fireEvent.click(screen.getByText("Benachrichtigen"));
    expect(alertMock).toHaveBeenCalledWith("Danke! Wir benachrichtigen dich.");
  });

  it("progress increases over time", () => {
    render(<ComingSoonOverlay daysUntilTarget={5} />);
    const initial = parseInt(
      screen.getByText(/% fertiggestellt/).textContent || "0",
      10,
    );

    act(() => {
      vi.setSystemTime(new Date("2025-01-02T00:00:00Z"));
      vi.advanceTimersByTime(1000); // let effect's setInterval run once
    });

    const updated = parseInt(
      screen.getByText(/% fertiggestellt/).textContent || "0",
      10,
    );

    expect(updated).toBeGreaterThan(initial);
  });

  it("counts down correctly based on daysUntilTarget", () => {
    // Freeze time at Jan 1, 2025
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));

    render(<ComingSoonOverlay daysUntilTarget={5} />);

    // Expect 5 days remaining initially
    expect(screen.getByText("05")).toBeInTheDocument();
    expect(screen.getByText("Tage")).toBeInTheDocument();

    // Advance simulated clock by 1 day
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 60 * 24); // 24h
    });

    // Should now display 04 days
    expect(screen.getByText("04")).toBeInTheDocument();
  });
});
