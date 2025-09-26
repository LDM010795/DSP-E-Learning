import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import LearningTimeChart from "@components/charts/LearningTimeChart.tsx";
import {renderMocksForResponsiveContainer} from "../../test-utils.tsx";

beforeAll(() => {
    renderMocksForResponsiveContainer()
})


describe("LearningTimeChart", () => {
  const mockData = [
    { day: "Monday", Stunden: 2 },
    { day: "Tuesday", Stunden: 3 },
    { day: "Wednesday", Stunden: 4 },
  ];

  it("renders without crashing", () => {
    render(<LearningTimeChart data={mockData} />);
    expect(screen.getByTestId("learningTimeChart")).toBeInTheDocument();
  });

  it("renders bars for each data point", () => {
    const { container } = render(<LearningTimeChart data={mockData} />);

    // Bars in Recharts render as <rect> inside the SVG
    const bars = container.querySelectorAll(".recharts-bar-rectangle");
    expect(bars.length).toBeGreaterThanOrEqual(mockData.length);
  });

  it("renders correct day labels on the XAxis", () => {
    render(<LearningTimeChart data={mockData} />);
    mockData.forEach((item) => {
      expect(screen.getByText(item.day)).toBeInTheDocument();
    });
  });
});
