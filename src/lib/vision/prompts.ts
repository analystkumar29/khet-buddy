/**
 * Prompt templates for all AI scenarios in KhetBuddy v2.
 * Prompts are assembled dynamically from crop data in the database.
 */

import type { CropDisease } from "@/types/database";

// ─────────────────────────────────────────────────────────
// STEP 1: Image Description (Gemini Flash)
// Just describe — no diagnosis
// ─────────────────────────────────────────────────────────

export const IMAGE_DESCRIPTION_PROMPT = `You are an agricultural field observer. Describe EXACTLY what you see in this plant photograph. Be extremely detailed and specific.

Focus on:
1. PLANT PART: What part of the plant is shown? (leaf, fruit, bark, stem, flower, whole plant)
2. COLOR: Exact colors — normal green areas, any discoloration (yellowing, browning, white patches, black spots)
3. TEXTURE: Smooth, rough, powdery coating, wet/slimy, dry/crispy, holes, webbing
4. PATTERN: Spots (size, shape, distribution), streaks, rings, uniform coverage
5. DEFORMATION: Curling, wilting, swelling, galls, holes, tunnels, dropping
6. PEST SIGNS: Any visible insects, larvae, eggs, frass, silk webbing, bore holes
7. SEVERITY: What percentage of the visible plant area is affected?
8. PLANT HEALTH: Overall vigor — is the plant otherwise healthy or stressed?

Do NOT diagnose. Do NOT name any disease. Just describe what you observe in precise agricultural terms. Be factual and detailed.`;

// ─────────────────────────────────────────────────────────
// STEP 2: Disease Diagnosis (DeepSeek / Claude)
// Dynamic prompt built from DB crop data
// ─────────────────────────────────────────────────────────

export type DiagnosisContext = {
  cropNameEn: string;
  cropNameHi: string;
  treeAge: number;
  district: string;
  state: string;
  lat: number;
  lon: number;
  monthName: string;
  currentStageName: string;
  temperature?: number;
  humidity?: number;
  weatherDescription?: string;
  diseases: CropDisease[];
};

export function buildDiagnosisSystemPrompt(ctx: DiagnosisContext): string {
  const diseaseList = ctx.diseases
    .map(
      (d, i) =>
        `${i + 1}. ${d.name_en} (${d.name_hi}) — Local name: "${d.local_name || ""}"
   Symptoms: ${d.symptoms_en || ""}
   Chemical treatment: ${d.treatment_en || ""}
   Organic treatment: ${d.organic_treatment_en || ""}
   Products: ${JSON.stringify(d.products || [])}`
    )
    .join("\n\n");

  const weatherLine =
    ctx.temperature != null
      ? `- Current weather: ${ctx.temperature}°C, humidity ${ctx.humidity}%, ${ctx.weatherDescription || ""}`
      : "";

  return `You are an expert agricultural pathologist specializing in ${ctx.cropNameEn} (${ctx.cropNameHi}) cultivation in India.

CONTEXT:
- Crop: ${ctx.cropNameEn} (${ctx.cropNameHi})
- Tree age: Year ${ctx.treeAge}
- Location: ${ctx.district}, ${ctx.state} (lat: ${ctx.lat}, lon: ${ctx.lon})
- Current month: ${ctx.monthName}
- Current crop stage: ${ctx.currentStageName}
${weatherLine}

KNOWN DISEASES FOR THIS CROP:
${diseaseList}

INSTRUCTIONS:
Based on the field observation provided by the user, diagnose the disease using ONLY the report_disease_analysis function. Consider:
- Match symptoms to known diseases for this crop
- Factor in the current season/month (some diseases peak in specific months)
- Factor in weather conditions (humidity, temperature affect disease spread)
- Provide treatment in BOTH Hindi and English
- Products must be available in Indian agricultural input shops (कृषि दवाई की दुकान)
- Include specific dosages (ml/L or g/L)
- Include organic/desi alternatives where available
- If no disease is detected, set disease_detected=false with confidence=0.9 and give general health tips
- Always be practical and specific — this farmer needs actionable advice`;
}

// ─────────────────────────────────────────────────────────
// Claude Fallback: Single-step prompt (image + diagnosis)
// Used when Gemini + DeepSeek pipeline fails
// ─────────────────────────────────────────────────────────

export function buildClaudeFallbackPrompt(ctx: DiagnosisContext): string {
  return `${buildDiagnosisSystemPrompt(ctx)}

You will receive a photograph of the crop. Analyze it and use the report_disease_analysis function to provide your findings.`;
}

// ─────────────────────────────────────────────────────────
// Timeline Deviation Advice prompt (DeepSeek text-only)
// ─────────────────────────────────────────────────────────

export const DEVIATION_ADVICE_FUNCTION = {
  name: "report_deviation_advice",
  description:
    "Report advice for a farmer who deviated from their crop schedule",
  parameters: {
    type: "object" as const,
    required: [
      "impact_en",
      "impact_hi",
      "risk_level",
      "compensatory_actions_en",
      "compensatory_actions_hi",
      "warning_en",
      "warning_hi",
    ],
    properties: {
      impact_en: {
        type: "string",
        description: "Impact assessment in English",
      },
      impact_hi: {
        type: "string",
        description: "Impact assessment in Hindi",
      },
      risk_level: {
        type: "string",
        enum: ["low", "medium", "high"],
      },
      adjusted_activities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            activity_title: { type: "string" },
            new_scheduled_date: { type: "string" },
            reason_en: { type: "string" },
            reason_hi: { type: "string" },
          },
        },
      },
      compensatory_actions_en: {
        type: "array",
        items: { type: "string" },
      },
      compensatory_actions_hi: {
        type: "array",
        items: { type: "string" },
      },
      warning_en: { type: "string" },
      warning_hi: { type: "string" },
    },
  },
} as const;

export type DeviationAdviceInput = {
  cropNameEn: string;
  treeAge: number;
  district: string;
  state: string;
  activityTitle: string;
  scheduledDate: string;
  actualDate: string;
  deviationDays: number;
  farmerNote?: string;
  weatherSummary?: string;
  upcomingActivities: { title: string; scheduledDate: string }[];
};

export function buildDeviationPrompt(input: DeviationAdviceInput): string {
  const direction = input.deviationDays > 0 ? "late" : "early";
  const upcoming = input.upcomingActivities
    .map((a) => `- ${a.title}: ${a.scheduledDate}`)
    .join("\n");

  return `You are an expert horticulture advisor for ${input.cropNameEn} in ${input.state}, India.
A farmer has deviated from their recommended schedule. Analyze the impact and provide corrective advice.

Respond using the report_deviation_advice function. Be practical and specific.

CONTEXT:
- Crop: ${input.cropNameEn}, Year ${input.treeAge}
- Farm location: ${input.district}, ${input.state}
${input.weatherSummary ? `- Weather: ${input.weatherSummary}` : ""}

DEVIATION:
- Activity: "${input.activityTitle}"
- Was scheduled for: ${input.scheduledDate}
- Actually done on: ${input.actualDate} (${Math.abs(input.deviationDays)} days ${direction})
${input.farmerNote ? `- Farmer's note: "${input.farmerNote}"` : ""}

REMAINING SCHEDULE:
${upcoming}

PROVIDE:
1. Impact assessment — how does this ${direction} action affect the crop?
2. Compensatory actions — what extra steps should the farmer take?
3. Risk level: low/medium/high`;
}
