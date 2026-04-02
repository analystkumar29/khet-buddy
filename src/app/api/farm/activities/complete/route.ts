import { createClient, createServiceClient } from "@/lib/supabase/server";
import { completeActivity, skipActivity } from "@/lib/timeline/adjust-timeline";

export async function POST(request: Request) {
  try {
    const { activityId, action, actualDate, notes } = await request.json();

    if (!activityId || !action) {
      return Response.json(
        { error: "activityId and action are required" },
        { status: 400 }
      );
    }

    // Verify authenticated user
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify activity belongs to the user's farm
    const supabase = createServiceClient();
    const { data: activity } = await supabase
      .from("farm_activities")
      .select("farm_crop_id, farm_crops!inner(farm_id, farms!inner(user_id))")
      .eq("id", activityId)
      .single();

    if (!activity || (activity as Record<string, unknown>).farm_crops === null) {
      return Response.json({ error: "Activity not found" }, { status: 404 });
    }
    const farmCrops = (activity as Record<string, unknown>).farm_crops as Record<string, unknown>;
    const farms = farmCrops.farms as Record<string, unknown>;
    if (farms.user_id !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "complete") {
      const date = actualDate || new Date().toISOString().split("T")[0];
      const result = await completeActivity(supabase, activityId, date, notes);
      return Response.json({ success: true, ...result });
    }

    if (action === "skip") {
      const result = await skipActivity(supabase, activityId, notes);
      return Response.json({ success: true, ...result });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Complete activity error:", error);
    return Response.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}
