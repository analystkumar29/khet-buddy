import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  analyzeDiseaseImage,
  type DiseaseAnalysisResult,
} from "@/lib/vision/analyze-disease";
import type { DiagnosisContext } from "@/lib/vision/prompts";
import type { CropDisease } from "@/types/database";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scanId, imageBase64, mediaType, cropKey } = body as {
      scanId: string;
      imageBase64: string;
      mediaType: "image/jpeg" | "image/png" | "image/webp";
      cropKey?: string;
    };

    if (!scanId || !imageBase64) {
      return Response.json(
        { error: "scanId and imageBase64 are required" },
        { status: 400 }
      );
    }

    // Verify authenticated user owns this scan
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Verify scan belongs to this user
    const { data: scanOwnership } = await supabase
      .from("disease_scans")
      .select("user_id")
      .eq("id", scanId)
      .single();

    if (!scanOwnership || scanOwnership.user_id !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark scan as analyzing
    const { error: updateError } = await supabase
      .from("disease_scans")
      .update({ scan_status: "analyzing" })
      .eq("id", scanId);

    if (updateError) {
      console.error("Failed to update scan status:", updateError);
      return Response.json(
        { error: "Failed to update scan status" },
        { status: 500 }
      );
    }

    // Fetch crop diseases from DB for dynamic prompt
    const activeCropKey = cropKey || "apple_ber";
    const { data: diseases } = await supabase
      .from("crop_diseases")
      .select("*")
      .eq("crop_key", activeCropKey);

    // Fetch crop template for name
    const { data: template } = await supabase
      .from("crop_templates")
      .select("crop_name_en, crop_name_hi")
      .eq("crop_key", activeCropKey)
      .maybeSingle();

    // Get current month info
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed

    // Fetch user's farm location (from the scan's user)
    const { data: scan } = await supabase
      .from("disease_scans")
      .select("user_id")
      .eq("id", scanId)
      .single();

    let lat = 29.5152; // Fatehabad defaults
    let lon = 75.4548;
    let district = "Fatehabad";
    let state = "Haryana";
    let treeAge = 2;

    if (scan?.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("latitude, longitude, district, state")
        .eq("id", scan.user_id)
        .single();

      if (profile) {
        lat = profile.latitude || lat;
        lon = profile.longitude || lon;
        district = profile.district || district;
        state = profile.state || state;
      }

      // Try to get tree age from farm_crops
      const { data: farmCrop } = await supabase
        .from("farm_crops")
        .select("tree_age_years, farm_id")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (farmCrop) {
        treeAge = farmCrop.tree_age_years || 2;
      }
    }

    // Build diagnosis context
    const context: DiagnosisContext = {
      cropNameEn: template?.crop_name_en || "Apple Ber (Indian Jujube)",
      cropNameHi: template?.crop_name_hi || "एप्पल बेर (थाई बेर)",
      treeAge,
      district,
      state,
      lat,
      lon,
      monthName: MONTH_NAMES[currentMonth],
      currentStageName: getStageName(currentMonth),
      diseases: (diseases || []) as CropDisease[],
    };

    // Run two-step AI analysis (Gemini + DeepSeek, Claude fallback)
    let analysis: DiseaseAnalysisResult;
    let modelUsed: string;
    try {
      const result = await analyzeDiseaseImage(
        imageBase64,
        mediaType || "image/jpeg",
        context
      );
      analysis = result.analysis;
      modelUsed = result.model;
    } catch (aiError) {
      console.error("All AI providers failed:", aiError);

      await supabase
        .from("disease_scans")
        .update({ scan_status: "failed" })
        .eq("id", scanId);

      return Response.json(
        { error: "Disease analysis failed. Please try again." },
        { status: 500 }
      );
    }

    // Update scan row with results
    const { error: resultError } = await supabase
      .from("disease_scans")
      .update({
        scan_status: "completed",
        disease_name_hi: analysis.disease_name_hi,
        disease_name_en: analysis.disease_name_en,
        confidence_score: analysis.confidence,
        severity: analysis.severity,
        affected_part: analysis.affected_part,
        diagnosis_hi: analysis.diagnosis_hi,
        diagnosis_en: analysis.diagnosis_en,
        treatment_hi: analysis.treatment_hi,
        treatment_en: analysis.treatment_en,
        organic_treatment_hi: analysis.organic_treatment_hi,
        products_recommended: analysis.products,
        urgency: analysis.urgency,
        prevention_hi: analysis.prevention_hi,
        prevention_en: analysis.prevention_en,
        raw_ai_response: {
          ...analysis,
          _model: modelUsed,
          _timestamp: new Date().toISOString(),
        } as unknown as Record<string, unknown>,
      })
      .eq("id", scanId);

    if (resultError) {
      console.error("Failed to save analysis results:", resultError);
      return Response.json(
        { error: "Failed to save analysis results" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      scanId,
      analysis,
      model: modelUsed,
    });
  } catch (error) {
    console.error("Scan analyze route error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** Simple stage name lookup from month (fallback when no farm_crops exist) */
function getStageName(month: number): string {
  const stages: Record<number, string> = {
    0: "Fruit Maturation",   // January
    1: "Main Harvest",       // February
    2: "Late Harvest",       // March
    3: "Rest Period",        // April
    4: "Hard Pruning",       // May
    5: "Dormancy",           // June
    6: "New Growth Starts",  // July
    7: "Rapid Growth",       // August
    8: "Flowering Begins",   // September
    9: "Peak Flowering",     // October
    10: "Fruit Set",         // November
    11: "Fruit Development", // December
  };
  return stages[month] || "Unknown";
}
