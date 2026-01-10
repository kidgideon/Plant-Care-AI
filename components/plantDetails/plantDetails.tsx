"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaCalendarAlt, FaSyncAlt } from "react-icons/fa";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase/client";
import styles from "./plant-details.module.css";
import placeholderImage from "../../images/9.jpg";
import type { Plant } from "../../models/structure";

interface PlantDetailsProps {
  plantId: string;
}

const PlantDetails = ({ plantId }: PlantDetailsProps) => {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysesCount, setAnalysesCount] = useState(0);

  useEffect(() => {
    const fetchPlant = async () => {
      setLoading(true);
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          const uid = user.uid;

          // Fetch plant data
          const plantRef = doc(db, "users", uid, "plants", plantId);
          const plantSnap = await getDoc(plantRef);

          if (plantSnap.exists()) {
            setPlant(plantSnap.data() as Plant);

            // Fetch analyses count
            const analysesRef = collection(db, "users", uid, "plants", plantId, "analyses");
            const analysesSnap = await getDocs(analysesRef);
            setAnalysesCount(analysesSnap.size);
          } else {
            console.warn("Plant not found");
          }
        } catch (err) {
          console.error("Error fetching plant:", err);
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    };

    fetchPlant();
  }, [plantId]);

  if (loading) {
    return (
      <div className={styles.Interface}>
        <div className={styles.detailsArea}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonMeta}>
            <div className={styles.skeletonRow}></div>
            <div className={styles.skeletonRow}></div>
            <div className={styles.skeletonRow}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!plant) return <p>Plant not found.</p>;

  return (
    <div className={styles.Interface}>
      <div className={styles.detailsArea}>
        <div className={styles.plantImg}>
          <Image
            src={plant.image || placeholderImage}
            alt={plant.cropName}
            className={styles.img}
            width={200}
            height={200}
          />
          <div className={styles.healthStatus}>{plant.latestHealthScore}%</div>
        </div>

        <div className={styles.plantMeta}>
          <p className={styles.plantName}>{plant.cropName}</p>
          {plant.botanicalName && (
            <p className={styles.botName}>
  {plant.botanicalName}{" "}
  <span className={`${styles.plantStatus} ${styles[plant.status]}`}>
    {plant.status.charAt(0).toUpperCase() + plant.status.slice(1)}
  </span>
</p>
          )}

          <div className={styles.extraData}>
            <div className={styles.metaItem}>
              <FaCalendarAlt className={styles.icon} />
              <span>Created: {plant.createdAt.toDate().toLocaleDateString()}</span>
            </div>
            <div className={styles.metaItem}>
              <FaCalendarAlt className={styles.icon} />
              <span>Last Analysis: {plant.latestAnalysisAt.toDate().toLocaleDateString()}</span>
            </div>
            <div className={styles.metaItem}>
              <FaSyncAlt className={styles.icon} />
              <span>Analysis: {analysesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetails;
