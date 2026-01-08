"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import styles from "./charts.module.css";

// Fake weekly data
const data = [
  { week: "Week 1", avgHealth: 75 },
  { week: "Week 2", avgHealth: 78 },
  { week: "Week 3", avgHealth: 72 },
  { week: "Week 4", avgHealth: 80 },
  { week: "Week 5", avgHealth: 82 },
];

const HealthScoreTrend = () => {
  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.chartTitle}>Average Health Score Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
          <Line type="monotone" dataKey="avgHealth" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthScoreTrend;
