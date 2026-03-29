-- ============================================
-- KhetBuddy: World-Class Apple Ber Knowledge Base
-- Sources: ICAR, CCS HAU Hisar, PAU Ludhiana, NHB,
-- MDPI Horticulturae 2022, VNR Nursery, Vikaspedia
-- ============================================

-- ═══════════════════════════════════════════
-- PART 1: Detailed Stage Guides (12 stages)
-- ═══════════════════════════════════════════

-- Stage 1: Hard Pruning
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Annual hard pruning — cut all branches to 1 foot (30cm) above ground. This removes old wood and forces new fruiting shoots.", "hi": "सालाना कड़ी छंटाई — सभी शाखाएं ज़मीन से 1 फुट (30cm) ऊपर काटें। इससे पुरानी लकड़ी हटती है और नई फलदार टहनियां आती हैं।"},
  "why": {"en": "Apple Ber fruits ONLY on current season''s new wood. Without hard pruning, fruit size shrinks and yield drops 50-70%. Research shows 50% pruning intensity gives maximum yield (25-30 kg/tree). Pruning also controls tree height for easy harvesting.", "hi": "एप्पल बेर सिर्फ इस सीज़न की नई लकड़ी पर फल देता है। छंटाई के बिना फल छोटे और 50-70% कम होते हैं। शोध से पता चला कि 50% छंटाई से अधिकतम उपज (25-30 किलो/पेड़) मिलती है।"},
  "how_steps": [
    {"en": "Apply Thiourea 3% spray 1 day BEFORE pruning (accelerates bud break)", "hi": "छंटाई से 1 दिन पहले Thiourea 3% स्प्रे करें (अंकुरण तेज़ होगा)"},
    {"en": "Cut all branches to 1 foot above ground using sharp secateurs", "hi": "तेज़ सिकेटर से सभी शाखाएं ज़मीन से 1 फुट ऊपर काटें"},
    {"en": "Apply Bordeaux paste on cut surfaces to prevent infection", "hi": "कटे हिस्सों पर बोर्डो पेस्ट लगाएं (संक्रमण से बचाव)"},
    {"en": "Apply FYM 40-50 kg/tree in basin around trunk", "hi": "तने के चारों ओर गड्ढे में गोबर खाद 40-50 किलो डालें"},
    {"en": "Apply DAP 250g + MOP 200g per tree", "hi": "DAP 250g + MOP 200g प्रति पेड़ डालें"},
    {"en": "Give first irrigation 7 days after pruning", "hi": "छंटाई के 7 दिन बाद पहला पानी दें"}
  ],
  "products": [
    {"name": "Thiourea", "dosage": "30g/L water (3%)", "cost_approx": "₹300/100g", "where": "कृषि दवाई दुकान"},
    {"name": "Bordeaux paste", "dosage": "Apply on cuts", "cost_approx": "₹150/kg", "where": "कृषि दवाई दुकान"},
    {"name": "Sharp secateurs", "dosage": "—", "cost_approx": "₹500-1500", "where": "कृषि उपकरण दुकान"}
  ],
  "warnings": [
    {"en": "Do NOT prune before late April in North India — tree loses stored reserves (ICAR warning)", "hi": "उत्तर भारत में अप्रैल के अंत से पहले छंटाई न करें — पेड़ का जमा पोषण खत्म होता है (ICAR)"},
    {"en": "Year 1 trees: Training cuts ONLY — do not hard prune to 1 foot", "hi": "पहले साल के पेड़: सिर्फ ट्रेनिंग कट्स — 1 फुट पर कड़ी छंटाई न करें"}
  ],
  "science": {"en": "Hard pruning triggers auxin redistribution. Terminal buds removed → lateral buds activated by cytokinin from roots. Thiourea breaks dormancy by inhibiting catalase enzyme, releasing H2O2 which triggers bud break signaling.", "hi": "कड़ी छंटाई से ऑक्सिन का वितरण बदलता है। ऊपर की कलियां हटने से जड़ों से साइटोकाइनिन आता है जो बाकी कलियों को जगाता है। Thiourea catalase एंज़ाइम को रोकता है।"}
}'::JSONB
WHERE stage_name_en = 'Hard Pruning'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 2: Bud Break
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "New buds emerge from pruned stumps. First irrigation and soil management.", "hi": "कटे हुए तनों से नई कलियां निकल रही हैं। पहला पानी और मिट्टी प्रबंधन।"},
  "why": {"en": "Bud break takes 14-28 days after pruning. The tree is using stored root reserves to push new growth. Adequate moisture and nutrition accelerate this process.", "hi": "छंटाई के 14-28 दिन बाद कलियां फूटती हैं। पेड़ जड़ों में जमा पोषण से नई बढ़वार कर रहा है। पर्याप्त नमी और पोषण इस प्रक्रिया को तेज़ करता है।"},
  "how_steps": [
    {"en": "Give first irrigation 7-10 days after pruning", "hi": "छंटाई के 7-10 दिन बाद पहला पानी दें"},
    {"en": "Fill pits/basins around trees with FYM mix", "hi": "पेड़ों के चारों ओर गड्ढे गोबर खाद मिश्रण से भरें"},
    {"en": "Remove weeds that compete for moisture", "hi": "खरपतवार निकालें — नमी की प्रतिस्पर्धा कम होगी"},
    {"en": "If buds slow after 3 weeks, spray Thiourea 1% (10g/L)", "hi": "3 हफ्ते बाद भी कलियां न फूटें तो Thiourea 1% (10g/L) स्प्रे करें"},
    {"en": "Second irrigation 15-20 days after first", "hi": "पहले पानी के 15-20 दिन बाद दूसरा पानी"}
  ],
  "science": {"en": "Post-pruning bud break requires: (1) Adequate soil temperature >25°C (2) Available soil moisture (3) Sufficient root carbohydrate reserves. Thiourea at 1% (10g/L) post-pruning spray on dormant buds accelerates break by 7-10 days.", "hi": "छंटाई के बाद कलियों को चाहिए: (1) मिट्टी का तापमान 25°C से ज़्यादा (2) पर्याप्त नमी (3) जड़ों में पोषण। Thiourea 1% स्प्रे 7-10 दिन जल्दी अंकुरण लाता है।"}
}'::JSONB
WHERE stage_name_en = 'Bud Break'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 3: New Growth (Monsoon)
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Monsoon rains trigger vigorous vegetative growth. Time for first urea dose and intercropping.", "hi": "बारिश से तेज़ बढ़वार शुरू। यूरिया की पहली खुराक और अंतरफसल बोने का समय।"},
  "why": {"en": "Monsoon provides natural irrigation — no supplemental water needed. Nitrogen (urea) fuels leaf and shoot growth. This vegetative mass will bear flowers in September. More growth = more flowering points = more fruit.", "hi": "बारिश से प्राकृतिक पानी मिलता है। नाइट्रोजन (यूरिया) पत्तों और टहनियों की बढ़वार को तेज़ करता है। यही बढ़वार सितंबर में फूल लाएगी। ज़्यादा बढ़वार = ज़्यादा फूल = ज़्यादा फल।"},
  "how_steps": [
    {"en": "Apply Urea 200g/tree at base (first of 2 splits)", "hi": "यूरिया 200g/पेड़ तने के पास डालें (2 खुराकों में पहली)"},
    {"en": "Apply NPK (20:20:20) at 50g/tree if available", "hi": "NPK (20:20:20) 50g/पेड़ डालें (अगर उपलब्ध हो)"},
    {"en": "Sow moong/moth between rows for extra income", "hi": "कतारों के बीच मूंग/मोठ बोएं — अतिरिक्त आमदनी"},
    {"en": "Spray ZnSO4 0.5% (5g/L) on new leaves", "hi": "नई पत्तियों पर ZnSO4 0.5% (5g/L) स्प्रे करें"},
    {"en": "Ensure drainage around trees — no waterlogging", "hi": "पेड़ों के पास पानी न ठहरे — जल निकासी सुनिश्चित करें"}
  ],
  "products": [
    {"name": "Urea", "dosage": "200g/tree", "cost_approx": "₹6/kg", "where": "खाद दुकान"},
    {"name": "ZnSO4", "dosage": "5g/L foliar", "cost_approx": "₹80/500g", "where": "कृषि दवाई दुकान"},
    {"name": "Moong seed", "dosage": "5 kg/acre", "cost_approx": "₹100/kg", "where": "बीज दुकान"}
  ],
  "science": {"en": "Urea (46% N) provides nitrogen for chlorophyll synthesis and cell division. Split application (July + September) matches the tree''s demand curve. Single dose wastes 30-40% to volatilization and leaching.", "hi": "यूरिया (46% N) पत्तों में हरापन और कोशिका विभाजन के लिए ज़रूरी है। दो खुराकों में देने से 30-40% बर्बादी बच जाती है।"}
}'::JSONB
WHERE stage_name_en = 'New Growth (Monsoon)'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 4: Rapid Growth
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Vigorous shoot elongation during late monsoon. Critical pest watch period.", "hi": "देर बारिश में तेज़ टहनी बढ़वार। कीट निगरानी का ज़रूरी समय।"},
  "why": {"en": "August shoots will bear September flowers. Quality of this growth determines fruit quantity. Bark eating caterpillar is most active now — can girdle and kill branches.", "hi": "अगस्त की टहनियां सितंबर में फूल लाएंगी। इस बढ़वार की गुणवत्ता फल की मात्रा तय करती है। छाल कीड़ा अभी सबसे सक्रिय है — शाखाओं को काट सकता है।"},
  "how_steps": [
    {"en": "Check tree trunks WEEKLY for bore holes + silk webbing (bark caterpillar)", "hi": "हर हफ्ते तने पर छेद + जाले देखें (छाल कीड़ा)"},
    {"en": "If bore holes found: inject kerosene 5ml/hole and seal with mud", "hi": "छेद मिले तो: 5ml मिट्टी का तेल डालें और गीली मिट्टी से बंद करें"},
    {"en": "Remove weeds — they harbor pests and compete for nutrients", "hi": "खरपतवार निकालें — कीटों को आश्रय देते हैं"},
    {"en": "If early-pruned: thin excessive shoots to 5-6 per main branch", "hi": "जल्दी छंटाई की थी तो: अतिरिक्त टहनियां काटें (5-6 प्रति शाखा)"},
    {"en": "Monitor for lacewing bugs on tender new leaves", "hi": "कोमल नई पत्तियों पर पत्ती कीड़ा देखें"}
  ],
  "warnings": [
    {"en": "Bark caterpillar can kill whole branches — check trunks weekly!", "hi": "छाल कीड़ा पूरी शाखा मार सकता है — हर हफ्ते तना चेक करें!"},
    {"en": "Do NOT irrigate — monsoon provides sufficient water", "hi": "पानी न दें — बारिश से पर्याप्त पानी मिल रहा है"}
  ],
  "science": {"en": "Indarbela quadrinotata (bark caterpillar) larvae bore into trunk bark, creating galleries protected by silk + frass webbing. They feed at night and hide by day. Kerosene injection kills larvae by asphyxiation. Alternative: Coragen 18.5 SC injection reaches deep larvae.", "hi": "छाल कीड़ा (Indarbela) लार्वा तने की छाल में सुरंग बनाता है। रात को खाता है, दिन में छुपता है। मिट्टी के तेल से दम घुटने से मरता है। Coragen 18.5 SC गहरे लार्वा तक पहुंचता है।"}
}'::JSONB
WHERE stage_name_en = 'Rapid Growth'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 5: Flowering Begins (MOST CRITICAL)
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Flowering has started! This is the MOST CRITICAL stage — flowers become fruits. ZERO IRRIGATION.", "hi": "फूल आ गए! यह सबसे ज़रूरी चरण है — फूलों से ही फल बनेंगे। पानी बिल्कुल बंद!"},
  "why": {"en": "Ber flowering is triggered by shortening day length (photoperiod) in September. Any irrigation causes flower drop via ethylene spike. ABA hormone naturally suppresses ethylene during water stress — irrigation breaks this. Even ONE watering can drop 30-50% flowers.", "hi": "बेर में फूल सितंबर में दिन छोटा होने (फोटोपीरियड) से आते हैं। पानी देने से एथिलीन हार्मोन बढ़ता है और फूल गिरते हैं। सूखे में ABA हार्मोन एथिलीन रोकता है — पानी यह संतुलन बिगाड़ता है। एक बार भी पानी = 30-50% फूल गिर सकते हैं!"},
  "how_steps": [
    {"en": "STOP all irrigation immediately — do not water under any circumstance", "hi": "सिंचाई तुरंत बंद करें — किसी भी हालत में पानी न दें"},
    {"en": "Apply Urea 200g/tree (2nd dose) dry at base — do NOT mix with water", "hi": "यूरिया 200g/पेड़ (दूसरी खुराक) सूखा तने के पास डालें — पानी में न मिलाएं"},
    {"en": "Prepare Sulfex 0.3% (3g/L) for first powdery mildew spray", "hi": "छूर्णी रोग के लिए Sulfex 0.3% (3g/L) घोल तैयार करें"},
    {"en": "Check leaves DAILY for white powdery coating (mildew)", "hi": "रोज़ पत्तों पर सफ़ेद पाउडर चेक करें (छूर्णी रोग)"},
    {"en": "Do NOT prune, spray heavy chemicals, or disturb tree", "hi": "छंटाई, भारी दवाई स्प्रे, या पेड़ को न छेड़ें"}
  ],
  "products": [
    {"name": "Sulfex (Wettable Sulphur)", "dosage": "3g/L water", "cost_approx": "₹200/500g", "where": "कृषि दवाई दुकान"},
    {"name": "Urea", "dosage": "200g/tree (dry application)", "cost_approx": "₹6/kg", "where": "खाद दुकान"}
  ],
  "warnings": [
    {"en": "Even ONE irrigation can cause 30-50% flower drop!", "hi": "एक बार भी पानी दिया तो 30-50% फूल गिर सकते हैं!"},
    {"en": "If unexpected rain occurs, spray Sulfex within 48 hours", "hi": "अगर बारिश हो जाए तो 48 घंटे में Sulfex स्प्रे करें"},
    {"en": "Powdery mildew is HIGHEST risk now — daily monitoring essential", "hi": "छूर्णी रोग का सबसे ज़्यादा खतरा — रोज़ निगरानी ज़रूरी"}
  ],
  "science": {"en": "Controlled water stress ↑ ABA → ↓ ethylene → flowers stay attached. Irrigation ↓ ABA → ↑ ethylene → activates abscission zone at flower stalk base → flowers drop. Ber evolved in arid Thar region — flowering naturally coincides with post-monsoon declining moisture. This is a survival adaptation: fruit develops in cool dry winter when water stress improves seed desiccation tolerance.", "hi": "सूखा → ABA बढ़ता है → एथिलीन कम → फूल टिके रहते हैं। पानी → ABA कम → एथिलीन ज़्यादा → फूल के डंठल पर अलगाव परत सक्रिय → फूल गिरते हैं। बेर थार मरुस्थल का पेड़ है — फूल बारिश बंद होने के बाद आते हैं।"},
  "organic_alternative": {"en": "Organic powdery mildew control: Fermented buttermilk 6L + 100L water spray. Or: Baking soda 5g/L + liquid soap 1ml/L.", "hi": "देसी छूर्णी रोग इलाज: छाछ 6 लीटर + 100 लीटर पानी। या: खाने का सोडा 5g/L + साबुन 1ml/L।"}
}'::JSONB
WHERE stage_name_en = 'Flowering Begins'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 6: Peak Flowering
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Maximum flower density. Critical powdery mildew management. CONTINUE zero irrigation.", "hi": "सबसे ज़्यादा फूल। छूर्णी रोग प्रबंधन ज़रूरी। पानी बिल्कुल बंद रखें।"},
  "why": {"en": "Peak flowering (mid-October) determines total fruit set potential. Powdery mildew can destroy 50-60% of flowers/young fruits if uncontrolled. Umran variety is most susceptible. Temperature 15-25°C with high humidity is ideal for mildew.", "hi": "पूरे फूल (अक्टूबर मध्य) से कुल फल की संभावना तय होती है। छूर्णी रोग से 50-60% फूल/छोटे फल नष्ट हो सकते हैं। Umran किस्म सबसे ज़्यादा प्रभावित। 15-25°C + ज़्यादा नमी = रोग के लिए आदर्श।"},
  "how_steps": [
    {"en": "CONTINUE zero irrigation", "hi": "पानी बंद रखें"},
    {"en": "Spray Sulfex 0.3% (3g/L) every 12-15 days", "hi": "Sulfex 0.3% (3g/L) हर 12-15 दिन स्प्रे करें"},
    {"en": "Alternate with Bayleton 0.1% (1g/L) for resistance management", "hi": "बारी-बारी Bayleton 0.1% (1g/L) भी करें (प्रतिरोध न बने)"},
    {"en": "Spray in evening (4-6 PM) — avoid flower damage from sun+spray", "hi": "शाम 4-6 बजे स्प्रे करें — धूप+स्प्रे से फूल खराब न हों"},
    {"en": "Organic option: Buttermilk 6L + 100L water spray", "hi": "देसी: छाछ 6L + 100L पानी स्प्रे"}
  ],
  "products": [
    {"name": "Sulfex (Wettable Sulphur)", "dosage": "3g/L every 12-15 days", "cost_approx": "₹200/500g", "where": "कृषि दवाई दुकान"},
    {"name": "Bayleton (Triadimefon)", "dosage": "1g/L alternate spray", "cost_approx": "₹600/100g", "where": "कृषि दवाई दुकान"},
    {"name": "Contaf (Hexaconazole)", "dosage": "2ml/L alternative", "cost_approx": "₹350/250ml", "where": "कृषि दवाई दुकान"}
  ],
  "science": {"en": "Oidium erysiphoides f.sp. ziziphi causes powdery mildew. Conidia germinate at 20-25°C with 60-80% RH. Wettable sulphur disrupts fungal cell membrane lipids. Triadimefon inhibits ergosterol biosynthesis. Alternating modes of action prevents resistance.", "hi": "छूर्णी रोग Oidium erysiphoides कवक से होता है। 20-25°C + 60-80% नमी पर तेज़ फैलता है। गंधक कवक की कोशिका झिल्ली तोड़ता है। दवाइयां बदल-बदलकर इस्तेमाल करें ताकि प्रतिरोध न बने।"}
}'::JSONB
WHERE stage_name_en = 'Peak Flowering'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 7: Fruit Set
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Flowers are becoming small fruits. Resume careful irrigation. Support heavy branches.", "hi": "फूलों से छोटे फल बन रहे हैं। धीरे-धीरे पानी शुरू करें। भारी शाखाओं को सहारा दें।"},
  "why": {"en": "Fruit set occurs 16-21 days after pollination. Resuming irrigation now feeds growing fruits. Too much water initially can still cause fruit drop — start at 30-40% of normal and increase over 2 weeks. Boron spray improves fruit retention and quality.", "hi": "फल लगने में परागण से 16-21 दिन लगते हैं। पानी शुरू करने से बढ़ते फलों को पोषण मिलता है। शुरू में ज़्यादा पानी से फल गिर सकते हैं — 30-40% से शुरू करें, 2 हफ्ते में बढ़ाएं। बोरॉन स्प्रे से फल टिके रहते हैं।"},
  "how_steps": [
    {"en": "Resume irrigation at 30-40% normal dose when marble-sized fruits visible", "hi": "जब कंचे जैसे छोटे फल दिखें तो 30-40% कम पानी दें"},
    {"en": "Spray Borax 0.4% (4g/L) — reduces fruit drop by 40-50%", "hi": "बोरेक्स 0.4% (4g/L) स्प्रे — फल गिरना 40-50% कम होता है"},
    {"en": "Continue powdery mildew spray schedule", "hi": "छूर्णी रोग का स्प्रे जारी रखें"},
    {"en": "Install bamboo supports under heavy branches", "hi": "भारी शाखाओं के नीचे बांस का सहारा लगाएं"},
    {"en": "Spray GA3 20 ppm + NAA 25 ppm for fruit retention (optional)", "hi": "GA3 20 ppm + NAA 25 ppm स्प्रे — फल टिके रहते हैं (वैकल्पिक)"}
  ],
  "products": [
    {"name": "Borax", "dosage": "4g/L foliar spray", "cost_approx": "₹60/500g", "where": "कृषि दवाई दुकान"},
    {"name": "GA3 (Gibberellic Acid)", "dosage": "20 ppm (1 tablet/L)", "cost_approx": "₹50/tablet", "where": "कृषि दवाई दुकान"}
  ],
  "science": {"en": "Boron is essential for pollen tube growth and fruit cell wall formation. Borax 0.4% reduced fruit drop from 69.45% to 30.55% retention (research). GA3 + NAA synergistically reduce abscission by maintaining auxin gradient across the fruit stalk junction.", "hi": "बोरॉन परागनली बढ़ने और फल की कोशिका दीवार बनने के लिए ज़रूरी है। शोध: बोरेक्स 0.4% से फल गिरना 69.45% से घटकर 30.55% हुआ।"}
}'::JSONB
WHERE stage_name_en = 'Fruit Set'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 8: Fruit Development
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Fruits growing rapidly. Regular irrigation, calcium spray, fruit fly traps.", "hi": "फल तेज़ी से बढ़ रहे हैं। नियमित पानी, कैल्शियम स्प्रे, फल मक्खी ट्रैप।"},
  "why": {"en": "Phase 1 of fruit growth: rapid cell division (first 6 weeks after set). Calcium strengthens cell walls → better shelf life. Fruit flies start becoming active — early trapping prevents population explosion.", "hi": "फल बढ़वार का पहला चरण: तेज़ कोशिका विभाजन (फल लगने के 6 हफ्ते)। कैल्शियम कोशिका दीवारें मज़बूत करता है → ज़्यादा दिन टिकता है। फल मक्खी सक्रिय हो रही है — जल्दी ट्रैप लगाएं।"},
  "how_steps": [
    {"en": "Irrigate every 7-10 days (50-80 liters/tree)", "hi": "हर 7-10 दिन पानी दें (50-80 लीटर/पेड़)"},
    {"en": "Spray CaCl2 0.5-1% (5-10g/L) for fruit quality + shelf life", "hi": "CaCl2 0.5-1% (5-10g/L) स्प्रे — फल की क्वालिटी + शेल्फ लाइफ"},
    {"en": "Install fruit fly traps: Methyl eugenol + Malathion in bottles (4-5/acre)", "hi": "फल मक्खी ट्रैप लगाएं: मिथाइल यूजेनॉल + मैलाथियान बोतल में (4-5/एकड़)"},
    {"en": "Start monitoring mandi prices — plan harvest timing", "hi": "मंडी भाव देखना शुरू करें — तोड़ाई की योजना बनाएं"},
    {"en": "Spray ZnSO4 0.5% + Borax 0.5% for maximum fruit weight", "hi": "ZnSO4 0.5% + बोरेक्स 0.5% स्प्रे — अधिकतम फल भार"}
  ],
  "products": [
    {"name": "CaCl2 (Calcium Chloride)", "dosage": "5-10g/L foliar", "cost_approx": "₹80/kg", "where": "कृषि दवाई दुकान"},
    {"name": "Methyl eugenol trap", "dosage": "4-5 traps/acre", "cost_approx": "₹50/trap", "where": "कृषि दवाई दुकान"},
    {"name": "Malathion 50 EC", "dosage": "For traps: 1ml in trap bottle", "cost_approx": "₹200/500ml", "where": "कृषि दवाई दुकान"}
  ],
  "science": {"en": "CaCl2 reduces cellulase (20-22%), polygalacturonase (23-29%), and pectin methylesterase (25-28%) — enzymes that cause fruit softening. Research: CaCl2 1.5% dip extended ber shelf life from 3 to 7 days.", "hi": "CaCl2 फल को नरम करने वाले एंज़ाइम कम करता है — शेल्फ लाइफ 3 से 7 दिन हो जाती है।"}
}'::JSONB
WHERE stage_name_en = 'Fruit Development'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 9: Fruit Maturation
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Fruits reaching maturity. Fruit fly management CRITICAL. Begin selective harvest.", "hi": "फल पक रहे हैं। फल मक्खी से बचाव बहुत ज़रूरी। चुनिंदा तोड़ाई शुरू करें।"},
  "why": {"en": "Apple Ber matures 70-75 days after flowering. Fruit fly (Carpomyia vesuviana) can destroy 80-100% of crop if untreated. Bait spray every 7-10 days is essential. Ripe fruits attract more flies — harvest promptly.", "hi": "एप्पल बेर फूल से 70-75 दिन में पकता है। फल मक्खी से 80-100% नुकसान हो सकता है। हर 7-10 दिन बेट स्प्रे ज़रूरी। पक्के फल ज़्यादा मक्खी आकर्षित करते हैं — जल्दी तोड़ें।"},
  "how_steps": [
    {"en": "Bait spray every 7-10 days: Malathion 2ml/L + Jaggery 10g/L", "hi": "हर 7-10 दिन बेट स्प्रे: मैलाथियान 2ml/L + गुड़ 10g/L"},
    {"en": "Grade fruits by size: A (35-45mm), B (25-35mm), C (20-25mm)", "hi": "फल ग्रेडिंग: A (35-45mm), B (25-35mm), C (20-25mm)"},
    {"en": "Check mandi prices DAILY — Apple Ber prices fluctuate", "hi": "रोज़ मंडी भाव चेक करें — एप्पल बेर के भाव बदलते रहते हैं"},
    {"en": "Harvest when light green turning yellowish — firm and crunchy", "hi": "हल्का हरा जो पीला-हरा हो रहा हो — मज़बूत और कुरकुरा — तब तोड़ें"},
    {"en": "Pick in early morning (6-9 AM) for lowest field heat", "hi": "सुबह 6-9 बजे तोड़ें — सबसे कम गर्मी"},
    {"en": "Destroy ALL fallen fruits daily — they contain fly larvae", "hi": "गिरे फल रोज़ नष्ट करें — इनमें मक्खी के अंडे होते हैं"}
  ],
  "products": [
    {"name": "Malathion 50 EC", "dosage": "2ml/L + Jaggery 10g/L", "cost_approx": "₹200/500ml", "where": "कृषि दवाई दुकान"},
    {"name": "Fruit fly pheromone trap", "dosage": "4-5/acre, replace lure monthly", "cost_approx": "₹50-80/trap", "where": "कृषि दवाई दुकान"},
    {"name": "Ethrel (Ethephon 39%)", "dosage": "750 ppm (2ml/L) 7-10 days before harvest for uniform ripening", "cost_approx": "₹250/100ml", "where": "कृषि दवाई दुकान"}
  ],
  "warnings": [
    {"en": "Fruit fly can destroy 80-100% crop if not controlled — spray EVERY 7-10 days", "hi": "फल मक्खी से 80-100% फसल बर्बाद — हर 7-10 दिन स्प्रे ज़रूरी"},
    {"en": "Stop Malathion spray 7 days before harvest (pre-harvest interval)", "hi": "तोड़ाई से 7 दिन पहले मैलाथियान स्प्रे बंद करें"}
  ],
  "science": {"en": "Carpomyia vesuviana female punctures fruit skin with ovipositor, lays eggs inside. Larvae feed on pulp causing internal rot. Bait spray works because: adults are attracted to protein hydrolysate/jaggery → feed on poisoned bait → die before egg-laying. Pheromone traps capture males, reducing mating.", "hi": "फल मक्खी (Carpomyia) मादा फल में अंडे देती है। लार्वा गूदा खाता है और फल सड़ता है। बेट स्प्रे काम करता है क्योंकि: मक्खी गुड़ की ओर आकर्षित होती है → ज़हरीला चारा खाती है → अंडे देने से पहले मर जाती है।"}
}'::JSONB
WHERE stage_name_en = 'Fruit Maturation'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 10: Main Harvest
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Peak harvest season — maximum production, best prices. Grade, pack, sell strategically.", "hi": "मुख्य तोड़ाई — सबसे ज़्यादा उत्पादन, अच्छे भाव। ग्रेडिंग, पैकिंग, सही मंडी में बेचें।"},
  "why": {"en": "This is your INCOME window. Apple Ber has 2-3 day shelf life at ambient temperature. Proper grading and quick sale maximize returns. Grade A fetches 2-3x more than Grade C. Early morning picking reduces field heat and improves shelf life.", "hi": "यही आपकी कमाई का समय है। एप्पल बेर 2-3 दिन ही टिकता है। सही ग्रेडिंग और जल्दी बिक्री से ज़्यादा कमाई। A ग्रेड का भाव C ग्रेड से 2-3 गुना ज़्यादा।"},
  "how_steps": [
    {"en": "Harvest 6-9 AM daily — pick yellowish-green, firm fruits", "hi": "रोज़ सुबह 6-9 बजे तोड़ें — पीले-हरे, मज़बूत फल"},
    {"en": "Grade immediately: A (large, unblemished), B (medium), C (small/marks)", "hi": "तुरंत ग्रेडिंग: A (बड़े, साफ), B (मध्यम), C (छोटे/दाग)"},
    {"en": "Pack in ventilated crates — do NOT use plastic bags", "hi": "हवादार टोकरी में पैक करें — प्लास्टिक बैग न इस्तेमाल करें"},
    {"en": "Transport to mandi same day — within 4-6 hours of picking", "hi": "तोड़ने के 4-6 घंटे में मंडी पहुंचाएं"},
    {"en": "Continue fruit fly bait spray between harvests", "hi": "तोड़ाई के बीच फल मक्खी बेट स्प्रे जारी रखें"},
    {"en": "CaCl2 1.5% dip before storage extends shelf life to 7 days", "hi": "CaCl2 1.5% में 5 मिनट डुबोकर रखें — 7 दिन तक टिकेगा"}
  ],
  "science": {"en": "Apple Ber has climacteric respiration pattern — ethylene production peaks post-harvest causing rapid softening. CaCl2 treatment inhibits ethylene biosynthesis enzymes (ACC oxidase). ZECC (Zero Energy Cool Chamber) extends storage to 5-6 days using evaporative cooling principle.", "hi": "एप्पल बेर तोड़ने के बाद एथिलीन हार्मोन बनता है जिससे जल्दी नरम होता है। CaCl2 एथिलीन बनने को रोकता है। ज़ीरो एनर्जी कूल चैम्बर (ईंट+रेत+पानी) में 5-6 दिन रखा जा सकता है।"}
}'::JSONB
WHERE stage_name_en = 'Main Harvest'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 11: Late Harvest & Cleanup
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Final harvest and orchard cleanup. Breaking the pest cycle for next season.", "hi": "आखिरी तोड़ाई और बाग़ की सफाई। अगले सीज़न के लिए कीट चक्र तोड़ें।"},
  "why": {"en": "Fallen and damaged fruits harbor fruit fly pupae in soil. If not destroyed, they emerge as adults in the next season. Thorough cleanup reduces next year''s fruit fly population by 60-80%.", "hi": "गिरे और खराब फल में फल मक्खी के प्यूपा (अंडे) मिट्टी में रहते हैं। नष्ट न करें तो अगले सीज़न में वयस्क मक्खी बनकर निकलते हैं। सफाई से अगले साल मक्खी 60-80% कम।"},
  "how_steps": [
    {"en": "Complete final harvest — even small/damaged fruits", "hi": "आखिरी फल तोड़ें — छोटे/खराब फल भी"},
    {"en": "Collect and DESTROY all fallen fruits — bury 2 feet deep or burn", "hi": "सभी गिरे फल इकट्ठा करें — 2 फुट गहरा गाड़ें या जलाएं"},
    {"en": "Clean orchard floor — remove all organic debris", "hi": "बाग़ की ज़मीन साफ करें — सारा कचरा हटाएं"},
    {"en": "Reduce irrigation gradually — tree entering rest phase", "hi": "पानी धीरे-धीरे कम करें — पेड़ आराम में जा रहा है"},
    {"en": "Light plowing around trees to expose fruit fly pupae to sun", "hi": "पेड़ों के चारों ओर हल्की जुताई — मक्खी प्यूपा धूप में आएंगे"}
  ],
  "science": {"en": "Carpomyia vesuviana pupates in soil at 2-5 cm depth. Pupae can survive 6-8 months. Plowing exposes pupae to UV radiation and predatory birds. Burying fallen fruits >60 cm prevents adult emergence.", "hi": "फल मक्खी मिट्टी में 2-5 cm गहराई पर प्यूपा बनाती है। 6-8 महीने ज़िंदा रहता है। जुताई से प्यूपा धूप और पक्षियों से मरते हैं। फल 60 cm गहरा गाड़ने से मक्खी नहीं निकल पाती।"}
}'::JSONB
WHERE stage_name_en = 'Late Harvest & Cleanup'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- Stage 12: Rest Period
UPDATE crop_template_stages SET detailed_guide = '{
  "what": {"en": "Tree is dormant. Plan next season, organize inputs, prepare for May pruning.", "hi": "पेड़ सुस्त है। अगले सीज़न की योजना बनाएं, सामान इकट्ठा करें, मई छंटाई की तैयारी।"},
  "why": {"en": "Dormancy allows the tree to accumulate carbohydrate reserves in roots for the next season''s growth cycle. Irrigation during this period wastes water and can delay leaf shedding.", "hi": "सुस्ती में पेड़ जड़ों में पोषण जमा करता है — अगले सीज़न की बढ़वार के लिए। इस समय पानी देने से पत्ता झड़ना देर होता है।"},
  "how_steps": [
    {"en": "Stop irrigation completely by mid-March", "hi": "मार्च के बीच तक पानी बिल्कुल बंद करें"},
    {"en": "Let leaves fall naturally — do NOT force with chemicals", "hi": "पत्ते अपने आप गिरने दें — दवाई से मत गिराएं"},
    {"en": "Order FYM (40-50 kg/tree), DAP, MOP, Urea for next season", "hi": "अगले सीज़न के लिए गोबर खाद, DAP, MOP, यूरिया ऑर्डर करें"},
    {"en": "Sharpen/replace pruning tools", "hi": "छंटाई के औज़ार तेज़ करें/नए लें"},
    {"en": "Plan: hard pruning in last week April to end May", "hi": "योजना: कड़ी छंटाई अप्रैल अंत से मई अंत तक"}
  ],
  "science": {"en": "Dormancy in ber is triggered by high temperatures (>40°C) and water stress in April-May, not by cold (unlike temperate fruits). Leaf abscission is triggered by ABA accumulation due to heat stress. The tree redistributes photosynthates from leaves to roots and trunk before shedding.", "hi": "बेर में सुस्ती गर्मी (40°C+) और सूखे से आती है (सर्दी से नहीं, जैसे सेब में)। गर्मी से ABA हार्मोन बढ़ता है और पत्ते गिरते हैं। पत्ते गिरने से पहले पेड़ पोषण जड़ों और तने में भेजता है।"}
}'::JSONB
WHERE stage_name_en = 'Rest Period'
  AND template_id = (SELECT id FROM crop_templates WHERE crop_key = 'apple_ber' AND region_key IS NULL);

