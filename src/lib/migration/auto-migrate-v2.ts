/**
 * Auto-migration for existing v1 users.
 *
 * When a user has a profile but no farms row, this creates:
 * 1. A farm from their profile data
 * 2. A farm_crop for Apple Ber with default planting date
 * 3. Generates the personal timeline
 *
 * Runs once per user, tracked by profiles.migrated_to_v2 flag.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function autoMigrateUser(
  supabase: SupabaseClient,
  userId: string
): Promise<{ migrated: boolean; error?: string }> {
  // Check if already migrated
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, farm_name, village, district, state, latitude, longitude, farm_area_acres, migrated_to_v2")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { migrated: false, error: "No profile found" };
  }

  if (profile.migrated_to_v2) {
    return { migrated: false }; // Already done
  }

  // Check if farm already exists (maybe partially migrated)
  const { data: existingFarms } = await supabase
    .from("farms")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (existingFarms && existingFarms.length > 0) {
    // Farm exists, just mark as migrated
    await supabase
      .from("profiles")
      .update({ migrated_to_v2: true })
      .eq("id", userId);
    return { migrated: true };
  }

  // Create farm from profile data
  const { data: farm, error: farmError } = await supabase
    .from("farms")
    .insert({
      user_id: userId,
      farm_name: profile.farm_name || profile.full_name + " का खेत",
      area_acres: profile.farm_area_acres,
      latitude: profile.latitude || 29.5152,
      longitude: profile.longitude || 75.4548,
      village: profile.village,
      district: profile.district || "Fatehabad",
      state: profile.state || "Haryana",
    })
    .select("id")
    .single();

  if (farmError || !farm) {
    return { migrated: false, error: farmError?.message || "Farm creation failed" };
  }

  // Get Apple Ber template
  const { data: template } = await supabase
    .from("crop_templates")
    .select("id")
    .eq("crop_key", "apple_ber")
    .maybeSingle();

  if (!template) {
    // No template yet, mark as migrated anyway
    await supabase
      .from("profiles")
      .update({ migrated_to_v2: true })
      .eq("id", userId);
    return { migrated: true };
  }

  // Create farm_crop with default May 2025 planting date
  const { data: farmCrop, error: cropError } = await supabase
    .from("farm_crops")
    .insert({
      farm_id: farm.id,
      crop_template_id: template.id,
      planting_date: "2025-05-01",
      tree_age_years: 2,
      status: "active",
    })
    .select("id")
    .single();

  if (cropError || !farmCrop) {
    await supabase
      .from("profiles")
      .update({ migrated_to_v2: true })
      .eq("id", userId);
    return { migrated: true };
  }

  // Generate timeline via API (server-side call)
  try {
    const { generateTimeline } = await import("@/lib/timeline/generate-timeline");
    await generateTimeline(supabase, farmCrop.id, template.id, "2025-05-01");
  } catch (err) {
    console.error("Timeline generation during migration failed:", err);
  }

  // Mark as migrated
  await supabase
    .from("profiles")
    .update({ migrated_to_v2: true })
    .eq("id", userId);

  return { migrated: true };
}
