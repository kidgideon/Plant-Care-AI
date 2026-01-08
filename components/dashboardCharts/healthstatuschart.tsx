"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./charts.module.css";

const data = [
  { name: "Healthy", value: 7 },
  { name: "At-Risk", value: 2 },
  { name: "Declining", value: 3 },
];

const COLORS = ["var(--color-success)", "var(--color-warning)", "var(--color-error)"];

const HealthStatusChart = () => {
  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.chartTitle}>Overall Plant Health Distribution</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40} // makes it a donut chart
            paddingAngle={3}
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthStatusChart;
