-- ============================================
-- KhetBuddy: Three-Layer Timeline Anchoring
-- Fixes the scientifically wrong pure-week-offset model.
-- Ber flowering is photoperiod-dependent (September), NOT pruning-relative.
-- ============================================

-- 1. Add anchor columns to crop_template_stages
ALTER TABLE crop_template_stages
  ADD COLUMN anchor_type TEXT NOT NULL DEFAULT 'pruning_relative'
    CHECK (anchor_type IN ('pruning_relative', 'calendar_fixed', 'flowering_relative')),
  ADD COLUMN calendar_month INT,
  ADD COLUMN calendar_day INT DEFAULT 1,
  ADD COLUMN flowering_offset_days INT;

-- 2. Add timeline_version to farm_crops (track which model generated activities)
ALTER TABLE farm_crops ADD COLUMN timeline_version INT DEFAULT 1;

-- 3. Update FK on farm_activities to SET NULL on stage deletion (for reseed safety)
ALTER TABLE farm_activities DROP CONSTRAINT IF EXISTS farm_activities_template_stage_id_fkey;
ALTER TABLE farm_activities ADD CONSTRAINT farm_activities_template_stage_id_fkey
  FOREIGN KEY (template_stage_id) REFERENCES crop_template_stages(id) ON DELETE SET NULL;

-- 4. Create crop_knowledge_base — regional validation rules and advice
CREATE TABLE crop_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_key TEXT NOT NULL,
  region_key TEXT,
  state TEXT,
  rule_type TEXT NOT NULL,
  rule_key TEXT NOT NULL,
  value_date_month INT,
  value_date_day INT,
  value_int INT,
  message_en TEXT,
  message_hi TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_knowledge_base_unique
  ON crop_knowledge_base (crop_key, COALESCE(region_key, ''), COALESCE(state, ''), rule_type, rule_key);

ALTER TABLE crop_knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read crop knowledge base" ON crop_knowledge_base
  FOR SELECT USING (true);
