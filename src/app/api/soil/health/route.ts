import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { SensorReading, SoilThreshold } from "@/types/database";

type ParameterStatus = {
  parameter: string;
  value: number | null;
  unit: string;
  status: "low" | "optimal" | "high" | "unknown";
  min: number;
  max: number;
  advice_en: string | null;
  advice_hi: string | null;
};

export async function GET(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get("farm_id");
  const cropKey = searchParams.get("crop_key") || "apple_ber";

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

  // Get latest reading
  const { data: latest } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("farm_id", farmId)
    .order("reading_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get thresholds for this crop (general, not stage-specific for now)
  const { data: thresholds } = await supabase
    .from("soil_thresholds")
    .select("*")
    .eq("crop_key", cropKey)
    .is("stage_key", null);

  if (!latest) {
    return Response.json({
      hasData: false,
      latest: null,
      parameters: [],
      recommendations: [],
    });
  }

  const reading = latest as SensorReading;
  const thresholdList = (thresholds || []) as SoilThreshold[];

  // Map reading values to parameter names
  const parameterMap: Record<string, number | null> = {
    moisture: reading.moisture_pct,
    nitrogen: reading.nitrogen_ppm,
    phosphorus: reading.phosphorus_ppm,
    potassium: reading.potassium_ppm,
    ph: reading.ph,
    temperature: reading.temperature_c,
  };

  const parameters: ParameterStatus[] = [];
  const recommendations: { en: string; hi: string; urgency: "low" | "medium" | "high" }[] = [];

  for (const threshold of thresholdList) {
    const value = parameterMap[threshold.parameter] ?? null;
    let status: "low" | "optimal" | "high" | "unknown" = "unknown";
    let adviceEn: string | null = null;
    let adviceHi: string | null = null;

    if (value !== null) {
      if (value < threshold.min_value) {
        status = "low";
        adviceEn = threshold.advice_low_en;
        adviceHi = threshold.advice_low_hi;
      } else if (value > threshold.max_value) {
        status = "high";
        adviceEn = threshold.advice_high_en;
        adviceHi = threshold.advice_high_hi;
      } else {
        status = "optimal";
      }
    }

    parameters.push({
      parameter: threshold.parameter,
      value,
      unit: threshold.unit,
      status,
      min: threshold.min_value,
      max: threshold.max_value,
      advice_en: adviceEn,
      advice_hi: adviceHi,
    });

    // Add recommendation if not optimal
    if (status !== "optimal" && status !== "unknown" && adviceEn && adviceHi) {
      const urgency =
        threshold.parameter === "moisture" ? "high" :
        threshold.parameter === "nitrogen" ? "medium" : "low";
      recommendations.push({ en: adviceEn, hi: adviceHi, urgency });
    }
  }

  // Sort recommendations by urgency
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return Response.json({
    hasData: true,
    latest: reading,
    parameters,
    recommendations,
  });
}
