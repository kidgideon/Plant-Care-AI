"use client";

import React from "react";
import styles from "./diseaseRisk.module.css";
import { FiAlertOctagon } from "react-icons/fi";

// Fake data
const mockDiseases = [
  { name: "Leaf Blight", severity: 80, confidence: 92 },
  { name: "Powdery Mildew", severity: 55, confidence: 75 },
  { name: "Bacterial Spot", severity: 35, confidence: 60 },
  { name: "Rust Fungus", severity: 20, confidence: 45 },
];

const mockCareRecommendations = [
  "Water the plant thoroughly twice a week.",
  "Apply nitrogen-rich fertilizer.",
  "Prune dead leaves and stems.",
  "Monitor for fungal infections.",
  "Ensure proper sunlight exposure.",
];

const getSeverityColor = (severity: number) => {
  if (severity >= 70) return "var(--color-error)";
  if (severity >= 40) return "var(--color-warning)";
  return "var(--color-success)";
};

const PlantAnalysisPanel = () => {
  return (
    <div className={styles.container}>
      {/* Disease Risk Bars */}
      <div className={styles.column}>
        <h3 className={styles.title}>Disease Risk</h3>
        {mockDiseases.length === 0 ? (
          <p className={styles.empty}>No diseases detected.</p>
        ) : (
          <div className={styles.list}>
            {mockDiseases.map((disease, idx) => (
              <div key={idx} className={styles.item}>
                <div className={styles.label}>
                  {disease.name} ({disease.confidence}%)
                </div>
                <div className={styles.barBackground}>
                  <div
                    className={styles.bar}
                    style={{
                      width: `${disease.severity}%`,
                      backgroundColor: getSeverityColor(disease.severity),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Care Recommendations */}
      <div className={styles.column}>
        <h3 className={styles.title}>Care Recommendations</h3>
        <ul className={styles.recommendations}>
          {mockCareRecommendations.slice(0, 5).map((rec, idx) => (
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
