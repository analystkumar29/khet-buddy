-- ============================================
-- KhetBuddy v2: Farms, farm crops, and activity tracking
-- Personal timeline system for each farmer
-- ============================================

-- FARMS (user can have multiple farms/plots)
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farm_name TEXT,
  area_acres NUMERIC(5,2),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  village TEXT,
  district TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FARM CROPS (crop planted on a farm with planting date)
CREATE TABLE farm_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_template_id UUID NOT NULL REFERENCES crop_templates(id),
  planting_date DATE NOT NULL,
  tree_age_years INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FARM ACTIVITIES (scheduled + actual work log)
CREATE TABLE farm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_crop_id UUID NOT NULL REFERENCES farm_crops(id) ON DELETE CASCADE,
  template_stage_id UUID REFERENCES crop_template_stages(id),
  activity_type TEXT CHECK (activity_type IN (
    'irrigation', 'fertilizer', 'pesticide', 'pruning',
    'harvesting', 'marketing', 'maintenance', 'sowing', 'other'
  )),
  title_hi TEXT NOT NULL,
  title_en TEXT,
  description_hi TEXT,
  description_en TEXT,
  scheduled_date DATE,
  actual_date DATE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'late')),
  deviation_days INT DEFAULT 0,
  notes TEXT,
  ai_advice JSONB, -- stores DeepSeek advice for deviations
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_activities ENABLE ROW LEVEL SECURITY;

-- Farms: users manage their own
CREATE POLICY "Users can manage own farms" ON farms
  FOR ALL USING (auth.uid() = user_id);

-- Farm crops: through farms ownership
CREATE POLICY "Users can view own farm crops" ON farm_crops
  FOR SELECT USING (
    farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert own farm crops" ON farm_crops
  FOR INSERT WITH CHECK (
    farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own farm crops" ON farm_crops
  FOR UPDATE USING (
    farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own farm crops" ON farm_crops
  FOR DELETE USING (
    farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
  );

-- Farm activities: through farm_crops -> farms ownership
CREATE POLICY "Users can view own farm activities" ON farm_activities
  FOR SELECT USING (
    farm_crop_id IN (
      SELECT fc.id FROM farm_crops fc
      JOIN farms f ON fc.farm_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own farm activities" ON farm_activities
  FOR INSERT WITH CHECK (
    farm_crop_id IN (
      SELECT fc.id FROM farm_crops fc
      JOIN farms f ON fc.farm_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own farm activities" ON farm_activities
  FOR UPDATE USING (
    farm_crop_id IN (
      SELECT fc.id FROM farm_crops fc
      JOIN farms f ON fc.farm_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_farms_user ON farms(user_id);
CREATE INDEX idx_farm_crops_farm ON farm_crops(farm_id);
CREATE INDEX idx_farm_crops_status ON farm_crops(status) WHERE status = 'active';
CREATE INDEX idx_farm_activities_crop ON farm_activities(farm_crop_id);
CREATE INDEX idx_farm_activities_scheduled ON farm_activities(scheduled_date) WHERE status = 'scheduled';
