import type { Timestamp } from "firebase/firestore";

// users/${uid}/
export type User = {
  fullName: string;
  email: string;
  role: "farmer";
  createdAt: Timestamp;
  dp: string; // display picture URL
};

// users/${uid}/plants/${plantId}
export type PlantStatus = "new" | "improving" | "declining" | "stable";

export type Plant = {
  cropName: string;
  botanicalName?: string;
  createdAt: Timestamp;
  latestHealthScore: number;
  latestAnalysisAt: Timestamp;
  status: PlantStatus;
  image : string;
};

// shared
export type DiseaseDetection = {
  name: string;
  severity: number;
  confidence: number;
};

export type HealthStats = {
  color_health: number;
  texture_health: number;
  disease_risk: number;
  new_growth_vigor: number;
  turgidity_wilt: number;
  canopy_structure: number;
  spot_lesion_count: number;
};

export type PlantIdentification = {
  commonName: string;
  speciesOrVariety: string;
  botanicalName: string;
  confidence: number;
};

// users/${uid}/plants/${plantId}/analyses/${analysisId}
export type PlantAnalysis = {
  imageUrl: string;
  plantIdentification: PlantIdentification;
  possibleDiseases: DiseaseDetection[];
  careRecommendations: string[];
  healthStats: HealthStats;
  overallHealthScore: number;
  createdAt: Timestamp;
};
