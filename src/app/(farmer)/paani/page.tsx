"use client";

import { useState, useEffect } from "react";
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

export default function PaaniPage() {
  const { lang } = useLanguage();
  const { currentStage, latitude, longitude, loading: farmLoading } = useFarmData();

  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);

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
    </div>
  );
}
