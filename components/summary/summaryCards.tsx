"use client";

import { useState, useEffect } from "react";
import { FaLeaf, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import styles from "./summary.module.css";
import type { Plant, PlantStatus } from "../../models/structure";

const SummaryCard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    healthy: 0,
    stable: 0,
    declining: 0,
  });

  useEffect(() => {
    const fetchPlants = async (uid: string) => {
      try {
        const plantsRef = collection(db, "users", uid, "plants");
        const plantSnapshots = await getDocs(plantsRef);

        const plants: Plant[] = plantSnapshots.docs.map((doc) => doc.data() as Plant);

        const total = plants.length;
        const healthy = plants.filter((p) => p.status === "new" || p.status === "improving").length;
        const stable = plants.filter((p) => p.status === "stable").length;
        const declining = plants.filter((p) => p.status === "declining").length;

        setSummary({ total, healthy, stable, declining });
      } catch (err) {
        console.error("Failed to fetch plants:", err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchPlants(user.uid);
      else setLoading(false); // not signed in
    });

    return () => unsubscribe();
  }, []);

  const summaryItems = [
    { title: "Total Plants", value: summary.total, icon: <FaLeaf />, color: "var(--color-primary)" },
    { title: "Healthy", value: summary.healthy, icon: <FaCheckCircle />, color: "var(--color-success)" },
    { title: "Stable", value: summary.stable, icon: <FaExclamationTriangle />, color: "var(--color-warning)" },
    { title: "Declining", value: summary.declining, icon: <FaTimesCircle />, color: "var(--color-error)" },
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
