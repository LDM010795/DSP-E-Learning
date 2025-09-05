/**
 * Performance-Optimized Gauge Chart Component
 *
 * Converted from direct ECharts import to lazy loading for better performance
 */

import React, { memo, Suspense } from "react";
import { useShallowMemo, useMemoizedComputation } from "../../util/performance";
import { getDspThemeColorCode } from "../../util/helpers/color_theme_utils";

// Lazy load ECharts to reduce initial bundle size
const ReactECharts = React.lazy(() => import("echarts-for-react"));

// Performance fallback during loading
const ChartLoadingFallback = memo(() => (
  <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border">
    <div className="text-center">
      <div className="animate-pulse">
        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3"></div>
        <div className="h-2 bg-gray-300 rounded w-16 mx-auto mb-1"></div>
        <div className="h-2 bg-gray-300 rounded w-12 mx-auto"></div>
      </div>
      <p className="text-gray-500 text-sm mt-2">Chart lädt...</p>
    </div>
  </div>
));

ChartLoadingFallback.displayName = "ChartLoadingFallback";

interface ChartGaugeProps {
  progressValue: number;
  width?: number;
  height?: number;
}

const ChartGauge = memo<ChartGaugeProps>(
  ({ progressValue, width = 300, height = 300 }) => {
    // Memoize chart options to prevent unnecessary re-renders
    const option = useMemoizedComputation(
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
              itemStyle: { color: getDspThemeColorCode("--color-dsp-orange") },
            },
            axisLine: {
              lineStyle: {
                width: 10,
                color: [[1, "#ffe7d4"]],
              },
            },
            splitLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            detail: { show: false },
            data: [{ value: progressValue }],
          },
        ],
      }),
      [progressValue],
    );

    // Memoize container style
    const containerStyle = useShallowMemo(
      () => ({
        width: `${width}px`,
        height: `${height}px`,
      }),
      [width, height],
    );

    return (
      <div className="mx-auto" style={{ width: `${width}px` }}>
        <Suspense fallback={<ChartLoadingFallback />}>
          <ReactECharts
            option={option}
            style={containerStyle}
            opts={{ renderer: "canvas" }}
            lazyUpdate={true}
          />
        </Suspense>
      </div>
    );
  },
);

ChartGauge.displayName = "ChartGauge";

export default ChartGauge;
