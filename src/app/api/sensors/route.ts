import { createClient, createServiceClient } from "@/lib/supabase/server";

// GET — list farmer's registered sensors
export async function GET() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get user's farms
  const { data: farms } = await supabase
    .from("farms")
    .select("id")
    .eq("user_id", user.id);

  if (!farms?.length) {
    return Response.json({ sensors: [] });
  }

  const farmIds = farms.map((f) => f.id);
  const { data: sensors } = await supabase
    .from("soil_sensors")
    .select("*")
    .in("farm_id", farmIds)
    .order("created_at", { ascending: false });

  return Response.json({ sensors: sensors || [] });
}

// POST — register a new sensor
export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { farm_id, device_id, sensor_type, label } = await request.json();

  if (!farm_id || !device_id) {
    return Response.json(
      { error: "farm_id and device_id are required" },
      { status: 400 }
    );
  }

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

  // Check if device_id already taken
  const { data: existing } = await supabase
    .from("soil_sensors")
    .select("id")
    .eq("device_id", device_id)
    .maybeSingle();

  if (existing) {
    return Response.json(
      { error: "This device ID is already registered" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("soil_sensors")
    .insert({
      farm_id,
      device_id: device_id.trim(),
      sensor_type: sensor_type || "diy_esp32",
      label: label || null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Failed to register sensor" }, { status: 500 });
  }

  return Response.json({ sensor: data }, { status: 201 });
}

// DELETE — deactivate a sensor
export async function DELETE(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sensorId = searchParams.get("id");
  if (!sensorId) {
    return Response.json({ error: "Sensor id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify ownership through farm
  const { data: sensor } = await supabase
    .from("soil_sensors")
    .select("farm_id, farms!inner(user_id)")
    .eq("id", sensorId)
    .single();

  if (!sensor) {
    return Response.json({ error: "Sensor not found" }, { status: 404 });
  }

  const farms = (sensor as Record<string, unknown>).farms as Record<string, unknown>;
  if (farms.user_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase
    .from("soil_sensors")
    .update({ is_active: false })
    .eq("id", sensorId);

  return Response.json({ success: true });
}
