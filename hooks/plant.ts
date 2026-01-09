import { db } from "../firebase/client";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import type { Plant, PlantAnalysis, PlantStatus } from "../models/structure";
import { uploadPlantImage } from "./storage";

/**
 * Convert a File to base64 string
 * Only accepts image files
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("File is not a valid image"));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:image/...;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Add a new plant with its first analysis
 */
export const addNewPlantWithAnalysis = async (
  userId: string,
  cropName: string,
  botanicalName: string | undefined,
  file: File
) => {
  if (!userId || !cropName.trim() || !file) {
    throw new Error("Invalid input: userId, cropName, and image file are required");
  }

  const plantId = uuidv4();
  let imageBase64: string;

  try {
    // Convert image to base64 for AI
    imageBase64 = await fileToBase64(file);

    // Call AI analysis API
    const res = await fetch("/api/analyze-plant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
    });
    const analysisData = await res.json();

    if (!res.ok || !analysisData || typeof analysisData.overall_health_score !== "number") {
      throw new Error(analysisData?.error || "AI analysis failed");
    }

    const now = Timestamp.now();

    // Build Plant
    const plant: Plant = {
      cropName: cropName.trim(),
      botanicalName,
      createdAt: now,
      latestHealthScore: analysisData.overall_health_score,
      latestAnalysisAt: now,
      status: "new",
    };

    // Build first Analysis
    const analysisId = uuidv4();
    const firstAnalysis: PlantAnalysis = {
      imageUrl: "", // optional: upload image after analysis
      plantIdentification: analysisData.plant_identification,
      possibleDiseases: analysisData.possible_diseases ?? [],
      careRecommendations: analysisData.care_recommendations ?? [],
      healthStats: analysisData.health_stats,
      overallHealthScore: analysisData.overall_health_score,
      createdAt: now,
    };

    // Save plant and first analysis
    await setDoc(doc(db, "users", userId, "plants", plantId), plant);
    await setDoc(
      doc(db, "users", userId, "plants", plantId, "analyses", analysisId),
      firstAnalysis
    );

    // Optional: upload original image to storage
    // const imageUrl = await uploadPlantImage(userId, plantId, file);
    // await updateDoc(doc(db, "users", userId, "plants", plantId), { imageUrl });

    return { plant, firstAnalysis };
  } catch (err) {
    throw err;
  }
};

/**
 * Add a new analysis to an existing plant
 */
export const addAnalysisToExistingPlant = async (
  userId: string,
  plantId: string,
  file: File
) => {
  if (!userId || !plantId || !file) {
    throw new Error("Invalid input: userId, plantId, and image file are required");
  }

  try {
    // Convert image to base64
    const imageBase64 = await fileToBase64(file);

    // Call AI analysis API
    const res = await fetch("/api/analyze-plant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
    });
    const analysisData = await res.json();

    if (!res.ok || !analysisData || typeof analysisData.overall_health_score !== "number") {
      throw new Error(analysisData?.error || "AI analysis failed");
    }

    const now = Timestamp.now();

    // Build new Analysis
    const analysisId = uuidv4();
    const newAnalysis: PlantAnalysis = {
      imageUrl: "", // optional: upload image after analysis
      plantIdentification: analysisData.plant_identification,
      possibleDiseases: analysisData.possible_diseases ?? [],
      careRecommendations: analysisData.care_recommendations ?? [],
      healthStats: analysisData.health_stats,
      overallHealthScore: analysisData.overall_health_score,
      createdAt: now,
    };

    // Save analysis
    await setDoc(
      doc(db, "users", userId, "plants", plantId, "analyses", analysisId),
      newAnalysis
    );

    // Update Plant health
    const plantRef = doc(db, "users", userId, "plants", plantId);
    const plantSnap = await getDoc(plantRef);
    if (!plantSnap.exists()) throw new Error("Plant not found");

    const plantData = plantSnap.data() as Plant;
    const prevScore = plantData.latestHealthScore;
    const newScore = analysisData.overall_health_score;

    let status: PlantStatus = "stable";
    if (newScore > prevScore) status = "improving";
    else if (newScore < prevScore) status = "declining";

    await updateDoc(plantRef, {
      latestHealthScore: newScore,
      latestAnalysisAt: now,
      status,
    });

    return {
      newAnalysis,
      updatedPlant: {
        ...plantData,
        latestHealthScore: newScore,
        latestAnalysisAt: now,
        status,
      },
    };
  } catch (err) {
    throw err;
  }
};
