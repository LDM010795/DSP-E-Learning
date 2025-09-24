import React from "react";
import { act, render, screen } from "@testing-library/react"
import { vi } from "vitest"
import LazyLoadChartWrapper from "../../../src/components/common/LazyLoadChartWrapper";

// da es im vitest Umfeld keine echte Browserumgebung gibt,
// muss der IntersectionObserver leider komplett gemockt werden

let observerInstance: MockIntersectionObserver;
class MockIntersectionObserver {
    root: Element | Document | null;
    rootMargin: string;
    thresholds: ReadonlyArray<number>;

    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);

    constructor(private callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
        this.root = options.root ?? null;
        this.rootMargin = options.rootMargin ?? "";
        const t = options.threshold ?? 0;
        this.thresholds = Array.isArray(t) ? t : [t];
        observerInstance = this;
    }

    // Sichtbarkeit simulieren
    triggerIntersect(isIntersecting: boolean, target: Element) {
        this.callback([{ isIntersecting, target } as IntersectionObserverEntry], this);
    }
}

beforeEach(() => {
    // Reset für jeden Test einzeln
    observerInstance = undefined as unknown as MockIntersectionObserver;
    vi.stubGlobal(`IntersectionObserver`, MockIntersectionObserver)
})

const ChartMock = vi.fn(() => <div data-testid="chart" />);

describe("LazyLoadChartWrapper", () => {
    it("init state - renders placeholder with configured styles", () => {
        const { container } = render(
            <LazyLoadChartWrapper
                component={ChartMock}
                minHeight={200}
                placeholderStyle={{ backgroundColor: "red" }}
                chartProps={{}}
            />
        )
        const placeholder = container.firstChild as HTMLDivElement;

        expect(placeholder).toBeInTheDocument();
        expect(placeholder).toHaveStyle({
            minHeight: "200px",
            width: "100%",
            backgroundColor: "rgb(255, 0, 0)"
        });

    });

    it("init state - no chart yet", () => {
        render(
            <LazyLoadChartWrapper
                component={ChartMock}
                minHeight={200}
                placeholderStyle={{ backgroundColor: "red" }}
                chartProps={{ foo: "bar" }}
            />
        )
        const chart = screen.queryByTestId("chart");
        expect(chart).not.toBeInTheDocument();
    });

    it("when placeholder becomes visible, chart is rendered", async () => {
        const { container } = render(
            <LazyLoadChartWrapper
                component={ChartMock}
                minHeight={200}
                chartProps={{ foo: "bar" }}
            />
        );
        const placeholder = container.firstChild as HTMLDivElement;

        // Zugriff auf die Observer-Instanz
        const observer = observerInstance;

        // Chart darf noch nicht gerendert sein
        expect(screen.queryByTestId("chart")).toBeNull();

        // Intersect simulieren
        act(() => {
            observer.triggerIntersect(true, placeholder);
        });

        // Chart sollte jetzt gerendert sein
        const chart = await screen.findByTestId("chart");
        expect(chart).toBeInTheDocument();

        // ChartMock wurde mit chartProps aufgerufen
        expect(ChartMock).toHaveBeenCalledWith(expect.objectContaining({ foo: "bar" }), undefined);
        expect(observer.unobserve).toHaveBeenCalledWith(placeholder);
        expect(observer.disconnect).toHaveBeenCalled();
    });

    it("passes observerOptions to IntersectionObserver", () => {
        const options = { threshold: 0.5, rootMargin: "100px" };
        render(
            <LazyLoadChartWrapper
                component={ChartMock}
                minHeight={200}
                observerOptions={options}
                chartProps={{}}
            />
        );

        expect(observerInstance).toBeDefined();
        expect(observerInstance.thresholds).toEqual([0.5] as ReadonlyArray<number>);
        expect(observerInstance.rootMargin).toBe("100px");
    });

    it("calls unobserve and disconnect on unmount", () => {
        const { unmount, container } = render(
            <LazyLoadChartWrapper component={ChartMock} minHeight={200} chartProps={{}} />
        );
        const placeholder = container.firstChild as HTMLDivElement;

        unmount();

        expect(observerInstance.unobserve).toHaveBeenCalledWith(placeholder);
        expect(observerInstance.disconnect).toHaveBeenCalled();
    });

    it("does not re-render chart when intersect triggered multiple times", () => {
        const { container } = render(<LazyLoadChartWrapper component={ChartMock} minHeight={200} chartProps={{ foo: "bar" }} />);
        const placeholder = container.firstChild as HTMLDivElement;

        act(() => {
            observerInstance.triggerIntersect(true, placeholder);
            observerInstance.triggerIntersect(true, placeholder);
        });

        expect(ChartMock).toHaveBeenCalledTimes(1);
    });

});