import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "@components/ui_elements/loading_spinner.tsx";

describe("LoadingSpinner Component", () => {
  it("renders without crashing", () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId("loading-message")).toBeInTheDocument();
  });

  it("renders the correct custom message", () => {
    render(<LoadingSpinner message="Please wait..." />);
    expect(screen.getByText(/please wait/i)).toBeInTheDocument();
  });

  it("renders spinner variant by default", () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("renders hourglass variant", () => {
    render(<LoadingSpinner variant="hourglass" />);
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("renders pulse variant", () => {
    render(<LoadingSpinner variant="pulse" />);
    const indicator = screen.getByTestId("loading-indicator");
    expect(indicator.firstChild).toHaveClass("rounded-full");
  });

  it("renders dots variant with three dots", () => {
    render(<LoadingSpinner variant="dots" />);
    const indicator = screen.getByTestId("loading-indicator");
    const test = indicator.firstChild;
    expect(indicator.querySelectorAll("div")).toHaveLength(5); //renders with two helper divs
  });

  it("applies fullScreen wrapper when prop is true", () => {
    render(<LoadingSpinner fullScreen />);
    const wrapper = screen.getByTestId("loading-content").parentElement;
    expect(wrapper).toHaveClass("fixed");
    expect(wrapper).toHaveClass("flex");
  });

  it("applies size classes correctly", () => {
    render(<LoadingSpinner size="xl" />);
    const messageEl = screen.getByTestId("loading-message").querySelector("p");
    expect(messageEl).toHaveClass("text-xl");
  });

  it("applies additional className prop", () => {
    render(<LoadingSpinner className="custom-class" />);
    const content = screen.getByTestId("loading-content");
    expect(content).toHaveClass("custom-class");
  });

  it("renders progress indicator", () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId("loading-progress")).toBeInTheDocument();
  });
});