-- ═══════════════════════════════════════════
-- PART 2: Expanded Disease Database (14 new)
-- Existing 6 are updated, 14 new ones added
-- ═══════════════════════════════════════════

-- Update existing diseases with new fields
UPDATE crop_diseases SET
  causative_agent = 'Oidium erysiphoides f.sp. ziziphi',
  favorable_conditions_en = 'Temperature 15-25°C, humidity 60-80%, cloudy weather. Most severe in October-November.',
  favorable_conditions_hi = 'तापमान 15-25°C, नमी 60-80%, बादल वाला मौसम। अक्टूबर-नवंबर में सबसे गंभीर।',
  economic_impact_en = '50-60% yield loss. Disease index can reach 17-71%.',
  economic_impact_hi = '50-60% उपज हानि। रोग सूचकांक 17-71% तक।',
  prevention_en = 'Use resistant varieties. Remove infected plant debris. Avoid excess nitrogen. Good air circulation through pruning.',
  prevention_hi = 'प्रतिरोधी किस्में लगाएं। संक्रमित पत्ते हटाएं। ज़्यादा नाइट्रोजन न दें। छंटाई से हवा का प्रवाह बनाएं।',
  spray_schedule = '[{"month": 9, "spray": "Sulfex 0.3% — first spray at flowering start"}, {"month": 10, "spray": "Bayleton 0.1% — alternate spray"}, {"month": 10, "spray": "Sulfex 0.3% — repeat after 15 days"}, {"month": 11, "spray": "Contaf 2ml/L — if still active"}, {"month": 12, "spray": "Sulfex if needed on fruits"}]'::JSONB
