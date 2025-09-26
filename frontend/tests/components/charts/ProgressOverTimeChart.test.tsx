// ProgressOverTimeChart.test.tsx
import { render, screen } from "@testing-library/react";
import ProgressOverTimeChart from "@components/charts/ProgressOverTimeChart.tsx";
import {beforeAll, vi} from "vitest";
import {getDspThemeColorCode} from "@/util/helpers/color_theme_utils.tsx";
import {renderMocksForResponsiveContainer} from "../../test-utils.tsx";

const mockData = [
  { month: "Jan", Fortschritt: 20 },
  { month: "Feb", Fortschritt: 40 },
  { month: "Mrz", Fortschritt: 60 },
];



beforeAll(() => {
    renderMocksForResponsiveContainer()
    vi.mock("@/util/helpers/color_theme_utils.tsx", () => ({
  getDspThemeColorCode: vi.fn().mockReturnValue("#ff6600"),
}));
})

describe("ProgressOverTimeChart", () => {
  it("renders without crashing", () => {
    render(<ProgressOverTimeChart data={mockData} />);
    // SVG container check
    expect(screen.getByTestId("linechart")).toBeInTheDocument();
  });

  it("renders correct number of x-axis labels", () => {
    render(<ProgressOverTimeChart data={mockData} />);
    mockData.forEach((point) => {
      expect(screen.getByText(point.month)).toBeInTheDocument();
    });
  });

it("passes correct stroke to Line", () => {
  render(<ProgressOverTimeChart data={mockData} />);
  // check if defautl color was called
  expect(getDspThemeColorCode).toHaveBeenCalledWith("dsp-orange");
});
});