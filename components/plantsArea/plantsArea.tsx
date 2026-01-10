"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaLeaf } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase/client";
import styles from "./plantsArea.module.css";
import plantImage from "../../images/9.jpg";
import type { Plant } from "../../models/structure";

const PlantArea = () => {
  const [plants, setPlants] = useState<(Plant & { plantId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlants = async (uid: string) => {
      try {
        const plantsRef = collection(db, "users", uid, "plants");
        const plantSnapshots = await getDocs(plantsRef);

        const fetchedPlants: (Plant & { plantId: string })[] = plantSnapshots.docs.map((doc) => ({
          plantId: doc.id,
          ...(doc.data() as Plant),
        }));

        setPlants(fetchedPlants);
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

  const getStatusClass = (status: string) => {
    switch (status) {
      case "improving":
        return styles.healthy;
      case "declining":
        return styles.danger;
      case "new":
      case "stable":
        return styles.warning;
      default:
        return styles.warning;
    }
  };

  if (loading) {
  return (
    <section className={styles.plantsSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Plants</h2>
        <p className={styles.subtitle}>
          Overview of all monitored crops and their current health status
        </p>
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonImage}></div>
            <div className={styles.skeletonRow}></div>
            <div className={styles.skeletonRow}></div>
            <div className={styles.skeletonRow}></div>
          </div>
        ))}
      </div>
    </section>
  );
}


  return (
    <section className={styles.plantsSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Plants</h2>
        <p className={styles.subtitle}>Overview of all monitored crops and their current health status</p>
      </div>

      {plants.length === 0 ? (
        <div className={styles.emptyState}>
          <FaLeaf size={48} color="var(--color-border)" />
          <p>No plants added yet</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {plants.map((plant) => (
            <div key={plant.plantId} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={plant.image || plantImage}
                  alt={plant.cropName}
                  className={styles.image}
                  width={100}
                  height={100}
                />
              </div>

              <div className={styles.content}>
                <div className={styles.iconName}>
                  <FaLeaf className={styles.icon} />
                  <h3 className={styles.plantName}>{plant.cropName}</h3>
                </div>

                {plant.botanicalName && <p className={styles.botanical}>{plant.botanicalName}</p>}

                <div className={styles.row}>
                  <span className={styles.label}>Created At:</span>
                  <span className={styles.value}>{plant.createdAt.toDate().toLocaleDateString()}</span>
                </div>

                <div className={styles.row}>
                  <span className={styles.label}>Last Analysis:</span>
                  <span className={styles.value}>{plant.latestAnalysisAt.toDate().toLocaleDateString()}</span>
                </div>

                <div className={styles.row}>
                  <span className={styles.label}>Health Score:</span>
                  <span className={styles.value}>{plant.latestHealthScore}%</span>
                </div>

                <div className={styles.row}>
                  <span className={styles.label}>Status:</span>
                  <span className={`${styles.status} ${getStatusClass(plant.status)}`}>
                    {plant.status.toUpperCase()}
                  </span>
                </div>

                <button
                  className={styles.button}
                  onClick={() => router.push(`/plant/${plant.plantId}`)}
                >
                  View Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PlantArea;
