/**
 *
 * Tests for the <Header /> component.
 *
 * The tests verify:
 *  - Default rendering:
 *      • Renders the default title "Output vorhersagen".
 *  - Custom props:
 *      • Displays a custom title when provided via the `title` prop.
 *  - Icon rendering:
 *      • Ensures the <FaCode /> icon (from react-icons) is rendered
 *        within the header container.
 *
 * Test framework: Vitest + React Testing Library
 * Author: DSP development team
 * Date: 30-10-2025
 */


import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Header } from "@/components/ui_elements/output_prediction/layout/Header";

describe("Header component", () => {
  it("renders with default title", () => {
    render(<Header />);
    const header = screen.getByTestId("outpred-header");
    expect(header).toBeInTheDocument();
    expect(screen.getByText("Output vorhersagen")).toBeInTheDocument();
  });

  it("renders with a custom title", () => {
    render(<Header title="My Custom Title" />);
    expect(screen.getByText("My Custom Title")).toBeInTheDocument();
  });

  it("renders the FaCode icon", () => {
    render(<Header />);
    // Check that the icon SVG is present (react-icons render as <svg>)
    const icon = screen.getByTestId("outpred-header").querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
