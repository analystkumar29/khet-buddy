export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  role: "farmer" | "admin";
  preferred_language: "hi" | "en";
  farm_name: string | null;
  farm_area_acres: number | null;
  village: string | null;
  district: string | null;
  state: string;
  latitude: number | null;
  longitude: number | null;
  migrated_to_v2: boolean;
  created_at: string;
  updated_at: string;
};

export type DiseaseScan = {
  id: string;
  user_id: string;
  photo_url: string;
  photo_storage_path: string;
  scan_status: "pending" | "analyzing" | "completed" | "failed";
  diagnosis_hi: string | null;
  diagnosis_en: string | null;
  disease_name_hi: string | null;
  disease_name_en: string | null;
  confidence_score: number | null;
  severity: "none" | "low" | "medium" | "high" | "critical" | null;
  treatment_hi: string | null;
  treatment_en: string | null;
  organic_treatment_hi: string | null;
  products_recommended: {
    name_en: string;
    name_hi: string;
    dosage: string;
    application: string;
    where_to_buy: string;
  }[];
  affected_part: string | null;
  urgency: "immediate" | "within_3_days" | "within_week" | "routine" | null;
  prevention_hi: string | null;
  prevention_en: string | null;
  raw_ai_response: Record<string, unknown> | null;
  created_at: string;
};

export type FarmTask = {
  id: string;
  user_id: string;
  title_hi: string;
  title_en: string | null;
  description_hi: string | null;
  description_en: string | null;
  due_date: string | null;
  status: "pending" | "in_progress" | "completed" | "skipped";
  priority: "low" | "medium" | "high" | "urgent";
  category:
    | "irrigation"
    | "fertilizer"
    | "pesticide"
    | "pruning"
    | "harvesting"
    | "marketing"
    | "maintenance"
    | "other";
  completed_at: string | null;
  created_at: string;
};

// ============================================
// v2 Types: Crop templates, farms, activities
// ============================================

export type CropTemplate = {
  id: string;
  crop_key: string;
  crop_name_en: string;
  crop_name_hi: string;
  region_key: string | null;
  total_weeks: number;
  description_en: string | null;
  description_hi: string | null;
  is_perennial: boolean;
  created_at: string;
};

export type CropTemplateStage = {
  id: string;
  template_id: string;
  week_offset: number;
  duration_weeks: number;
  stage_name_en: string;
  stage_name_hi: string;
  irrigation_status: "allowed" | "blocked" | "careful" | "reduce";
  irrigation_reason_en: string;
  irrigation_reason_hi: string;
  activities_en: string[];
  activities_hi: string[];
  disease_risk: "low" | "medium" | "high" | "critical";
  disease_alerts_en: string[];
  disease_alerts_hi: string[];
  fertilizer_schedule: Record<string, unknown> | null;
  sort_order: number;
  anchor_type: "pruning_relative" | "calendar_fixed" | "flowering_relative";
  calendar_month: number | null;
  calendar_day: number | null;
  flowering_offset_days: number | null;
};

export type CropDisease = {
  id: string;
  crop_key: string;
  name_en: string;
  name_hi: string;
  local_name: string | null;
  peak_week_offsets: number[];
  symptoms_en: string | null;
  symptoms_hi: string | null;
  treatment_en: string | null;
  treatment_hi: string | null;
  organic_treatment_en: string | null;
  organic_treatment_hi: string | null;
  products: {
    name_en: string;
    name_hi: string;
    dosage: string;
    where_to_buy: string;
  }[];
  causative_agent: string | null;
  favorable_conditions_en: string | null;
  favorable_conditions_hi: string | null;
  economic_impact_en: string | null;
  economic_impact_hi: string | null;
  prevention_en: string | null;
  prevention_hi: string | null;
  spray_schedule: Record<string, unknown>[] | null;
  image_indicators: string[] | null;
  created_at: string;
};

export type Farm = {
  id: string;
  user_id: string;
  farm_name: string | null;
  area_acres: number | null;
  latitude: number | null;
  longitude: number | null;
  village: string | null;
  district: string | null;
  state: string | null;
  created_at: string;
};

export type FarmCrop = {
  id: string;
  farm_id: string;
  crop_template_id: string;
  planting_date: string;
  tree_age_years: number;
  status: "active" | "completed" | "abandoned";
  notes: string | null;
  timeline_version: number;
  created_at: string;
};

export type FarmActivity = {
  id: string;
  farm_crop_id: string;
  template_stage_id: string | null;
  activity_type:
    | "irrigation"
    | "fertilizer"
    | "pesticide"
    | "pruning"
    | "harvesting"
    | "marketing"
    | "maintenance"
    | "sowing"
    | "other";
  title_hi: string;
  title_en: string | null;
  description_hi: string | null;
  description_en: string | null;
  scheduled_date: string | null;
  actual_date: string | null;
  status: "scheduled" | "completed" | "skipped" | "late";
  deviation_days: number;
  notes: string | null;
  ai_advice: Record<string, unknown> | null;
  created_at: string;
};

export type MandiPrice = {
  id: string;
  crop_key: string;
  mandi_name: string;
  district: string;
  state: string;
  price_per_quintal: number;
  min_price: number | null;
  max_price: number | null;
  price_date: string;
  grade: string | null;
  source: string;
  created_at: string;
};

export type CropKnowledgeBase = {
  id: string;
  crop_key: string;
  region_key: string | null;
  state: string | null;
  rule_type: string;
  rule_key: string;
  value_date_month: number | null;
  value_date_day: number | null;
  value_int: number | null;
  message_en: string | null;
  message_hi: string | null;
  severity: "info" | "warning" | "danger";
  created_at: string;
};

export type PriceAlert = {
  id: string;
  user_id: string;
  crop_key: string;
  target_price: number;
  mandi_name: string | null;
  is_active: boolean;
  last_notified_at: string | null;
  created_at: string;
};
