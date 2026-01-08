import type { Timestamp } from "firebase/firestore";

// users/${uid}/
export type User = {
  id: string;
  fullName: string;
  email: string;
  role: "farmer";
  createdAt: Timestamp;
  dp: string; // display picture URL
};

// users/${uid}/plants/${plantId}
export type PlantStatus = "new" | "improving" | "declining" | "stable";

export type Plant = {
  id: string;
  cropName: string;
  botanicalName?: string;
  createdAt: Timestamp;
  latestHealthScore: number;
  latestAnalysisAt: Timestamp;
  status: PlantStatus;
};

// shared
export type DiseaseDetection = {
  name: string;
  severity: number;
  confidence: number;
};

export type HealthStats = {
  colorHealth: number;
  textureHealth: number;
  diseaseRisk: number;
  newGrowthVigor: number;
  turgidityWilt: number;
  canopyStructure: number;
  spotLesionCount: number;
};

export type PlantIdentification = {
  commonName: string;
  speciesOrVariety: string;
  botanicalName: string;
  confidence: number;
};

// users/${uid}/plants/${plantId}/analyses/${analysisId}
export type PlantAnalysis = {
  id: string;
  imageUrl: string;
  plantIdentification: PlantIdentification;
  possibleDiseases: DiseaseDetection[];
  careRecommendations: string[];
  healthStats: HealthStats;
  overallHealthScore: number;
  createdAt: Timestamp;
};
