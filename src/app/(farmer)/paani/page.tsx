"use client";

import { useState, useEffect, useCallback } from "react";
import { useFarmData } from "@/hooks/useFarmData";
import { useLanguage } from "@/hooks/useLanguage";
import type { CurrentWeather, DailyForecast } from "@/lib/weather/open-meteo";

const IRRIGATION_STATUS_MAP: Record<
  string,
  { label_hi: string; label_en: string; color: string; bgColor: string; emoji: string }
> = {
  allowed: {
    label_hi: "पानी दें",
    label_en: "Irrigate",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    emoji: "💧",
  },
  blocked: {
    label_hi: "पानी न दें!",
    label_en: "NO Water!",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    emoji: "🚫",
  },
  careful: {
    label_hi: "सावधानी से पानी दें",
    label_en: "Water Carefully",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    emoji: "⚠️",
  },
  reduce: {
    label_hi: "पानी कम करें",
    label_en: "Reduce Water",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    emoji: "🟠",
  },
};

type SoilParam = {
  parameter: string;
  value: number | null;
  unit: string;
  status: "low" | "optimal" | "high" | "unknown";
  min: number;
  max: number;
  advice_en: string | null;
  advice_hi: string | null;
};

type SoilHealth = {
  hasData: boolean;
  latest: { source: string; reading_at: string } | null;
  parameters: SoilParam[];
  recommendations: { en: string; hi: string; urgency: string }[];
};

