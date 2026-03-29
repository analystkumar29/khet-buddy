-- ============================================
-- KhetBuddy: Reseed Apple Ber with Science-Based Three-Layer Anchoring
--
-- Sources: ICAR, CCS HAU Hisar, PAU Ludhiana, NHB, MDPI Horticulturae 2022
-- Key: Flowering is photoperiod-dependent (Sep 1 North India)
-- Apple Ber maturity = 70-75 days from flowering (NOT 150-175 desi ber)
-- ============================================

-- Delete old (incorrect) template stages
-- farm_activities FK is ON DELETE SET NULL, so existing records are preserved
DELETE FROM crop_template_stages WHERE template_id = (
  SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL
);

-- Reseed with correct anchor types
DO $$
DECLARE
  tmpl_id UUID;
BEGIN
  SELECT id INTO tmpl_id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL;

  -- Stage 1: Hard Pruning (PRUNING-RELATIVE, Week 0)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi,
    fertilizer_schedule, sort_order)
  VALUES (tmpl_id, 0, 4, 'Hard Pruning', 'कड़ी छंटाई',
    'pruning_relative', 'careful',
    'First irrigation after pruning',
    'छंटाई के बाद पहला पानी दें',
    ARRAY['Hard prune to 1 foot above ground!', 'Apply FYM 40 kg/tree', 'Apply DAP 250g + MOP 200g per tree', 'Summer plowing'],
    ARRAY['ज़मीन से 1 फुट ऊपर कड़ी छंटाई करें!', 'गोबर की खाद 40 किलो/पेड़ डालें', 'DAP 250g + MOP 200g प्रति पेड़ डालें', 'गर्मी की जुताई करें'],
    'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    '{"fym_kg_per_tree": 40, "dap_g_per_tree": 250, "mop_g_per_tree": 200}'::JSONB, 1);

  -- Stage 2: Bud Break & Dormancy (PRUNING-RELATIVE, Week 4)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, sort_order)
  VALUES (tmpl_id, 4, 5, 'Bud Break', 'अंकुरण / सुस्ती',
    'pruning_relative', 'careful',
    'Light irrigation for bud break',
    'अंकुरण के लिए हल्का पानी दें',
    ARRAY['First irrigation after pruning', 'Pit filling', 'Second irrigation', 'Weed management', 'Apply Thiourea 1% spray if buds slow'],
    ARRAY['छंटाई के बाद पहला पानी', 'गड्ढे भरें', 'दूसरा पानी दें', 'खरपतवार निकालें', 'अंकुरण देर हो तो Thiourea 1% स्प्रे करें'],
    'low', 2);

  -- Stage 3: New Growth / Monsoon (CALENDAR-FIXED, July 1)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, calendar_month, calendar_day,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk,
    fertilizer_schedule, sort_order)
  VALUES (tmpl_id, 9, 4, 'New Growth (Monsoon)', 'नई बढ़वार (बारिश)',
    'calendar_fixed', 7, 1,
    'blocked',
    'Monsoon — no irrigation needed',
    'बारिश का मौसम — पानी की ज़रूरत नहीं',
    ARRAY['Apply Urea 200g/tree (first dose)', 'Apply NPK fertilizer', 'Sow intercrops (moong/moth)'],
    ARRAY['यूरिया 200g/पेड़ (पहली खुराक)', 'NPK खाद डालें', 'अंतरफसल बोएं (मूंग/मोठ)'],
    'low',
    '{"urea_g_per_tree": 200, "note": "first dose — July"}'::JSONB, 3);

  -- Stage 4: Rapid Growth (CALENDAR-FIXED, August 1)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, calendar_month, calendar_day,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 13, 4, 'Rapid Growth', 'तेज़ बढ़वार',
    'calendar_fixed', 8, 1,
    'blocked',
    'Monsoon continues — no supplemental irrigation',
    'बारिश जारी — अलग से पानी न दें',
    ARRAY['Monitor for pests', 'Check trunk for bark eating caterpillar', 'Weed control', 'Thin excessive shoots if pruned early'],
    ARRAY['कीटों पर नज़र रखें', 'तने पर छाल कीड़ा चेक करें', 'खरपतवार निकालें', 'जल्दी छंटाई की हो तो अतिरिक्त टहनियां काटें'],
    'medium',
    ARRAY['Bark eating caterpillar — check trunk for holes and webbing'],
    ARRAY['छाल खाने वाला कीड़ा — तने पर छेद और जाले देखें'],
    4);

  -- Stage 5: Flowering Begins (CALENDAR-FIXED, September 1) *** CRITICAL ***
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, calendar_month, calendar_day,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi,
    fertilizer_schedule, sort_order)
  VALUES (tmpl_id, 17, 6, 'Flowering Begins', 'फूल आना शुरू',
    'calendar_fixed', 9, 1,
    'blocked',
    'FLOWERING — ZERO irrigation! Flowers will drop!',
    '🔴 फूल आ रहे हैं — पानी बिल्कुल न दें! फूल गिर जाएंगे!',
    ARRAY['CRITICAL: ZERO irrigation!', 'Apply Urea 200g/tree (second dose)', 'Prepare powdery mildew fungicide', 'Monitor for powdery mildew on leaves'],
    ARRAY['🔴 पानी बिल्कुल न दें!', 'यूरिया 200g/पेड़ (दूसरी खुराक)', 'छूर्णी रोग की दवाई तैयार रखें', 'पत्तों पर छूर्णी रोग चेक करें'],
    'high',
    ARRAY['Powdery mildew may start — watch for white powder on leaves'],
    ARRAY['छूर्णी रोग शुरू हो सकता है — पत्तियों पर सफ़ेद पाउडर देखें'],
    '{"urea_g_per_tree": 200, "note": "second dose — September at flowering"}'::JSONB, 5);

  -- Stage 6: Peak Flowering (CALENDAR-FIXED, October 15) *** CRITICAL ***
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, calendar_month, calendar_day,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 22, 4, 'Peak Flowering', 'पूरे फूल',
    'calendar_fixed', 10, 15,
    'blocked',
    'CRITICAL: Peak flowering — absolutely NO water!',
    '🔴 फूल पूरे खिले हैं — पानी बिल्कुल न दें!',
    ARRAY['ZERO irrigation!', 'Powdery mildew spray: Sulfex 0.3% every 12-15 days', 'Alternate with Bayleton 0.1%', 'Organic: Fermented buttermilk 6L in 100L water'],
    ARRAY['🔴 पानी बिल्कुल न दें!', 'छूर्णी रोग: Sulfex 0.3% हर 12-15 दिन', 'या Bayleton 0.1% बारी-बारी से', 'देसी इलाज: छाछ 6L + 100L पानी'],
    'critical',
    ARRAY['Powdery mildew CRITICAL — white powder on fruits/leaves', 'Umran variety most susceptible'],
    ARRAY['छूर्णी रोग — सफ़ेद पाउडर फलों/पत्तों पर', 'Umran किस्म सबसे प्रभावित'],
    6);

  -- Stage 7: Fruit Set (FLOWERING-RELATIVE, +21 days from Sep 1)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, flowering_offset_days,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 26, 4, 'Fruit Set', 'फल लगना',
    'flowering_relative', 21,
    'careful',
    'Begin careful irrigation — fruits developing',
    'धीरे-धीरे पानी शुरू करें — फल बढ़ रहे हैं',
    ARRAY['Begin careful irrigation', 'Apply boron spray (fruit quality)', 'Continue powdery mildew spray', 'Install bamboo supports for heavy branches'],
    ARRAY['सिंचाई धीरे-धीरे शुरू करें', 'बोरॉन स्प्रे करें (फल की क्वालिटी)', 'छूर्णी रोग का स्प्रे जारी रखें', 'बांस का सहारा लगाएं'],
    'high',
    ARRAY['Powdery mildew continues — maintain spray schedule'],
    ARRAY['छूर्णी रोग जारी — स्प्रे करते रहें'],
    7);

  -- Stage 8: Fruit Development (FLOWERING-RELATIVE, +50 days)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, flowering_offset_days,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 30, 4, 'Fruit Development', 'फल बढ़ना',
    'flowering_relative', 50,
    'allowed',
    'Irrigate every 7-10 days — fruits growing rapidly',
    'हर 7-10 दिन में पानी दें — फल तेज़ी से बढ़ रहे हैं',
    ARRAY['Apply calcium spray (fruit quality)', 'Set up fruit fly traps', 'Regular irrigation every 7-10 days', 'Start monitoring mandi prices'],
    ARRAY['कैल्शियम स्प्रे करें', 'फल मक्खी के ट्रैप लगाएं', 'नियमित सिंचाई', 'मंडी भाव पर नज़र रखें'],
    'high',
    ARRAY['Fruit fly becoming active — set up traps NOW'],
    ARRAY['फल मक्खी सक्रिय हो रही है — अभी ट्रैप लगाएं'],
    8);

  -- Stage 9: Fruit Maturation (FLOWERING-RELATIVE, +75 days) — Apple Ber specific!
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, flowering_offset_days,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 35, 4, 'Fruit Maturation', 'फल पकना',
    'flowering_relative', 75,
    'allowed',
    'Irrigate every 7-10 days',
    'हर 7-10 दिन में पानी दें',
    ARRAY['Fruit fly bait spray: Malathion 20ml + Jaggery 200g + 20L water', 'Grade fruits by size (A/B/C)', 'Check mandi prices daily', 'Begin selective harvest of ripe fruits'],
    ARRAY['फल मक्खी बेट स्प्रे: मैलाथियान 20ml + गुड़ 200g + 20L पानी', 'फलों की ग्रेडिंग (A/B/C)', 'रोज़ मंडी भाव चेक करें', 'पक्के फल तोड़ना शुरू करें'],
    'critical',
    ARRAY['Fruit fly CRITICAL — bait spray every 7-10 days essential!'],
    ARRAY['फल मक्खी — हर 7-10 दिन बेट स्प्रे ज़रूरी!'],
    9);

  -- Stage 10: Main Harvest (FLOWERING-RELATIVE, +105 days)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, flowering_offset_days,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 39, 5, 'Main Harvest', 'मुख्य तोड़ाई',
    'flowering_relative', 105,
    'allowed',
    'Maintain irrigation — harvest season',
    'पानी बनाए रखें — तोड़ाई का मौसम',
    ARRAY['Peak harvest season — best prices!', 'Harvest, grade, sell at mandi', 'Continue fruit fly bait spray', 'Store in cool place (2-3 day shelf life)'],
    ARRAY['तोड़ाई का पीक सीज़न — अच्छे भाव!', 'तोड़ाई, ग्रेडिंग, मंडी में बेचें', 'फल मक्खी स्प्रे जारी रखें', 'ठंडी जगह में रखें (2-3 दिन शेल्फ लाइफ)'],
    'high',
    ARRAY['Fruit fly continues', 'Watch for fruit rot in damaged fruits'],
    ARRAY['फल मक्खी जारी', 'कटे-फटे फलों में सड़न देखें'],
    10);

  -- Stage 11: Late Harvest (FLOWERING-RELATIVE, +135 days)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, flowering_offset_days,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, sort_order)
  VALUES (tmpl_id, 44, 4, 'Late Harvest & Cleanup', 'आखिरी तोड़ाई और सफाई',
    'flowering_relative', 135,
    'reduce',
    'Reduce irrigation — season ending',
    'पानी कम करें — सीज़न खत्म हो रहा',
    ARRAY['Complete final harvest', 'Destroy ALL fallen fruits (breaks fruit fly cycle!)', 'Post-harvest cleanup', 'Clean orchard floor'],
    ARRAY['आखिरी फल तोड़ लें', 'सभी गिरे फल नष्ट करें (फल मक्खी चक्र तोड़ें!)', 'कटाई के बाद सफाई', 'बाग़ की ज़मीन साफ़ करें'],
    'low', 11);

  -- Stage 12: Rest Period (CALENDAR-FIXED, April 1)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi,
    anchor_type, calendar_month, calendar_day,
    irrigation_status, irrigation_reason_en, irrigation_reason_hi,
    activities_en, activities_hi, disease_risk, sort_order)
  VALUES (tmpl_id, 48, 4, 'Rest Period', 'आराम का समय',
    'calendar_fixed', 4, 1,
    'blocked',
    'Rest period — stop irrigation by mid-March',
    'आराम का समय — मार्च के बीच में पानी बंद करें',
    ARRAY['Let trees rest', 'Stop irrigation by mid-March', 'Clean the orchard', 'Plan next season inputs', 'Prepare for hard pruning in May'],
    ARRAY['पेड़ को आराम दें', 'मार्च के बीच में सिंचाई बंद करें', 'खेत की सफाई करें', 'अगले सीज़न की तैयारी', 'मई में कड़ी छंटाई की तैयारी करें'],
    'low', 12);

