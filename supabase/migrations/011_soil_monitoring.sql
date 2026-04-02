-- ============================================================
-- 011: Soil Monitoring — sensors, readings, thresholds
-- ============================================================

-- Registered sensor devices per farm
CREATE TABLE IF NOT EXISTS soil_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL UNIQUE,
  sensor_type TEXT NOT NULL DEFAULT 'manual' CHECK (sensor_type IN ('diy_esp32', 'soilsens', 'manual')),
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Time-series soil readings (sensor + manual + soil health card)
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES soil_sensors(id) ON DELETE SET NULL,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('sensor', 'manual', 'soil_health_card')),
  moisture_pct NUMERIC(5,2),
  nitrogen_ppm NUMERIC(7,2),
  phosphorus_ppm NUMERIC(7,2),
  potassium_ppm NUMERIC(7,2),
  ph NUMERIC(4,2),
  temperature_c NUMERIC(5,2),
  humidity_pct NUMERIC(5,2),
  reading_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_farm_date
  ON sensor_readings (farm_id, reading_at DESC);

-- Optimal ranges per crop (with optional stage-specific overrides)
CREATE TABLE IF NOT EXISTS soil_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_key TEXT NOT NULL,
  stage_key TEXT,
  parameter TEXT NOT NULL CHECK (parameter IN ('moisture', 'nitrogen', 'phosphorus', 'potassium', 'ph', 'temperature')),
  min_value NUMERIC NOT NULL,
  max_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  advice_low_en TEXT,
  advice_low_hi TEXT,
  advice_high_en TEXT,
  advice_high_hi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE soil_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_thresholds ENABLE ROW LEVEL SECURITY;

-- Sensors: users access own farm's sensors
CREATE POLICY "Users can manage own farm sensors"
  ON soil_sensors FOR ALL
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

-- Readings: users access own farm's readings
CREATE POLICY "Users can read own farm readings"
  ON sensor_readings FOR SELECT
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own farm readings"
  ON sensor_readings FOR INSERT
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

-- Thresholds: public read
CREATE POLICY "Anyone can read thresholds"
  ON soil_thresholds FOR SELECT
  USING (true);

-- ============================================================
-- Seed: Apple Ber optimal soil ranges (ICAR/HAU data)
-- ============================================================

INSERT INTO soil_thresholds (crop_key, stage_key, parameter, min_value, max_value, unit, advice_low_en, advice_low_hi, advice_high_en, advice_high_hi) VALUES
-- General moisture (non-flowering)
('apple_ber', NULL, 'moisture', 25, 40, '%',
 'Soil is dry — irrigate now. Apply 50-60 liters per tree.',
 'मिट्टी सूखी है — अभी पानी दें। 50-60 लीटर/पेड़ डालें।',
 'Soil is too wet — stop irrigation. Risk of root rot.',
 'मिट्टी में ज़्यादा नमी है — पानी बंद करें। जड़ सड़न का खतरा।'),

-- Flowering moisture (water stress needed Sep-Oct)
('apple_ber', 'flowering', 'moisture', 15, 25, '%',
 'Moisture too low even for flowering stress. Light irrigation (10-15L/tree) if wilting visible.',
 'फूल आने के लिए भी नमी बहुत कम है। मुरझाने पर हल्का पानी (10-15L/पेड़) दें।',
 'Too much moisture during flowering! Stop all irrigation immediately. Flowers will drop.',
 'फूल आने के समय ज़्यादा नमी! पानी तुरंत बंद करें। फूल गिर जाएंगे।'),

-- Nitrogen
('apple_ber', NULL, 'nitrogen', 150, 250, 'ppm',
 'Nitrogen is low — apply 200g Urea per tree. Split into 2 doses (July + September).',
 'नाइट्रोजन कम है — 200g यूरिया/पेड़ डालें। 2 बार में (जुलाई + सितंबर)।',
 'Excess nitrogen — stop urea application. Too much N delays flowering and reduces fruit quality.',
 'नाइट्रोजन ज़्यादा है — यूरिया बंद करें। ज़्यादा N से फूल देर से आते हैं और फल की गुणवत्ता गिरती है।'),

-- Phosphorus
('apple_ber', NULL, 'phosphorus', 20, 40, 'ppm',
 'Phosphorus is low — apply 250g DAP per tree at pruning time.',
 'फ़ॉस्फ़ोरस कम है — छंटाई के समय 250g DAP/पेड़ डालें।',
 'Phosphorus is high — skip DAP this season. Excess P blocks zinc absorption.',
 'फ़ॉस्फ़ोरस ज़्यादा है — इस बार DAP न डालें। ज़्यादा P से ज़िंक नहीं लगता।'),

-- Potassium
('apple_ber', NULL, 'potassium', 150, 250, 'ppm',
 'Potassium is low — apply 200g MOP per tree. Important for fruit sweetness.',
 'पोटैशियम कम है — 200g MOP/पेड़ डालें। फल की मिठास के लिए ज़रूरी है।',
 'Potassium is high — skip MOP this season.',
 'पोटैशियम ज़्यादा है — इस बार MOP न डालें।'),

-- pH
('apple_ber', NULL, 'ph', 6.5, 8.5, '',
 'Soil is too acidic — apply 2-3 kg lime per tree to raise pH.',
 'मिट्टी बहुत अम्लीय है — pH बढ़ाने के लिए 2-3 किलो चूना/पेड़ डालें।',
 'Soil is too alkaline — apply 500g gypsum per tree. Also add FYM to improve structure.',
 'मिट्टी बहुत क्षारीय है — 500g जिप्सम/पेड़ डालें। गोबर की खाद भी डालें।'),

-- Soil temperature
('apple_ber', NULL, 'temperature', 20, 35, '°C',
 'Soil is cold — mulch heavily (15cm straw/dry leaves) to retain heat.',
 'मिट्टी ठंडी है — 15cm पराली/सूखी पत्तियों से मल्चिंग करें।',
 'Soil temperature is very high — mulch to cool roots. Irrigate in evening only.',
 'मिट्टी का तापमान बहुत ज़्यादा है — मल्चिंग करें। शाम को ही पानी दें।');