WHERE crop_key = 'apple_ber' AND name_en = 'Powdery Mildew';

UPDATE crop_diseases SET
  causative_agent = 'Carpomyia vesuviana Costa (Fruit Fly)',
  favorable_conditions_en = 'Temperature 20-30°C. Active from November-March. Attracted to ripening fruits.',
  favorable_conditions_hi = 'तापमान 20-30°C। नवंबर-मार्च तक सक्रिय। पकते फलों की ओर आकर्षित।',
  economic_impact_en = '80-100% yield loss possible if untreated. Most damaging pest of ber.',
  economic_impact_hi = 'बिना इलाज 80-100% नुकसान। बेर का सबसे खतरनाक कीट।',
  prevention_en = 'Destroy fallen fruits daily. Install methyl eugenol traps. Plow soil after harvest to expose pupae. Early harvest reduces exposure.',
  prevention_hi = 'गिरे फल रोज़ नष्ट करें। मिथाइल यूजेनॉल ट्रैप लगाएं। तोड़ाई बाद जुताई करें। जल्दी तोड़ाई करें।',
  spray_schedule = '[{"month": 11, "spray": "Install traps (4-5/acre)"}, {"month": 12, "spray": "Start bait spray: Malathion 2ml/L + Jaggery 10g/L every 10 days"}, {"month": 1, "spray": "Continue bait spray every 7-10 days"}, {"month": 2, "spray": "Continue — peak season"}, {"month": 3, "spray": "Final spray + destroy fallen fruits"}]'::JSONB
