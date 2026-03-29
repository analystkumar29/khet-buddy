"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useVoice } from "@/hooks/useVoice";
import type { FarmActivity } from "@/types/database";

type DetailedGuide = {
  what?: { en: string; hi: string };
  why?: { en: string; hi: string };
  how_steps?: { en: string; hi: string }[];
  products?: { name: string; dosage: string; cost_approx?: string; where?: string }[];
  warnings?: { en: string; hi: string }[];
  science?: { en: string; hi: string };
  organic_alternative?: { en: string; hi: string };
};

type Props = {
  activity: FarmActivity;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
};

export function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
  onComplete,
  onSkip,
}: Props) {
  const { lang } = useLanguage();
  const { speak } = useVoice();
  const [guide, setGuide] = useState<DetailedGuide | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!isOpen || !activity.template_stage_id) return;

    setLoading(true);
    supabase
      .from("crop_template_stages")
      .select("detailed_guide")
      .eq("id", activity.template_stage_id)
      .single()
      .then(({ data }) => {
        setGuide(data?.detailed_guide as DetailedGuide | null);
        setLoading(false);
      });
  }, [isOpen, activity.template_stage_id, supabase]);

  if (!isOpen) return null;

  const t = (obj?: { en: string; hi: string }) =>
    obj ? (lang === "hi" ? obj.hi : obj.en) : "";

  const title = lang === "hi" ? activity.title_hi : (activity.title_en || activity.title_hi);

  // Build voice text
  const voiceText = guide
    ? [
        t(guide.what),
        t(guide.why),
        ...(guide.how_steps?.map((s) => t(s)) || []),
        ...(guide.warnings?.map((w) => t(w)) || []),
      ].join("। ")
    : activity.description_hi || activity.title_hi;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white pb-8 safe-bottom animate-in slide-in-from-bottom">
        {/* Handle bar */}
        <div className="sticky top-0 z-20 bg-white pt-3 pb-2 rounded-t-3xl">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        <div className="px-5 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {activity.scheduled_date && (
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date(activity.scheduled_date).toLocaleDateString(
                  lang === "hi" ? "hi-IN" : "en-IN",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </p>
            )}
          </div>

          {/* Voice button */}
          <button
            onClick={() => speak(voiceText, lang)}
            className="flex items-center gap-2 rounded-lg bg-khet-green/10 px-3 py-2 text-sm font-medium text-khet-green"
          >
            🔊 {lang === "hi" ? "सुनें" : "Listen"}
          </button>

          {loading && (
            <div className="flex justify-center py-8">
              <svg className="h-6 w-6 animate-spin text-khet-green" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {/* Guide content */}
          {guide ? (
            <>
              {/* What */}
              {guide.what && (
                <section>
                  <h3 className="text-lg font-bold text-khet-green mb-1">
                    {lang === "hi" ? "क्या करना है" : "What to do"}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{t(guide.what)}</p>
                </section>
              )}

              {/* Why */}
              {guide.why && (
                <section>
                  <h3 className="text-lg font-bold text-khet-green mb-1">
                    {lang === "hi" ? "क्यों ज़रूरी है" : "Why it matters"}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{t(guide.why)}</p>
                </section>
              )}

              {/* How steps */}
              {guide.how_steps && guide.how_steps.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-khet-green mb-2">
                    {lang === "hi" ? "कैसे करें" : "How to do it"}
                  </h3>
                  <ol className="space-y-2">
                    {guide.how_steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-gray-700">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-khet-green text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{t(step)}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Warnings */}
              {guide.warnings && guide.warnings.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-red-600 mb-2">
                    {lang === "hi" ? "सावधानी" : "Warnings"}
                  </h3>
                  <div className="space-y-2">
                    {guide.warnings.map((w, i) => (
                      <div key={i} className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                        ⚠️ {t(w)}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Products */}
              {guide.products && guide.products.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-khet-green mb-2">
                    {lang === "hi" ? "ज़रूरी सामान" : "Products needed"}
                  </h3>
                  <div className="space-y-2">
                    {guide.products.map((p, i) => (
                      <div key={i} className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-sm text-gray-600">
                          {lang === "hi" ? "मात्रा" : "Dosage"}: {p.dosage}
                        </p>
                        {p.cost_approx && (
                          <p className="text-sm text-gray-500">
                            {lang === "hi" ? "अनुमानित कीमत" : "Approx cost"}: {p.cost_approx}
                          </p>
                        )}
                        {p.where && (
                          <p className="text-sm text-gray-500">
                            {lang === "hi" ? "कहां से" : "Where"}: {p.where}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Organic alternative */}
              {guide.organic_alternative && (
                <section>
                  <h3 className="text-lg font-bold text-green-700 mb-1">
                    {lang === "hi" ? "देसी / जैविक विकल्प" : "Organic alternative"}
                  </h3>
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    🌿 {t(guide.organic_alternative)}
                  </div>
                </section>
              )}

              {/* Science */}
              {guide.science && (
                <section>
                  <h3 className="text-lg font-bold text-blue-700 mb-1">
                    {lang === "hi" ? "विज्ञान" : "The science"}
                  </h3>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                    🧪 {t(guide.science)}
                  </div>
                </section>
              )}
            </>
          ) : !loading ? (
            /* Fallback for activities without detailed guide */
            <section>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {lang === "hi"
                  ? activity.description_hi || activity.title_hi
                  : activity.description_en || activity.title_en || activity.title_hi}
              </p>
            </section>
          ) : null}

          {/* Action buttons */}
          {activity.status === "scheduled" && (
            <div className="flex gap-3 pt-2">
              {onSkip && (
                <button
                  onClick={() => { onSkip(); onClose(); }}
                  className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 text-lg font-semibold text-gray-600"
                >
                  {lang === "hi" ? "छोड़ें" : "Skip"}
                </button>
              )}
              {onComplete && (
                <button
                  onClick={() => { onComplete(); onClose(); }}
                  className="flex-[2] rounded-xl bg-khet-green px-4 py-3 text-lg font-bold text-white shadow"
                >
                  {lang === "hi" ? "पूरा हुआ ✅" : "Mark Done ✅"}
                </button>
              )}
            </div>
          )}

          {/* Source citation */}
          <p className="text-center text-xs text-gray-400 pt-2">
            {lang === "hi"
              ? "स्रोत: ICAR, CCS HAU हिसार, PAU लुधियाना, NHB"
              : "Source: ICAR, CCS HAU Hisar, PAU Ludhiana, NHB"}
          </p>
        </div>
      </div>
    </div>
  );
}
