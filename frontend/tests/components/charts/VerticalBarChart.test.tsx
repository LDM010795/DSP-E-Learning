import { render, screen, waitFor } from "@testing-library/react";
import VerticalBarChart from "@components/charts/VerticalBarChart.tsx";
import { afterAll, beforeAll, vi } from "vitest";

interface DataPoint {
  name: string; // Y-Achse Label (z.B. Themenname, Modulname)
  value: number; // x-Achse Wert (z.B. Stunden)
}

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
