-- ============================================
-- KhetBuddy Phase 1: Core Schema
-- Apple Ber Smart Farm — Fatehabad, Haryana
-- ============================================

-- PROFILES (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
  preferred_language TEXT NOT NULL DEFAULT 'hi' CHECK (preferred_language IN ('hi', 'en')),
  farm_name TEXT,
  farm_area_acres NUMERIC(5,2),
  village TEXT,
  district TEXT,
  state TEXT DEFAULT 'Haryana',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISEASE SCANS (AI Crop Doctor)
CREATE TABLE disease_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  photo_url TEXT NOT NULL,
  photo_storage_path TEXT NOT NULL,
  scan_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (scan_status IN ('pending', 'analyzing', 'completed', 'failed')),
  diagnosis_hi TEXT,
  diagnosis_en TEXT,
  disease_name_hi TEXT,
  disease_name_en TEXT,
  confidence_score NUMERIC(3,2),
  severity TEXT CHECK (severity IN ('none', 'low', 'medium', 'high', 'critical')),
  treatment_hi TEXT,
  treatment_en TEXT,
  organic_treatment_hi TEXT,
  products_recommended JSONB DEFAULT '[]',
  affected_part TEXT CHECK (affected_part IN ('leaf', 'fruit', 'bark', 'root', 'flower', 'whole_plant')),
  urgency TEXT CHECK (urgency IN ('immediate', 'within_3_days', 'within_week', 'routine')),
  prevention_hi TEXT,
  prevention_en TEXT,
  raw_ai_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CROP STAGES (reference data — apple ber calendar)
CREATE TABLE crop_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL DEFAULT 'apple_ber',
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  stage_name_hi TEXT NOT NULL,
  stage_name_en TEXT NOT NULL,
  irrigation_status TEXT NOT NULL CHECK (irrigation_status IN ('allowed', 'blocked', 'careful', 'reduce')),
  irrigation_reason_hi TEXT NOT NULL,
  irrigation_reason_en TEXT NOT NULL,
  activities_hi TEXT[] DEFAULT '{}',
  activities_en TEXT[] DEFAULT '{}',
  disease_risk TEXT NOT NULL DEFAULT 'low' CHECK (disease_risk IN ('low', 'medium', 'high', 'critical')),
  disease_alerts_hi TEXT[] DEFAULT '{}',
  disease_alerts_en TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0
);

-- FARM TASKS
CREATE TABLE farm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title_hi TEXT NOT NULL,
  title_en TEXT,
  description_hi TEXT,
  description_en TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT CHECK (category IN (
    'irrigation', 'fertilizer', 'pesticide', 'pruning',
    'harvesting', 'marketing', 'maintenance', 'other'
  )),
  is_auto_generated BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER SETTINGS
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) UNIQUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  voice_enabled BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'hi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Disease scans
CREATE POLICY "Users can view own scans" ON disease_scans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON disease_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scans" ON disease_scans
  FOR UPDATE USING (auth.uid() = user_id);

-- Crop stages (public read — reference data)
CREATE POLICY "Anyone can read crop stages" ON crop_stages
  FOR SELECT USING (true);

-- Farm tasks
CREATE POLICY "Users can manage own tasks" ON farm_tasks
  FOR ALL USING (auth.uid() = user_id);

-- User settings
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Run this in Supabase dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('disease-scans', 'disease-scans', true);

-- ============================================
-- SEED: Apple Ber Crop Calendar for Fatehabad
-- ============================================

