import styles from "./page.module.css";
import PlantDetails from "../../../components/plantDetails/plantDetails";
import PlantHealthStats from "../../../components/plantHealthStat/plantHealthStat";
import PlantAnalysisPanel from "../../../components/diseaseRiskBar/diseaseRisk";

const PlantPage = () => {
    return(
        <div className={styles.Interface}>
      <PlantDetails/>
      <PlantHealthStats/>
      <PlantAnalysisPanel/>
        </div>
    )
}

export default PlantPage;