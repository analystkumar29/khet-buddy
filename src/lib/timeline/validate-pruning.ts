/**
 * Pruning date validation against crop knowledge base.
 * Warns farmers if their pruning date is outside the scientifically
 * recommended window for their region, and provides mitigation advice.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type PruningValidation = {
  isValid: boolean;
  severity: "ok" | "warning" | "danger";
  warnings: { message_en: string; message_hi: string; severity: string }[];
  mitigations: { message_en: string; message_hi: string }[];
  validWindow: {
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
  } | null;
};

export async function validatePruningDate(
  supabase: SupabaseClient,
  cropKey: string,
  state: string,
  pruningDate: string
): Promise<PruningValidation> {
  const result: PruningValidation = {
    isValid: true,
    severity: "ok",
    warnings: [],
    mitigations: [],
    validWindow: null,
  };

  // Fetch pruning window for this state
  const { data: windowRules } = await supabase
    .from("crop_knowledge_base")
    .select("*")
    .eq("crop_key", cropKey)
    .eq("rule_type", "pruning_window")
    .or(`state.eq.${state},state.is.null`)
    .order("state", { ascending: false, nullsFirst: false }); // Prefer state-specific over null

  if (!windowRules || windowRules.length === 0) {
    return result; // No rules = no validation
  }

  // Extract start and end from rules
  const startRule = windowRules.find((r) => r.rule_key === "pruning_start");
  const endRule = windowRules.find((r) => r.rule_key === "pruning_end");

  if (startRule && endRule) {
    result.validWindow = {
      startMonth: startRule.value_date_month!,
      startDay: startRule.value_date_day!,
      endMonth: endRule.value_date_month!,
      endDay: endRule.value_date_day!,
    };
  }

  // Parse farmer's pruning date
  const pDate = new Date(pruningDate);
  const pMonth = pDate.getMonth() + 1; // 1-indexed
  const pDay = pDate.getDate();

  // Check if within window
  const startOk =
    !startRule ||
    pMonth > startRule.value_date_month! ||
    (pMonth === startRule.value_date_month! &&
      pDay >= startRule.value_date_day!);

  const endOk =
    !endRule ||
    pMonth < endRule.value_date_month! ||
    (pMonth === endRule.value_date_month! && pDay <= endRule.value_date_day!);

  if (startOk && endOk) {
    return result; // Within window — all good
  }

  // Outside window — fetch warnings and mitigations
  result.isValid = false;

  const isTooEarly = !startOk;
  const warningKey = isTooEarly ? "pruning_too_early" : "pruning_too_late";

  // Fetch warning message
  const { data: warnings } = await supabase
    .from("crop_knowledge_base")
    .select("message_en, message_hi, severity")
    .eq("crop_key", cropKey)
    .eq("rule_type", "warning")
    .eq("rule_key", warningKey);

  if (warnings) {
    for (const w of warnings) {
      result.warnings.push({
        message_en: (w.message_en || "").replace("{state}", state),
        message_hi: (w.message_hi || "").replace("{state}", state),
        severity: w.severity || "warning",
      });
      if (w.severity === "danger") result.severity = "danger";
      else if (w.severity === "warning" && result.severity !== "danger")
        result.severity = "warning";
    }
  }

  // Fetch mitigation advice
  const { data: mitigations } = await supabase
    .from("crop_knowledge_base")
    .select("message_en, message_hi")
    .eq("crop_key", cropKey)
    .eq("rule_type", "mitigation")
    .eq("rule_key", warningKey);

  if (mitigations) {
    result.mitigations = mitigations.map((m) => ({
      message_en: m.message_en || "",
      message_hi: m.message_hi || "",
    }));
  }

  return result;
}
