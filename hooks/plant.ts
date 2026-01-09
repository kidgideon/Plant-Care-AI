import { db } from "../firebase/client";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import type {Plant, PlantAnalysis, PlantStatus,} from "../models/structure";
import { uploadPlantImage } from "./storage";

/**
 * Add a new plant with its first analysis
 */
export const addNewPlantWithAnalysis = async ( userId: string, cropName: string, botanicalName: string | undefined, file: File
) => {
  const plantId = uuidv4();

  // Upload the image
  const imageUrl = await uploadPlantImage(userId, plantId, file);

  // Call AI analysis endpoint
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });
  const analysisData = await res.json();
  if (!res.ok) throw new Error(analysisData.error || "Analysis failed");

  // Create Plant
  const plant: Plant = {
    cropName,
    botanicalName,
    createdAt: Timestamp.now(),
    latestHealthScore: analysisData.overall_health_score,
    latestAnalysisAt: Timestamp.now(),
    status: "new",
  };

  // Create first analysis
  const analysisId = uuidv4();
  const firstAnalysis: PlantAnalysis = {
    imageUrl,
    plantIdentification: analysisData.plant_identification,
    possibleDiseases: analysisData.possible_diseases,
    careRecommendations: analysisData.care_recommendations,
    healthStats: analysisData.health_stats,
    overallHealthScore: analysisData.overall_health_score,
    createdAt: Timestamp.now(),
  };

  // Save to Firestore
  await setDoc(doc(db, "users", userId, "plants", plantId), plant);
  await setDoc(doc(db, "users", userId, "plants", plantId, "analyses", analysisId), firstAnalysis);

  return { plant, firstAnalysis };
};


/**
 * Add a new analysis to an existing plant
 */
export const addAnalysisToExistingPlant = async (
  userId: string,
  plantId: string,
  file: File
) => {
  // Upload image
  const imageUrl = await uploadPlantImage(userId, plantId, file);

  // Call AI analysis
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });
  const analysisData = await res.json();
  if (!res.ok) throw new Error(analysisData.error || "Analysis failed");

  // Build new analysis
  const analysisId = uuidv4();
  const newAnalysis: PlantAnalysis = {
    imageUrl,
    plantIdentification: analysisData.plant_identification,
    possibleDiseases: analysisData.possible_diseases,
    careRecommendations: analysisData.care_recommendations,
    healthStats: analysisData.health_stats,
    overallHealthScore: analysisData.overall_health_score,
    createdAt: Timestamp.now(),
  };

  // Save analysis
  await setDoc(doc(db, "users", userId, "plants", plantId, "analyses", analysisId), newAnalysis);

  // Update plant
  const plantRef = doc(db, "users", userId, "plants", plantId);
  const plantSnap = await getDoc(plantRef);
  if (!plantSnap.exists()) throw new Error("Plant not found");

  const plantData = plantSnap.data() as Plant;
  const previousScore = plantData.latestHealthScore;
  const newScore = analysisData.overall_health_score;

  let status: PlantStatus = "stable";
  if (newScore > previousScore) status = "improving";
  else if (newScore < previousScore) status = "declining";

  await updateDoc(plantRef, {
    latestHealthScore: newScore,
    latestAnalysisAt: Timestamp.now(),
    status,
  });

  return { newAnalysis, updatedPlant: { ...plantData, latestHealthScore: newScore, latestAnalysisAt: Timestamp.now(), status } };
};
