import { render, screen, waitFor } from "@testing-library/react";
import VerticalBarChart from "@components/charts/VerticalBarChart.tsx";
import { beforeAll } from "vitest";
import {renderMocksForResponsiveContainer} from "../../test-utils.tsx";

interface DataPoint {
  name: string; // Y-Achse Label (z.B. Themenname, Modulname)
  value: number; // x-Achse Wert (z.B. Stunden)
}

beforeAll(() => {
    renderMocksForResponsiveContainer()
})

describe("VerticalBarChart", async () => {
  // setup testing data
  const data: DataPoint[] = [
    { name: "Test1", value: 10 },
    { name: "Test2", value: 20 },
    { name: "Test3", value: 30 },
  ];

  it("Renders at all", async () => {
    render(<VerticalBarChart data={data} />);
    await waitFor(() => expect(screen.getByText("Test1")).toBeInTheDocument());
    expect(screen.getByText("Test2")).toBeInTheDocument();
    expect(screen.getByText("Test3")).toBeInTheDocument();
  });

  it("Use default x-axis label", async () => {
    render(<VerticalBarChart data={data} />);
    await waitFor(() => expect(screen.getByText("Wert")).toBeInTheDocument());
  });

  it("renders custom xAxisLabel", () => {
    render(<VerticalBarChart data={data} xAxisLabel="Stunden" />);
    expect(screen.getByText("Stunden")).toBeInTheDocument();
  });

  it.skip("applies custom bar fill color", async () => {
    //can't get this test to run. Does not like rendering in JSDOM
    const { container } = render(
      <VerticalBarChart data={data} barFill="#123456" />,
    );
    await waitFor(() => {
      const bars = container.querySelectorAll(".recharts-bar-rectangle");
      expect(bars.length).toBeGreaterThan(0);
      expect(bars[0].getAttribute("fill")).toBe("#123456");
    });
  });

  it("respects custom height", () => {
    const { container } = render(<VerticalBarChart data={data} height={500} />);
    // ResponsiveContainer sets height on the wrapping div
    const wrapper = container.querySelector(".recharts-responsive-container");
    expect(wrapper).toHaveAttribute(
      "style",
      expect.stringContaining("height: 500px"),
    );
  });
});
