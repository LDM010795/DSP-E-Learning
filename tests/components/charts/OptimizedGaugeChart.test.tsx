// OptimizedGaugeChart.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
// Mock ECharts component so you don’t need to load the real lib
vi.mock("echarts-for-react", () => {
  return {
    default: (props: any) => (
      <div data-testid="echarts-mock" data-props={JSON.stringify(props)} />
    ),
  };
});

import OptimizedGaugeChart from "@components/charts/OptimizedGaugeChart.tsx";

describe("OptimizedGaugeChart", () => {
  it("shows fallback while loading", async () => {
    render(<OptimizedGaugeChart progressValue={50} />);
    expect(screen.getByText(/loading chart/i)).toBeInTheDocument();
  });

  it("renders echarts after lazy load resolves", async () => {
    render(<OptimizedGaugeChart progressValue={75} width={400} height={200} />);
    const echarts = await screen.findByTestId("echarts-mock");
    expect(echarts).toBeInTheDocument();
  });

  it("passes correct props to echarts", async () => {
    render(
      <OptimizedGaugeChart
        progressValue={42}
        width={250}
        height={150}
        showLabels={false}
      />,
    );
    const echarts = await screen.findByTestId("echarts-mock");
    const props = JSON.parse(echarts.getAttribute("data-props") || "{}");

    expect(props.style).toEqual({ width: "250px", height: "150px" });
    expect(props.option.series[0].data[0].value).toBe(42);
    expect(props.option.graphic).toEqual([]); // because showLabels=false
  });
});
