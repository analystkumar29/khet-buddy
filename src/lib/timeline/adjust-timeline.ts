/**
 * Adaptive timeline adjustment.
 *
 * When a farmer completes an activity early/late, shift subsequent activities
 * and optionally call DeepSeek for deviation advice.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type CompletionResult = {
  deviationDays: number;
  activitiesShifted: number;
  advice: string | null;
};

/**
 * Mark an activity as completed and adjust the timeline if needed.
 */
export async function completeActivity(
  supabase: SupabaseClient,
  activityId: string,
  actualDate: string, // ISO date
  notes?: string
): Promise<CompletionResult> {
  // Fetch the activity
  const { data: activity, error: fetchError } = await supabase
    .from("farm_activities")
    .select("*, farm_crop_id, template_stage_id, scheduled_date")
    .eq("id", activityId)
    .single();

  if (fetchError || !activity) {
    throw new Error("Activity not found");
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

  // If significant deviation (>3 days), shift subsequent unstarted activities
  if (Math.abs(deviationDays) > 3) {
    const { data: upcoming } = await supabase
      .from("farm_activities")
      .select("id, scheduled_date")
      .eq("farm_crop_id", activity.farm_crop_id)
      .eq("status", "scheduled")
      .gt("scheduled_date", activity.scheduled_date)
      .order("scheduled_date", { ascending: true });

    if (upcoming && upcoming.length > 0) {
      for (const item of upcoming) {
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

  // Generate simple advice for significant deviations
  let advice: string | null = null;
  if (Math.abs(deviationDays) > 7) {
    const direction = deviationDays > 0 ? "देर से" : "जल्दी";
    advice = `आपने "${activity.title_hi}" ${Math.abs(deviationDays)} दिन ${direction} किया। आगे की ${activitiesShifted} गतिविधियों की तारीखें बदल दी गई हैं।`;
  }

  return { deviationDays, activitiesShifted, advice };
}

/**
 * Mark an activity as skipped.
 */
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
