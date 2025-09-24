import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import LearningTimeChart from "@components/charts/LearningTimeChart.tsx";

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
