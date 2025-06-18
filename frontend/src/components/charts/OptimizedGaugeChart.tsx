/**
 * Performance-Optimized Gauge Chart Component
 *
 * Demonstrates best practices for heavy chart components including:
 * - Lazy loading with intersection observer
 * - Memoized chart options to prevent unnecessary re-renders
 * - Dynamic import for chart library
 * - Fallback UI during loading
 *
 * This serves as a template for optimizing other chart components.
 */

import React, { memo } from "react";
import {
  useShallowMemo,
  useMemoizedComputation,
  createVendorLazy,
} from "../../util/performance";

interface OptimizedGaugeChartProps {
  progressValue: number;
  width?: number;
  height?: number;
  primaryColor?: string;
  backgroundColor?: string;
  showLabels?: boolean;
}

// Performance optimization: Lazy load the heavy ECharts library
const LazyReactECharts = createVendorLazy(() => import("echarts-for-react"), {
  minHeight: 300,
  fallback: (
    <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="animate-pulse">
        <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="text-sm text-gray-500">Loading chart...</div>
      </div>
    </div>
  ),
});

const OptimizedGaugeChart: React.FC<OptimizedGaugeChartProps> = memo(
  ({
    progressValue,
    width = 300,
    height = 300,
    primaryColor = "#ff863d",
    backgroundColor = "#ffe7d4",
    showLabels = true,
  }) => {
    // Performance optimization: Memoize expensive chart options calculation
    const chartOptions = useMemoizedComputation(
      `gauge-options-${progressValue}-${primaryColor}`,
      () => ({
        series: [
          {
            type: "gauge",
            startAngle: 180,
            endAngle: 0,
            pointer: { show: false },
            progress: {
              show: true,
              width: 10,
              roundCap: true,
              itemStyle: { color: primaryColor },
            },
            axisLine: {
              lineStyle: {
                width: 10,
                color: [[1, backgroundColor]],
              },
            },
            splitLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            detail: { show: false },
            data: [{ value: progressValue }],
          },
        ],
        graphic: showLabels
          ? [
              {
                type: "text",
                left: "10%",
                bottom: "40%",
                style: {
                  text: "0%",
                  fill: "#000",
                },
              },
              {
                type: "text",
                right: "5%",
                bottom: "40%",
                style: {
                  text: "100%",
                  fill: "#000",
                },
              },
            ]
          : [],
      }),
      [progressValue, primaryColor, backgroundColor, showLabels]
    );

    // Performance optimization: Memoize container styles
    const containerStyle = useShallowMemo(
      () => ({
        width: `${width}px`,
        height: `${height}px`,
      }),
      [width, height]
    );

    return (
      <div className="mx-auto" style={{ width: `${width}px` }}>
        <LazyReactECharts
          option={chartOptions}
          style={containerStyle}
          opts={{ renderer: "canvas" }} // Canvas renderer is faster for simple charts
          lazyUpdate={true} // Optimize updates
        />
      </div>
    );
  }
);

// Performance optimization: Set display name for React DevTools
OptimizedGaugeChart.displayName = "OptimizedGaugeChart";

export default OptimizedGaugeChart;
