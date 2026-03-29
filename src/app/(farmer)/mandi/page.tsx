"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useFarmData } from "@/hooks/useFarmData";

type MandiEntry = {
  mandi: string;
  district: string;
  state: string;
  price: number;
  date: string;
};

type PriceSummary = {
  bestMandi: { name: string; district: string; price: number } | null;
  avgPrice: number;
  trend: "rising" | "falling" | "stable";
  lastUpdated: string | null;
  totalMandis: number;
};

type MandiResponse = {
  crop: string;
  prices: MandiEntry[];
  summary: PriceSummary;
  isStale: boolean;
};

const TREND_CONFIG = {
  rising: { hi: "बढ़ रहे हैं ↑", en: "Rising ↑", color: "text-green-600", bg: "bg-green-50" },
  falling: { hi: "गिर रहे हैं ↓", en: "Falling ↓", color: "text-red-600", bg: "bg-red-50" },
  stable: { hi: "स्थिर →", en: "Stable →", color: "text-gray-600", bg: "bg-gray-50" },
};

export default function MandiPage() {
  const { lang } = useLanguage();
  const { farm } = useFarmData();

  const [data, setData] = useState<MandiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const params = new URLSearchParams({ crop: "apple_ber" });
        if (farm?.state) params.set("state", farm.state);

        const res = await fetch(`/api/mandi/prices?${params}`);
        if (!res.ok) throw new Error("Failed");

        const json = await res.json();
        setData(json);
      } catch {
        setError(
          lang === "hi"
            ? "मंडी भाव लोड नहीं हो पाए"
            : "Failed to load mandi prices"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [farm?.state, lang]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-4">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-khet-green" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-2 text-gray-500">
            {lang === "hi" ? "मंडी भाव लोड हो रहे हैं..." : "Loading mandi prices..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-khet-green mb-4">
          {lang === "hi" ? "मंडी भाव" : "Mandi Prices"}
        </h1>
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-center">
          <p className="text-lg text-yellow-800">{error}</p>
          <p className="mt-2 text-sm text-yellow-600">
            {lang === "hi"
              ? "कृपया बाद में फिर से कोशिश करें"
              : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const prices = data?.prices || [];
  const trend = summary?.trend || "stable";
  const trendConfig = TREND_CONFIG[trend];

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-khet-green">
        {lang === "hi" ? "मंडी भाव" : "Mandi Prices"}
      </h1>

      {/* Summary card */}
      {summary && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          {/* Best mandi */}
          {summary.bestMandi && (
            <div className="mb-3">
              <p className="text-sm text-gray-500">
                {lang === "hi" ? "सबसे अच्छा भाव" : "Best Price Today"}
              </p>
              <p className="text-3xl font-bold text-khet-green">
                ₹{summary.bestMandi.price.toLocaleString("en-IN")}
                <span className="text-sm font-normal text-gray-500">/क्विंटल</span>
              </p>
              <p className="text-sm text-gray-600">
                {summary.bestMandi.name}, {summary.bestMandi.district}
              </p>
            </div>
          )}

          {/* Trend + avg */}
          <div className="flex items-center gap-3">
            <div className={`rounded-full px-3 py-1 text-sm font-medium ${trendConfig.bg} ${trendConfig.color}`}>
              {lang === "hi" ? trendConfig.hi : trendConfig.en}
            </div>
            {summary.avgPrice > 0 && (
              <p className="text-sm text-gray-500">
                {lang === "hi" ? "औसत" : "Avg"}: ₹{summary.avgPrice.toLocaleString("en-IN")}/
                {lang === "hi" ? "क्विंटल" : "quintal"}
              </p>
            )}
          </div>

          {/* Last updated */}
          {summary.lastUpdated && (
            <p className="mt-2 text-xs text-gray-400">
              {lang === "hi" ? "अपडेट" : "Updated"}: {summary.lastUpdated}
              {data?.isStale && (
                <span className="ml-2 text-yellow-500">
                  ({lang === "hi" ? "पुराना डेटा" : "stale data"})
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Price recommendation */}
      {summary?.bestMandi && trend === "rising" && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="font-bold text-green-700">
            {lang === "hi"
              ? "💰 अभी बेचने का अच्छा मौका — भाव बढ़ रहे हैं!"
              : "💰 Good time to sell — prices are rising!"}
          </p>
        </div>
      )}

      {trend === "falling" && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
          <p className="font-bold text-yellow-700">
            {lang === "hi"
              ? "⚠️ भाव गिर रहे हैं — जल्दी बेचें या रुकें"
              : "⚠️ Prices are falling — sell soon or hold"}
          </p>
        </div>
      )}

      {/* Mandi list */}
      <div>
        <h2 className="font-bold text-lg mb-2">
          {lang === "hi"
            ? `मंडी भाव (${prices.length} मंडी)`
            : `Mandi Prices (${prices.length} mandis)`}
        </h2>

        {prices.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-6 text-center">
            <p className="text-lg text-gray-500">
              {lang === "hi"
                ? "आज कोई भाव उपलब्ध नहीं"
                : "No prices available today"}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {lang === "hi"
                ? "data.gov.in API key जोड़ने के बाद भाव दिखेंगे"
                : "Prices will appear after adding data.gov.in API key"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {prices.map((entry, i) => (
              <div
                key={`${entry.mandi}-${i}`}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  i === 0
                    ? "border-green-200 bg-green-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-900">{entry.mandi}</p>
                  <p className="text-xs text-gray-500">
                    {entry.district}, {entry.state}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${i === 0 ? "text-green-700" : "text-gray-900"}`}>
                    ₹{entry.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400">
                    /{lang === "hi" ? "क्विंटल" : "quintal"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apple Ber premium note */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
        <p className="text-sm text-blue-800">
          {lang === "hi"
            ? "📌 ये भाव सामान्य बेर (Ber) के हैं। थाई एप्पल बेर को मंडी में 2-3 गुना ज़्यादा भाव मिलता है। अपनी किस्म के हिसाब से भाव लगाएं।"
            : "📌 These are general Ber prices. Thai Apple Ber typically fetches 2-3x premium in mandis. Adjust for your variety."}
        </p>
      </div>

      {/* Info footer */}
      <p className="text-center text-xs text-gray-400">
        {lang === "hi"
          ? "स्रोत: data.gov.in (AGMARKNET)"
          : "Source: data.gov.in (AGMARKNET)"}
      </p>
    </div>
  );
}
