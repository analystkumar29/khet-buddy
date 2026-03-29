"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import type { CropDisease } from "@/types/database";

const RISK_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function DiseasesPage() {
  const { lang } = useLanguage();
  const [diseases, setDiseases] = useState<CropDisease[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("crop_diseases")
      .select("*")
      .eq("crop_key", "apple_ber")
      .order("name_en")
      .then(({ data }) => {
        setDiseases((data || []) as CropDisease[]);
        setLoading(false);
      });
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-4">
        <svg className="h-8 w-8 animate-spin text-khet-green" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Group diseases
  const fungal = diseases.filter((d) =>
    d.causative_agent?.toLowerCase().match(/oidium|alternaria|colletotrichum|phakopsora|capnodium|phytophthora|fusarium|lasiodiplodia/)
  );
  const insects = diseases.filter((d) =>
    d.causative_agent?.toLowerCase().match(/carpomyia|indarbela|pulvinaria|amrasca|meridarchis|helicoverpa|euproctis|aubeus|aceria/)
  );
  const nutritional = diseases.filter((d) =>
    d.causative_agent?.toLowerCase().includes("nutritional")
  );
  const other = diseases.filter(
    (d) => !fungal.includes(d) && !insects.includes(d) && !nutritional.includes(d)
  );

  function renderGroup(title: string, titleHi: string, icon: string, items: CropDisease[]) {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>{icon}</span>
          {lang === "hi" ? titleHi : title} ({items.length})
        </h2>
        {items.map((disease) => (
          <DiseaseCard
            key={disease.id}
            disease={disease}
            lang={lang}
            expanded={expandedId === disease.id}
            onToggle={() =>
              setExpandedId(expandedId === disease.id ? null : disease.id)
            }
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-khet-green">
        {lang === "hi" ? "बीमारियां और कीट" : "Diseases & Pests"}
      </h1>
      <p className="text-sm text-gray-500">
        {lang === "hi"
          ? `एप्पल बेर — ${diseases.length} बीमारियां/कीट/विकार`
          : `Apple Ber — ${diseases.length} diseases/pests/disorders`}
      </p>

      {renderGroup("Fungal Diseases", "फफूंद रोग", "🍄", fungal)}
      {renderGroup("Insect Pests", "कीट", "🐛", insects)}
      {renderGroup("Nutritional Disorders", "पोषण विकार", "🧪", nutritional)}
      {renderGroup("Other", "अन्य", "📋", other)}

      <p className="text-center text-xs text-gray-400 pt-2">
        {lang === "hi"
          ? "स्रोत: ICAR, CCS HAU हिसार, PAU लुधियाना, NHB, विकासपीडिया"
          : "Source: ICAR, CCS HAU Hisar, PAU Ludhiana, NHB, Vikaspedia"}
      </p>
    </div>
  );
}

function DiseaseCard({
  disease,
  lang,
  expanded,
  onToggle,
}: {
  disease: CropDisease;
  lang: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const name = lang === "hi" ? disease.name_hi : disease.name_en;
  const localName = disease.local_name;

  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden transition-all ${
        expanded ? "border-khet-green shadow-md" : "border-gray-200"
      }`}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-center justify-between gap-2"
      >
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          {localName && (
            <p className="text-sm text-gray-500 italic">
              {lang === "hi" ? `(${disease.name_en})` : `(${localName})`}
            </p>
          )}
        </div>
        <span className={`text-xl transition-transform ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Causative agent */}
          {disease.causative_agent && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                {lang === "hi" ? "कारक" : "Causative Agent"}
              </p>
              <p className="text-sm text-gray-700 italic">{disease.causative_agent}</p>
            </div>
          )}

          {/* Symptoms */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              {lang === "hi" ? "लक्षण" : "Symptoms"}
            </p>
            <p className="text-sm text-gray-700">
              {lang === "hi" ? disease.symptoms_hi : disease.symptoms_en}
            </p>
          </div>

          {/* Favorable conditions */}
          {(disease.favorable_conditions_en || disease.favorable_conditions_hi) && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                {lang === "hi" ? "अनुकूल परिस्थितियां" : "Favorable Conditions"}
              </p>
              <p className="text-sm text-gray-700">
                {lang === "hi" ? disease.favorable_conditions_hi : disease.favorable_conditions_en}
              </p>
            </div>
          )}

          {/* Economic impact */}
          {(disease.economic_impact_en || disease.economic_impact_hi) && (
            <div className="rounded-lg bg-red-50 p-2">
              <p className="text-xs font-medium text-red-600 uppercase">
                {lang === "hi" ? "आर्थिक नुकसान" : "Economic Impact"}
              </p>
              <p className="text-sm text-red-700">
                {lang === "hi" ? disease.economic_impact_hi : disease.economic_impact_en}
              </p>
            </div>
          )}

          {/* Chemical treatment */}
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs font-medium text-blue-600 uppercase mb-1">
              {lang === "hi" ? "रासायनिक इलाज" : "Chemical Treatment"}
            </p>
            <p className="text-sm text-blue-800">
              {lang === "hi" ? disease.treatment_hi : disease.treatment_en}
            </p>
          </div>

          {/* Organic treatment */}
          {(disease.organic_treatment_en || disease.organic_treatment_hi) && (
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">
                {lang === "hi" ? "देसी / जैविक इलाज" : "Organic Treatment"}
              </p>
              <p className="text-sm text-green-800">
                🌿 {lang === "hi" ? disease.organic_treatment_hi : disease.organic_treatment_en}
              </p>
            </div>
          )}

          {/* Products */}
          {disease.products && disease.products.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                {lang === "hi" ? "दवाइयां" : "Products"}
              </p>
              <div className="space-y-1">
                {disease.products.map((p, i) => (
                  <div key={i} className="rounded bg-gray-50 p-2 text-sm">
                    <span className="font-medium">
                      {lang === "hi" ? p.name_hi : p.name_en}
                    </span>
                    <span className="text-gray-500"> — {p.dosage}</span>
                    <span className="text-gray-400 text-xs ml-1">({p.where_to_buy})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prevention */}
          {(disease.prevention_en || disease.prevention_hi) && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                {lang === "hi" ? "बचाव" : "Prevention"}
              </p>
              <p className="text-sm text-gray-700">
                {lang === "hi" ? disease.prevention_hi : disease.prevention_en}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
