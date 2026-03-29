-- ============================================
-- KhetBuddy v2: Crop templates system
-- Database-driven crop calendars replacing hardcoded TypeScript
-- ============================================

-- CROP TEMPLATES (one per crop+region combo)
CREATE TABLE crop_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_key TEXT NOT NULL,
  crop_name_en TEXT NOT NULL,
  crop_name_hi TEXT NOT NULL,
  region_key TEXT, -- NULL = universal template
  total_weeks INT NOT NULL DEFAULT 52,
  description_en TEXT,
  description_hi TEXT,
  is_perennial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crop_key, region_key)
);

-- CROP TEMPLATE STAGES (week-offset based, not fixed months)
CREATE TABLE crop_template_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES crop_templates(id) ON DELETE CASCADE,
  week_offset INT NOT NULL,
  duration_weeks INT NOT NULL DEFAULT 4,
  stage_name_en TEXT NOT NULL,
  stage_name_hi TEXT NOT NULL,
  irrigation_status TEXT NOT NULL CHECK (irrigation_status IN ('allowed', 'blocked', 'careful', 'reduce')),
  irrigation_reason_en TEXT NOT NULL,
  irrigation_reason_hi TEXT NOT NULL,
  activities_en TEXT[] DEFAULT '{}',
  activities_hi TEXT[] DEFAULT '{}',
  disease_risk TEXT NOT NULL DEFAULT 'low' CHECK (disease_risk IN ('low', 'medium', 'high', 'critical')),
  disease_alerts_en TEXT[] DEFAULT '{}',
  disease_alerts_hi TEXT[] DEFAULT '{}',
  fertilizer_schedule JSONB,
  sort_order INT DEFAULT 0
);

-- CROP DISEASES (per-crop disease database for AI prompts)
CREATE TABLE crop_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_key TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  local_name TEXT,
  peak_week_offsets INT[] DEFAULT '{}',
  symptoms_en TEXT,
  symptoms_hi TEXT,
  treatment_en TEXT,
  treatment_hi TEXT,
  organic_treatment_en TEXT,
  organic_treatment_hi TEXT,
  products JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE crop_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_template_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_diseases ENABLE ROW LEVEL SECURITY;

-- Public read for all reference data
CREATE POLICY "Anyone can read crop templates" ON crop_templates
  FOR SELECT USING (true);
CREATE POLICY "Anyone can read crop template stages" ON crop_template_stages
  FOR SELECT USING (true);
CREATE POLICY "Anyone can read crop diseases" ON crop_diseases
  FOR SELECT USING (true);

-- Index for common lookups
CREATE INDEX idx_crop_template_stages_template ON crop_template_stages(template_id, week_offset);
CREATE INDEX idx_crop_diseases_crop_key ON crop_diseases(crop_key);
