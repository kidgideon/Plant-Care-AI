import styles from "./plantDetails.module.css";
import PlantImage from "../../images/9.jpg";
import { Plant } from "../../models/structure";
import { Timestamp } from "firebase/firestore";

// Example fake plant data
const fakePlant: Plant = {
  cropName: "Tomato",
  botanicalName: "Solanum lycopersicum",
  createdAt: Timestamp.fromDate(new Date("2026-01-01")),
  latestHealthScore: 85,
  latestAnalysisAt: Timestamp.fromDate(new Date("2026-01-08")),
  status: "improving",
};

type PlantDetailsProps = {
  plant?: Plant;
};

const PlantDetails: React.FC<PlantDetailsProps> = ({ plant = fakePlant }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
      case "stable":
        return styles.statusStable;
      case "improving":
        return styles.statusHealthy;
      case "declining":
        return styles.statusWarning;
      default:
        return styles.statusStable;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <img src={PlantImage.src} alt={plant.cropName} className={styles.image} />
      </div>
      <div className={styles.detailsSection}>
        <h1 className={styles.name}>{plant.cropName}</h1>
        {plant.botanicalName && <p className={styles.botanical}>{plant.botanicalName}</p>}

        <div className={styles.row}>
          <span className={styles.label}>Health Score:</span>
          <span className={styles.value}>{plant.latestHealthScore}%</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Last Analysis:</span>
          <span className={styles.value}>{plant.latestAnalysisAt.toDate().toLocaleDateString()}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Status:</span>
          <span className={`${styles.status} ${getStatusColor(plant.status)}`}>
            {plant.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlantDetails;
