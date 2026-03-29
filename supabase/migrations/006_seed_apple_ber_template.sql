-- ============================================
-- KhetBuddy v2: Seed Apple Ber (Thai Ber) template
-- Cycle starts at hard pruning in May (Week 0)
-- Month mapping: May=W0, Jun=W4, Jul=W9, Aug=W13, Sep=W17, Oct=W22, Nov=W26, Dec=W30, Jan=W35, Feb=W39, Mar=W44, Apr=W48
-- ============================================

-- Insert Apple Ber template (universal — works across North India)
INSERT INTO crop_templates (crop_key, crop_name_en, crop_name_hi, region_key, total_weeks, description_en, description_hi, is_perennial)
VALUES ('apple_ber', 'Apple Ber (Indian Jujube)', 'एप्पल बेर (थाई बेर)', NULL, 52,
  'Thai Apple Ber (Ziziphus mauritiana) — popular horticulture crop in Haryana, Punjab, UP, Rajasthan. Annual cycle starts with hard pruning in May.',
  'थाई एप्पल बेर — हरियाणा, पंजाब, UP, राजस्थान में लोकप्रिय बागवानी फसल। सालाना चक्र मई में कड़ी छंटाई से शुरू होता है।',
  TRUE);

-- Get the template ID for stages
DO $$
DECLARE
  tmpl_id UUID;
