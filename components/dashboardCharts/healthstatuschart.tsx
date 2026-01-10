"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import styles from "./charts.module.css";
import type { Plant } from "../../models/structure";

const COLORS = ["var(--color-success)", "var(--color-warning)", "var(--color-error)"];

const HealthStatusChart = () => {
  const [data, setData] = useState([
    { name: "Healthy", value: 0 },
    { name: "Stable", value: 0 },
    { name: "Declining", value: 0 },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async (uid: string) => {
      try {
        const plantsRef = collection(db, "users", uid, "plants");
        const plantSnapshots = await getDocs(plantsRef);

        const plants: Plant[] = plantSnapshots.docs.map((doc) => doc.data() as Plant);

        const healthy = plants.filter((p) => p.status === "new" || p.status === "improving").length;
        const stable = plants.filter((p) => p.status === "stable").length;
        const declining = plants.filter((p) => p.status === "declining").length;

        setData([
          { name: "Healthy", value: healthy },
          { name: "Stable", value: stable },
          { name: "Declining", value: declining },
        ]);
      } catch (err) {
        console.error("Failed to fetch plants:", err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchPlants(user.uid);
      else setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Optional: show skeleton placeholder while loading
  if (loading) {
    return (
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Overall Plant Health Distribution</h2>
        <div className={styles.skeletonChart}></div>
      </div>
    );
  }

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
            innerRadius={40}
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
