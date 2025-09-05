import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import { getDspThemeColorCode } from "../../util/helpers/color_theme_utils";

interface DataPoint {
  month: string;
  Fortschritt: number;
}

interface Props {
  data: DataPoint[];
}

const ProgressOverTimeChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          domain={[0, 100]}
          unit="%"
          axisLine={false}
          tickLine={false}
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "12px",
          }}
          labelFormatter={(label) => `Monat: ${label}`}
          formatter={(value: number) => [`${value}%`, "Fortschritt"]}
        />
        <Line
          type="monotone"
          dataKey="Fortschritt"
          stroke={`${getDspThemeColorCode("dsp-orange")}`}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressOverTimeChart;