BEGIN
  SELECT id INTO tmpl_id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL;

  -- Week 0-3: Hard Pruning (May)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, fertilizer_schedule, sort_order)
  VALUES (tmpl_id, 0, 4, 'Hard Pruning', 'कड़ी छंटाई', 'careful',
    'First irrigation after pruning',
    'छंटाई के बाद पहला पानी दें',
    ARRAY['Hard prune to 1 foot above ground!', 'Apply FYM 40 kg/tree', 'Summer plowing', 'Apply DAP 250g + MOP 200g per tree'],
    ARRAY['ज़मीन से 1 फुट ऊपर कड़ी छंटाई करें!', 'गोबर की खाद 40 किलो/पेड़ डालें', 'गर्मी की जुताई करें', 'DAP 250g + MOP 200g प्रति पेड़ डालें'],
    'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    '{"fym_kg_per_tree": 40, "dap_g_per_tree": 250, "mop_g_per_tree": 200}'::JSONB,
    1);

  -- Week 4-8: Dormancy (June)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 4, 5, 'Dormancy', 'सुस्ती का समय', 'careful',
    'Light irrigation',
    'हल्का पानी दें',
    ARRAY['Pit filling', 'Second irrigation', 'Weed management'],
    ARRAY['गड्ढे भरें', 'दूसरा पानी दें', 'खरपतवार निकालें'],
    'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 2);

  -- Week 9-12: New Growth Starts (July)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, fertilizer_schedule, sort_order)
  VALUES (tmpl_id, 9, 4, 'New Growth Starts', 'नई बढ़वार शुरू', 'blocked',
    'Monsoon — no irrigation needed',
    'बारिश का मौसम — पानी की ज़रूरत नहीं',
    ARRAY['Apply NPK fertilizer', 'Urea 200g/tree (first dose)', 'Sow intercrops (moong/moth)'],
    ARRAY['NPK खाद डालें', 'यूरिया 200g/पेड़ (पहली खुराक)', 'अंतरफसल बोएं (मूंग/मोठ)'],
    'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    '{"urea_g_per_tree": 200, "note": "first dose"}'::JSONB,
    3);

  -- Week 13-16: Rapid Growth (August)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 13, 4, 'Rapid Growth', 'तेज़ बढ़वार', 'blocked',
    'Monsoon — no supplemental irrigation',
    'बारिश का मौसम — अलग से पानी न दें',
    ARRAY['Monitor for pests', 'Check for bark eating caterpillar', 'Weed control'],
    ARRAY['कीटों पर नज़र रखें', 'छाल खाने वाले कीड़े चेक करें', 'खरपतवार निकालें'],
    'medium',
    ARRAY['Bark eating caterpillar — check trunk for holes and webbing'],
    ARRAY['छाल खाने वाला कीड़ा — तने पर छेद और जाले देखें'],
    4);

  -- Week 17-21: Flowering Begins (September)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, fertilizer_schedule, sort_order)
  VALUES (tmpl_id, 17, 5, 'Flowering Begins', 'फूल आना शुरू', 'blocked',
    'Flowering — ZERO irrigation! Flowers will drop!',
    '🔴 फूल आ रहे हैं — पानी बिल्कुल न दें! फूल गिर जाएंगे!',
    ARRAY['CRITICAL: ZERO irrigation!', 'Apply second urea dose 200g/tree', 'Prepare powdery mildew fungicide'],
    ARRAY['🔴 पानी बिल्कुल न दें!', 'यूरिया की दूसरी खुराक 200g/पेड़ दें', 'छूर्णी रोग की दवाई तैयार रखें'],
    'high',
    ARRAY['Powdery mildew may start — monitor leaves'],
    ARRAY['छूर्णी रोग शुरू हो सकता है — पत्तियां चेक करें'],
    '{"urea_g_per_tree": 200, "note": "second dose"}'::JSONB,
    5);

  -- Week 22-25: Peak Flowering (October)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 22, 4, 'Peak Flowering', 'पूरे फूल', 'blocked',
    'CRITICAL: Peak flowering — absolutely NO water!',
    '🔴 फूल पूरे खिले हैं — पानी बिल्कुल न दें!',
    ARRAY['ZERO irrigation!', 'Powdery mildew spray: Sulfex 0.3% every 12-15 days', 'Alternate with Triadimefon (Bayleton) 0.1%', 'Organic: Fermented buttermilk 6L in 100L water'],
    ARRAY['🔴 पानी बिल्कुल न दें!', 'छूर्णी रोग का स्प्रे: Sulfex 0.3% हर 12-15 दिन', 'या ट्राईडिमेफॉन (Bayleton) 0.1% बारी-बारी से', 'देसी इलाज: छाछ 6L + 100L पानी'],
    'critical',
    ARRAY['Powdery mildew HIGH — white powder on fruits/leaves', 'Umran variety most susceptible'],
    ARRAY['छूर्णी रोग — सफ़ेद पाउडर फलों/पत्तों पर', 'Umran किस्म सबसे ज़्यादा प्रभावित'],
    6);

  -- Week 26-29: Fruit Set (November)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 26, 4, 'Fruit Set', 'फल लगना', 'careful',
    'Begin careful irrigation — fruits developing',
    'धीरे-धीरे पानी शुरू करें — फल बढ़ रहे हैं',
    ARRAY['Begin careful irrigation', 'Apply boron spray (fruit quality)', 'Continue powdery mildew spray', 'Add bamboo supports for heavy load'],
    ARRAY['सिंचाई धीरे-धीरे शुरू करें', 'बोरॉन स्प्रे करें (फल की क्वालिटी)', 'छूर्णी रोग का स्प्रे जारी रखें', 'बांस का सहारा लगाएं'],
    'high',
    ARRAY['Powdery mildew continues — maintain spray schedule'],
    ARRAY['छूर्णी रोग जारी — स्प्रे करते रहें'],
    7);

  -- Week 30-34: Fruit Development (December)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 30, 5, 'Fruit Development', 'फल बढ़ना', 'allowed',
    'Irrigate every 7-10 days — fruits growing',
    'हर 7-10 दिन में पानी दें — फल बड़े हो रहे हैं',
    ARRAY['Apply calcium spray (fruit quality)', 'Set up fruit fly traps', 'Regular irrigation every 7-10 days', 'Start monitoring mandi prices'],
    ARRAY['कैल्शियम स्प्रे करें', 'फल मक्खी के ट्रैप लगाएं', 'नियमित सिंचाई करें', 'मंडी भाव पर नज़र रखें'],
    'high',
    ARRAY['Fruit fly becoming active — set up traps'],
    ARRAY['फल मक्खी सक्रिय हो रही है — ट्रैप लगाएं'],
    8);

  -- Week 35-38: Fruit Maturation (January)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 35, 4, 'Fruit Maturation', 'फल पकना', 'allowed',
    'Irrigate every 7-10 days',
    'हर 7-10 दिन में पानी दें',
    ARRAY['Apply fruit fly bait spray (Malathion 20ml + Jaggery 200g + 20L water)', 'Grade fruits by size', 'Check mandi prices', 'Harvest ripe fruits'],
    ARRAY['फल मक्खी का बेट स्प्रे करें (मैलाथियान 20ml + गुड़ 200g + 20L पानी)', 'फलों की ग्रेडिंग करें', 'मंडी भाव चेक करें', 'पक्के फल तोड़ें'],
    'critical',
    ARRAY['Fruit fly CRITICAL — bait spray essential!'],
    ARRAY['फल मक्खी — बेट स्प्रे ज़रूरी!'],
    9);

  -- Week 39-43: Main Harvest (February)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 39, 5, 'Main Harvest', 'मुख्य तोड़ाई', 'allowed',
    'Maintain irrigation every 7-10 days',
    'पानी बनाए रखें, हर 7-10 दिन',
    ARRAY['Peak harvest season — best prices', 'Harvest, grade, sell at mandi', 'Continue fruit fly bait spray', 'Store in cool place (2-3 day shelf life)'],
    ARRAY['तोड़ाई का पीक सीज़न — अच्छे भाव', 'तोड़ाई, ग्रेडिंग, मंडी में बेचें', 'फल मक्खी का स्प्रे जारी रखें', 'ठंडी जगह में रखें (2-3 दिन शेल्फ लाइफ)'],
    'high',
    ARRAY['Fruit fly continues', 'Watch for fruit rot'],
    ARRAY['फल मक्खी जारी', 'फल सड़न से बचें'],
    10);

  -- Week 44-47: Late Harvest (March)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 44, 4, 'Late Harvest', 'आखिरी तोड़ाई', 'reduce',
    'Reduce irrigation',
    'पानी कम करें',
    ARRAY['Complete final harvest', 'Post-harvest cleanup', 'Destroy fallen fruits (breaks fruit fly cycle)', 'Clean orchard floor'],
    ARRAY['आखिरी फल तोड़ लें', 'कटाई के बाद सफाई करें', 'गिरे फल नष्ट करें (फल मक्खी चक्र तोड़ें)', 'बाग़ की ज़मीन साफ़ करें'],
    'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 11);

  -- Week 48-51: Rest Period (April)
  INSERT INTO crop_template_stages (template_id, week_offset, duration_weeks, stage_name_en, stage_name_hi, irrigation_status, irrigation_reason_en, irrigation_reason_hi, activities_en, activities_hi, disease_risk, disease_alerts_en, disease_alerts_hi, sort_order)
  VALUES (tmpl_id, 48, 4, 'Rest Period', 'आराम का समय', 'blocked',
    'Rest period — no irrigation',
    'आराम का समय — पानी न दें',
    ARRAY['Let trees rest', 'Clean the orchard', 'Plan next season inputs', 'Prepare for hard pruning'],
    ARRAY['पेड़ को आराम दें', 'खेत की सफाई करें', 'अगले सीज़न की तैयारी करें', 'कड़ी छंटाई की तैयारी'],
    'low', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 12);

