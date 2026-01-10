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

const getStatusFromScore = (score: number) => {
  if (score >= 75) return { label: "Improving", color: "var(--color-success)" };
  if (score >= 50) return { label: "Stable", color: "var(--color-primary)" };
  return { label: "Declining", color: "var(--color-error)" };
};

const PreviousAnalyses = ({ plantId }: Props) => {
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

        const q = query(ref, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const data = snap.docs.map(
          (doc) => doc.data() as PlantAnalysis
        );

        setAnalyses(data);
      } catch (e) {
        console.error("Failed to fetch previous analyses", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [plantId]);

  /* =========================
     LOADING / EMPTY STATES
     ========================= */
  if (loading) {
    return <div className={styles.skeletonTable} />;
  }

  if (analyses.length === 0) {
    return <p className={styles.empty}>No previous analyses available.</p>;
  }

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
            const status = getStatusFromScore(a.overallHealthScore);

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
