import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateTimeline } from "@/lib/timeline/generate-timeline";

export async function POST(request: Request) {
  try {
    const { farmCropId, cropTemplateId, plantingDate, state } = await request.json();

    if (!farmCropId || !cropTemplateId || !plantingDate) {
      return Response.json(
        { error: "farmCropId, cropTemplateId, and plantingDate are required" },
        { status: 400 }
      );
    }

    // Verify authenticated user owns this farm crop
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: farmCrop } = await supabase
      .from("farm_crops")
      .select("farm_id, farms!inner(user_id)")
      .eq("id", farmCropId)
      .single();

    if (!farmCrop) {
      return Response.json({ error: "Farm crop not found" }, { status: 404 });
    }
    const farms = (farmCrop as Record<string, unknown>).farms as Record<string, unknown>;
    if (farms.user_id !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const result = await generateTimeline(
      supabase,
      farmCropId,
      cropTemplateId,
      plantingDate,
      state
    );

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({
      success: true,
      activitiesGenerated: result.count,
    });
  } catch (error) {
    console.error("Generate timeline error:", error);
    return Response.json(
      { error: "Failed to generate timeline" },
      { status: 500 }
    );
  }
}
