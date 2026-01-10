"use client";

import { useEffect, useState } from "react";
import styles from "./analysis.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "../../firebase/client";
import type { PlantAnalysis } from "../../models/structure";

interface Props {
  plantId: string;
}

const PreviousAnalyses = ({ plantId }: Props) => {
  const [analyses, setAnalyses] = useState<PlantAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch analyses
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || !plantId) {
        setLoading(false);
        return;
      }

      try {
        const ref = collection(db, "users", user.uid, "plants", plantId, "analyses");
        const q = query(ref, orderBy("createdAt", "asc")); // Ascending to compare previous score
        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => doc.data() as PlantAnalysis);
        setAnalyses(data);
      } catch (e) {
        console.error("Failed to fetch previous analyses", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [plantId]);

  if (loading) return <div className={styles.skeletonTable} />;
  if (analyses.length === 0) return <p className={styles.empty}>No previous analyses available.</p>;

  // Compute status based on trend
  const computeStatus = (current: number, previous?: number) => {
    let label = "Stable";
    let color = "var(--color-primary)";

    if (previous !== undefined) {
      if (current > previous) {
        label = "Improving";
        color = "var(--color-success)";
      } else if (current < previous) {
        label = "Declining";
        color = "var(--color-error)";
      }
    } else {
      // First analysis: determine healthy/unhealthy by threshold
      if (current >= 50) {
        label = "Healthy";
        color = "var(--color-success)";
      } else {
        label = "Unhealthy";
        color = "var(--color-error)";
      }
    }

    return { label, color };
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Previous Analyses</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Health Score</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((a, idx) => {
            const previousScore = idx > 0 ? analyses[idx - 1].overallHealthScore : undefined;
            const status = computeStatus(a.overallHealthScore, previousScore);

            return (
              <tr key={idx}>
                <td>{a.createdAt.toDate().toLocaleDateString()}</td>
                <td style={{ color: status.color }}>{status.label}</td>
                <td>{a.overallHealthScore}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PreviousAnalyses;