WHERE crop_key = 'apple_ber' AND name_en = 'Fruit Fly';

UPDATE crop_diseases SET
  causative_agent = 'Indarbela quadrinotata (Bark Eating Caterpillar)',
  favorable_conditions_en = 'Monsoon season (July-September). Young trees and excess growth more susceptible.',
  favorable_conditions_hi = 'बारिश का मौसम (जुलाई-सितंबर)। नए पेड़ और ज़्यादा बढ़वार में ज़्यादा।',
  economic_impact_en = 'Can girdle and kill individual branches. Moderate damage but weakens tree structure.',
  economic_impact_hi = 'शाखाएं मार सकता है। मध्यम नुकसान लेकिन पेड़ का ढांचा कमज़ोर करता है।',
  prevention_en = 'Clean trunk regularly. Remove loose bark. Apply lime wash on trunk. Good orchard hygiene.',
  prevention_hi = 'तने की नियमित सफाई। ढीली छाल हटाएं। तने पर चूने का लेप। बाग़ की साफ-सफाई।'
WHERE crop_key = 'apple_ber' AND name_en = 'Bark Eating Caterpillar';

-- Add NEW diseases

INSERT INTO crop_diseases (crop_key, name_en, name_hi, local_name, causative_agent, peak_week_offsets,
  symptoms_en, symptoms_hi, treatment_en, treatment_hi, organic_treatment_en, organic_treatment_hi,
  favorable_conditions_en, favorable_conditions_hi, economic_impact_en, economic_impact_hi,
  prevention_en, prevention_hi, products) VALUES

