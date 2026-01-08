import Styles from "./plantArea.module.css";

const PlantArea = () => {
  return (
    <div className={Styles.plantArea}>
      <div className={Styles.overlay}></div> {/* dark overlay */}
      <div className={Styles.textContainer}>
        <h1 className={Styles.plantTitle}>PlantSight</h1>
        <h2 className={Styles.plantTitleHeader}>Smart AI for Healthier Plants</h2>
        <p className={Styles.description}>
          Sign in to PlantSight to start monitoring your crops. Upload photos, get AI-driven health scores, and view personalized care tips for each plant. Your farm’s growth, made simple and intelligent.
        </p>
      </div>
    </div>
  );
};

export default PlantArea;
