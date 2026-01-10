import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { uploadPlantImage } from "./storage";
import type { Plant, PlantAnalysis, PlantStatus } from "../models/structure";

/* ======================================================
   HELPERS
====================================================== */

/** Convert image file to base64 */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Invalid image file"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/** Call AI analysis API */
const analyzeImage = async (imageBase64: string) => {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "AI analysis failed");
  }

  const data = await res.json();

  if (typeof data.overall_health_score !== "number") {
    throw new Error("Invalid AI response");
  }

  return data;
};

/** Derive base health status */
const getHealthStatus = (score: number): PlantStatus =>
  score >= 50 ? "healthy" : "unhealthy";

/** Derive trend status */
const getTrendStatus = (
  prev: number,
  next: number
): PlantStatus => {
  if (next > prev) return "improving";
  if (next < prev) return "declining";
  return "stable";
};

/* ======================================================
   CREATE PLANT + FIRST ANALYSIS
====================================================== */

export const addNewPlantWithAnalysis = async (
  userId: string,
  file: File
) => {
  if (!userId || !file) {
    throw new Error("Missing required parameters");
  }

  const now = Timestamp.now();

  const imageBase64 = await fileToBase64(file);
  const analysisData = await analyzeImage(imageBase64);

  const healthScore = analysisData.overall_health_score;
  const baseStatus = getHealthStatus(healthScore);

  const plant: Plant = {
    cropName:
      analysisData.plant_identification?.common_name || "Unknown",
    botanicalName:
      analysisData.plant_identification?.botanical_name,
    createdAt: now,
    latestHealthScore: healthScore,
    latestAnalysisAt: now,
    status: baseStatus,
    image: "",
  };

  const plantRef = await addDoc(
    collection(db, "users", userId, "plants"),
    plant
  );

  const plantId = plantRef.id;

  const imageUrl = await uploadPlantImage(userId, plantId, file);

  await updateDoc(plantRef, { image: imageUrl });

  const firstAnalysis: PlantAnalysis = {
    imageUrl,
    plantIdentification: analysisData.plant_identification,
    possibleDiseases: analysisData.possible_diseases ?? [],
    careRecommendations: analysisData.care_recommendations ?? [],
    healthStats: analysisData.health_stats,
    overallHealthScore: healthScore,
    createdAt: now,
  };

  await addDoc(
    collection(db, "users", userId, "plants", plantId, "analyses"),
    firstAnalysis
  );

  return {
    plant: { ...plant, image: imageUrl, id: plantId },
    firstAnalysis,
  };
};

/* ======================================================
   ADD ANALYSIS TO EXISTING PLANT
====================================================== */

export const addAnalysisToExistingPlant = async (
  userId: string,
  plantId: string,
  file: File
) => {
  if (!userId || !plantId || !file) {
    throw new Error("Missing required parameters");
  }

  const plantRef = doc(db, "users", userId, "plants", plantId);
  const plantSnap = await getDoc(plantRef);

  if (!plantSnap.exists()) {
    throw new Error("Plant not found");
  }

  const plantData = plantSnap.data() as Plant;
  const now = Timestamp.now();

  const imageBase64 = await fileToBase64(file);
  const analysisData = await analyzeImage(imageBase64);

  const imageUrl = await uploadPlantImage(userId, plantId, file);

  const newScore = analysisData.overall_health_score;
  const prevScore = plantData.latestHealthScore;

  const baseStatus = getHealthStatus(newScore);
  const trendStatus = getTrendStatus(prevScore, newScore);

  // Priority: trend > base
  const finalStatus: PlantStatus =
    trendStatus === "stable" ? baseStatus : trendStatus;

  const newAnalysis: PlantAnalysis = {
    imageUrl,
    plantIdentification: analysisData.plant_identification,
    possibleDiseases: analysisData.possible_diseases ?? [],
    careRecommendations: analysisData.care_recommendations ?? [],
    healthStats: analysisData.health_stats,
    overallHealthScore: newScore,
    createdAt: now,
  };

  await addDoc(
    collection(db, "users", userId, "plants", plantId, "analyses"),
    newAnalysis
  );

  await updateDoc(plantRef, {
    latestHealthScore: newScore,
    latestAnalysisAt: now,
    status: finalStatus,
    image: imageUrl,
  });

  return {
    newAnalysis,
    updatedPlant: {
      ...plantData,
      latestHealthScore: newScore,
      latestAnalysisAt: now,
      status: finalStatus,
      image: imageUrl,
    },
  };
};