END $$;

-- ============================================
-- Seed Crop Knowledge Base
-- ============================================

-- Pruning windows by state (from HAU, PAU, ICAR, NHB)
INSERT INTO crop_knowledge_base (crop_key, state, rule_type, rule_key, value_date_month, value_date_day, message_en, message_hi, severity) VALUES
('apple_ber', 'Haryana', 'pruning_window', 'pruning_start', 4, 20,
  'Pruning window for Haryana starts late April (HAU recommendation)',
  'हरियाणा में छंटाई अप्रैल के अंत से शुरू करें (HAU सिफारिश)', 'info'),
('apple_ber', 'Haryana', 'pruning_window', 'pruning_end', 5, 31,
  'Pruning must be completed by end of May in Haryana',
  'हरियाणा में छंटाई मई के अंत तक पूरी करें', 'info'),
('apple_ber', 'Punjab', 'pruning_window', 'pruning_start', 5, 15,
  'Pruning window for Punjab starts 2nd fortnight of May (PAU recommendation)',
  'पंजाब में छंटाई मई के दूसरे पखवाड़े से शुरू करें (PAU सिफारिश)', 'info'),
('apple_ber', 'Punjab', 'pruning_window', 'pruning_end', 5, 31,
  'Pruning must be completed by end of May in Punjab',
  'पंजाब में छंटाई मई के अंत तक पूरी करें', 'info'),
