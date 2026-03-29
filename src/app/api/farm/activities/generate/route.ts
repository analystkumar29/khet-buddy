import { createServiceClient } from "@/lib/supabase/server";
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

    const supabase = createServiceClient();
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
