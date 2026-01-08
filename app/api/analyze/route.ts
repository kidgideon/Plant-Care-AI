import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

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
      "severity": 0,
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
- Max 5 recommendations
- Empty or uncertain → lowest reasonable value
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "image/jpeg", data: imageUrl } },
    ]);

    const raw = result.response?.text?.();
    if (!raw) return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });

    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Invalid JSON returned by AI", raw: cleaned }, { status: 500 });
    }

    const health = data.health_stats ?? {};

    const metrics = [
      health.color_health,
      health.texture_health,
      11 - health.disease_risk,
      health.new_growth_vigor,
      health.turgidity_wilt,
      health.canopy_structure,
      health.spot_lesion_count,
    ].map((n) => (Number.isInteger(n) ? Math.min(Math.max(1, n), 10) : 1));

    const total = metrics.reduce((a, b) => a + b, 0);
    const overall_health_score = Math.round((total / 70) * 100);

    return NextResponse.json({ ...data, overall_health_score }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
