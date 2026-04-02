"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useFarmData } from "@/hooks/useFarmData";
import type { PriceAlert } from "@/types/database";

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
  const { lang, strings } = useLanguage();
  const { farm, cropKey } = useFarmData();

  const [data, setData] = useState<MandiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Price alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.alerts || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  async function saveAlert() {
    if (!alertPrice || Number(alertPrice) <= 0) return;
    setAlertSaving(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_key: cropKey || "apple_ber",
          target_price: Number(alertPrice),
        }),
      });
      if (res.ok) {
        setAlertMessage(strings.mandi.alert_saved);
        setAlertPrice("");
        setShowAlertForm(false);
        fetchAlerts();
        setTimeout(() => setAlertMessage(null), 3000);
      }
    } catch { /* ignore */ }
    setAlertSaving(false);
  }

  async function deleteAlert(id: string) {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  useEffect(() => {
    async function fetchPrices() {
      try {
        const params = new URLSearchParams({ crop: cropKey || "apple_ber" });
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
  }, [farm?.state, cropKey, lang]);

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

      {/* Alert triggered indicator */}
      {alerts.length > 0 && data?.summary?.bestMandi && alerts.some((a) => data.summary.bestMandi!.price >= a.target_price) && (
        <div className="rounded-xl bg-green-100 border-2 border-green-400 p-4 text-center">
          <p className="text-lg font-bold text-green-800">
            🔔 {strings.mandi.alert_triggered}
          </p>
        </div>
      )}

      {/* Success message */}
      {alertMessage && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center text-green-700 font-medium">
          {alertMessage}
        </div>
      )}

      {/* Price Alerts Section */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">
            {strings.mandi.alert_active}
          </h2>
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="min-h-[40px] px-4 bg-khet-green text-white text-sm font-semibold rounded-xl active:bg-green-800"
          >
            {showAlertForm ? strings.common.cancel : strings.mandi.set_alert}
          </button>
        </div>

        {/* Alert creation form */}
        {showAlertForm && (
          <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {strings.mandi.alert_price}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="₹ 3000"
                className="flex-1 min-h-[44px] px-3 rounded-lg border border-gray-300 text-lg"
                min="1"
              />
              <button
                onClick={saveAlert}
                disabled={alertSaving || !alertPrice}
                className="min-h-[44px] px-5 bg-khet-green text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {alertSaving ? "..." : strings.common.save}
              </button>
            </div>
          </div>
        )}

        {/* Active alerts list */}
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">
            {strings.mandi.no_alerts}
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => {
              const triggered = data?.summary?.bestMandi && data.summary.bestMandi.price >= alert.target_price;
              return (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    triggered ? "border-green-300 bg-green-50" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div>
                    <p className={`font-bold ${triggered ? "text-green-700" : "text-gray-800"}`}>
                      ₹{alert.target_price.toLocaleString("en-IN")}/{lang === "hi" ? "क्विंटल" : "quintal"}
                    </p>
                    {triggered && (
                      <p className="text-xs text-green-600 font-medium">
                        {lang === "hi" ? "भाव लक्ष्य से ऊपर!" : "Price above target!"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="min-h-[36px] px-3 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 active:bg-red-100"
                  >
                    {lang === "hi" ? "हटाएं" : "Delete"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
