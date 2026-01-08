import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI MODEL INITIALIZATION
 * Pre-trained multimodal vision-language model
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL_VERSION = "gemini-2.0-flash";

/**
 * Utility: Clamp integer values safely into a fixed range
 */
function clampInt(value: unknown, min = 1, max = 10): number {
  if (!Number.isInteger(value)) return min;
  return Math.min(Math.max(value as number, min), max);
}

/**
 * POST /api/analyze-plant
 * Accepts a base64-encoded crop image and returns structured plant health analysis
 */
export async function POST(req: NextRequest) {
  try {
    /**
     * INPUT VALIDATION
     * Expecting base64-encoded image data (not a URL)
     */
    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing image data (base64 required)" },
        { status: 400 }
      );
    }

    /**
     * PROMPT ENGINEERING
     * Forces deterministic JSON output for safe parsing
     */
    const prompt = `
Return ONLY valid JSON.
No markdown, no code fences, no text outside JSON.

{
  "plant_identification": {
    "common_name": "",
    "species_or_variety": "",
    "botanical_name": "",
    "confidence": 1
  },
  "possible_diseases": [
    {
      "name": "",
      "severity": 1,
      "confidence": 1
    }
  ],
  "care_recommendations": [""],
  "health_stats": {
    "color_health": 1,
    "texture_health": 1,
    "disease_risk": 1,
    "new_growth_vigor": 1,
    "turgidity_wilt": 1,
    "canopy_structure": 1,
    "spot_lesion_count": 1
  }
}

Rules:
- Integers only (1–10)
- Maximum of 5 care recommendations
- If uncertain, return the lowest reasonable value
`;

    /**
     * AI INFERENCE
     * Multimodal input: text + image
     */
    const model = genAI.getGenerativeModel({ model: MODEL_VERSION });

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
    ]);

    const rawResponse = result.response?.text?.();
    if (!rawResponse) {
      return NextResponse.json(
        { error: "Empty response from AI model" },
        { status: 500 }
      );
    }

    /**
     * SAFE JSON PARSING
     */
    let parsed: any;
    try {
      parsed = JSON.parse(rawResponse.trim());
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: rawResponse },
        { status: 500 }
      );
    }

    /**
     * STRUCTURE NORMALIZATION & VALIDATION
     */
    const health = parsed.health_stats ?? {};

    const normalizedHealthMetrics = [
      clampInt(health.color_health),
      clampInt(health.texture_health),
      clampInt(11 - clampInt(health.disease_risk)), // inverse risk
      clampInt(health.new_growth_vigor),
      clampInt(health.turgidity_wilt),
      clampInt(health.canopy_structure),
      clampInt(health.spot_lesion_count),
    ];

    /**
     * OVERALL HEALTH SCORE COMPUTATION
     * Normalized to percentage (0–100)
     */
    const totalScore = normalizedHealthMetrics.reduce((a, b) => a + b, 0);
    const overall_health_score = Math.round((totalScore / 70) * 100);

    /**
     * DISEASE & RECOMMENDATION SANITIZATION
     */
    const possible_diseases = Array.isArray(parsed.possible_diseases)
      ? parsed.possible_diseases.slice(0, 5).map((d: any) => ({
          name: String(d?.name ?? "Unknown"),
          severity: clampInt(d?.severity),
          confidence: clampInt(d?.confidence),
        }))
      : [];

    const care_recommendations = Array.isArray(parsed.care_recommendations)
      ? parsed.care_recommendations.slice(0, 5).map(String)
      : [];

    /**
     * FINAL RESPONSE
     * Combines AI inference + rule-based evaluation
     */
    return NextResponse.json(
      {
        plant_identification: parsed.plant_identification ?? null,
        possible_diseases,
        care_recommendations,
        health_stats: {
          color_health: clampInt(health.color_health),
          texture_health: clampInt(health.texture_health),
          disease_risk: clampInt(health.disease_risk),
          new_growth_vigor: clampInt(health.new_growth_vigor),
          turgidity_wilt: clampInt(health.turgidity_wilt),
          canopy_structure: clampInt(health.canopy_structure),
          spot_lesion_count: clampInt(health.spot_lesion_count),
        },
        overall_health_score,
        meta: {
          model_version: MODEL_VERSION,
          evaluation_method: "rule-based aggregation",
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
