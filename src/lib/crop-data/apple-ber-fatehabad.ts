export type CropStage = {
  month: number; // 1-12
  stage_en: string;
  stage_hi: string;
  irrigation: "allowed" | "blocked" | "careful" | "reduce";
  irrigation_reason_hi: string;
  irrigation_reason_en: string;
  activities_hi: string[];
  activities_en: string[];
  disease_risk: "low" | "medium" | "high" | "critical";
  disease_alerts_hi: string[];
  disease_alerts_en: string[];
};

export const APPLE_BER_CALENDAR: CropStage[] = [
  {
    month: 1,
    stage_en: "Fruit Maturation",
    stage_hi: "फल पकना",
    irrigation: "allowed",
    irrigation_reason_hi: "हर 7-10 दिन में पानी दें",
    irrigation_reason_en: "Irrigate every 7-10 days",
    activities_hi: [
      "फल मक्खी का बेट स्प्रे करें (मैलाथियान 20ml + गुड़ 200g + 20L पानी)",
      "फलों की ग्रेडिंग करें",
      "मंडी भाव चेक करें",
      "पक्के फल तोड़ें",
    ],
    activities_en: [
      "Apply fruit fly bait spray (Malathion 20ml + Jaggery 200g + 20L water)",
      "Grade fruits by size",
      "Check mandi prices",
      "Harvest ripe fruits",
    ],
    disease_risk: "critical",
    disease_alerts_hi: ["फल मक्खी (aam ki makhi) — बेट स्प्रे ज़रूरी!"],
    disease_alerts_en: ["Fruit fly CRITICAL — bait spray essential!"],
  },
  {
    month: 2,
    stage_en: "Main Harvest",
    stage_hi: "मुख्य तोड़ाई",
    irrigation: "allowed",
    irrigation_reason_hi: "पानी बनाए रखें, हर 7-10 दिन",
    irrigation_reason_en: "Maintain irrigation every 7-10 days",
    activities_hi: [
      "तोड़ाई, ग्रेडिंग, मंडी में बेचें",
      "पीक सीज़न — अच्छे भाव मिलेंगे",
      "फल मक्खी का स्प्रे जारी रखें",
      "ठंडी जगह में रखें (2-3 दिन की शेल्फ लाइफ)",
    ],
    activities_en: [
      "Harvest, grade, sell at mandi",
      "Peak season — best prices available",
      "Continue fruit fly spray",
      "Store in cool place (2-3 day shelf life)",
    ],
    disease_risk: "high",
    disease_alerts_hi: ["फल मक्खी जारी", "फल सड़न (phal ka sadna) से बचें"],
    disease_alerts_en: ["Fruit fly continues", "Watch for fruit rot"],
  },
  {
    month: 3,
    stage_en: "Late Harvest",
    stage_hi: "आखिरी तोड़ाई",
    irrigation: "reduce",
    irrigation_reason_hi: "पानी कम करें",
    irrigation_reason_en: "Reduce irrigation",
    activities_hi: [
      "आखिरी फल तोड़ लें",
      "कटाई के बाद सफाई करें",
      "गिरे फल उठाकर नष्ट करें (फल मक्खी के प्यूपा)",
    ],
    activities_en: [
      "Complete final harvest",
      "Post-harvest cleanup",
      "Destroy fallen fruits (fruit fly pupae)",
    ],
    disease_risk: "low",
    disease_alerts_hi: [],
    disease_alerts_en: [],
  },
  {
    month: 4,
    stage_en: "Rest Period",
    stage_hi: "आराम का समय",
    irrigation: "blocked",
    irrigation_reason_hi: "आराम का समय, पानी न दें — पकने में देरी होगी",
    irrigation_reason_en: "Rest period — no irrigation, delays ripening cycle",
    activities_hi: [
      "पेड़ को आराम दें",
      "खेत की सफाई करें",
      "अगले सीज़न की तैयारी",
    ],
    activities_en: [
      "Let trees rest",
      "Clean the orchard",
      "Prepare for next season",
    ],
    disease_risk: "low",
    disease_alerts_hi: [],
    disease_alerts_en: [],
  },
  {
    month: 5,
    stage_en: "Hard Pruning",
    stage_hi: "कड़ी छंटाई",
    irrigation: "careful",
    irrigation_reason_hi: "छंटाई के बाद पहला पानी दें",
    irrigation_reason_en: "First irrigation after hard pruning",
    activities_hi: [
      "🔴 ज़मीन से 1 फुट ऊपर कड़ी छंटाई करें — यह सबसे ज़रूरी काम है!",
      "गोबर की खाद डालें (40 किलो/पेड़ — दूसरे साल)",
      "गर्मी की जुताई करें (फल मक्खी के प्यूपा मरेंगे)",
      "छंटाई के बाद पहला पानी दें",
    ],
    activities_en: [
      "CRITICAL: Hard prune to 1 foot above ground",
      "Apply FYM (40 kg/tree — Year 2 dose)",
      "Summer plowing (kills fruit fly pupae in soil)",
      "First irrigation after pruning",
    ],
    disease_risk: "low",
    disease_alerts_hi: [],
    disease_alerts_en: [],
  },
  {
    month: 6,
    stage_en: "Dormancy",
    stage_hi: "सुस्ती का समय",
    irrigation: "careful",
    irrigation_reason_hi: "हल्का पानी दें",
    irrigation_reason_en: "Light irrigation",
    activities_hi: [
      "गड्ढे भरें (अगर बाग बढ़ाना हो)",
      "दूसरा पानी दें",
      "खरपतवार निकालें",
    ],
    activities_en: [
      "Pit filling (if expanding orchard)",
      "Second irrigation",
      "Weed management",
    ],
    disease_risk: "low",
    disease_alerts_hi: [],
    disease_alerts_en: [],
  },
  {
    month: 7,
    stage_en: "New Growth Starts",
    stage_hi: "नई बढ़वार शुरू",
    irrigation: "blocked",
    irrigation_reason_hi: "बारिश का मौसम — पानी की जरूरत नहीं, जल निकासी रखें",
    irrigation_reason_en: "Monsoon — no irrigation needed, ensure drainage",
    activities_hi: [
      "NPK खाद डालें",
      "यूरिया की पहली खुराक (200g/पेड़)",
      "बारिश का पानी जमा न होने दें",
      "अंतरफसल बोएं (मूंग/मोठ)",
    ],
    activities_en: [
      "Apply NPK fertilizer",
      "First urea dose (200g/tree — Year 2)",
      "Ensure water drainage",
      "Sow intercrops (mungbean/moth bean)",
    ],
    disease_risk: "low",
    disease_alerts_hi: [],
    disease_alerts_en: [],
  },
  {
    month: 8,
    stage_en: "Rapid Growth",
    stage_hi: "तेज़ बढ़वार",
    irrigation: "blocked",
    irrigation_reason_hi: "बारिश का मौसम — पानी न दें",
    irrigation_reason_en: "Monsoon — no supplemental irrigation",
    activities_hi: [
      "कीटों पर नज़र रखें",
      "छाल खाने वाले कीड़े (chhaal ka keeda) चेक करें",
      "अंतरफसल की देखभाल",
    ],
    activities_en: [
      "Monitor for pests",
      "Check for bark eating caterpillar",
      "Tend intercrops",
    ],
    disease_risk: "medium",
    disease_alerts_hi: ["छाल खाने वाला कीड़ा — तने पर छेद और जाला देखें"],
    disease_alerts_en: ["Bark eating caterpillar — check trunk for bore holes and frass webbing"],
  },
  {
    month: 9,
    stage_en: "Flowering Begins",
    stage_hi: "फूल आना शुरू",
    irrigation: "blocked",
    irrigation_reason_hi: "🔴 फूल आ रहे हैं — पानी बिल्कुल न दें! फूल गिर जाएंगे!",
    irrigation_reason_en: "CRITICAL: Flowering started — ZERO irrigation! Water causes 100% flower drop!",
    activities_hi: [
      "🔴 पानी बिल्कुल न दें — फूल गिर जाएंगे!",
      "यूरिया की दूसरी खुराक दें",
      "छूर्णी रोग (safed rog) की दवाई तैयार रखें",
    ],
    activities_en: [
      "CRITICAL: ZERO irrigation — flowers will drop!",
      "Apply second urea dose",
      "Prepare powdery mildew fungicide",
    ],
    disease_risk: "high",
    disease_alerts_hi: ["छूर्णी रोग (safed rog) शुरू हो सकता है — पत्तियां चेक करें"],
    disease_alerts_en: ["Powdery mildew may start — monitor leaves"],
  },
  {
    month: 10,
    stage_en: "Peak Flowering",
    stage_hi: "पूरे फूल",
    irrigation: "blocked",
    irrigation_reason_hi: "🔴 फूल पूरे खिले हैं — पानी बिल्कुल न दें!",
    irrigation_reason_en: "CRITICAL: Peak flowering — absolutely NO water!",
    activities_hi: [
      "🔴 पानी बिल्कुल न दें!",
      "छूर्णी रोग का स्प्रे: घुलनशील गंधक (Sulfex) 0.3% हर 12-15 दिन",
      "या ट्राईडिमेफॉन (Bayleton) 0.1% बारी-बारी से",
      "देसी इलाज: छाछ 6 लीटर + 100 लीटर पानी",
    ],
    activities_en: [
      "ZERO irrigation!",
      "Powdery mildew spray: Wettable sulphur (Sulfex) 0.3% every 12-15 days",
      "Alternate with Triadimefon (Bayleton) 0.1%",
      "Organic option: Fermented buttermilk 6L in 100L water",
    ],
    disease_risk: "critical",
    disease_alerts_hi: [
      "छूर्णी रोग (choorni rog) — सफ़ेद पाउडर जैसा फलों/पत्तों पर",
      "Umran किस्म सबसे ज़्यादा प्रभावित",
    ],
    disease_alerts_en: [
      "Powdery mildew HIGH — white powder on fruits/leaves",
      "Umran variety most susceptible",
    ],
  },
  {
    month: 11,
    stage_en: "Fruit Set",
    stage_hi: "फल लगना",
    irrigation: "careful",
    irrigation_reason_hi: "धीरे-धीरे पानी शुरू करें — फल बढ़ रहे हैं",
    irrigation_reason_en: "Begin careful irrigation — fruits developing",
    activities_hi: [
      "सिंचाई धीरे-धीरे शुरू करें",
      "बोरॉन स्प्रे करें (फल की क्वालिटी के लिए)",
      "छूर्णी रोग का स्प्रे जारी रखें",
      "भारी फलों के लिए बांस का सहारा लगाएं",
    ],
    activities_en: [
      "Begin careful irrigation for fruit development",
      "Apply boron spray (improves fruit quality)",
      "Continue powdery mildew spray",
      "Add bamboo supports for heavy fruit load",
    ],
    disease_risk: "high",
    disease_alerts_hi: ["छूर्णी रोग जारी — स्प्रे करते रहें"],
    disease_alerts_en: ["Powdery mildew continues — maintain spray schedule"],
  },
  {
    month: 12,
    stage_en: "Fruit Development",
    stage_hi: "फल बढ़ना",
    irrigation: "allowed",
    irrigation_reason_hi: "हर 7-10 दिन में पानी दें — फल बड़े हो रहे हैं",
    irrigation_reason_en: "Irrigate every 7-10 days — fruits growing",
    activities_hi: [
      "कैल्शियम स्प्रे करें (फल की क्वालिटी)",
      "फल मक्खी के ट्रैप लगाएं",
      "नियमित सिंचाई करें",
      "मंडी भाव पर नज़र रखें",
    ],
    activities_en: [
      "Apply calcium spray (fruit quality)",
      "Set up fruit fly traps",
      "Regular irrigation every 7-10 days",
      "Start monitoring mandi prices",
    ],
    disease_risk: "high",
    disease_alerts_hi: ["फल मक्खी सक्रिय हो रही है — ट्रैप लगाएं"],
    disease_alerts_en: ["Fruit fly becoming active — set up traps"],
  },
];

