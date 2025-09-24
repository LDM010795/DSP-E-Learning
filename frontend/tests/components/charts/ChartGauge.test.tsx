import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Mock the lazy-loaded echarts-for-react
vi.mock("echarts-for-react", () => ({
  __esModule: true,
  default: ({ option, style}: any) => (
    <div data-testid="echarts-mock" data-option={JSON.stringify(option)} style={style}>
      Mocked ECharts
    </div>
  ),
}));

import ChartGauge from "@components/charts/chart_gauge.tsx";

describe("ChartGauge", () => {
  it("shows loading fallback initially", async () => {
    render(<ChartGauge progressValue={50} />);

    // The fallback text should appear
    expect(screen.getByText("Chart lädt...")).toBeInTheDocument();

    // Wait for lazy import resolution
    await screen.findByTestId("echarts-mock");

    // Fallback should be gone
    expect(screen.queryByText("Chart lädt...")).not.toBeInTheDocument();
  });

  it("renders echarts with correct props after lazy load", async () => {
    render(<ChartGauge progressValue={75} width={400} height={200} />);

    const echarts = await screen.findByTestId("echarts-mock");

    // Verify container style applied
    expect(echarts.getAttribute("style")).toContain("width: 400px");

    // Verify option passed down contains correct progressValue
    const option = JSON.parse(echarts.getAttribute("data-option")!);
    expect(option.series[0].data[0].value).toBe(75);
  });
});