('apple_ber', 'Rajasthan', 'pruning_window', 'pruning_start', 4, 20,
  'Pruning window for Rajasthan starts late April',
  'राजस्थान में छंटाई अप्रैल के अंत से शुरू करें', 'info'),
('apple_ber', 'Rajasthan', 'pruning_window', 'pruning_end', 5, 15,
  'Pruning should be done by mid-May in Rajasthan (hotter climate, earlier dormancy)',
  'राजस्थान में छंटाई मई के बीच तक करें (गर्म जलवायु)', 'info'),
('apple_ber', 'Uttar Pradesh', 'pruning_window', 'pruning_start', 5, 1,
  'Pruning window for UP starts in May',
  'UP में छंटाई मई में शुरू करें', 'info'),
('apple_ber', 'Uttar Pradesh', 'pruning_window', 'pruning_end', 5, 31,
  'Pruning must be completed by end of May in UP',
  'UP में छंटाई मई के अंत तक पूरी करें', 'info');

-- Flowering date (universal for North India — photoperiod dependent)
INSERT INTO crop_knowledge_base (crop_key, state, rule_type, rule_key, value_date_month, value_date_day, message_en, message_hi, severity) VALUES
('apple_ber', NULL, 'flowering_date', 'flowering_start', 9, 1,
  'Flowering starts 1st week September in North India (photoperiod-triggered)',
  'उत्तर भारत में फूल सितंबर के पहले हफ्ते में आते हैं (दिन की लंबाई से तय)', 'info');

