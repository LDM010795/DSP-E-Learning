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
import { getDspThemeColorCode } from "../../util/helpers/color_theme_utils";

interface DataPoint {
  day: string;
  Stunden: number;
}

interface Props {
  data: DataPoint[];
}

const LearningTimeChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis axisLine={false} tickLine={false} fontSize={12} />
        <Tooltip
          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "12px",
          }}
          labelFormatter={(label) => `Tag: ${label}`}
          formatter={(value: number) => [`${value} Std.`, "Lernzeit"]}
        />
        <Bar
          dataKey="Stunden"
          fill={`${getDspThemeColorCode("dsp-orange")}`}
          radius={[4, 4, 0, 0]}
          barSize={35}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LearningTimeChart;
