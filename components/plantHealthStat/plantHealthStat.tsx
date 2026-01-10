"use client";

import { useEffect, useState, useMemo } from "react";
import { Radar, Line } from "react-chartjs-2";
import {
  Chart,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "../../firebase/client";
import type { PlantAnalysis } from "../../models/structure";
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

interface Props {
  plantId: string;
}

const PlantHealthStats = ({ plantId }: Props) => {
  const [analyses, setAnalyses] = useState<PlantAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH ANALYSES
     ========================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || !plantId) {
        setLoading(false);
        return;
      }

      try {
        const ref = collection(
          db,
          "users",
          user.uid,
          "plants",
          plantId,
          "analyses"
        );

        const q = query(ref, orderBy("createdAt", "asc"));
        const snap = await getDocs(q);

        setAnalyses(
          snap.docs.map((d) => d.data() as PlantAnalysis)
        );
      } catch (e) {
        console.error("Failed to load analyses", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [plantId]);

  /* =========================
     SAFE DERIVED DATA
     ========================= */
  const latest = analyses.length
    ? analyses[analyses.length - 1]
    : null;

  const radarData = useMemo(() => {
    if (!latest) return null;

    const s = latest.healthStats;

    return {
      labels: [
        "Color Health",
        "Texture Health",
        "Disease Resistance",
        "New Growth Vigor",
        "Turgidity / Wilt",
        "Canopy Structure",
        "Spot / Lesion Control",
      ],
      datasets: [
        {
          label: "Current Health",
          data: [
            s.color_health * 10,
            s.texture_health * 10,
            (10 - s.disease_risk) * 10,
            s.new_growth_vigor * 10,
            s.turgidity_wilt * 10,
            s.canopy_structure * 10,
            (10 - s.spot_lesion_count) * 10,
          ],
          backgroundColor: "rgba(46,125,50,0.35)",
          borderColor: "var(--color-primary)",
          borderWidth: 2,
          pointRadius: 4,
        },
      ],
    };
  }, [latest]);

  const lineData = useMemo(() => {
    if (!analyses.length) return null;

    return {
      labels: analyses.map((a) =>
        a.createdAt.toDate().toLocaleDateString()
      ),
      datasets: [
        {
          label: "Overall Health Score",
          data: analyses.map((a) => a.overallHealthScore),
          fill: true,
          backgroundColor: "rgba(46,125,50,0.2)",
          borderColor: "var(--color-primary)",
          tension: 0.3,
          pointRadius: 4,
        },
      ],
    };
  }, [analyses]);

  /* =========================
     RENDER STATES
     ========================= */
  if (loading) {
    return <div className={styles.skeletonChart} />;
  }

  if (!latest || !radarData || !lineData) {
    return <p className={styles.empty}>No analysis data available.</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.charts}>
        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Current Health Metrics</h3>
          <Radar
            data={radarData}
            options={{ scales: { r: { min: 0, max: 100 } } }}
          />
        </div>

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Health Trend</h3>
          <Line
            data={lineData}
            options={{ scales: { y: { min: 0, max: 100 } } }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlantHealthStats;