-- Anthracnose
('apple_ber', 'Anthracnose', 'एन्थ्रेक्नोज़', 'kala dhabba rog',
  'Colletotrichum fructicola / C. siamense',
  ARRAY[26,30,35,39],
  'Dark brown to black sunken lesions on fruits. Pink-orange spore masses in humid conditions. Fruit cracks and rots.',
  'फलों पर गहरे भूरे-काले धंसे धब्बे। नम मौसम में गुलाबी-नारंगी बीजाणु। फल फटता और सड़ता है।',
  'Copper Oxychloride 3g/L spray. Difenoconazole (Score) 1ml/L. Carbendazim 1g/L.',
  'कॉपर ऑक्सीक्लोराइड 3g/L स्प्रे। डिफेनोकोनाज़ोल (Score) 1ml/L। कार्बेन्डाज़िम 1g/L।',
  'Neem oil 2% spray. Remove infected fruits.',
  'नीम तेल 2% स्प्रे। संक्रमित फल तोड़ें।',
  'High humidity >80%, temperature 25-30°C, rain splash spreads spores.',
  'नमी 80%+, तापमान 25-30°C, बारिश से बीजाणु फैलते हैं।',
  'Can cause 20-40% fruit loss in wet seasons.',
  'गीले मौसम में 20-40% फल नुकसान।',
  'Remove infected fruits. Improve air circulation. Avoid overhead irrigation.',
  'संक्रमित फल हटाएं। हवा का प्रवाह बढ़ाएं। ऊपर से पानी न दें।',
  '[{"name_en":"Copper Oxychloride (Blitox)","name_hi":"कॉपर ऑक्सीक्लोराइड (ब्लिटॉक्स)","dosage":"3g/L","where_to_buy":"कृषि दवाई दुकान"},{"name_en":"Score (Difenoconazole)","name_hi":"स्कोर (डिफेनोकोनाज़ोल)","dosage":"1ml/L","where_to_buy":"कृषि दवाई दुकान"}]'::JSONB),

