"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useVoice } from "@/hooks/useVoice";
import type { DiseaseScan } from "@/types/database";

const SEVERITY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  none: { label: "कोई नहीं", bg: "bg-gray-100", text: "text-gray-700" },
  low: { label: "कम", bg: "bg-green-100", text: "text-green-800" },
  medium: { label: "मध्यम", bg: "bg-yellow-100", text: "text-yellow-800" },
  high: { label: "ज़्यादा", bg: "bg-orange-100", text: "text-orange-800" },
  critical: { label: "गंभीर", bg: "bg-red-100", text: "text-red-800" },
};

const URGENCY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  immediate: {
    label: "तुरंत करें!",
    bg: "bg-red-100",
    text: "text-red-800",
  },
  within_3_days: {
    label: "3 दिन में करें",
    bg: "bg-orange-100",
    text: "text-orange-800",
  },
  within_week: {
    label: "इस हफ्ते करें",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  routine: {
    label: "सामान्य देखभाल",
    bg: "bg-green-100",
    text: "text-green-800",
  },
};

export default function ScanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { speak, stop } = useVoice();

  const [scan, setScan] = useState<DiseaseScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    async function fetchScan() {
      const { data, error: fetchError } = await supabase
        .from("disease_scans")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        console.error("Failed to fetch scan:", fetchError);
        setError("जांच का नतीजा नहीं मिला");
        setLoading(false);
        return;
      }

      setScan(data as DiseaseScan);
      setLoading(false);
    }

    fetchScan();
  }, [id, supabase]);

  const buildSpeechText = useCallback((s: DiseaseScan): string => {
    const parts: string[] = [];

    if (s.disease_name_hi) {
      parts.push(`बीमारी का नाम: ${s.disease_name_hi}।`);
    }
    if (s.severity) {
      const sev = SEVERITY_CONFIG[s.severity];
      parts.push(`गंभीरता: ${sev?.label || s.severity}।`);
    }
    if (s.diagnosis_hi) {
      parts.push(`पहचान: ${s.diagnosis_hi}`);
    }
    if (s.treatment_hi) {
      parts.push(`इलाज: ${s.treatment_hi}`);
    }
    if (s.organic_treatment_hi) {
      parts.push(`देसी इलाज: ${s.organic_treatment_hi}`);
    }
    if (s.prevention_hi) {
      parts.push(`बचाव: ${s.prevention_hi}`);
    }

    if (parts.length === 0) {
      parts.push("कोई बीमारी नहीं मिली। फसल ठीक है!");
    }

    return parts.join(" ");
  }, []);

  const handleSpeak = () => {
    if (!scan) return;

    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
      return;
    }

    const text = buildSpeechText(scan);
    speak(text, "hi");
    setIsSpeaking(true);

    // Listen for speech end (approximate)
    // speechSynthesis doesn't reliably fire onend on all devices,
    // so we reset after a timeout based on text length
    const estimatedDuration = Math.max(5000, text.length * 80);
    setTimeout(() => setIsSpeaking(false), estimatedDuration);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mb-4" />
        <p className="text-xl text-gray-600">नतीजा लोड हो रहा है...</p>
      </div>
    );
  }

  // Error state
  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-5xl mb-4">😔</div>
        <p className="text-xl text-red-600 text-center mb-6">
          {error || "कुछ गलत हो गया"}
        </p>
        <button
          onClick={() => router.push("/scan")}
          className="min-h-[48px] px-8 bg-green-600 text-white text-lg font-semibold rounded-xl"
        >
          फिर से जांच करें
        </button>
      </div>
    );
  }

  // Still analyzing
  if (scan.scan_status === "analyzing" || scan.scan_status === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col items-center justify-center px-4">
        <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mb-4" />
        <p className="text-xl font-semibold text-amber-800">
          जांच हो रही है...
        </p>
        <p className="text-lg text-amber-600 mt-2">
          थोड़ा इंतज़ार करें
        </p>
      </div>
    );
  }

  // Failed state
  if (scan.scan_status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-5xl mb-4">❌</div>
        <p className="text-xl text-red-700 text-center mb-2">
          जांच नहीं हो पाई
        </p>
        <p className="text-lg text-red-500 text-center mb-6">
          फिर से अच्छी फोटो लेकर कोशिश करें
        </p>
        <button
          onClick={() => router.push("/scan")}
          className="min-h-[48px] px-8 bg-green-600 text-white text-lg font-semibold rounded-xl"
        >
          फिर से जांच करें
        </button>
      </div>
    );
  }

  // Determine if disease was detected
  const diseaseDetected =
    scan.disease_name_hi && scan.severity && scan.severity !== "none";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-8">
      {/* Photo */}
      {scan.photo_url && (
        <div className="w-full max-h-64 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scan.photo_url}
            alt="जांच की गई फोटो"
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      <div className="px-4 pt-4">
        {/* Voice Button */}
        <button
          onClick={handleSpeak}
          className={`w-full min-h-[48px] mb-4 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors ${
            isSpeaking
              ? "bg-red-100 text-red-700 border-2 border-red-300"
              : "bg-blue-100 text-blue-700 border-2 border-blue-300"
          }`}
        >
          <span className="text-xl">{isSpeaking ? "🔇" : "🔊"}</span>
          {isSpeaking ? "आवाज़ बंद करें" : "सुनें (आवाज़ में)"}
        </button>

        {diseaseDetected ? (
          <>
            {/* Disease Name */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-red-800">
                {scan.disease_name_hi}
              </h1>
              {scan.disease_name_en && (
                <p className="text-lg text-gray-500">{scan.disease_name_en}</p>
              )}
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-3 mb-5">
              {/* Severity Badge */}
              {scan.severity && SEVERITY_CONFIG[scan.severity] && (
                <span
                  className={`px-4 py-2 rounded-full text-lg font-semibold ${SEVERITY_CONFIG[scan.severity].bg} ${SEVERITY_CONFIG[scan.severity].text}`}
                >
                  गंभीरता: {SEVERITY_CONFIG[scan.severity].label}
                </span>
              )}

              {/* Urgency Badge */}
              {scan.urgency && URGENCY_CONFIG[scan.urgency] && (
                <span
                  className={`px-4 py-2 rounded-full text-lg font-semibold ${URGENCY_CONFIG[scan.urgency].bg} ${URGENCY_CONFIG[scan.urgency].text}`}
                >
                  {URGENCY_CONFIG[scan.urgency].label}
                </span>
              )}
            </div>

            {/* Confidence */}
            {scan.confidence_score != null && (
              <div className="mb-5 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg text-gray-600">AI का भरोसा</span>
                  <span className="text-lg font-bold text-gray-800">
                    {Math.round(scan.confidence_score * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 rounded-full h-3 transition-all"
                    style={{
                      width: `${Math.round(scan.confidence_score * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Diagnosis */}
            {scan.diagnosis_hi && (
              <section className="mb-5">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  पहचान
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-100">
                  {scan.diagnosis_hi}
                </p>
              </section>
            )}

            {/* Treatment Steps */}
            {scan.treatment_hi && (
              <section className="mb-5">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  इलाज
                </h2>
                <div className="bg-white p-4 rounded-xl border border-green-100">
                  <ol className="space-y-2">
                    {scan.treatment_hi.split("\n").filter(Boolean).map((step, i) => (
                      <li key={i} className="flex gap-3 text-lg text-gray-700">
                        <span className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-base font-bold">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step.replace(/^\d+\.\s*/, "")}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            )}

            {/* Organic Treatment */}
            {scan.organic_treatment_hi && (
              <section className="mb-5">
                <h2 className="text-xl font-bold text-green-800 mb-2">
                  देसी / जैविक इलाज
                </h2>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-lg text-green-800 leading-relaxed">
                    {scan.organic_treatment_hi}
                  </p>
                </div>
              </section>
            )}

            {/* Products */}
            {scan.products_recommended &&
              scan.products_recommended.length > 0 && (
                <section className="mb-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    दवाइयां / उत्पाद
                  </h2>
                  <div className="space-y-3">
                    {scan.products_recommended.map((product, i) => (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                      >
                        <h3 className="text-lg font-bold text-gray-800">
                          {product.name_hi}
                        </h3>
                        {product.name_en && (
                          <p className="text-base text-gray-500">
                            {product.name_en}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          <p className="text-lg text-gray-700">
                            <span className="font-semibold">मात्रा:</span>{" "}
                            {product.dosage}
                          </p>
                          <p className="text-lg text-gray-700">
                            <span className="font-semibold">कैसे डालें:</span>{" "}
                            {product.application}
                          </p>
                          <p className="text-lg text-gray-700">
                            <span className="font-semibold">कहां से लें:</span>{" "}
                            {product.where_to_buy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* Prevention */}
            {scan.prevention_hi && (
              <section className="mb-5">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  बचाव के उपाय
                </h2>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-lg text-blue-800 leading-relaxed">
                    {scan.prevention_hi}
                  </p>
                </div>
              </section>
            )}
          </>
        ) : (
          /* No Disease Detected */
          <div className="text-center py-8">
            <div className="text-7xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">
              कोई बीमारी नहीं — फसल ठीक है!
            </h1>
            <p className="text-lg text-green-600">
              आपकी फसल स्वस्थ दिख रही है
            </p>
            {scan.diagnosis_hi && (
              <p className="text-lg text-gray-600 mt-4 bg-green-50 p-4 rounded-xl">
                {scan.diagnosis_hi}
              </p>
            )}
          </div>
        )}

        {/* Back / Scan Again Button */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push("/scan")}
            className="w-full min-h-[56px] bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-2xl">📷</span>
            फिर से जांच करें
          </button>
          <button
            onClick={() => router.back()}
            className="w-full min-h-[48px] bg-white hover:bg-gray-50 text-gray-600 text-lg font-semibold rounded-xl border border-gray-200 transition-colors"
          >
            वापस जाएं
          </button>
        </div>
      </div>
    </div>
  );
}