-- Apple Ber maturity period
INSERT INTO crop_knowledge_base (crop_key, state, rule_type, rule_key, value_int, message_en, message_hi, severity) VALUES
('apple_ber', NULL, 'maturity_days', 'days_from_flowering', 75,
  'Apple Ber fruits mature in 70-75 days from flowering (ICAR/VNR)',
  'एप्पल बेर फल फूल आने से 70-75 दिन में पकते हैं (ICAR/VNR)', 'info');

-- Warnings for out-of-range pruning
INSERT INTO crop_knowledge_base (crop_key, state, rule_type, rule_key, message_en, message_hi, severity) VALUES
('apple_ber', NULL, 'warning', 'pruning_too_early',
  'Pruning before April is too early for North India. ICAR research warns: trees lose stored reserves, causing excessive vegetative growth and potentially delayed or weak flowering.',
  'अप्रैल से पहले छंटाई बहुत जल्दी है। ICAR के अनुसार: पेड़ अपना जमा पोषण खो देता है, ज़रूरत से ज़्यादा टहनियां आती हैं और फूल कमज़ोर या देर से आ सकते हैं।',
  'danger'),
('apple_ber', NULL, 'warning', 'pruning_too_late',
  'Pruning after June means less time for vegetative growth before September flowering. The tree may not develop enough fruiting wood.',
  'जून के बाद छंटाई का मतलब है कि सितंबर में फूल आने से पहले पर्याप्त बढ़वार नहीं होगी। पेड़ पर कम फल आ सकते हैं।',
  'warning');

