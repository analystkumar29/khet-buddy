import { createServiceClient } from "@/lib/supabase/server";
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

    const supabase = createServiceClient();

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
