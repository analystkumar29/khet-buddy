/**
 * Step 2: Disease Diagnosis using DeepSeek Chat with function calling
 *
 * Receives a text description of the plant (from Gemini) and diagnoses
 * the disease using strict function calling — guaranteed structured output.
 *
 * DeepSeek API is OpenAI-compatible, so we use the OpenAI SDK.
 */

import OpenAI from "openai";
import { DISEASE_ANALYSIS_FUNCTION, type DiseaseAnalysisResult } from "./schema";
import { buildDiagnosisSystemPrompt, type DiagnosisContext } from "./prompts";

function getDeepSeekClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY!,
    baseURL: "https://api.deepseek.com",
  });
}

export async function diagnoseFromDescription(
  imageDescription: string,
  context: DiagnosisContext
): Promise<DiseaseAnalysisResult> {
  const systemPrompt = buildDiagnosisSystemPrompt(context);

  const deepseek = getDeepSeekClient();
  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Field observation of the plant:\n\n${imageDescription}`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: DISEASE_ANALYSIS_FUNCTION.name,
          description: DISEASE_ANALYSIS_FUNCTION.description,
          parameters: DISEASE_ANALYSIS_FUNCTION.parameters,
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: "report_disease_analysis" },
    },
    max_tokens: 2048,
    temperature: 0.3,
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];

  if (!toolCall || toolCall.type !== "function") {
    throw new Error("DeepSeek did not return expected function call");
  }

  const fnCall = toolCall as { type: "function"; function: { name: string; arguments: string } };

  if (fnCall.function.name !== "report_disease_analysis") {
    throw new Error("DeepSeek returned wrong function: " + fnCall.function.name);
  }

  const analysis = JSON.parse(
    fnCall.function.arguments
  ) as DiseaseAnalysisResult;

  // Validate critical fields
  if (typeof analysis.disease_detected !== "boolean") {
    throw new Error("Invalid disease_detected field in DeepSeek response");
  }

  // Clamp confidence to 0-1
  analysis.confidence = Math.max(0, Math.min(1, analysis.confidence));

  return analysis;
}
