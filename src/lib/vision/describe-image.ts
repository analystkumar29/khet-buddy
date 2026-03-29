/**
 * Step 1: Image Description using Gemini 2.0 Flash
 *
 * Sends the plant photo to Gemini and gets a detailed text description
 * of what's visible — no diagnosis, just observation.
 */

import { GoogleGenAI } from "@google/genai";
import { IMAGE_DESCRIPTION_PROMPT } from "./prompts";

function getGenAI() {
  return new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
}

export async function describeImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<string> {
  const response = await getGenAI().models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mediaType,
              data: imageBase64,
            },
          },
          {
            text: IMAGE_DESCRIPTION_PROMPT,
          },
        ],
      },
    ],
    config: {
      maxOutputTokens: 1024,
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text || text.trim().length < 20) {
    throw new Error("Gemini returned insufficient image description");
  }

  return text.trim();
}
