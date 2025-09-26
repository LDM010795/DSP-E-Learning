import { render, screen } from "@testing-library/react";
import {describe, it, expect, beforeAll} from "vitest";
import SkillDistributionChart from "@components/charts/SkillDistributionChart.tsx";
import {renderMocksForResponsiveContainer} from "../../test-utils.tsx";

beforeAll(() => {
    renderMocksForResponsiveContainer()
})

const mockData = [
  { name: "JavaScript", value: 40, fill: "#f7df1e" },
  { name: "TypeScript", value: 30, fill: "#3178c6" },
  { name: "React", value: 30, fill: "#61dafb" },
];

describe("SkillDistributionChart", () => {
  it("renders the chart container", () => {
    render(<SkillDistributionChart data={mockData} />);
    // Check if SVG container is present
    const svg = screen.getByTestId("pie-chart");
    expect(svg).toBeInTheDocument();
  });

  it("renders the correct number of slices", () => {
    const { container } = render(<SkillDistributionChart data={mockData} />);
    // Pie slices are rendered as <path> elements inside <g> elements
    const paths = container.querySelectorAll("path"); // querySelectorAll works reliably
    expect(paths.length).toBe(mockData.length);
  });

  it("renders labels with correct text", () => {
    render(<SkillDistributionChart data={mockData} />);
    mockData.forEach((entry) => {
      const label = screen.getByText(`${entry.name} ${entry.value}%`);
      expect(label).toBeInTheDocument();
    });
  });
});