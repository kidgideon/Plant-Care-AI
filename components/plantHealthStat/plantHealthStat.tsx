"use client";

import React from "react";
import { Radar, Line } from "react-chartjs-2";
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale } from "chart.js";
import styles from "./plantHealthStat.module.css";

Chart.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

// Fake plant health data
const fakePlant = {
  cropName: "Tomato",
  botanicalName: "Solanum lycopersicum",
  healthStats: {
    colorHealth: 85,
    textureHealth: 78,
    diseaseRisk: 35,
    newGrowthVigor: 90,
    turgidityWilt: 70,
    canopyStructure: 80,
    spotLesionCount: 15,
  },
  overallHealthHistory: [
    { date: "2026-01-01", score: 70 },
    { date: "2026-01-03", score: 72 },
    { date: "2026-01-05", score: 75 },
    { date: "2026-01-07", score: 78 },
    { date: "2026-01-09", score: 85 },
  ],
};

const PlantHealthStats = () => {
  // Radar chart data
  const radarData = {
    labels: [
      "Color Health",
      "Texture Health",
      "Disease Risk",
      "New Growth Vigor",
      "Turgidity / Wilt",
      "Canopy Structure",
      "Spot / Lesion Count",
    ],
    datasets: [
      {
        label: fakePlant.cropName,
        data: [
          fakePlant.healthStats.colorHealth,
          fakePlant.healthStats.textureHealth,
          100 - fakePlant.healthStats.diseaseRisk, // invert disease risk so higher is better
          fakePlant.healthStats.newGrowthVigor,
          fakePlant.healthStats.turgidityWilt,
          fakePlant.healthStats.canopyStructure,
          100 - fakePlant.healthStats.spotLesionCount, // fewer spots = better
        ],
        backgroundColor: "rgba(30, 94, 32, 0.2)",
        borderColor: "var(--color-primary)",
        borderWidth: 2,
        pointBackgroundColor: "var(--color-primary)",
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20, color: "var(--color-text-muted)" },
        grid: { color: "var(--color-border-soft)" },
        angleLines: { color: "var(--color-border-soft)" },
        pointLabels: { color: "var(--color-text-main)", font: { size: 12 } },
      },
    },
    plugins: {
      legend: { labels: { color: "var(--color-text-main)" } },
    },
  };

  // Line chart data (overall health history)
  const lineData = {
    labels: fakePlant.overallHealthHistory.map((h) => h.date),
    datasets: [
      {
        label: "Overall Health Score",
        data: fakePlant.overallHealthHistory.map((h) => h.score),
        fill: true,
        backgroundColor: "rgba(46, 125, 50, 0.2)",
        borderColor: "var(--color-primary)",
        tension: 0.3,
        pointBackgroundColor: "var(--color-primary)",
      },
    ],
  };

  const lineOptions = {
    scales: {
      y: { min: 0, max: 100, ticks: { color: "var(--color-text-muted)" } },
      x: { ticks: { color: "var(--color-text-muted)" } },
    },
    plugins: {
      legend: { labels: { color: "var(--color-text-main)" } },
    },
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{fakePlant.cropName} Health Stats</h2>
      <p className={styles.subtitle}>{fakePlant.botanicalName}</p>

      <div className={styles.charts}>
        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Current Health Metrics</h3>
          <Radar data={radarData} options={radarOptions} />
        </div>

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Health Trend</h3>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
};

export default PlantHealthStats;