-- Scale Insects
('apple_ber', 'Scale Insects', 'शेल्क कीड़े / स्केल', 'shelk keede',
  'Pulvinaria maxima / Aonidiella orientalis',
  ARRAY[13,17,22,26],
  'Small brown/white oval bumps on bark, leaves, fruits. Honeydew secretion. Sooty mold follows.',
  'तने, पत्तों, फलों पर छोटे भूरे/सफ़ेद अंडाकार उभार। चिपचिपा पदार्थ। काली फफूंद आती है।',
  'Dimethoate 30 EC @ 2ml/L. Or Imidacloprid 0.5ml/L. Apply on trunk and branches.',
  'डाइमेथोएट 30 EC @ 2ml/L। या इमिडाक्लोप्रिड 0.5ml/L। तने और शाखाओं पर करें।',
  'Neem oil 2% (20ml/L) spray. Release Chilocorus ladybird beetles (biocontrol).',
  'नीम तेल 2% (20ml/L) स्प्रे। Chilocorus भृंग छोड़ें (जैविक नियंत्रण)।',
  'Warm humid conditions. Dense canopy with poor air circulation.',
  'गर्म नम मौसम। घनी छतरी में हवा कम होने से।',
  'Weakens tree, reduces yield 15-25%. Sooty mold reduces photosynthesis.',
  'पेड़ कमज़ोर, उपज 15-25% कम। काली फफूंद प्रकाश संश्लेषण रोकती है।',
  'Prune for air circulation. Remove heavily infested branches. Clean trunk.',
  'हवा के लिए छंटाई। ज़्यादा प्रभावित शाखाएं काटें। तने की सफाई।',
  '[{"name_en":"Dimethoate 30 EC (Rogor)","name_hi":"डाइमेथोएट (रोगोर)","dosage":"2ml/L","where_to_buy":"कृषि दवाई दुकान"},{"name_en":"Neem oil","name_hi":"नीम तेल","dosage":"20ml/L","where_to_buy":"कृषि दवाई दुकान"}]'::JSONB),

