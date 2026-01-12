"use client";

import { useEffect, useState } from "react";
import styles from "./diseaseRisk.module.css";
import { FiAlertOctagon, FiShield } from "react-icons/fi";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { auth, db } from "../../firebase/client";
import type { PlantAnalysis } from "../../models/structure";

interface Props {
  plantId: string;
}

const getSeverityColor = (severity: number) => {
  if (severity >= 7) return "var(--color-error)";
  if (severity >= 4) return "var(--color-warning)";
  return "var(--color-success)";
};

const PlantAnalysisPanel = ({ plantId }: Props) => {
  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH LATEST ANALYSIS
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

        const q = query(ref, orderBy("createdAt", "desc"), limit(1));
        const snap = await getDocs(q);

        if (!snap.empty) {
          setAnalysis(snap.docs[0].data() as PlantAnalysis);
        }
      } catch (e) {
        console.error("Failed to fetch plant analysis", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [plantId]);

  /* =========================
     LOADING STATE
     ========================= */
  if (loading) {
    return <div className={styles.skeletonPanel} />;
  }

  if (!analysis) {
    return <p className={styles.empty}>No analysis data available.</p>;
  }

  const diseases = analysis.possibleDiseases || [];
  const recommendations = analysis.careRecommendations || [];

  return (
    <div className={styles.container}>
      {/* ======================
          DISEASE RISK
         ====================== */}
      <div className={styles.column}>
        <h3 className={styles.title}>Disease Risk</h3>

        {diseases.length === 0 ? (
          <div className={styles.noDisease}>
            <FiShield className={styles.safeIcon} />
            <p className={styles.safeText}>
              No possible diseases detected.  
              Plant appears stable based on the latest analysis.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {diseases.map((d, idx) => (
              <div key={idx} className={styles.item}>
                <div className={styles.label}>
                  {d.name} ({Math.round(d.confidence)}%)
                </div>
                <div className={styles.barBackground}>
                  <div
                    className={styles.bar}
                    style={{
                      width: `${d.severity}%`,
                      backgroundColor: getSeverityColor(d.severity),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================
          CARE RECOMMENDATIONS
         ====================== */}
      <div className={styles.column}>
        <h3 className={styles.title}>Care Recommendations</h3>
        <ul className={styles.recommendations}>
          {recommendations.slice(0, 5).map((rec, idx) => (
            <li key={idx} className={styles.recItem}>
              <FiAlertOctagon className={styles.icon} />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlantAnalysisPanel;
