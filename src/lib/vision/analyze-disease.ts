/**
 * Disease Analysis Orchestrator
 *
 * Two-step pipeline:
 *   1. Gemini Flash — describes the plant image (cheap, fast)
 *   2. DeepSeek Chat — diagnoses disease from description (cheap, structured)
 *
 * Fallback: Claude Sonnet with tool_use if the pipeline fails.
 */

import { describeImage } from "./describe-image";
import { diagnoseFromDescription } from "./diagnose-disease";
import {
  DISEASE_ANALYSIS_FUNCTION,
  type DiseaseAnalysisResult,
} from "./schema";
import { buildClaudeFallbackPrompt, type DiagnosisContext } from "./prompts";
import Anthropic from "@anthropic-ai/sdk";

export { type DiseaseAnalysisResult } from "./schema";

export async function analyzeDiseaseImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  context: DiagnosisContext
): Promise<{ analysis: DiseaseAnalysisResult; model: string }> {
  // ─── Primary pipeline: Gemini + DeepSeek ───
  try {
    // Step 1: Gemini describes the image
    const description = await describeImage(imageBase64, mediaType);

    // Step 2: DeepSeek diagnoses from description
    const analysis = await diagnoseFromDescription(description, context);

    return { analysis, model: "gemini-flash+deepseek" };
  } catch (primaryError) {
    console.error(
      "Primary pipeline (Gemini+DeepSeek) failed, falling back to Claude:",
      primaryError
    );
  }

  // ─── Fallback: Claude Sonnet with tool_use ───
  try {
    const analysis = await analyzeWithClaude(imageBase64, mediaType, context);
    return { analysis, model: "claude-sonnet" };
  } catch (fallbackError) {
    console.error("Claude fallback also failed:", fallbackError);
    throw new Error(
      "All disease analysis providers failed. Please try again later."
    );
  }
}

async function analyzeWithClaude(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  context: DiagnosisContext
): Promise<DiseaseAnalysisResult> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: buildClaudeFallbackPrompt(context),
    tools: [
      {
        name: DISEASE_ANALYSIS_FUNCTION.name,
        description: DISEASE_ANALYSIS_FUNCTION.description,
        input_schema: JSON.parse(JSON.stringify(DISEASE_ANALYSIS_FUNCTION.parameters)) as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: {
      type: "tool",
      name: "report_disease_analysis",
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Analyze this plant photo and report your disease analysis findings.",
          },
        ],
      },
    ],
  });

  // Extract the tool use result
  const toolUseBlock = response.content.find(
    (block) => block.type === "tool_use"
  );

  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new Error("Claude did not return tool_use response");
  }

  return toolUseBlock.input as DiseaseAnalysisResult;
}