const PARAM_LABELS: Record<string, { en: string; hi: string; icon: string }> = {
  moisture: { en: "Moisture", hi: "नमी", icon: "💧" },
  nitrogen: { en: "Nitrogen", hi: "नाइट्रोजन", icon: "🟢" },
  phosphorus: { en: "Phosphorus", hi: "फ़ॉस्फ़ोरस", icon: "🟠" },
  potassium: { en: "Potassium", hi: "पोटैशियम", icon: "🟣" },
  ph: { en: "pH", hi: "pH", icon: "⚗️" },
  temperature: { en: "Soil Temp", hi: "मिट्टी तापमान", icon: "🌡️" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  low: { bg: "bg-yellow-50", text: "text-yellow-700", bar: "bg-yellow-400" },
  optimal: { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
  high: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-400" },
  unknown: { bg: "bg-gray-50", text: "text-gray-500", bar: "bg-gray-300" },
};

export default function PaaniPage() {
  const { lang, strings } = useLanguage();
  const { currentStage, farm, cropKey, latitude, longitude, loading: farmLoading } = useFarmData();

  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Soil health state
  const [soilHealth, setSoilHealth] = useState<SoilHealth | null>(null);
  const [soilLoading, setSoilLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [manualSource, setManualSource] = useState<"manual" | "soil_health_card">("manual");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const fetchSoilHealth = useCallback(async () => {
    if (!farm?.id) return;
    setSoilLoading(true);
    try {
      const params = new URLSearchParams({ farm_id: farm.id });
      if (cropKey) params.set("crop_key", cropKey);
      const res = await fetch(`/api/soil/health?${params}`);
      if (res.ok) {
        setSoilHealth(await res.json());
      }
    } catch { /* ignore */ }
    setSoilLoading(false);
  }, [farm?.id, cropKey]);

  useEffect(() => { fetchSoilHealth(); }, [fetchSoilHealth]);

  async function saveManualReading() {
    if (!farm?.id) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        farm_id: farm.id,
        source: manualSource,
      };
      if (manualValues.moisture) body.moisture_pct = Number(manualValues.moisture);
      if (manualValues.nitrogen) body.nitrogen_ppm = Number(manualValues.nitrogen);
      if (manualValues.phosphorus) body.phosphorus_ppm = Number(manualValues.phosphorus);
      if (manualValues.potassium) body.potassium_ppm = Number(manualValues.potassium);
      if (manualValues.ph) body.ph = Number(manualValues.ph);
      if (manualValues.temperature) body.temperature_c = Number(manualValues.temperature);

      const res = await fetch("/api/soil/readings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaveMsg(lang === "hi" ? "डेटा सेव हो गया!" : "Data saved!");
        setManualValues({});
        setShowManualForm(false);
        fetchSoilHealth();
        setTimeout(() => setSaveMsg(null), 3000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  useEffect(() => {
    async function fetchWeather() {
      try {
        const params = new URLSearchParams();
        if (latitude) params.set("lat", String(latitude));
        if (longitude) params.set("lon", String(longitude));

        const res = await fetch(`/api/weather/forecast?${params}`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data.current);
          setForecast(data.forecast || []);
        }
      } catch {
        // Show weather unavailable instead of blank
      } finally {
        setWeatherLoading(false);
      }
    }

    fetchWeather();
  }, [latitude, longitude]);

  const irrigationStatus = currentStage?.irrigation_status || "allowed";
  const statusConfig = IRRIGATION_STATUS_MAP[irrigationStatus] || IRRIGATION_STATUS_MAP.allowed;

  const rainExpected = forecast.length > 0 && forecast[0].rain_sum > 5;

  if (farmLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-4">
        <svg className="h-8 w-8 animate-spin text-khet-green" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-khet-green">
        {lang === "hi" ? "पानी / सिंचाई" : "Water / Irrigation"}
      </h1>

      {/* Main irrigation status card */}
      <div className={`rounded-2xl border-2 p-6 text-center ${statusConfig.bgColor}`}>
        <div className="text-5xl mb-3">{statusConfig.emoji}</div>
        <h2 className={`text-2xl font-bold ${statusConfig.color}`}>
          {lang === "hi" ? statusConfig.label_hi : statusConfig.label_en}
        </h2>
        {currentStage && (
          <p className="mt-2 text-gray-600">
            {lang === "hi"
              ? currentStage.irrigation_reason_hi
              : currentStage.irrigation_reason_en}
          </p>
        )}

        {/* Rain advisory */}
        {rainExpected && irrigationStatus !== "blocked" && (
          <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
            {lang === "hi"
              ? `🌧️ आज बारिश की संभावना (${forecast[0].rain_sum}mm) — पानी देने की ज़रूरत नहीं`
              : `🌧️ Rain expected today (${forecast[0].rain_sum}mm) — skip irrigation`}
          </div>
        )}
      </div>

      {/* Current crop stage */}
      {currentStage && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-khet-green">
            {lang === "hi" ? currentStage.stage_name_hi : currentStage.stage_name_en}
          </h3>
          <div className="mt-2 space-y-1">
            {(lang === "hi" ? currentStage.activities_hi : currentStage.activities_en).map(
              (activity: string, i: number) => (
                <p key={i} className="text-sm flex items-start gap-1.5">
                  <span className="text-khet-green mt-0.5">▸</span>
                  {activity}
                </p>
              )
            )}
          </div>

          {/* Disease alerts */}
          {((lang === "hi" ? currentStage.disease_alerts_hi : currentStage.disease_alerts_en) as string[]).length > 0 && (
            <div className="mt-3 bg-red-50 rounded-lg p-3">
              {((lang === "hi" ? currentStage.disease_alerts_hi : currentStage.disease_alerts_en) as string[]).map(
                (alert: string, i: number) => (
                  <p key={i} className="text-sm text-red-700">
                    ⚠️ {alert}
                  </p>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Weather unavailable */}
      {!weatherLoading && !weather && (
        <div className="rounded-2xl bg-gray-100 p-4 text-center text-gray-500">
          {lang === "hi" ? "मौसम की जानकारी उपलब्ध नहीं है" : "Weather data unavailable"}
        </div>
      )}

      {/* Weather */}
      {!weatherLoading && weather && (
        <div className="rounded-2xl bg-khet-blue p-4 text-white">
          <h3 className="font-bold text-lg mb-2">
            {lang === "hi" ? "मौसम" : "Weather"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-3xl font-bold">{weather.temperature}°C</p>
              <p className="text-sm text-white/80">
                {lang === "hi"
                  ? weather.weather_description_hi
                  : weather.weather_description_en}
              </p>
            </div>
            <div className="space-y-1 text-sm">
              <p>💧 {lang === "hi" ? "नमी" : "Humidity"}: {weather.humidity}%</p>
              <p>💨 {lang === "hi" ? "हवा" : "Wind"}: {weather.wind_speed} km/h</p>
              <p>🌧️ {lang === "hi" ? "बारिश" : "Rain"}: {weather.rain_probability}%</p>
            </div>
          </div>
        </div>
      )}

      {/* 7-day forecast */}
      {forecast.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-3">
            {lang === "hi" ? "7 दिन का पूर्वानुमान" : "7-Day Forecast"}
          </h3>
          <div className="space-y-2">
            {forecast.map((day, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                <span className="text-sm font-medium w-20">
                  {new Date(day.date).toLocaleDateString(
                    lang === "hi" ? "hi-IN" : "en-IN",
                    { weekday: "short", day: "numeric" }
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  {lang === "hi" ? day.description_hi : day.description_en}
                </span>
                <span className="text-sm font-medium">
                  {day.temp_min}°-{day.temp_max}°
                </span>
                <span
                  className={`text-xs font-medium ${
                    day.rain_probability > 60
                      ? "text-blue-600"
                      : day.rain_probability > 30
                        ? "text-blue-400"
                        : "text-gray-400"
                  }`}
                >
                  🌧️ {day.rain_probability}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Soil Health Section ─── */}
      <div className="border-t-2 border-khet-green/20 pt-4">
        <h2 className="text-2xl font-bold text-khet-green mb-3">
          {strings.soil.title}
        </h2>

        {/* Save confirmation */}
        {saveMsg && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center text-green-700 font-medium mb-3">
            {saveMsg}
          </div>
        )}

        {soilLoading ? (
          <div className="flex items-center justify-center py-6">
            <svg className="h-8 w-8 animate-spin text-khet-green" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : !soilHealth?.hasData ? (
          /* No data yet */
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 text-center">
            <p className="text-lg text-gray-500 mb-3">{strings.soil.no_data}</p>
            <button
              onClick={() => setShowManualForm(true)}
              className="min-h-[48px] px-6 bg-khet-green text-white text-lg font-semibold rounded-xl active:bg-green-800"
            >
              {strings.soil.add_reading}
            </button>
          </div>
        ) : (
          <>
            {/* Last reading meta */}
            {soilHealth.latest && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">
                  {strings.soil.last_reading}:{" "}
                  {new Date(soilHealth.latest.reading_at).toLocaleDateString(
                    lang === "hi" ? "hi-IN" : "en-IN",
                    { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
                  )}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  soilHealth.latest.source === "sensor"
                    ? "bg-blue-100 text-blue-700"
                    : soilHealth.latest.source === "soil_health_card"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                }`}>
                  {soilHealth.latest.source === "sensor"
                    ? strings.soil.source_sensor
                    : soilHealth.latest.source === "soil_health_card"
                      ? strings.soil.source_card
                      : strings.soil.source_manual}
                </span>
              </div>
            )}

            {/* Parameter cards grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {soilHealth.parameters.map((param) => {
                const label = PARAM_LABELS[param.parameter];
                const colors = STATUS_COLORS[param.status];
                if (!label) return null;
                // Calculate bar fill percentage
                const range = param.max - param.min;
                const fillPct = param.value !== null
                  ? Math.min(100, Math.max(0, ((param.value - param.min + range * 0.2) / (range * 1.4)) * 100))
                  : 0;
                return (
                  <div key={param.parameter} className={`rounded-xl border p-3 ${colors.bg}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg">{label.icon}</span>
                      <span className="text-xs font-medium text-gray-600">
                        {lang === "hi" ? label.hi : label.en}
                      </span>
                    </div>
                    <p className={`text-xl font-bold ${colors.text}`}>
                      {param.value !== null ? `${param.value}${param.unit}` : "—"}
                    </p>
                    {/* Status bar */}
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div className={`${colors.bar} rounded-full h-1.5 transition-all`} style={{ width: `${fillPct}%` }} />
                    </div>
                    <p className={`text-xs mt-0.5 ${colors.text}`}>
                      {param.status === "low" ? strings.soil.status_low
                        : param.status === "optimal" ? strings.soil.status_optimal
                        : param.status === "high" ? strings.soil.status_high
                        : "—"}
                      {param.value !== null && ` (${param.min}-${param.max}${param.unit})`}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Recommendations */}
            {soilHealth.recommendations.length > 0 && (
              <div className="space-y-2 mb-4">
                {soilHealth.recommendations.map((rec, i) => (
                  <div key={i} className={`rounded-xl p-3 border ${
                    rec.urgency === "high"
                      ? "bg-red-50 border-red-200"
                      : rec.urgency === "medium"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-blue-50 border-blue-200"
                  }`}>
                    <p className={`text-sm font-medium ${
                      rec.urgency === "high" ? "text-red-700"
                        : rec.urgency === "medium" ? "text-yellow-700"
                        : "text-blue-700"
                    }`}>
                      {rec.urgency === "high" ? "🚨 " : rec.urgency === "medium" ? "⚠️ " : "💡 "}
                      {lang === "hi" ? rec.hi : rec.en}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Accuracy note */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-3">
              <p className="text-xs text-amber-700">
                {strings.soil.accuracy_note}
              </p>
            </div>

            {/* Add new reading button */}
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="w-full min-h-[44px] bg-khet-green text-white font-semibold rounded-xl active:bg-green-800"
            >
              {showManualForm ? strings.common.cancel : strings.soil.add_reading}
            </button>
          </>
        )}

        {/* Manual entry form */}
        {showManualForm && (
          <div className="mt-3 rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
            {/* Source selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setManualSource("manual")}
                className={`flex-1 min-h-[40px] rounded-lg text-sm font-medium border ${
                  manualSource === "manual"
                    ? "bg-khet-green text-white border-khet-green"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {strings.soil.manual_entry}
              </button>
              <button
                onClick={() => setManualSource("soil_health_card")}
                className={`flex-1 min-h-[40px] rounded-lg text-sm font-medium border ${
                  manualSource === "soil_health_card"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {strings.soil.soil_health_card}
              </button>
            </div>

            {/* Input fields */}
            {[
              { key: "moisture", label: strings.soil.moisture, unit: "%", placeholder: "30" },
              { key: "nitrogen", label: strings.soil.nitrogen, unit: "ppm", placeholder: "200" },
              { key: "phosphorus", label: strings.soil.phosphorus, unit: "ppm", placeholder: "30" },
              { key: "potassium", label: strings.soil.potassium, unit: "ppm", placeholder: "200" },
              { key: "ph", label: strings.soil.ph, unit: "", placeholder: "7.5" },
              { key: "temperature", label: strings.soil.temperature, unit: "°C", placeholder: "28" },
            ].map((field) => (
              <div key={field.key} className="flex items-center gap-2">
                <label className="w-28 text-sm font-medium text-gray-700 flex-shrink-0">
                  {field.label}
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualValues[field.key] || ""}
                  onChange={(e) => setManualValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="flex-1 min-h-[40px] px-3 rounded-lg border border-gray-300 text-base"
                />
                {field.unit && <span className="text-sm text-gray-500 w-8">{field.unit}</span>}
              </div>
            ))}

            <button
              onClick={saveManualReading}
              disabled={saving || Object.values(manualValues).every((v) => !v)}
              className="w-full min-h-[48px] bg-khet-green text-white text-lg font-semibold rounded-xl disabled:opacity-50 active:bg-green-800"
            >
              {saving ? strings.common.loading : strings.common.save}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