END $$;

-- ============================================
-- Seed Apple Ber Diseases
-- ============================================

INSERT INTO crop_diseases (crop_key, name_en, name_hi, local_name, peak_week_offsets, symptoms_en, symptoms_hi, treatment_en, treatment_hi, organic_treatment_en, organic_treatment_hi, products) VALUES
('apple_ber', 'Powdery Mildew', 'छूर्णी रोग / सफ़ेद रोग', 'safed rog / choorni rog',
  ARRAY[17,18,19,20,21,22,23,24,25,26,27,28],
  'White powdery coating on fruits and leaves. 17-71% disease index. Umran variety most susceptible.',
  'फलों और पत्तों पर सफ़ेद पाउडर जैसा। Umran किस्म सबसे ज़्यादा प्रभावित।',
  'Wettable sulphur (Sulfex) 0.3% every 12-15 days OR Triadimefon (Bayleton) 0.1% alternately.',
  'घुलनशील गंधक (Sulfex) 0.3% हर 12-15 दिन या ट्राईडिमेफॉन (Bayleton) 0.1% बारी-बारी से।',
  'Fermented buttermilk 6L in 100L water spray. Neem oil 5ml/L as preventive.',
  'छाछ 6 लीटर + 100 लीटर पानी का स्प्रे। नीम तेल 5ml/L बचाव के लिए।',
  '[{"name_en":"Sulfex (Wettable Sulphur)","name_hi":"सल्फ़ेक्स (घुलनशील गंधक)","dosage":"3g/L water","where_to_buy":"कृषि दवाई की दुकान"},{"name_en":"Bayleton (Triadimefon)","name_hi":"बेलेटन (ट्राईडिमेफॉन)","dosage":"1g/L water","where_to_buy":"कृषि दवाई की दुकान"}]'::JSONB),

('apple_ber', 'Fruit Fly', 'फल मक्खी', 'aam ki makhi',
  ARRAY[30,31,32,33,34,35,36,37,38,39,40,41,42,43],
  'Pinhole marks on fruit. Larvae inside causing rot. 80-100% yield loss if untreated.',
  'फल पर छोटे छेद, अंदर लार्वा से सड़न। बिना इलाज 80-100% नुकसान।',
  'Bait spray: Malathion 50 EC 20ml + Jaggery 200g + 20L water. Repeat every 7-10 days.',
  'बेट स्प्रे: मैलाथियान 50 EC 20ml + गुड़ 200g + 20L पानी। हर 7-10 दिन दोहराएं।',
  'Pheromone traps. Neem oil spray. Destroy fallen fruits daily.',
  'फेरोमोन ट्रैप लगाएं। नीम तेल स्प्रे। गिरे फल रोज़ नष्ट करें।',
  '[{"name_en":"Malathion 50 EC","name_hi":"मैलाथियान 50 EC","dosage":"20ml + Jaggery 200g in 20L water","where_to_buy":"कृषि दवाई की दुकान"},{"name_en":"Fruit fly pheromone trap","name_hi":"फल मक्खी फेरोमोन ट्रैप","dosage":"4-5 traps per acre","where_to_buy":"कृषि दवाई की दुकान"}]'::JSONB),

