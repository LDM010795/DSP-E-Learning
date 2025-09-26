import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ExercisePerformanceChart from "@components/charts/ExercisePerformanceChart.tsx";

// Mock ReactECharts since we don't want to render the full chart
vi.mock("echarts-for-react", () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="echarts-mock">Chart</div>),
}));

describe("ExercisePerformanceChart", () => {
  const mockData = [
    { exercise: "Push-ups", score: 8, maxScore: 10 },
    { exercise: "Squats", score: 7, maxScore: 10 },
  ];

  it("renders loading fallback initially", () => {
    render(<ExercisePerformanceChart exerciseData={mockData} />);

    expect(screen.getByText("Performance Chart lädt...")).toBeInTheDocument();
  });

  it("renders the chart after lazy loading", async () => {
    render(<ExercisePerformanceChart exerciseData={mockData} />);

    // Wait for the lazy-loaded chart to appear
    const chart = await waitFor(() => screen.getByTestId("echarts-mock"));

    expect(chart).toBeInTheDocument();
  });

  it("passes correct chart options to ReactECharts", async () => {
    const { default: ReactEChartsMock } = await import("echarts-for-react");

    render(<ExercisePerformanceChart exerciseData={mockData} />);

    await waitFor(() => screen.getByTestId("echarts-mock"));

    // Access the props passed to the mocked component
    const chartProps = ReactEChartsMock.mock.calls[0][0];

    expect(chartProps.option.series[0].data).toEqual([80, 70]);
    expect(chartProps.style.width).toBe("400px");
    expect(chartProps.style.height).toBe("300px");
  });

  it("respects custom width and height", async () => {
    render(
      <ExercisePerformanceChart
        exerciseData={mockData}
        width={500}
        height={400}
      />,
    );

    const chart = await waitFor(() => screen.getByTestId("echarts-mock"));

    expect(chart).toBeInTheDocument();
    const { default: ReactEChartsMock } = await import("echarts-for-react");
    const chartProps = ReactEChartsMock.mock.calls[0][0];

    expect(chartProps.style.width).toBe("500px");
    expect(chartProps.style.height).toBe("400px");
  });
});
