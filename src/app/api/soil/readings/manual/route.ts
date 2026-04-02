import { createClient, createServiceClient } from "@/lib/supabase/server";

// POST — manual soil data entry (test kit or Soil Health Card)
export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { farm_id, source, moisture_pct, nitrogen_ppm, phosphorus_ppm, potassium_ppm, ph, temperature_c, humidity_pct } = body;

  if (!farm_id) {
    return Response.json({ error: "farm_id is required" }, { status: 400 });
  }

  const validSource = source === "soil_health_card" ? "soil_health_card" : "manual";

  const supabase = createServiceClient();

  // Verify farm ownership
  const { data: farm } = await supabase
    .from("farms")
    .select("user_id")
    .eq("id", farm_id)
    .single();

  if (!farm || farm.user_id !== user.id) {
    return Response.json({ error: "Farm not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("sensor_readings")
    .insert({
      farm_id,
      source: validSource,
      moisture_pct: moisture_pct ?? null,
      nitrogen_ppm: nitrogen_ppm ?? null,
      phosphorus_ppm: phosphorus_ppm ?? null,
      potassium_ppm: potassium_ppm ?? null,
      ph: ph ?? null,
      temperature_c: temperature_c ?? null,
      humidity_pct: humidity_pct ?? null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Failed to save reading" }, { status: 500 });
  }

  return Response.json({ reading: data }, { status: 201 });
}