-- Fruit Borer
('apple_ber', 'Fruit Borer', 'फल छेदक', 'phal ka keeda',
  'Meridarchis scyrodes / Helicoverpa armigera',
  ARRAY[30,35,39],
  'Small entry holes in fruits. Larvae inside feeding on pulp. Frass (excreta) near hole.',
  'फलों में छोटे छेद। अंदर लार्वा गूदा खा रहा। छेद के पास मल (फ्रास)।',
  'Emamectin benzoate (Proclaim) 0.4g/L. Spinosad (Tracer) 0.3ml/L.',
  'इमामेक्टिन बेंज़ोएट (प्रोक्लेम) 0.4g/L। स्पिनोसैड (ट्रेसर) 0.3ml/L।',
  'Bt spray (Bacillus thuringiensis) 2g/L. Neem seed kernel extract 5%.',
  'Bt स्प्रे 2g/L। नीम गिरी अर्क 5%।',
  'Warm nights, light traps attract adults. Peak during fruit development.',
  'गर्म रातें, प्रकाश जाल से वयस्क आते हैं। फल विकास के दौरान सबसे ज़्यादा।',
  'Up to 70% yield loss in severe infestation.',
  'गंभीर संक्रमण में 70% तक नुकसान।',
  'Light traps at night. Pheromone traps. Remove infested fruits.',
  'रात को प्रकाश जाल। फेरोमोन ट्रैप। संक्रमित फल हटाएं।',
  '[{"name_en":"Proclaim (Emamectin)","name_hi":"प्रोक्लेम (इमामेक्टिन)","dosage":"0.4g/L","where_to_buy":"कृषि दवाई दुकान"},{"name_en":"Tracer (Spinosad)","name_hi":"ट्रेसर (स्पिनोसैड)","dosage":"0.3ml/L","where_to_buy":"कृषि दवाई दुकान"}]'::JSONB),

