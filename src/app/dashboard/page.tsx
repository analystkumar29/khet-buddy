"use client";

import { useEffect, useState } from "react";
import { useFarmData } from "@/hooks/useFarmData";

type WeatherData = {
  current: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    rain_probability: number;
    weather_description_en: string;
  };
};

export default function DashboardPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const { currentStage, upcomingActivities, farm, latitude, longitude, loading } =
    useFarmData();

  useEffect(() => {
    const params = new URLSearchParams();
    if (latitude) params.set("lat", String(latitude));
    if (longitude) params.set("lon", String(longitude));

    fetch(`/api/weather/forecast?${params}`)
      .then((r) => r.json())
      .then(setWeather)
      .catch(console.error);
  }, [latitude, longitude]);

  const irrigationBlocked = currentStage?.irrigation_status === "blocked";
  const location = farm
    ? `${farm.district || "Unknown"}, ${farm.state || ""}`
    : "Loading...";

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Farm Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Current Stage</p>
          <p className="text-xl font-bold text-khet-green">
            {currentStage?.stage_name_en || "No crop data"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {currentStage?.stage_name_hi || ""}
          </p>
        </div>

        <div
          className={`rounded-xl p-5 shadow-sm border ${
            irrigationBlocked
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <p className="text-sm text-gray-500 mb-1">Irrigation Status</p>
          <p
            className={`text-xl font-bold ${
              irrigationBlocked ? "text-red-700" : "text-green-700"
            }`}
          >
            {irrigationBlocked ? "BLOCKED" : "ALLOWED"}
          </p>
          <p className="text-sm mt-1">
            {currentStage?.irrigation_reason_en || ""}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">
            Weather — {location}
          </p>
          {weather ? (
            <>
              <p className="text-xl font-bold">
                {weather.current.temperature}°C
              </p>
              <p className="text-sm text-gray-600">
                {weather.current.weather_description_en} • Humidity{" "}
                {weather.current.humidity}% • Rain{" "}
                {weather.current.rain_probability}%
              </p>
            </>
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </div>
      </div>

      {currentStage && currentStage.disease_risk !== "low" && (
        <div
          className={`rounded-xl p-5 border ${
            currentStage.disease_risk === "critical"
              ? "bg-red-50 border-red-200"
              : currentStage.disease_risk === "high"
                ? "bg-orange-50 border-orange-200"
                : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <h3 className="font-bold text-lg mb-2">
            Disease Risk: {currentStage.disease_risk.toUpperCase()}
          </h3>
          <ul className="space-y-1">
            {(currentStage.disease_alerts_en as string[]).map((alert, i) => (
              <li key={i} className="text-sm">
                ⚠️ {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcomingActivities.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-3">Upcoming Activities</h3>
          <ul className="space-y-2">
            {upcomingActivities.slice(0, 8).map((activity) => (
              <li
                key={activity.id}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <span className="flex items-start gap-2">
                  <span className="text-khet-green mt-0.5">●</span>
                  {activity.title_en || activity.title_hi}
                </span>
                <span className="shrink-0 text-gray-400">
                  {activity.scheduled_date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
