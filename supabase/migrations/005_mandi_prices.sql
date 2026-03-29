-- ============================================
-- KhetBuddy v2: Mandi prices and price alerts
-- ============================================

-- MANDI PRICES (cached from data.gov.in)
CREATE TABLE mandi_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_key TEXT NOT NULL,
  mandi_name TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  price_per_quintal NUMERIC(10,2) NOT NULL,
  min_price NUMERIC(10,2),
  max_price NUMERIC(10,2),
  price_date DATE NOT NULL,
  grade TEXT,
  source TEXT DEFAULT 'data_gov_in',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crop_key, mandi_name, price_date, grade)
);

-- PRICE ALERTS (user notification preferences)
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  crop_key TEXT NOT NULL,
  target_price NUMERIC(10,2) NOT NULL,
  mandi_name TEXT, -- NULL = any mandi
  is_active BOOLEAN DEFAULT TRUE,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE mandi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Mandi prices: public read (reference data)
CREATE POLICY "Anyone can read mandi prices" ON mandi_prices
  FOR SELECT USING (true);

-- Price alerts: users manage their own
CREATE POLICY "Users can manage own price alerts" ON price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX idx_mandi_prices_lookup ON mandi_prices(crop_key, state, price_date DESC);
CREATE INDEX idx_mandi_prices_district ON mandi_prices(crop_key, district, price_date DESC);
CREATE INDEX idx_price_alerts_user ON price_alerts(user_id) WHERE is_active = TRUE;
