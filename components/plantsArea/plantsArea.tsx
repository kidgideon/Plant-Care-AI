import Image from "next/image";
import styles from "./plantsArea.module.css";
import plantImage from "../../images/9.jpg";

const mockPlants = [
  {
    name: "Tomato",
    status: "Healthy",
    healthScore: 85,
  },
  {
    name: "Maize",
    status: "At Risk",
    healthScore: 62,
  },
  {
    name: "Pepper",
    status: "Declining",
    healthScore: 38,
  },
];

const PlantArea = () => {
  return (
    <section className={styles.plantsSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Plants</h2>
        <p className={styles.subtitle}>
          Overview of all monitored crops and their current health status
        </p>
      </div>

      <div className={styles.grid}>
        {mockPlants.map((plant, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image
                src={plantImage}
                alt={plant.name}
                className={styles.image}
              />
            </div>

            <div className={styles.content}>
              <h3 className={styles.plantName}>{plant.name}</h3>

              <div className={styles.meta}>
                <span
                  className={`${styles.status} ${
                    plant.status === "Healthy"
                      ? styles.healthy
                      : plant.status === "At Risk"
                      ? styles.warning
                      : styles.danger
                  }`}
                >
                  {plant.status}
                </span>

                <span className={styles.score}>
                  {plant.healthScore}%
                </span>
              </div>

              <button className={styles.button}>
                View Analysis
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlantArea;
