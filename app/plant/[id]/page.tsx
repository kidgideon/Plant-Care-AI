"use client";

import styles from "./page.module.css"; 
import PlantDetails from "../../../components/plantDetails/plantDetails"; 
import PlantHealthStats from "../../../components/plantHealthStat/plantHealthStat"; 
import PlantAnalysisPanel from "../../../components/diseaseRiskBar/diseaseRisk";
import PreviousAnalyses from "../../../components/previousAnalysis/analysis";
import Blob from "../../../components/aiBlob/blob";
import Navbar from "../../../components/navbar/navbar";
import { useParams, useRouter } from "next/navigation";

const PlantPage = () => {
  const params = useParams();
  const router = useRouter();

  // params.id may be undefined or array, so handle it
  const plantId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  if (!plantId) {
    // Redirect or show an error page
    router.push("/dashboard");
    return <p>Loading plant...</p>;
  }

  return (
    <div className={styles.Interface}>
      <Navbar />
      <PlantDetails plantId={plantId} />
      <PlantHealthStats plantId={plantId} />
      <PlantAnalysisPanel plantId={plantId} />
      <PreviousAnalyses plantId={plantId} />
      <Blob plantId={plantId} />
    </div>
  );
};

export default PlantPage;