-- Zinc Deficiency
('apple_ber', 'Zinc Deficiency', 'जिंक की कमी', 'chhoti patti / rosette',
  'Nutritional disorder — Zn deficiency',
  ARRAY[9,13,17],
  'Small, narrow leaves (rosette). Interveinal chlorosis on young leaves. Short internodes. Reduced fruit set.',
  'छोटी, संकरी पत्तियां (रोज़ेट)। नई पत्तियों पर नसों के बीच पीलापन। छोटी गांठें। कम फल।',
  'ZnSO4 0.5% (5g/L) foliar spray. 2-3 sprays at 15-day intervals on new growth.',
  'ZnSO4 0.5% (5g/L) पत्तों पर स्प्रे। 15 दिन के अंतराल पर 2-3 स्प्रे।',
  'Zinc-enriched compost. Chelated zinc foliar spray.',
  'ज़िंक-समृद्ध कम्पोस्ट। चीलेटेड ज़िंक पत्तों पर स्प्रे।',
  'Alkaline soils (pH >8.0). Sandy soils with low organic matter. High phosphorus locks zinc.',
  'क्षारीय मिट्टी (pH 8+)। रेतीली मिट्टी कम कार्बनिक पदार्थ। ज़्यादा फॉस्फोरस ज़िंक को रोकता है।',
  'Reduced fruit set and small fruit size. Yield loss 15-30%.',
  'कम फल और छोटे फल। उपज 15-30% कम।',
  'Maintain organic matter. Balanced fertilization. Regular foliar ZnSO4.',
  'कार्बनिक पदार्थ बनाए रखें। संतुलित खाद। नियमित ZnSO4 स्प्रे।',
  '[{"name_en":"ZnSO4 (Zinc Sulphate)","name_hi":"ज़िंक सल्फेट","dosage":"5g/L foliar spray","where_to_buy":"कृषि दवाई दुकान"}]'::JSONB),

-- Boron Deficiency
('apple_ber', 'Boron Deficiency', 'बोरॉन की कमी', 'phal phatna',
  'Nutritional disorder — Boron deficiency',
  ARRAY[26,30,35],
  'Fruit cracking. Poor fruit set. Misshapen fruits. Internal cork-like browning.',
  'फल फटना। कम फल लगना। बेडौल फल। अंदर कॉर्क जैसा भूरापन।',
  'Borax 0.4% (4g/L) foliar spray at flowering and fruit set. 2 sprays at 15-day intervals.',
  'बोरेक्स 0.4% (4g/L) फूल आने और फल लगने पर स्प्रे। 15 दिन अंतराल पर 2 बार।',
  'Borax soil application 50g/tree in basin with FYM.',
  'बोरेक्स 50g/पेड़ गड्ढे में गोबर खाद के साथ।',
  'Sandy soils. High pH. Dry conditions reduce boron availability.',
  'रेतीली मिट्टी। ऊँचा pH। सूखे में बोरॉन कम उपलब्ध।',
  'Fruit drop 40-60%. Cracked fruits unsaleable.',
  'फल गिरना 40-60%। फटे फल बेचने लायक नहीं।',
  'Regular borax spray at fruit set. Maintain organic matter.',
  'फल लगने पर नियमित बोरेक्स स्प्रे। कार्बनिक पदार्थ बनाएं।',
  '[{"name_en":"Borax","name_hi":"बोरेक्स","dosage":"4g/L foliar or 50g/tree soil","where_to_buy":"कृषि दवाई दुकान"}]'::JSONB),

-- Iron Chlorosis
('apple_ber', 'Iron Chlorosis', 'लोहे की कमी / पीलापन', 'peeli patti',
  'Nutritional disorder — Iron deficiency',
  ARRAY[9,13],
  'Young leaves turn yellow with green veins (interveinal chlorosis). Severe: entire leaf white-yellow. Stunted growth.',
  'नई पत्तियां पीली, नसें हरी (इंटरवीनल क्लोरोसिस)। गंभीर: पूरी पत्ती सफ़ेद-पीली। बढ़वार रुकी।',
  'FeSO4 0.5% (5g/L) + Citric acid 0.1% (1g/L) foliar spray. 2-3 sprays at 15-day intervals.',
  'FeSO4 0.5% (5g/L) + साइट्रिक एसिड 0.1% (1g/L) पत्तों पर स्प्रे। 15 दिन अंतराल पर 2-3 बार।',
  'Fe-EDDHA chelate 10g/tree soil application for alkaline soils.',
  'Fe-EDDHA चीलेट 10g/पेड़ मिट्टी में — क्षारीय मिट्टी के लिए।',
  'Alkaline soils (pH >8). Calcareous soils. Waterlogged conditions. High phosphorus.',
  'क्षारीय मिट्टी (pH 8+)। चूने वाली मिट्टी। जलभराव। ज़्यादा फॉस्फोरस।',
  'Reduced photosynthesis. Weak growth. Yield loss 10-20%.',
  'प्रकाश संश्लेषण कम। कमज़ोर बढ़वार। उपज 10-20% कम।',
  'Improve drainage. Add organic matter. Avoid excess phosphorus fertilization.',
  'जल निकासी सुधारें। कार्बनिक पदार्थ डालें। ज़्यादा फॉस्फोरस खाद न दें।',
  '[{"name_en":"FeSO4 (Ferrous Sulphate)","name_hi":"फेरस सल्फेट","dosage":"5g/L + Citric acid 1g/L","where_to_buy":"कृषि दवाई दुकान"},{"name_en":"Fe-EDDHA (Iron Chelate)","name_hi":"आयरन चीलेट","dosage":"10g/tree soil","where_to_buy":"कृषि दवाई दुकान"}]'::JSONB);
