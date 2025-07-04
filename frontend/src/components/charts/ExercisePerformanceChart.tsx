/**
 * Performance-Optimized Exercise Performance Chart
 * 
 * Key optimizations:
 * - Lazy loading for ECharts library
 * - Memoized chart options and data processing
 * - Optimized rendering with Canvas renderer
 * - Loading fallback component
 */

import React, { memo, Suspense } from "react";
import { useShallowMemo, useMemoizedComputation } from "../../util/performance";

// Lazy load ECharts to reduce initial bundle size
const ReactECharts = React.lazy(() => import("echarts-for-react"));

// Performance fallback during loading
const ChartLoadingFallback = memo(() => (
  <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border">
    <div className="text-center">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-orange-300 rounded-lg mx-auto mb-3"></div>
        <div className="h-2 bg-orange-200 rounded w-20 mx-auto mb-1"></div>
        <div className="h-2 bg-orange-200 rounded w-16 mx-auto"></div>
      </div>
      <p className="text-orange-600 text-sm mt-2">Performance Chart lädt...</p>
    </div>
  </div>
));

ChartLoadingFallback.displayName = "ExercisePerformanceChartLoadingFallback";

interface ExercisePerformanceChartProps {
  exerciseData: Array<{
    exercise: string;
    score: number;
    maxScore: number;
  }>;
  width?: number;
  height?: number;
}

const ExercisePerformanceChart = memo<ExercisePerformanceChartProps>(({ 
  exerciseData, 
  width = 400, 
  height = 300 
}) => {
  // Memoize chart options to prevent unnecessary re-renders
  const chartOptions = useMemoizedComputation(
    () => {
      const exercises = exerciseData.map(item => item.exercise);
      const scores = exerciseData.map(item => item.score);
      const maxScores = exerciseData.map(item => item.maxScore);
      const percentages = exerciseData.map(item => 
        item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0
      );

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const dataIndex = params[0]?.dataIndex ?? 0;
            const exercise = exercises[dataIndex];
            const score = scores[dataIndex];
            const maxScore = maxScores[dataIndex];
            const percentage = percentages[dataIndex];
            
            return `
              <div style="padding: 8px;">
                <strong>${exercise}</strong><br/>
                Score: ${score}/${maxScore}<br/>
                Performance: ${percentage}%
              </div>
            `;
          }
        },
        xAxis: {
          type: 'category',
          data: exercises,
          axisLabel: {
            rotate: 45,
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            data: percentages,
            type: 'bar',
            itemStyle: {
              color: '#ff863d',
              borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
              itemStyle: {
                color: '#ff7029'
              }
            }
          }
        ],
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%',
          top: '10%'
        }
      };
    },
    [exerciseData]
  );

  // Memoize container style
  const containerStyle = useShallowMemo(
    () => ({
      width: `${width}px`,
      height: `${height}px`,
    }),
    [width, height]
  );

  return (
    <div className="w-full">
      <Suspense fallback={<ChartLoadingFallback />}>
        <ReactECharts
          option={chartOptions}
          style={containerStyle}
          opts={{ renderer: "canvas" }}
          lazyUpdate={true}
        />
      </Suspense>
    </div>
  );
});

ExercisePerformanceChart.displayName = "ExercisePerformanceChart";

export default ExercisePerformanceChart;
