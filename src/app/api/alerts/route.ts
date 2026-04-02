import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("price_alerts")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }

  return Response.json({ alerts: data });
}

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { crop_key, target_price, mandi_name } = await request.json();

  if (!crop_key || !target_price || target_price <= 0) {
    return Response.json(
      { error: "crop_key and target_price (> 0) are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("price_alerts")
    .insert({
      user_id: user.id,
      crop_key,
      target_price,
      mandi_name: mandi_name || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Failed to create alert" }, { status: 500 });
  }

  return Response.json({ alert: data });
}

export async function DELETE(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const alertId = searchParams.get("id");
  if (!alertId) {
    return Response.json({ error: "Alert id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify ownership
  const { data: alert } = await supabase
    .from("price_alerts")
    .select("user_id")
    .eq("id", alertId)
    .single();

  if (!alert || alert.user_id !== user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await supabase
    .from("price_alerts")
    .update({ is_active: false })
    .eq("id", alertId);

  return Response.json({ success: true });
}
