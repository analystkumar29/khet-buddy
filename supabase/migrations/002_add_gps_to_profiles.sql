-- ============================================
-- KhetBuddy v2: Add GPS coordinates to profiles
-- ============================================

ALTER TABLE profiles
  ADD COLUMN latitude NUMERIC(9,6),
  ADD COLUMN longitude NUMERIC(9,6);

-- Backfill existing users with Fatehabad coordinates
UPDATE profiles SET latitude = 29.5152, longitude = 75.4548 WHERE latitude IS NULL;

-- Add migrated_to_v2 flag for auto-migration tracking
ALTER TABLE profiles ADD COLUMN migrated_to_v2 BOOLEAN DEFAULT FALSE;
