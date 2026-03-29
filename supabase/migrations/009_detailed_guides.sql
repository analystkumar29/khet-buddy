-- ============================================
-- KhetBuddy: Detailed Activity Guides + Enhanced Disease Fields
-- Enables rich what/why/how content for every activity
-- ============================================

-- Add structured guide to template stages
ALTER TABLE crop_template_stages
  ADD COLUMN detailed_guide JSONB;

-- Expand crop_diseases with comprehensive fields
ALTER TABLE crop_diseases
  ADD COLUMN causative_agent TEXT,
  ADD COLUMN favorable_conditions_en TEXT,
  ADD COLUMN favorable_conditions_hi TEXT,
  ADD COLUMN economic_impact_en TEXT,
  ADD COLUMN economic_impact_hi TEXT,
  ADD COLUMN prevention_en TEXT,
  ADD COLUMN prevention_hi TEXT,
  ADD COLUMN spray_schedule JSONB,
  ADD COLUMN image_indicators TEXT[];
