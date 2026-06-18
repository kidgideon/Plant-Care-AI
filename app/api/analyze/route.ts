import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

const MODEL_VERSION = "gemini-2.5-flash";

function clampInt(
  value: unknown,
  min = 1,
  max = 10
): number {
  const num = Number(value);

  if (!Number.isInteger(num)) {
    return min;
  }

  return Math.min(Math.max(num, min), max);
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        {
          error:
            "Invalid or missing image data (base64 required)",
        },
        { status: 400 }
      );
    }

    const prompt = `
Return ONLY valid JSON.
No markdown.
No code fences.
No explanations.

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
- Integers only (1-10)
- Maximum 5 care recommendations
- If uncertain, return conservative estimates
`;

    const model = genAI.getGenerativeModel({
      model: MODEL_VERSION,
    });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
    ]);

    const rawResponse = result.response.text();

    if (!rawResponse) {
      return NextResponse.json(
        {
          error: "Empty response from Gemini",
        },
        { status: 500 }
      );
    }

    let jsonString = rawResponse.trim();

    if (jsonString.startsWith("```")) {
      jsonString = jsonString
        .replace(/^```(?:json)?\s*/, "")
        .replace(/```$/, "")
        .trim();
    }

    let parsed: any;

    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return NextResponse.json(
        {
          error: "Gemini returned invalid JSON",
          raw: rawResponse,
        },
        { status: 500 }
      );
    }

    const health = parsed.health_stats ?? {};

    const normalizedHealthMetrics = [
      clampInt(health.color_health),
      clampInt(health.texture_health),
      clampInt(
        11 - clampInt(health.disease_risk)
      ),
      clampInt(health.new_growth_vigor),
      clampInt(health.turgidity_wilt),
      clampInt(health.canopy_structure),
      clampInt(health.spot_lesion_count),
    ];

    const totalScore = normalizedHealthMetrics.reduce(
      (sum, value) => sum + value,
      0
    );

    const overall_health_score = Math.round(
      (totalScore / 70) * 100
    );

    const possible_diseases = Array.isArray(
      parsed.possible_diseases
    )
      ? parsed.possible_diseases
          .slice(0, 5)
          .map((d: any) => ({
            name: String(d?.name ?? "Unknown"),
            severity: clampInt(d?.severity),
            confidence: clampInt(d?.confidence),
          }))
      : [];

    const care_recommendations = Array.isArray(
      parsed.care_recommendations
    )
      ? parsed.care_recommendations
          .slice(0, 5)
          .map(String)
      : [];

    return NextResponse.json(
      {
        plant_identification:
          parsed.plant_identification ?? null,

        possible_diseases,

        care_recommendations,

        health_stats: {
          color_health: clampInt(
            health.color_health
          ),
          texture_health: clampInt(
            health.texture_health
          ),
          disease_risk: clampInt(
            health.disease_risk
          ),
          new_growth_vigor: clampInt(
            health.new_growth_vigor
          ),
          turgidity_wilt: clampInt(
            health.turgidity_wilt
          ),
          canopy_structure: clampInt(
            health.canopy_structure
          ),
          spot_lesion_count: clampInt(
            health.spot_lesion_count
          ),
        },

        overall_health_score,

        meta: {
          model_version: MODEL_VERSION,
          evaluation_method:
            "rule-based aggregation",
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Internal server error",
      },
      { status: 500 }
    );
  }
}