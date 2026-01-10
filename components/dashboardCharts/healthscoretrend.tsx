"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import styles from "./charts.module.css";
import type { Plant, PlantAnalysis } from "../../models/structure";

interface TrendData {
  date: string;       // date of analysis
  avgHealth: number;  // average health across all plants at that point
}

const HealthScoreTrend = () => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async (uid: string) => {
      try {
        // Fetch all plants for the user
        const plantsRef = collection(db, "users", uid, "plants");
        const plantSnapshots = await getDocs(plantsRef);

        // Attach plantId from doc.id since it's not in the Plant type
        const plants: (Plant & { plantId: string })[] = plantSnapshots.docs.map((doc) => ({
          plantId: doc.id,
          ...(doc.data() as Plant),
        }));

        // Collect all analyses from all plants
        let allAnalyses: { date: Date; plantId: string; overallHealthScore: number }[] = [];

        for (const plant of plants) {
          const analysesRef = collection(db, "users", uid, "plants", plant.plantId, "analyses");
          const analysesSnap = await getDocs(query(analysesRef, orderBy("createdAt", "asc")));

          analysesSnap.docs.forEach((doc) => {
            const analysis = doc.data() as PlantAnalysis;
            allAnalyses.push({
              date: analysis.createdAt.toDate(),
              plantId: plant.plantId,
              overallHealthScore: analysis.overallHealthScore,
            });
          });
        }

        // Sort all analyses by date
        allAnalyses.sort((a, b) => a.date.getTime() - b.date.getTime());

        // Build trend: after each analysis, compute average health across all plants
        const trend: TrendData[] = [];
        const latestScores: Record<string, number> = {}; // plantId -> latest health

        allAnalyses.forEach((a) => {
          latestScores[a.plantId] = a.overallHealthScore;

          const scores = Object.values(latestScores);
          const avg = scores.reduce((sum, v) => sum + v, 0) / scores.length;

          trend.push({
            date: a.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            avgHealth: Math.round(avg),
          });
        });

        setData(trend);
      } catch (err) {
        console.error("Failed to fetch trend data:", err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchTrend(user.uid);
      else setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Skeleton loader while fetching
  if (loading) {
    return (
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Average Health Score Over Time</h2>
        <div className={styles.skeletonChart}></div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.chartTitle}>Average Health Score Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
          <Line
            type="monotone"
            dataKey="avgHealth"
            stroke="var(--color-primary)"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthScoreTrend;
