/**
 * Anchor-type-aware timeline adjustment.
 *
 * Key principle: Calendar-fixed events (flowering) NEVER shift.
 * Only events with the same anchor_type as the completed activity shift.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type CompletionResult = {
  deviationDays: number;
  activitiesShifted: number;
  advice: string | null;
};

export async function completeActivity(
  supabase: SupabaseClient,
  activityId: string,
  actualDate: string,
  notes?: string
): Promise<CompletionResult> {
  // Fetch the activity with its stage's anchor_type
  const { data: activity, error: fetchError } = await supabase
    .from("farm_activities")
    .select("*, farm_crop_id, template_stage_id, scheduled_date")
    .eq("id", activityId)
    .single();

  if (fetchError || !activity) {
    throw new Error("Activity not found");
  }

  // Get anchor_type from template stage
  let anchorType = "pruning_relative";
  if (activity.template_stage_id) {
    const { data: stage } = await supabase
      .from("crop_template_stages")
      .select("anchor_type")
      .eq("id", activity.template_stage_id)
      .single();
    if (stage) anchorType = stage.anchor_type;
  }

  // Calculate deviation
  const scheduled = new Date(activity.scheduled_date);
  const actual = new Date(actualDate);
  const deviationDays = Math.round(
    (actual.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24)
  );

  const status = Math.abs(deviationDays) > 3 ? "late" : "completed";

  // Update the activity
  await supabase
    .from("farm_activities")
    .update({
      actual_date: actualDate,
      status,
      deviation_days: deviationDays,
      notes: notes || null,
    })
    .eq("id", activityId);

  let activitiesShifted = 0;

  // Only shift if significant deviation AND anchor type allows it
  if (Math.abs(deviationDays) > 3) {
    // Calendar-fixed events NEVER shift — flowering is always September
    if (anchorType === "calendar_fixed") {
      // No shifting — these are photoperiod/season locked
    } else {
      // For pruning-relative: only shift other pruning-relative activities
      // For flowering-relative: only shift other flowering-relative activities
      const { data: upcoming } = await supabase
        .from("farm_activities")
        .select("id, scheduled_date, template_stage_id")
        .eq("farm_crop_id", activity.farm_crop_id)
        .eq("status", "scheduled")
        .gt("scheduled_date", activity.scheduled_date)
        .order("scheduled_date", { ascending: true });

      if (upcoming && upcoming.length > 0) {
        // Filter to only same anchor_type activities
        for (const item of upcoming) {
          let itemAnchor = "pruning_relative";
          if (item.template_stage_id) {
            const { data: itemStage } = await supabase
              .from("crop_template_stages")
              .select("anchor_type")
              .eq("id", item.template_stage_id)
              .single();
            if (itemStage) itemAnchor = itemStage.anchor_type;
          }

          // Only shift if same anchor type
          if (itemAnchor === anchorType) {
            const oldDate = new Date(item.scheduled_date);
            oldDate.setDate(oldDate.getDate() + deviationDays);
            const newDate = oldDate.toISOString().split("T")[0];

            await supabase
              .from("farm_activities")
              .update({ scheduled_date: newDate })
              .eq("id", item.id);

            activitiesShifted++;
          }
        }
      }
    }
  }

  // Generate advice
  let advice: string | null = null;
  if (Math.abs(deviationDays) > 7) {
    const direction = deviationDays > 0 ? "देर से" : "जल्दी";

    if (anchorType === "calendar_fixed") {
      advice = `आपने "${activity.title_hi}" ${Math.abs(deviationDays)} दिन ${direction} किया। यह मौसम पर निर्भर गतिविधि है — बाकी कैलेंडर नहीं बदलेगा।`;
    } else {
      advice = `आपने "${activity.title_hi}" ${Math.abs(deviationDays)} दिन ${direction} किया। ${activitiesShifted} संबंधित गतिविधियों की तारीखें बदली गईं। फूल आने का समय नहीं बदलेगा (सितंबर में ही आएंगे)।`;
    }
  }

  return { deviationDays, activitiesShifted, advice };
}

export async function skipActivity(
  supabase: SupabaseClient,
  activityId: string,
  notes?: string
): Promise<{ advice: string }> {
  const { data: activity } = await supabase
    .from("farm_activities")
    .select("title_hi, scheduled_date")
    .eq("id", activityId)
    .single();

  await supabase
    .from("farm_activities")
    .update({
      status: "skipped",
      notes: notes || null,
    })
    .eq("id", activityId);

  const advice = activity
    ? `"${activity.title_hi}" छोड़ दिया गया। जल्द से जल्द यह काम पूरा करने की कोशिश करें।`
    : "गतिविधि छोड़ दी गई।";

  return { advice };
}
