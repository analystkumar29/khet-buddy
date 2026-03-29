/**
 * Generate a personal timeline (farm_activities) from crop template stages.
 *
 * Each stage's activities become scheduled farm_activities with dates
 * calculated from the farmer's actual planting/pruning date.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateTimeline(
  supabase: SupabaseClient,
  farmCropId: string,
  cropTemplateId: string,
  plantingDate: string // ISO date string (e.g., "2025-05-01")
) {
  // Fetch all stages for this template
  const { data: stages, error: stagesError } = await supabase
    .from("crop_template_stages")
    .select("*")
    .eq("template_id", cropTemplateId)
    .order("sort_order", { ascending: true });

  if (stagesError || !stages || stages.length === 0) {
    console.error("Failed to fetch template stages:", stagesError);
    return { success: false, error: stagesError?.message || "No stages found" };
  }

  const baseDate = new Date(plantingDate);
  const activities: {
    farm_crop_id: string;
    template_stage_id: string;
    activity_type: string;
    title_hi: string;
    title_en: string | null;
    description_hi: string | null;
    description_en: string | null;
    scheduled_date: string;
    status: string;
  }[] = [];

  for (const stage of stages) {
    // Calculate the date for this stage
    const stageDate = new Date(baseDate);
    stageDate.setDate(stageDate.getDate() + stage.week_offset * 7);
    const scheduledDate = stageDate.toISOString().split("T")[0];

    // Determine activity type from stage name
    const activityType = inferActivityType(stage.stage_name_en);

    // Create one activity per stage (the stage itself as a milestone)
    activities.push({
      farm_crop_id: farmCropId,
      template_stage_id: stage.id,
      activity_type: activityType,
      title_hi: stage.stage_name_hi,
      title_en: stage.stage_name_en,
      description_hi: (stage.activities_hi as string[]).join("\n"),
      description_en: (stage.activities_en as string[]).join("\n"),
      scheduled_date: scheduledDate,
      status: "scheduled",
    });

    // Create individual sub-activities for each activity in the stage
    const activitiesHi = stage.activities_hi as string[];
    const activitiesEn = stage.activities_en as string[];

    for (let i = 0; i < activitiesHi.length; i++) {
      // Spread sub-activities across the stage's duration
      const subDate = new Date(stageDate);
      subDate.setDate(
        subDate.getDate() + Math.floor((i * stage.duration_weeks * 7) / Math.max(activitiesHi.length, 1))
      );

      activities.push({
        farm_crop_id: farmCropId,
        template_stage_id: stage.id,
        activity_type: inferActivityTypeFromText(activitiesEn[i] || ""),
        title_hi: activitiesHi[i],
        title_en: activitiesEn[i] || null,
        description_hi: null,
        description_en: null,
        scheduled_date: subDate.toISOString().split("T")[0],
        status: "scheduled",
      });
    }
  }

  // Insert all activities in batch
  const { error: insertError } = await supabase
    .from("farm_activities")
    .insert(activities);

  if (insertError) {
    console.error("Failed to insert farm activities:", insertError);
    return { success: false, error: insertError.message };
  }

  return { success: true, count: activities.length };
}

function inferActivityType(stageName: string): string {
  const lower = stageName.toLowerCase();
  if (lower.includes("pruning")) return "pruning";
  if (lower.includes("harvest")) return "harvesting";
  if (lower.includes("flower") || lower.includes("fruit set")) return "maintenance";
  if (lower.includes("growth") || lower.includes("dormancy")) return "maintenance";
  if (lower.includes("rest")) return "maintenance";
  return "other";
}

function inferActivityTypeFromText(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("irrigat") || lower.includes("water") || lower.includes("पानी") || lower.includes("सिंचाई"))
    return "irrigation";
  if (lower.includes("urea") || lower.includes("fym") || lower.includes("fertiliz") || lower.includes("खाद") || lower.includes("यूरिया") || lower.includes("dap"))
    return "fertilizer";
  if (lower.includes("spray") || lower.includes("malathion") || lower.includes("mildew") || lower.includes("स्प्रे") || lower.includes("दवाई"))
    return "pesticide";
  if (lower.includes("prun") || lower.includes("छंटाई"))
    return "pruning";
  if (lower.includes("harvest") || lower.includes("तोड़") || lower.includes("mandi") || lower.includes("मंडी"))
    return "harvesting";
  if (lower.includes("market") || lower.includes("price") || lower.includes("भाव") || lower.includes("बेचें"))
    return "marketing";
  return "maintenance";
}
