import React from "react";
import ReactECharts from "echarts-for-react";

interface MinimalGaugeChartProps {
  progressValue: number;
}

const MinimalGaugeChart: React.FC<MinimalGaugeChartProps> = ({
  progressValue,
}) => {
  const option = {
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
          itemStyle: { color: "#ff863d" }, // Fortschrittsbalken in Orange
        },
        axisLine: {
          lineStyle: {
            width: 10,
            color: [[1, "#ffe7d4"]], // Hintergrund in einem helleren Orange-/Creme-Ton
          },
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        data: [{ value: progressValue }],
      },
    ],
    graphic: [
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
    ],
  };

  return (
    <div className="w-[300px] mx-auto">
      <ReactECharts option={option} className="w-full h-[300px]" />
    </div>
  );
};

export default MinimalGaugeChart;