-- Mitigation advice
INSERT INTO crop_knowledge_base (crop_key, state, rule_type, rule_key, message_en, message_hi, severity) VALUES
('apple_ber', NULL, 'mitigation', 'pruning_too_early',
  'Since you pruned early: (1) Apply extra FYM — 50 kg/tree instead of 40 (2) In July, thin excessive shoots to 4-5 per branch (3) Flowering will still start in September (controlled by day length, not pruning) (4) Apply Thiourea 1% spray to accelerate bud break (5) Watch for more bark caterpillar due to longer growth period',
  'चूंकि आपने जल्दी छंटाई कर ली: (1) FYM ज़्यादा डालें — 50 किलो/पेड़ (40 की जगह) (2) जुलाई में अतिरिक्त टहनियां काटें (4-5 प्रति शाखा रखें) (3) फूल सितंबर में ही आएंगे (दिन की लंबाई से तय होता है, छंटाई से नहीं) (4) Thiourea 1% स्प्रे करें बढ़वार तेज़ करने के लिए (5) लंबी बढ़वार के कारण छाल कीड़े पर ज़्यादा ध्यान दें',
  'info'),
('apple_ber', NULL, 'mitigation', 'pruning_too_late',
  'Since you pruned late: (1) Apply Thiourea 1% or KNO3 3% spray immediately to accelerate bud break (2) Increase urea dose slightly (250g instead of 200g) to boost growth (3) Ensure regular irrigation every 2 weeks until monsoon (4) Flowering may be slightly delayed or less synchronous',
  'चूंकि आपने देर से छंटाई की: (1) तुरंत Thiourea 1% या KNO3 3% स्प्रे करें (2) यूरिया थोड़ा ज़्यादा दें (200g की जगह 250g) (3) बारिश तक हर 2 हफ्ते पानी दें (4) फूल थोड़ा देर से या असमान आ सकते हैं',
  'info');
