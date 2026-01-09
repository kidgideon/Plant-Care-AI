import Image from "next/image";
import { FaLeaf } from "react-icons/fa";
import { Timestamp } from "firebase/firestore";
import styles from "./plantsArea.module.css";
import plantImage from "../../images/9.jpg";

// Example mock data with full Plant type
const mockPlants = [
  {
    cropName: "Tomato",
    botanicalName: "Solanum lycopersicum",
    createdAt: Timestamp.fromDate(new Date("2026-01-01")),
    latestHealthScore: 85,
    latestAnalysisAt: Timestamp.fromDate(new Date("2026-01-08")),
    status: "improving",
  },
  {
    cropName: "Maize",
    botanicalName: "Zea mays",
    createdAt: Timestamp.fromDate(new Date("2025-12-15")),
    latestHealthScore: 62,
    latestAnalysisAt: Timestamp.fromDate(new Date("2026-01-07")),
    status: "declining",
  },
  {
    cropName: "Pepper",
    botanicalName: "Capsicum annuum",
    createdAt: Timestamp.fromDate(new Date("2025-11-20")),
    latestHealthScore: 38,
    latestAnalysisAt: Timestamp.fromDate(new Date("2026-01-05")),
    status: "new",
  },
];

const PlantArea = () => {
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

  return (
    <section className={styles.plantsSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Plants</h2>
        <p className={styles.subtitle}>
          Overview of all monitored crops and their current health status
        </p>
      </div>

      {mockPlants.length === 0 ? (
        <div className={styles.emptyState}>
          <FaLeaf size={48} color="var(--color-border)" />
          <p>No plants added yet</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {mockPlants.map((plant, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={plantImage}
                  alt={plant.cropName}
                  className={styles.image}
                />
              </div>

              <div className={styles.content}>
                <div className={styles.iconName}>
                  <FaLeaf className={styles.icon} />
                  <h3 className={styles.plantName}>{plant.cropName}</h3>
                </div>

                {plant.botanicalName && (
                  <p className={styles.botanical}>{plant.botanicalName}</p>
                )}

                <div className={styles.row}>
                  <span className={styles.label}>Created At:</span>
                  <span className={styles.value}>
                    {plant.createdAt.toDate().toLocaleDateString()}
                  </span>
                </div>

                <div className={styles.row}>
                  <span className={styles.label}>Last Analysis:</span>
                  <span className={styles.value}>
                    {plant.latestAnalysisAt.toDate().toLocaleDateString()}
                  </span>
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

                <button className={styles.button}>View Analysis</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PlantArea;
