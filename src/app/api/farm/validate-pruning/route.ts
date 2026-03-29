import { createServiceClient } from "@/lib/supabase/server";
import { validatePruningDate } from "@/lib/timeline/validate-pruning";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropKey = searchParams.get("crop") || "apple_ber";
    const state = searchParams.get("state") || "Haryana";
    const pruningDate = searchParams.get("date");
    const treeAgeMonths = searchParams.get("treeAgeMonths")
      ? parseInt(searchParams.get("treeAgeMonths")!)
      : undefined;

    if (!pruningDate) {
      return Response.json(
        { error: "date parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const result = await validatePruningDate(
      supabase,
      cropKey,
      state,
      pruningDate,
      treeAgeMonths
    );

    return Response.json(result);
  } catch (error) {
    console.error("Validate pruning error:", error);
    return Response.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