INSERT INTO crop_stages (month, stage_name_hi, stage_name_en, irrigation_status, irrigation_reason_hi, irrigation_reason_en, activities_hi, activities_en, disease_risk, disease_alerts_hi, disease_alerts_en, sort_order) VALUES
(1, 'फल पकना', 'Fruit Maturation', 'allowed', 'हर 7-10 दिन में पानी दें', 'Irrigate every 7-10 days', ARRAY['फल मक्खी का बेट स्प्रे करें','फलों की ग्रेडिंग करें','मंडी भाव चेक करें'], ARRAY['Apply fruit fly bait spray','Grade fruits','Check mandi prices'], 'critical', ARRAY['फल मक्खी — बेट स्प्रे ज़रूरी!'], ARRAY['Fruit fly CRITICAL — bait spray essential!'], 1),
(2, 'मुख्य तोड़ाई', 'Main Harvest', 'allowed', 'पानी बनाए रखें, हर 7-10 दिन', 'Maintain irrigation every 7-10 days', ARRAY['तोड़ाई, ग्रेडिंग, मंडी में बेचें','फल मक्खी का स्प्रे जारी रखें'], ARRAY['Harvest, grade, sell at mandi','Continue fruit fly spray'], 'high', ARRAY['फल मक्खी जारी','फल सड़न से बचें'], ARRAY['Fruit fly continues','Watch for fruit rot'], 2),
(3, 'आखिरी तोड़ाई', 'Late Harvest', 'reduce', 'पानी कम करें', 'Reduce irrigation', ARRAY['आखिरी फल तोड़ लें','कटाई के बाद सफाई करें','गिरे फल नष्ट करें'], ARRAY['Complete final harvest','Post-harvest cleanup','Destroy fallen fruits'], 'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 3),
(4, 'आराम का समय', 'Rest Period', 'blocked', 'आराम का समय, पानी न दें', 'Rest period — no irrigation', ARRAY['पेड़ को आराम दें','खेत की सफाई करें'], ARRAY['Let trees rest','Clean the orchard'], 'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 4),
(5, 'कड़ी छंटाई', 'Hard Pruning', 'careful', 'छंटाई के बाद पहला पानी दें', 'First irrigation after pruning', ARRAY['ज़मीन से 1 फुट ऊपर कड़ी छंटाई करें!','गोबर की खाद 40 किलो/पेड़ डालें','गर्मी की जुताई करें'], ARRAY['Hard prune to 1 foot above ground!','Apply FYM 40 kg/tree','Summer plowing'], 'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 5),
(6, 'सुस्ती का समय', 'Dormancy', 'careful', 'हल्का पानी दें', 'Light irrigation', ARRAY['गड्ढे भरें','दूसरा पानी दें','खरपतवार निकालें'], ARRAY['Pit filling','Second irrigation','Weed management'], 'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 6),
(7, 'नई बढ़वार शुरू', 'New Growth Starts', 'blocked', 'बारिश का मौसम — पानी न दें', 'Monsoon — no irrigation needed', ARRAY['NPK खाद डालें','यूरिया 200g/पेड़','अंतरफसल बोएं (मूंग/मोठ)'], ARRAY['Apply NPK fertilizer','Urea 200g/tree','Sow intercrops'], 'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 7),
(8, 'तेज़ बढ़वार', 'Rapid Growth', 'blocked', 'बारिश का मौसम — पानी न दें', 'Monsoon — no supplemental irrigation', ARRAY['कीटों पर नज़र रखें','छाल खाने वाले कीड़े चेक करें'], ARRAY['Monitor for pests','Check for bark eating caterpillar'], 'medium', ARRAY['छाल खाने वाला कीड़ा — तने पर छेद देखें'], ARRAY['Bark eating caterpillar — check trunk'], 8),
(9, 'फूल आना शुरू', 'Flowering Begins', 'blocked', 'फूल आ रहे हैं — पानी बिल्कुल न दें!', 'Flowering — ZERO irrigation!', ARRAY['पानी बिल्कुल न दें!','यूरिया की दूसरी खुराक','छूर्णी रोग की दवाई तैयार रखें'], ARRAY['ZERO irrigation!','Second urea dose','Prepare powdery mildew fungicide'], 'high', ARRAY['छूर्णी रोग शुरू हो सकता है'], ARRAY['Powdery mildew may start'], 9),
(10, 'पूरे फूल', 'Peak Flowering', 'blocked', 'फूल पूरे खिले हैं — पानी बिल्कुल न दें!', 'Peak flowering — NO water!', ARRAY['पानी बिल्कुल न दें!','छूर्णी रोग का स्प्रे: Sulfex 0.3%','देसी: छाछ 6L + 100L पानी'], ARRAY['ZERO irrigation!','Powdery mildew spray: Sulfex 0.3%','Organic: Buttermilk 6L + 100L water'], 'critical', ARRAY['छूर्णी रोग — सफ़ेद पाउडर फलों/पत्तों पर'], ARRAY['Powdery mildew HIGH — white powder on fruits/leaves'], 10),
(11, 'फल लगना', 'Fruit Set', 'careful', 'धीरे-धीरे पानी शुरू करें', 'Begin careful irrigation', ARRAY['सिंचाई शुरू करें','बोरॉन स्प्रे करें','बांस का सहारा लगाएं'], ARRAY['Begin irrigation','Apply boron spray','Add bamboo supports'], 'high', ARRAY['छूर्णी रोग जारी — स्प्रे करते रहें'], ARRAY['Powdery mildew continues'], 11),
(12, 'फल बढ़ना', 'Fruit Development', 'allowed', 'हर 7-10 दिन में पानी दें', 'Irrigate every 7-10 days', ARRAY['कैल्शियम स्प्रे करें','फल मक्खी के ट्रैप लगाएं','मंडी भाव पर नज़र रखें'], ARRAY['Apply calcium spray','Set up fruit fly traps','Monitor mandi prices'], 'high', ARRAY['फल मक्खी सक्रिय हो रही है'], ARRAY['Fruit fly becoming active'], 12);
