import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "@components/ui_elements/loading_spinner.tsx";

// Utility to check if a class exists on element
const hasClass = (element: HTMLElement, className: string) =>
  element.classList.contains(className);

describe("LoadingSpinner Component", () => {
  it("renders without crashing", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText(/laden/i)).toBeInTheDocument();
  });

  it("renders the correct message", () => {
    render(<LoadingSpinner message="Please wait..." />);
    expect(screen.getByText(/please wait/i)).toBeInTheDocument();
  });

  it("renders spinner variant by default", () => {
    render(<LoadingSpinner />);
    const spinnerIcon = screen.getByRole("img", { hidden: true });
    expect(spinnerIcon).toBeInTheDocument();
  });

  it("renders hourglass variant", () => {
    render(<LoadingSpinner variant="hourglass" />);
    const hourglassIcon = screen.getByRole("img", { hidden: true });
    expect(hourglassIcon).toBeInTheDocument();
  });

  it("renders pulse variant", () => {
    render(<LoadingSpinner variant="pulse" />);
    const pulseDiv = screen.getByText(/laden/i).previousSibling as HTMLElement;
    expect(pulseDiv).toHaveClass("rounded-full");
  });

  it("renders dots variant with three dots", () => {
    render(<LoadingSpinner variant="dots" />);
    const dots = screen.getAllByRole("presentation"); // for non-semantic divs
    expect(dots.length).toBe(3);
  });

  it("applies fullScreen wrapper when prop is true", () => {
    render(<LoadingSpinner fullScreen />);
    const wrapper = screen.getByText(/laden/i).closest("div");
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("fixed");
  });

  it("applies size classes correctly", () => {
    render(<LoadingSpinner size="xl" />);
    const messageEl = screen.getByText(/laden/i);
    expect(hasClass(messageEl, "text-xl")).toBe(true);
  });

  it("applies additional className prop", () => {
    render(<LoadingSpinner className="custom-class" />);
    const wrapper = screen.getByText(/laden/i).closest("div");
    expect(wrapper).toHaveClass("custom-class");
  });
});
