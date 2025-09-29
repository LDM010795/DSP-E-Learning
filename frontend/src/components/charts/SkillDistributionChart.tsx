import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
  fill: string; // Farbe wird in den Daten mitgegeben
}

interface Props {
  data: DataPoint[];
}

// Hilfsfunktion für Außen-Labels
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
  fill,
}: any) => {
  const radius = outerRadius + 25; // Abstand vom Zentrum zum Label
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={fill} // Label-Farbe = Segment-Farbe
      textAnchor={x > cx ? "start" : "end"} // Textausrichtung basierend auf Position
      dominantBaseline="central"
      fontSize={12} // Schriftgröße anpassen
      fontWeight="medium" // Etwas fetter
    >
      {`${name} ${value}%`}
    </text>
  );
};

const SkillDistributionChart: React.FC<Props> = ({ data }) => {
  return (
    // Höhe anpassen für Pie Chart + Legende
    <ResponsiveContainer width="100%" height={300}>
      <PieChart
        margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
        data-testid="pie-chart"
      >
        {" "}
        {/* Mehr Margin für Labels */}
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value}%`, name]}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", marginTop: "15px" }}
          formatter={(value) => (
            <span className="text-xs text-gray-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SkillDistributionChart;
