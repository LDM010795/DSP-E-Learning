import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

interface DataPoint {
  name: string; // Y-Achse Label (z.B. Themenname, Modulname)
  value: number; // X-Achse Wert (z.B. Stunden)
}

interface Props {
  data: DataPoint[];
  xAxisLabel?: string; // Optionales Label für die X-Achse
  barFill?: string; // Optionale Füllfarbe für die Balken
  height?: number; // Optionale Höhe
}

const VerticalBarChart: React.FC<Props> = ({
  data,
  xAxisLabel = "Wert",
  barFill = "#FF8C00",
  height = 300, // Standardhöhe
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          label={{
            value: xAxisLabel,
            position: "insideBottomRight",
            dy: 10,
            fontSize: 12,
          }}
          axisLine={false}
          tickLine={false}
          fontSize={12}
        />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          width={150}
          fontSize={12}
        />
        <Tooltip
          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "12px",
          }}
          labelFormatter={(label) => `${label}`}
          formatter={(value: number) => [value, xAxisLabel]} // Nutzt das Label der X-Achse
        />
        <Bar
          dataKey="value"
          fill={barFill}
          radius={[0, 4, 4, 0]}
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VerticalBarChart;
