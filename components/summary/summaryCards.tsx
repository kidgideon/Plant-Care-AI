"use client";

import { useState, useEffect } from "react";
import { FaLeaf, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import styles from "./summary.module.css";
import type { Plant, PlantStatus } from "../../models/structure";

interface Summary {
  total: number;
  healthy: number;
  stable: number;
  unhealthy: number;
}

const SummaryCard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    healthy: 0,
    stable: 0,
    unhealthy: 0,
  });

  useEffect(() => {
    const fetchPlants = async (uid: string) => {
      try {
        const plantsRef = collection(db, "users", uid, "plants");
        const plantSnapshots = await getDocs(plantsRef);

        const plants: Plant[] = plantSnapshots.docs.map((doc) => doc.data() as Plant);

        const total = plants.length;
        const healthy = plants.filter((p) => p.status === "healthy" || p.status === "improving").length;
        const stable = plants.filter((p) => p.status === "stable").length;
        const unhealthy = plants.filter((p) => p.status === "unhealthy" || p.status === "declining").length;

        setSummary({ total, healthy, stable, unhealthy });
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

  const summaryItems = [
    { title: "Total Plants", value: summary.total, icon: <FaLeaf />, color: "var(--color-primary)" },
    { title: "Healthy", value: summary.healthy, icon: <FaCheckCircle />, color: "var(--color-success)" },
    { title: "Stable", value: summary.stable, icon: <FaExclamationTriangle />, color: "var(--color-warning)" },
    { title: "Unhealthy", value: summary.unhealthy, icon: <FaTimesCircle />, color: "var(--color-error)" },
  ];

  return (
    <div className={styles.interface}>
      {summaryItems.map((item, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.icon} style={{ color: item.color }}>
            {item.icon}
          </div>
          <div className={styles.details}>
            <p className={styles.title}>{item.title}</p>
            <p className={styles.value}>
              {loading ? <span className={styles.skeleton}></span> : item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCard;
