import { render, screen } from "@testing-library/react";
import {describe, it, expect, beforeAll} from "vitest";
import SkillDistributionChart from "@components/charts/SkillDistributionChart.tsx";

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