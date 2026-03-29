/**
 * Three-Layer Timeline Generation
 *
 * Generates farm_activities using the scientifically correct model:
 *   Layer A: Pruning-relative (FYM, irrigation, bud break)
 *   Layer B: Calendar-fixed (monsoon, flowering Sep 1, peak flowering Oct 15)
 *   Layer C: Flowering-relative (fruit set +21d, maturity +75d, harvest +105d)
 *
 * Sources: ICAR, CCS HAU Hisar, PAU Ludhiana, NHB, MDPI Horticulturae 2022
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  validatePruningDate,
  type PruningValidation,
} from "./validate-pruning";

export async function generateTimeline(
  supabase: SupabaseClient,
  farmCropId: string,
  cropTemplateId: string,
  plantingDate: string, // pruning date (ISO)
  state?: string
): Promise<{
  success: boolean;
  count?: number;
  warnings?: PruningValidation;
  floweringDate?: string;
  error?: string;
}> {
  // Fetch all stages for this template
  const { data: stages, error: stagesError } = await supabase
    .from("crop_template_stages")
    .select("*")
    .eq("template_id", cropTemplateId)
    .order("sort_order", { ascending: true });

  if (stagesError || !stages || stages.length === 0) {
    console.error("Failed to fetch template stages:", stagesError);
    return {
      success: false,
      error: stagesError?.message || "No stages found",
    };
  }

  // Get crop_key for knowledge base lookup
  const { data: template } = await supabase
    .from("crop_templates")
    .select("crop_key")
    .eq("id", cropTemplateId)
    .single();

  const cropKey = template?.crop_key || "apple_ber";

  // Validate pruning date
  let validation: PruningValidation | undefined;
  if (state) {
    validation = await validatePruningDate(
      supabase,
      cropKey,
      state,
      plantingDate
    );
  }

  // Resolve flowering date from knowledge base
  const { data: floweringRule } = await supabase
    .from("crop_knowledge_base")
    .select("value_date_month, value_date_day")
    .eq("crop_key", cropKey)
    .eq("rule_type", "flowering_date")
    .eq("rule_key", "flowering_start")
    .maybeSingle();

  const pruningDate = new Date(plantingDate);
  const pruningYear = pruningDate.getFullYear();
  const pruningMonth = pruningDate.getMonth() + 1; // 1-indexed

  // Flowering month/day from knowledge base, default Sep 1
  const flowerMonth = floweringRule?.value_date_month || 9;
  const flowerDay = floweringRule?.value_date_day || 1;

  // Resolve flowering year: same year as pruning if flower month >= pruning month
  const flowerYear =
    flowerMonth >= pruningMonth ? pruningYear : pruningYear + 1;
  const floweringDate = `${flowerYear}-${String(flowerMonth).padStart(2, "0")}-${String(flowerDay).padStart(2, "0")}`;

  // Helper: resolve calendar-fixed date
  function resolveCalendarDate(month: number, day: number): string {
    const year = month >= pruningMonth ? pruningYear : pruningYear + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // Helper: resolve flowering-relative date
  function resolveFloweringDate(offsetDays: number): string {
    const d = new Date(floweringDate);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  }

  // Helper: resolve pruning-relative date
  function resolvePruningDate(weekOffset: number): string {
    const d = new Date(plantingDate);
    d.setDate(d.getDate() + weekOffset * 7);
    return d.toISOString().split("T")[0];
  }

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
    // ─── Determine stage date based on anchor_type ───
    let stageStartDate: string;

    const anchorType = stage.anchor_type || "pruning_relative";

    switch (anchorType) {
      case "calendar_fixed":
        stageStartDate = resolveCalendarDate(
          stage.calendar_month || 1,
          stage.calendar_day || 1
        );
        break;
      case "flowering_relative":
        stageStartDate = resolveFloweringDate(
          stage.flowering_offset_days || 0
        );
        break;
      case "pruning_relative":
      default:
        stageStartDate = resolvePruningDate(stage.week_offset);
        break;
    }

    // Create stage milestone activity
    activities.push({
      farm_crop_id: farmCropId,
      template_stage_id: stage.id,
      activity_type: inferActivityType(stage.stage_name_en),
      title_hi: stage.stage_name_hi,
      title_en: stage.stage_name_en,
      description_hi: (stage.activities_hi as string[]).join("\n"),
      description_en: (stage.activities_en as string[]).join("\n"),
      scheduled_date: stageStartDate,
      status: "scheduled",
    });

    // Create sub-activities spread across the stage's duration
    const activitiesHi = stage.activities_hi as string[];
    const activitiesEn = stage.activities_en as string[];

    for (let i = 0; i < activitiesHi.length; i++) {
      const subDate = new Date(stageStartDate);
      subDate.setDate(
        subDate.getDate() +
          Math.floor(
            (i * stage.duration_weeks * 7) /
              Math.max(activitiesHi.length, 1)
          )
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

  // Insert all activities
  const { error: insertError } = await supabase
    .from("farm_activities")
    .insert(activities);

  if (insertError) {
    console.error("Failed to insert farm activities:", insertError);
    return { success: false, error: insertError.message };
  }

  // Mark timeline version
  await supabase
    .from("farm_crops")
    .update({ timeline_version: 2 })
    .eq("id", farmCropId);

  return {
    success: true,
    count: activities.length,
    warnings: validation,
    floweringDate,
  };
}

function inferActivityType(stageName: string): string {
  const lower = stageName.toLowerCase();
  if (lower.includes("pruning")) return "pruning";
  if (lower.includes("harvest")) return "harvesting";
  if (lower.includes("flower") || lower.includes("fruit set"))
    return "maintenance";
  if (lower.includes("growth") || lower.includes("dormancy") || lower.includes("bud"))
    return "maintenance";
  if (lower.includes("rest")) return "maintenance";
  return "other";
}

function inferActivityTypeFromText(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes("irrigat") ||
    lower.includes("water") ||
    lower.includes("पानी") ||
    lower.includes("सिंचाई")
  )
    return "irrigation";
  if (
    lower.includes("urea") ||
    lower.includes("fym") ||
    lower.includes("fertiliz") ||
    lower.includes("खाद") ||
    lower.includes("यूरिया") ||
    lower.includes("dap") ||
    lower.includes("npk")
  )
    return "fertilizer";
  if (
    lower.includes("spray") ||
    lower.includes("malathion") ||
    lower.includes("mildew") ||
    lower.includes("स्प्रे") ||
    lower.includes("दवाई") ||
    lower.includes("sulfex") ||
    lower.includes("thiourea")
  )
    return "pesticide";
  if (lower.includes("prun") || lower.includes("छंटाई") || lower.includes("thin"))
    return "pruning";
  if (
    lower.includes("harvest") ||
    lower.includes("तोड़") ||
    lower.includes("mandi") ||
    lower.includes("मंडी") ||
    lower.includes("grade")
  )
    return "harvesting";
  if (
    lower.includes("market") ||
    lower.includes("price") ||
    lower.includes("भाव") ||
    lower.includes("बेचें")
  )
    return "marketing";
  return "maintenance";
}
