import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

interface DataPoint {
  name: string;
  korrekt: number;
  inkorrekt: number;
}

interface Props {
  data: DataPoint[];
}

const ExercisePerformanceChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          domain={[0, 100]}
          unit="%"
          axisLine={false}
          tickLine={false}
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
          formatter={(value: number, name: string) => [
            `${value}%`,
            name === "korrekt" ? "Korrekt" : "Inkorrekt",
          ]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-gray-600">
              {value === "korrekt" ? "Korrekt" : "Inkorrekt"}
            </span>
          )}
        />
        <Bar
          dataKey="korrekt"
          stackId="a"
          fill="#4CAF50"
          radius={[4, 4, 0, 0]}
          barSize={35}
        />
        <Bar
          dataKey="inkorrekt"
          stackId="a"
          fill="#F44336"
          radius={[4, 4, 0, 0]}
          barSize={35}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ExercisePerformanceChart;
