/**
 * District/State lookup for North India horticulture regions.
 * Covers Haryana, Punjab, Uttar Pradesh, Rajasthan.
 *
 * Each district has approximate center coordinates for weather fallback.
 */

export type District = {
  name: string;
  name_hi: string;
  lat: number;
  lon: number;
};

export type StateData = {
  name: string;
  name_hi: string;
  districts: District[];
};

export const STATES: StateData[] = [
  {
    name: "Haryana",
    name_hi: "हरियाणा",
    districts: [
      { name: "Ambala", name_hi: "अंबाला", lat: 30.38, lon: 76.78 },
      { name: "Bhiwani", name_hi: "भिवानी", lat: 28.79, lon: 76.13 },
      { name: "Charkhi Dadri", name_hi: "चरखी दादरी", lat: 28.59, lon: 76.27 },
      { name: "Faridabad", name_hi: "फरीदाबाद", lat: 28.41, lon: 77.31 },
      { name: "Fatehabad", name_hi: "फतेहाबाद", lat: 29.52, lon: 75.45 },
      { name: "Gurugram", name_hi: "गुरुग्राम", lat: 28.46, lon: 77.03 },
      { name: "Hisar", name_hi: "हिसार", lat: 29.15, lon: 75.72 },
      { name: "Jhajjar", name_hi: "झज्जर", lat: 28.61, lon: 76.65 },
      { name: "Jind", name_hi: "जींद", lat: 29.32, lon: 76.31 },
      { name: "Kaithal", name_hi: "कैथल", lat: 29.80, lon: 76.40 },
      { name: "Karnal", name_hi: "करनाल", lat: 29.69, lon: 76.98 },
      { name: "Kurukshetra", name_hi: "कुरुक्षेत्र", lat: 29.97, lon: 76.84 },
      { name: "Mahendragarh", name_hi: "महेंद्रगढ़", lat: 28.28, lon: 76.15 },
      { name: "Nuh", name_hi: "नूंह", lat: 28.10, lon: 77.00 },
      { name: "Palwal", name_hi: "पलवल", lat: 28.14, lon: 77.33 },
      { name: "Panchkula", name_hi: "पंचकूला", lat: 30.69, lon: 76.86 },
      { name: "Panipat", name_hi: "पानीपत", lat: 29.39, lon: 76.97 },
      { name: "Rewari", name_hi: "रेवाड़ी", lat: 28.19, lon: 76.62 },
      { name: "Rohtak", name_hi: "रोहतक", lat: 28.89, lon: 76.59 },
      { name: "Sirsa", name_hi: "सिरसा", lat: 29.53, lon: 75.02 },
      { name: "Sonipat", name_hi: "सोनीपत", lat: 28.99, lon: 77.02 },
      { name: "Yamunanagar", name_hi: "यमुनानगर", lat: 30.13, lon: 77.29 },
    ],
  },
  {
    name: "Punjab",
    name_hi: "पंजाब",
    districts: [
      { name: "Amritsar", name_hi: "अमृतसर", lat: 31.63, lon: 74.87 },
      { name: "Barnala", name_hi: "बरनाला", lat: 30.38, lon: 75.55 },
      { name: "Bathinda", name_hi: "बठिंडा", lat: 30.21, lon: 74.95 },
      { name: "Faridkot", name_hi: "फरीदकोट", lat: 30.68, lon: 74.76 },
      { name: "Fatehgarh Sahib", name_hi: "फतेहगढ़ साहिब", lat: 30.64, lon: 76.39 },
      { name: "Fazilka", name_hi: "फाज़िल्का", lat: 30.40, lon: 74.03 },
      { name: "Ferozepur", name_hi: "फिरोज़पुर", lat: 30.93, lon: 74.61 },
      { name: "Gurdaspur", name_hi: "गुरदासपुर", lat: 32.04, lon: 75.40 },
      { name: "Hoshiarpur", name_hi: "होशियारपुर", lat: 31.53, lon: 75.91 },
      { name: "Jalandhar", name_hi: "जालंधर", lat: 31.33, lon: 75.58 },
      { name: "Kapurthala", name_hi: "कपूरथला", lat: 31.38, lon: 75.38 },
      { name: "Ludhiana", name_hi: "लुधियाना", lat: 30.90, lon: 75.86 },
      { name: "Mansa", name_hi: "मानसा", lat: 29.99, lon: 75.40 },
      { name: "Moga", name_hi: "मोगा", lat: 30.82, lon: 75.17 },
      { name: "Mohali", name_hi: "मोहाली", lat: 30.70, lon: 76.72 },
      { name: "Muktsar", name_hi: "मुक्तसर", lat: 30.47, lon: 74.52 },
      { name: "Pathankot", name_hi: "पठानकोट", lat: 32.27, lon: 75.65 },
      { name: "Patiala", name_hi: "पटियाला", lat: 30.34, lon: 76.39 },
      { name: "Rupnagar", name_hi: "रूपनगर", lat: 30.97, lon: 76.53 },
      { name: "Sangrur", name_hi: "संगरूर", lat: 30.25, lon: 75.84 },
      { name: "Tarn Taran", name_hi: "तरन तारन", lat: 31.45, lon: 74.93 },
    ],
  },
  {
    name: "Uttar Pradesh",
    name_hi: "उत्तर प्रदेश",
    districts: [
      { name: "Agra", name_hi: "आगरा", lat: 27.18, lon: 78.02 },
      { name: "Aligarh", name_hi: "अलीगढ़", lat: 27.88, lon: 78.08 },
      { name: "Allahabad (Prayagraj)", name_hi: "प्रयागराज", lat: 25.43, lon: 81.85 },
      { name: "Bareilly", name_hi: "बरेली", lat: 28.37, lon: 79.42 },
      { name: "Bulandshahr", name_hi: "बुलंदशहर", lat: 28.41, lon: 77.85 },
      { name: "Etawah", name_hi: "इटावा", lat: 26.79, lon: 79.02 },
      { name: "Firozabad", name_hi: "फिरोज़ाबाद", lat: 27.15, lon: 78.39 },
      { name: "Hardoi", name_hi: "हरदोई", lat: 27.39, lon: 80.13 },
      { name: "Hathras", name_hi: "हाथरस", lat: 27.60, lon: 78.05 },
      { name: "Kanpur", name_hi: "कानपुर", lat: 26.45, lon: 80.35 },
      { name: "Lucknow", name_hi: "लखनऊ", lat: 26.85, lon: 80.95 },
      { name: "Mathura", name_hi: "मथुरा", lat: 27.49, lon: 77.67 },
      { name: "Meerut", name_hi: "मेरठ", lat: 28.98, lon: 77.71 },
      { name: "Moradabad", name_hi: "मुरादाबाद", lat: 28.84, lon: 78.78 },
      { name: "Muzaffarnagar", name_hi: "मुज़फ़्फ़रनगर", lat: 29.47, lon: 77.70 },
      { name: "Saharanpur", name_hi: "सहारनपुर", lat: 29.96, lon: 77.55 },
      { name: "Shahjahanpur", name_hi: "शाहजहाँपुर", lat: 27.88, lon: 79.91 },
      { name: "Unnao", name_hi: "उन्नाव", lat: 26.55, lon: 80.49 },
      { name: "Varanasi", name_hi: "वाराणसी", lat: 25.32, lon: 82.99 },
    ],
  },
  {
    name: "Rajasthan",
    name_hi: "राजस्थान",
    districts: [
      { name: "Ajmer", name_hi: "अजमेर", lat: 26.45, lon: 74.64 },
      { name: "Alwar", name_hi: "अलवर", lat: 27.56, lon: 76.63 },
      { name: "Bharatpur", name_hi: "भरतपुर", lat: 27.22, lon: 77.49 },
      { name: "Bhilwara", name_hi: "भीलवाड़ा", lat: 25.35, lon: 74.63 },
      { name: "Bikaner", name_hi: "बीकानेर", lat: 28.02, lon: 73.31 },
      { name: "Chittorgarh", name_hi: "चित्तौड़गढ़", lat: 24.88, lon: 74.62 },
      { name: "Churu", name_hi: "चूरू", lat: 28.30, lon: 74.97 },
      { name: "Ganganagar", name_hi: "गंगानगर", lat: 29.91, lon: 73.88 },
      { name: "Hanumangarh", name_hi: "हनुमानगढ़", lat: 29.58, lon: 74.33 },
      { name: "Jaipur", name_hi: "जयपुर", lat: 26.92, lon: 75.79 },
      { name: "Jhunjhunu", name_hi: "झुंझुनूं", lat: 28.13, lon: 75.40 },
      { name: "Jodhpur", name_hi: "जोधपुर", lat: 26.29, lon: 73.02 },
      { name: "Kota", name_hi: "कोटा", lat: 25.18, lon: 75.83 },
      { name: "Nagaur", name_hi: "नागौर", lat: 27.20, lon: 73.73 },
      { name: "Pali", name_hi: "पाली", lat: 25.77, lon: 73.32 },
      { name: "Sikar", name_hi: "सीकर", lat: 27.62, lon: 75.14 },
      { name: "Tonk", name_hi: "टोंक", lat: 26.17, lon: 75.79 },
      { name: "Udaipur", name_hi: "उदयपुर", lat: 24.58, lon: 73.71 },
    ],
  },
];

/** Find the nearest district to given coordinates */
export function findNearestDistrict(
  lat: number,
  lon: number
): { district: District; state: StateData } | null {
  let nearest: { district: District; state: StateData; dist: number } | null = null;

  for (const state of STATES) {
    for (const district of state.districts) {
      const dist = haversineKm(lat, lon, district.lat, district.lon);
      if (!nearest || dist < nearest.dist) {
        nearest = { district, state, dist };
      }
    }
  }

  return nearest ? { district: nearest.district, state: nearest.state } : null;
}

/** Haversine distance in km between two points */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
