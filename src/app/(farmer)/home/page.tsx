"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useVoice } from "@/hooks/useVoice";
import { useFarmData } from "@/hooks/useFarmData";
import { BigActionCard } from "@/components/farmer/BigActionCard";

interface WeatherData {
  temp: number | null;
  description: string;
}

export default function FarmerHome() {
  const { lang, strings } = useLanguage();
  const { speak } = useVoice();
  const { currentStage, upcomingActivities, latitude, longitude, loading } =
    useFarmData();
  const [farmerName, setFarmerName] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  // Fetch user's actual name from profile
  useEffect(() => {
    async function fetchName() {
      const supabase = supabaseRef.current;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile?.full_name) {
          setFarmerName(profile.full_name);
        }
      }
    }
    fetchName();
  }, []);

  const [weather, setWeather] = useState<WeatherData>({
    temp: null,
    description: "",
  });

  // Fetch weather using farm's GPS coordinates
  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        const params = new URLSearchParams();
        if (latitude) params.set("lat", String(latitude));
        if (longitude) params.set("lon", String(longitude));

        const res = await fetch(`/api/weather/forecast?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.current) {
          setWeather({
            temp: data.current.temperature ?? null,
            description:
              lang === "hi"
                ? data.current.weather_description_hi
                : data.current.weather_description_en,
          });
        }
      } catch {
        setWeather({
          temp: null,
          description: lang === "hi" ? "मौसम उपलब्ध नहीं" : "Weather unavailable",
        });
      }
    }

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [lang, latitude, longitude]);

  // Greeting
  const greeting = strings.home.greeting;
  const displayName = farmerName || (lang === "hi" ? "किसान" : "Farmer");

  // Crop stage display
  const stageLabel = loading
    ? strings.common.loading
    : currentStage
      ? lang === "hi"
        ? currentStage.stage_name_hi
        : currentStage.stage_name_en
      : lang === "hi"
        ? "फसल जानकारी नहीं मिली"
        : "No crop data";

  // First upcoming activity as description
  const stageDescription =
    upcomingActivities.length > 0
      ? lang === "hi"
        ? upcomingActivities[0].title_hi
        : upcomingActivities[0].title_en || upcomingActivities[0].title_hi
      : "";

  // Irrigation display
  const irrigationBlocked = currentStage?.irrigation_status === "blocked";
  const irrigationLabel = irrigationBlocked
    ? strings.irrigation.blocked
    : strings.irrigation.allowed;
  const irrigationReason = currentStage
    ? lang === "hi"
      ? currentStage.irrigation_reason_hi
      : currentStage.irrigation_reason_en
    : "";

  // Weather display
  const weatherTemp =
    weather.temp !== null
      ? `${weather.temp}°C`
      : lang === "hi"
        ? "लोड हो रहा..."
        : "Loading...";

  // Disease risk badge
  const diseaseBadge = currentStage
    ? currentStage.disease_risk === "critical"
      ? lang === "hi"
        ? "खतरा!"
        : "Alert!"
      : currentStage.disease_risk === "high"
        ? lang === "hi"
          ? "सावधान"
          : "Caution"
        : undefined
    : undefined;

  // Pending task count
  const taskBadge =
    upcomingActivities.length > 0 ? String(upcomingActivities.length) : undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Greeting ─── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {greeting}, {displayName}
        </h2>
        <button
          onClick={() => speak(`${greeting} ${displayName}`, lang)}
          className="touch-target flex items-center justify-center rounded-full bg-khet-green/10 p-2 text-xl active:bg-khet-green/20"
          aria-label={lang === "hi" ? "सुनें" : "Listen"}
        >
          🔈
        </button>
      </div>

      {/* ─── Current Crop Stage Card ─── */}
      <div className="rounded-2xl border border-khet-green/20 bg-white p-4 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            🌱
          </span>
          <span className="text-sm font-medium text-gray-500">
            {strings.calendar.title}
          </span>
        </div>
        <h3 className="text-lg font-bold text-khet-green">{stageLabel}</h3>
        {stageDescription && (
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {stageDescription}
          </p>
        )}
        {/* Disease risk indicator */}
        {currentStage && currentStage.disease_risk !== "low" && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                currentStage.disease_risk === "critical"
                  ? "bg-khet-red"
                  : currentStage.disease_risk === "high"
                    ? "bg-khet-orange"
                    : "bg-khet-yellow"
              }`}
            />
            <span className="text-xs font-medium text-gray-500">
              {currentStage.disease_alerts_hi?.length > 0
                ? lang === "hi"
                  ? currentStage.disease_alerts_hi[0]
                  : currentStage.disease_alerts_en?.[0] || ""
                : ""}
            </span>
          </div>
        )}
      </div>

      {/* ─── 2x2 Action Cards Grid ─── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Scan Card */}
        <BigActionCard
          title={strings.home.scan_crop}
          description={strings.home.scan_desc}
          icon={<span>📷</span>}
          href="/scan"
          bgColor="var(--khet-green)"
          badge={diseaseBadge}
        />

        {/* Tasks Card */}
        <BigActionCard
          title={strings.home.todays_tasks}
          description={strings.home.tasks_desc}
          icon={<span>📋</span>}
          href="/tasks"
          bgColor="var(--khet-orange)"
          badge={taskBadge}
        />

        {/* Weather Card */}
        <div className="action-card flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-md bg-khet-blue">
          <div className="text-3xl" aria-hidden="true">
            ☀️
          </div>
          <div className="mt-auto">
            <p className="text-2xl font-bold text-white">{weatherTemp}</p>
            <h3 className="text-lg font-bold leading-snug text-white">
              {strings.home.weather}
            </h3>
            <p className="mt-0.5 text-sm leading-snug text-white/80">
              {weather.description || strings.home.weather_desc}
            </p>
          </div>
        </div>

        {/* Irrigation / Water Status Card */}
        <BigActionCard
          title={strings.home.water_status}
          description={irrigationLabel}
          icon={<span>{irrigationBlocked ? "🚫" : "💧"}</span>}
          href="/paani"
          bgColor={
            irrigationBlocked ? "var(--khet-red)" : "var(--khet-green)"
          }
          badge={
            irrigationBlocked
              ? lang === "hi"
                ? "रुको!"
                : "Stop!"
              : undefined
          }
        />
      </div>

      {/* ─── Irrigation Reason (below cards) ─── */}
      {irrigationReason && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            irrigationBlocked
              ? "bg-red-50 text-khet-red"
              : "bg-green-50 text-khet-green"
          }`}
        >
          {irrigationBlocked ? "⚠️ " : "✅ "}
          {irrigationReason}
        </div>
      )}
    </div>
  );
}
