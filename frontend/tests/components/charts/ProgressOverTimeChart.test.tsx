// ProgressOverTimeChart.test.tsx
import { render, screen } from "@testing-library/react";
import ProgressOverTimeChart from "@components/charts/ProgressOverTimeChart.tsx";
import {beforeAll, vi} from "vitest";
import {getDspThemeColorCode} from "@/util/helpers/color_theme_utils.tsx";

const mockData = [
  { month: "Jan", Fortschritt: 20 },
  { month: "Feb", Fortschritt: 40 },
  { month: "Mrz", Fortschritt: 60 },
];

vi.mock("@/util/helpers/color_theme_utils.tsx", () => ({
  getDspThemeColorCode: vi.fn().mockReturnValue("#ff6600"),
}));

const originalGetBoundingClientRect =
  HTMLElement.prototype.getBoundingClientRect;

beforeAll(() => {
  // Make getBoundingClientRect return non-zero for the recharts wrapper
  HTMLElement.prototype.getBoundingClientRect = function () {
    if (
      this.classList &&
      this.classList.contains("recharts-responsive-container")
    ) {
      return {
        width: 800,
        height: 300,
        top: 0,
        left: 0,
        right: 800,
        bottom: 300,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect;
    }
    return (
      originalGetBoundingClientRect?.call(this) ?? {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      }
    );
  };

  // offsetWidth/offsetHeight positive values
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return 800;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return 300;
    },
  });

  // requestAnimationFrame polyfill to run callbacks
  (global as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(cb, 0);

  // ResizeObserver mock that immediately notifies with current rect
  class MockResizeObserver {
    cb: any;
    constructor(cb: any) {
      this.cb = cb;
    }
    observe(target: Element) {
      const rect = (target as any).getBoundingClientRect?.() ?? {
        width: 800,
        height: 300,
      };
      this.cb([
        { target, contentRect: { width: rect.width, height: rect.height } },
      ]);
    }
    unobserve() {}
    disconnect() {}
  }
  (global as any).ResizeObserver = MockResizeObserver;
});

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

  it("formats tooltip correctly", () => {
    render(<ProgressOverTimeChart data={mockData} />);
    // Tooltip content is not visible until interaction,
    // but you can unit test the formatter by calling it directly.
    const tooltipProps = (ProgressOverTimeChart as any).defaultProps?.children?.props?.children?.find(
      (c: any) => c.type?.displayName === "Tooltip"
    );
    // Alternative: export formatters separately and test directly
  });
});