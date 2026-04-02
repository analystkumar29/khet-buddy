import { createClient, createServiceClient } from "@/lib/supabase/server";

// GET — latest readings + 7-day history for a farm
export async function GET(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get("farm_id");
  if (!farmId) {
    return Response.json({ error: "farm_id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify farm ownership
  const { data: farm } = await supabase
    .from("farms")
    .select("user_id")
    .eq("id", farmId)
    .single();

  if (!farm || farm.user_id !== user.id) {
    return Response.json({ error: "Farm not found" }, { status: 404 });
  }

  // Latest reading
  const { data: latest } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("farm_id", farmId)
    .order("reading_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Last 7 days history
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: history } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("farm_id", farmId)
    .gte("reading_at", sevenDaysAgo.toISOString())
    .order("reading_at", { ascending: false })
    .limit(50);

  // Check if sensor is connected
  const { data: sensors } = await supabase
    .from("soil_sensors")
    .select("*")
    .eq("farm_id", farmId)
    .eq("is_active", true)
    .limit(1);

  return Response.json({
    latest,
    history: history || [],
    sensorConnected: (sensors?.length || 0) > 0,
    sensor: sensors?.[0] || null,
  });
}

// POST — ingest reading from ESP32 sensor
export async function POST(request: Request) {
  const body = await request.json();
  const { device_id, moisture_pct, nitrogen_ppm, phosphorus_ppm, potassium_ppm, ph, temperature_c, humidity_pct } = body;

  if (!device_id) {
    return Response.json({ error: "device_id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Find sensor by device_id
  const { data: sensor } = await supabase
    .from("soil_sensors")
    .select("id, farm_id, is_active")
    .eq("device_id", device_id)
    .single();

  if (!sensor) {
    return Response.json({ error: "Unknown device" }, { status: 404 });
  }

  if (!sensor.is_active) {
    return Response.json({ error: "Sensor is deactivated" }, { status: 403 });
  }

  // Store reading
  const { error } = await supabase
    .from("sensor_readings")
    .insert({
      sensor_id: sensor.id,
      farm_id: sensor.farm_id,
      source: "sensor",
      moisture_pct: moisture_pct ?? null,
      nitrogen_ppm: nitrogen_ppm ?? null,
      phosphorus_ppm: phosphorus_ppm ?? null,
      potassium_ppm: potassium_ppm ?? null,
      ph: ph ?? null,
      temperature_c: temperature_c ?? null,
      humidity_pct: humidity_pct ?? null,
    });

  if (error) {
    return Response.json({ error: "Failed to store reading" }, { status: 500 });
  }

  // Update last_seen_at
  await supabase
    .from("soil_sensors")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", sensor.id);

  return Response.json({ success: true }, { status: 201 });
}
