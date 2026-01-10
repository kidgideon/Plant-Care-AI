import { db } from "../firebase/client";
import { collection, doc, addDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import type { Plant, PlantAnalysis, PlantStatus } from "../models/structure";
import { uploadPlantImage } from "./storage";

/**
 * Convert a File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("File is not a valid image"));
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Add a new plant with its first analysis (no cropName or botanicalName input)
 */
export const addNewPlantWithAnalysis = async (userId: string, file: File) => {
  if (!userId || !file) throw new Error("userId and image file are required");

  const now = Timestamp.now();

  // Convert image for AI
  const imageBase64 = await fileToBase64(file);
  console.log("Image converted to base64, length:", imageBase64.length);

  // Call AI analysis API
  console.log("Sending request to /api/analyze...");
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });

  console.log("API response status:", res.status, res.statusText);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("API error response:", errorData);
    throw new Error(errorData?.error || `AI analysis failed with status ${res.status}`);
  }

  const analysisData = await res.json();
  console.log("API response data:", analysisData);

  if (typeof analysisData.overall_health_score !== "number") {
    console.error("Invalid response structure - missing overall_health_score:", analysisData);
    throw new Error("AI returned invalid response structure");
  }

  // Build initial plant doc
  const plant: Plant = {
    cropName: analysisData.plant_identification?.common_name || "Unknown",
    botanicalName: analysisData.plant_identification?.botanical_name || "Unknown",
    createdAt: now,
    latestHealthScore: analysisData.overall_health_score,
    latestAnalysisAt: now,
    status: "new",
    image: "", // placeholder until uploaded
  };

  // Save plant with auto-ID
  const plantRef = await addDoc(collection(db, "users", userId, "plants"), plant);
  const plantId = plantRef.id;
  console.log("Plant created in Firestore with ID:", plantId);

  // Upload image and update plant doc
  console.log("Starting image upload...");
  const imageUrl = await uploadPlantImage(userId, plantId, file);
  console.log("Image uploaded, URL:", imageUrl);
  
  await updateDoc(plantRef, { image: imageUrl });
  console.log("Plant doc updated with image URL");

  // Build first analysis doc
  const firstAnalysis: PlantAnalysis = {
    imageUrl,
    plantIdentification: analysisData.plant_identification,
    possibleDiseases: analysisData.possible_diseases ?? [],
    careRecommendations: analysisData.care_recommendations ?? [],
    healthStats: analysisData.health_stats,
    overallHealthScore: analysisData.overall_health_score,
    createdAt: now,
  };

  // Save first analysis with auto-ID
  await addDoc(collection(db, "users", userId, "plants", plantId, "analyses"), firstAnalysis);

  return { plant: { ...plant, image: imageUrl, id: plantId }, firstAnalysis };
};

/**
 * Add a new analysis to an existing plant
 */
export const addAnalysisToExistingPlant = async (userId: string, plantId: string, file: File) => {
  if (!userId || !plantId || !file) throw new Error("userId, plantId, and file are required");

  const now = Timestamp.now();

  // Convert image for AI
  const imageBase64 = await fileToBase64(file);
  console.log("Image converted to base64, length:", imageBase64.length);

  // Call AI analysis API
  console.log("Sending request to /api/analyze for existing plant...");
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });

  console.log("API response status:", res.status, res.statusText);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("API error response:", errorData);
    throw new Error(errorData?.error || `AI analysis failed with status ${res.status}`);
  }

  const analysisData = await res.json();
  console.log("API response data:", analysisData);

  if (typeof analysisData.overall_health_score !== "number") {
    console.error("Invalid response structure - missing overall_health_score:", analysisData);
    throw new Error("AI returned invalid response structure");
  }

  // Upload image
  console.log("Starting image upload for existing plant...");
  const imageUrl = await uploadPlantImage(userId, plantId, file);
  console.log("Image uploaded, URL:", imageUrl);

  // Build new analysis doc
  const newAnalysis: PlantAnalysis = {
    imageUrl,
    plantIdentification: analysisData.plant_identification,
    possibleDiseases: analysisData.possible_diseases ?? [],
    careRecommendations: analysisData.care_recommendations ?? [],
    healthStats: analysisData.health_stats,
    overallHealthScore: analysisData.overall_health_score,
    createdAt: now,
  };

  await addDoc(collection(db, "users", userId, "plants", plantId, "analyses"), newAnalysis);

  // Update plant with latest health & image
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
    image: imageUrl,
  });

  return {
    newAnalysis,
    updatedPlant: { ...plantData, latestHealthScore: newScore, latestAnalysisAt: now, status, image: imageUrl },
  };
};
