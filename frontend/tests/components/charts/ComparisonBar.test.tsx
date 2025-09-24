import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { describe, it, expect } from "vitest";
import ComparisonBar from "@components/charts/ComparisonBar.tsx";

describe("ComparisonBar", () => {
  it("renders the label and display value", () => {
    render(
      <ComparisonBar
        value={50}
        maxValue={100}
        colorClass="bg-dsp-orange"
        label="Du"
        displayValue="50"
      />
    );

    expect(screen.getByText("Du")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("applies the correct height based on value and maxValue", () => {
    const value = 50;
    const maxValue = 100;
    const maxVisualHeight = 96;

    render(
      <ComparisonBar
        value={value}
        maxValue={maxValue}
        colorClass="bg-dsp-orange"
        label="Du"
        displayValue={value}
      />
    );

    const bar = screen.getByTestId("comparison-bar");
    const expectedHeight = `${(value / maxValue) * maxVisualHeight}px`;
    expect(bar).toHaveStyle(`height: ${expectedHeight}`);
  });

  it("applies the correct color class", () => {
    render(
      <ComparisonBar
        value={30}
        maxValue={100}
        colorClass="bg-gray-200"
        label="Durchschnitt"
        displayValue="30"
      />
    );

    const bar = screen.getByTestId("comparison-bar");
    expect(bar).toHaveClass("bg-gray-200");
  });

  it("handles value greater than maxValue correctly", () => {
    render(
      <ComparisonBar
        value={150}
        maxValue={100}
        colorClass="bg-dsp-orange"
        label="Du"
        displayValue="150"
      />
    );

    const bar = screen.getByTestId("comparison-bar");
    expect(bar).toHaveStyle("height: 96px");
  });

  it("handles negative values correctly", () => {
    render(
      <ComparisonBar
        value={-50}
        maxValue={100}
        colorClass="bg-dsp-orange"
        label="Du"
        displayValue="-50"
      />
    );

    const bar = screen.getByTestId("comparison-bar");
    expect(bar).toHaveStyle("height: 0px");
  });
});