/**
 * Shared disease analysis schema used for function calling / tool_use
 * across DeepSeek (primary) and Claude (fallback).
 *
 * This guarantees structured JSON output regardless of model quality.
 */

export const DISEASE_ANALYSIS_FUNCTION = {
  name: "report_disease_analysis",
  description:
    "Report the disease analysis findings for a crop plant. Must be called with all required fields.",
  parameters: {
    type: "object" as const,
    required: [
      "disease_detected",
      "disease_name_en",
      "disease_name_hi",
      "confidence",
      "severity",
      "affected_part",
      "diagnosis_en",
      "diagnosis_hi",
      "treatment_en",
      "treatment_hi",
      "organic_treatment_hi",
      "products",
      "prevention_en",
      "prevention_hi",
      "urgency",
    ],
    properties: {
      disease_detected: {
        type: "boolean",
        description: "Whether a disease or pest was detected",
      },
      disease_name_en: {
        type: "string",
        description: "Disease name in English, or 'Healthy' if none detected",
      },
      disease_name_hi: {
        type: "string",
        description:
          "Disease name in Hindi, or 'स्वस्थ' if none detected",
      },
      confidence: {
        type: "number",
        description: "Confidence score from 0.0 to 1.0",
      },
      severity: {
        type: "string",
        enum: ["none", "low", "medium", "high", "critical"],
        description: "Severity level of the disease",
      },
      affected_part: {
        type: "string",
        enum: ["leaf", "fruit", "bark", "root", "flower", "whole_plant"],
        description: "Which part of the plant is affected",
      },
      diagnosis_en: {
        type: "string",
        description: "2-3 sentence diagnosis in English",
      },
      diagnosis_hi: {
        type: "string",
        description: "2-3 sentence diagnosis in Hindi",
      },
      treatment_en: {
        type: "string",
        description:
          "Step-by-step chemical treatment in English with specific dosages",
      },
      treatment_hi: {
        type: "string",
        description:
          "Step-by-step chemical treatment in Hindi with specific dosages",
      },
      organic_treatment_hi: {
        type: "string",
        description:
          "Organic/desi treatment option in Hindi (buttermilk, neem, etc.)",
      },
      products: {
        type: "array",
        description: "Recommended products available at agricultural shops",
        items: {
          type: "object",
          required: [
            "name_en",
            "name_hi",
            "dosage",
            "application",
            "where_to_buy",
          ],
          properties: {
            name_en: { type: "string", description: "Product name in English" },
            name_hi: { type: "string", description: "Product name in Hindi" },
            dosage: {
              type: "string",
              description: "Specific dosage (e.g., 2.5g/L water)",
            },
            application: {
              type: "string",
              description: "How to apply (e.g., foliar spray)",
            },
            where_to_buy: {
              type: "string",
              description:
                "Where to buy (e.g., कृषि दवाई की दुकान)",
            },
          },
        },
      },
      prevention_en: {
        type: "string",
        description: "Prevention tips in English",
      },
      prevention_hi: {
        type: "string",
        description: "Prevention tips in Hindi",
      },
      urgency: {
        type: "string",
        enum: ["immediate", "within_3_days", "within_week", "routine"],
        description: "How urgently the farmer should act",
      },
    },
  },
} as const;

/** TypeScript type matching the schema output */
export type DiseaseAnalysisResult = {
  disease_detected: boolean;
  disease_name_en: string;
  disease_name_hi: string;
  confidence: number;
  severity: "none" | "low" | "medium" | "high" | "critical";
  affected_part:
    | "leaf"
    | "fruit"
    | "bark"
    | "root"
    | "flower"
    | "whole_plant";
  diagnosis_en: string;
  diagnosis_hi: string;
  treatment_en: string;
  treatment_hi: string;
  organic_treatment_hi: string;
  products: {
    name_en: string;
    name_hi: string;
    dosage: string;
    application: string;
    where_to_buy: string;
  }[];
  prevention_en: string;
  prevention_hi: string;
  urgency: "immediate" | "within_3_days" | "within_week" | "routine";
};