export function getCurrentCropStage(): CropStage {
  const month = new Date().getMonth() + 1; // 1-12
  return APPLE_BER_CALENDAR.find((s) => s.month === month)!;
}

export function isIrrigationBlocked(): {
  blocked: boolean;
  reason_hi: string;
  reason_en: string;
} {
  const stage = getCurrentCropStage();
  return {
    blocked: stage.irrigation === "blocked",
    reason_hi: stage.irrigation_reason_hi,
    reason_en: stage.irrigation_reason_en,
  };
}

// Disease reference for Claude Vision prompt context
export const BER_DISEASES = [
  {
    name_en: "Powdery Mildew",
    name_hi: "छूर्णी रोग / सफ़ेद रोग",
    local_name: "safed rog / choorni rog",
    severity: "17-71% disease index",
    peak_months: [9, 10, 11],
    symptoms_hi: "फलों और पत्तों पर सफ़ेद पाउडर जैसा",
    treatment_hi: "घुलनशील गंधक (Sulfex) 0.3% या ट्राईडिमेफॉन (Bayleton) 0.1%",
  },
  {
    name_en: "Fruit Fly",
    name_hi: "फल मक्खी",
    local_name: "aam ki makhi",
    severity: "80-100% yield loss possible",
    peak_months: [1, 2, 3, 12],
    symptoms_hi: "फल पर छोटे छेद, अंदर सड़ा हुआ",
    treatment_hi: "बेट स्प्रे: मैलाथियान 20ml + गुड़ 200g + 20L पानी",
  },
  {
    name_en: "Bark Eating Caterpillar",
    name_hi: "छाल खाने वाला कीड़ा",
    local_name: "chhaal ka keeda",
    severity: "Moderate - damages trunk",
    peak_months: [7, 8, 9],
    symptoms_hi: "तने पर छेद और जाले जैसा मल दिखाई दे",
    treatment_hi: "छेद में 5ml मिट्टी का तेल डालें या Coragen 18.5 SC",
  },
  {
    name_en: "Leaf Spot",
    name_hi: "पत्ते का धब्बा रोग",
    local_name: "patte ka dhabba rog",
    severity: "Moderate",
    peak_months: [8, 9, 10],
    symptoms_hi: "पत्तों पर भूरे धब्बे",
    treatment_hi: "मैन्कोज़ेब 0.25% का स्प्रे",
  },
  {
    name_en: "Lacewing Bug",
    name_hi: "पत्ती का कीड़ा",
    local_name: "patti ka keeda",
    severity: "Moderate",
    peak_months: [7, 8, 9],
    symptoms_hi: "कोमल पत्तियां सिकुड़ जाएं",
    treatment_hi: "मैलाथियान 50 EC @ 1.5ml/लीटर",
  },
  {
    name_en: "Fruit Rot",
    name_hi: "फल सड़न",
    local_name: "phal ka sadna",
    severity: "Can cause post-harvest losses",
    peak_months: [1, 2, 3],
    symptoms_hi: "फल पर नरम भूरे धब्बे",
    treatment_hi: "संक्रमित फल तोड़कर नष्ट करें, कार्बेन्डाज़िम 0.1% का स्प्रे",
  },
];

// Year 2 specific fertilizer schedule
export const YEAR2_FERTILIZER = {
  fym_kg_per_tree: 40,
  urea_g_per_tree: 400, // split in 2 doses
  urea_dose1_month: 7, // July
  urea_dose2_month: 9, // September
  dap_g_per_tree: 250,
  mop_g_per_tree: 200,
};