('apple_ber', 'Bark Eating Caterpillar', 'छाल खाने वाला कीड़ा', 'chhaal ka keeda',
  ARRAY[9,10,11,12,13,14,15,16,17],
  'Holes in trunk with silk webbing and frass. Caterpillar bores into bark.',
  'तने पर छेद और जाले जैसा मल। कीड़ा छाल में छेद करता है।',
  'Inject kerosene 5ml per hole and plug with mud. OR Chlorantraniliprole (Coragen) 18.5 SC.',
  'छेद में 5ml मिट्टी का तेल डालें और गीली मिट्टी से बंद करें। या Coragen 18.5 SC।',
  'Clean trunk. Apply neem oil paste on holes.',
  'तने की सफाई करें। छेद पर नीम तेल का पेस्ट लगाएं।',
  '[{"name_en":"Kerosene","name_hi":"मिट्टी का तेल","dosage":"5ml per hole, plug with mud","where_to_buy":"किराना दुकान"},{"name_en":"Coragen (Chlorantraniliprole 18.5 SC)","name_hi":"कोराजन","dosage":"0.5ml/L water","where_to_buy":"कृषि दवाई की दुकान"}]'::JSONB),

('apple_ber', 'Leaf Spot', 'पत्ते का धब्बा रोग', 'patte ka dhabba rog',
  ARRAY[13,14,15,16,17,18,19,20,21,22],
  'Brown circular spots on leaves. Can cause defoliation in severe cases.',
  'पत्तों पर भूरे गोल धब्बे। गंभीर होने पर पत्ते गिर सकते हैं।',
  'Mancozeb 0.25% spray. Repeat after 15 days if needed.',
  'मैन्कोज़ेब 0.25% का स्प्रे। 15 दिन बाद दोबारा करें।',
  'Neem oil 5ml/L spray. Remove infected leaves.',
  'नीम तेल 5ml/L स्प्रे। संक्रमित पत्ते तोड़ें।',
  '[{"name_en":"Mancozeb (Dithane M-45)","name_hi":"मैन्कोज़ेब (डाइथेन M-45)","dosage":"2.5g/L water","where_to_buy":"कृषि दवाई की दुकान"}]'::JSONB),

('apple_ber', 'Lacewing Bug', 'पत्ती का कीड़ा', 'patti ka keeda',
  ARRAY[9,10,11,12,13,14,15,16,17],
  'Tender leaves curl and shrivel. Small bugs visible on leaf undersides.',
  'कोमल पत्तियां सिकुड़ जाएं। पत्तों के नीचे छोटे कीड़े दिखें।',
  'Malathion 50 EC @ 1.5ml/litre spray.',
  'मैलाथियान 50 EC @ 1.5ml/लीटर का स्प्रे।',
  'Neem oil 5ml/L. Spray on leaf undersides.',
  'नीम तेल 5ml/L। पत्तों के नीचे की तरफ स्प्रे करें।',
  '[{"name_en":"Malathion 50 EC","name_hi":"मैलाथियान 50 EC","dosage":"1.5ml/L water","where_to_buy":"कृषि दवाई की दुकान"}]'::JSONB),

('apple_ber', 'Fruit Rot', 'फल सड़न', 'phal ka sadna',
  ARRAY[35,36,37,38,39,40,41,42,43,44],
  'Soft brown patches on fruit. Can spread rapidly in humid conditions.',
  'फल पर नरम भूरे धब्बे। नम मौसम में तेज़ी से फैलता है।',
  'Remove and destroy infected fruits. Carbendazim 0.1% spray preventively.',
  'संक्रमित फल तोड़कर नष्ट करें। कार्बेन्डाज़िम 0.1% बचाव स्प्रे।',
  'Remove infected fruits immediately. Improve air circulation by pruning.',
  'संक्रमित फल तुरंत तोड़ें। छंटाई से हवा का प्रवाह बढ़ाएं।',
  '[{"name_en":"Carbendazim (Bavistin)","name_hi":"कार्बेन्डाज़िम (बाविस्टिन)","dosage":"1g/L water","where_to_buy":"कृषि दवाई की दुकान"}]'::JSONB);
