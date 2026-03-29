"use client";

import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useFarmData } from "@/hooks/useFarmData";
import type { FarmActivity } from "@/types/database";

export default function TasksPage() {
  const { lang, strings } = useLanguage();
  const { upcomingActivities, pastActivities, currentStage, loading, refetch } =
    useFarmData();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);

  async function handleAction(
    activity: FarmActivity,
    action: "complete" | "skip"
  ) {
    setActionLoading(activity.id);
    setAdvice(null);

    try {
      const res = await fetch("/api/farm/activities/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activity.id,
          action,
          actualDate: new Date().toISOString().split("T")[0],
        }),
      });

      const data = await res.json();
      if (data.advice) {
        setAdvice(data.advice);
      }
      refetch();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  }

  // Get this week's activities (next 7 days)
  const today = new Date();
  const weekLater = new Date(today);
  weekLater.setDate(weekLater.getDate() + 7);
  const todayStr = today.toISOString().split("T")[0];
  const weekStr = weekLater.toISOString().split("T")[0];

  const thisWeek = upcomingActivities.filter(
    (a) => a.scheduled_date && a.scheduled_date <= weekStr
  );

  const overdue = pastActivities.filter(
    (a) =>
      a.status === "scheduled" &&
      a.scheduled_date &&
      a.scheduled_date < todayStr
  );

  const recentlyDone = pastActivities
    .filter((a) => a.status === "completed" || a.status === "late")
    .slice(-5)
    .reverse();

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

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-khet-green">
        {strings.tasks.title}
      </h1>

      {/* Current Stage */}
      {currentStage && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-green-100">
          <h2 className="font-bold text-lg text-khet-green mb-1">
            {lang === "hi"
              ? currentStage.stage_name_hi
              : currentStage.stage_name_en}
          </h2>
          {currentStage.disease_risk !== "low" && (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                currentStage.disease_risk === "critical"
                  ? "bg-red-100 text-red-700"
                  : currentStage.disease_risk === "high"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {lang === "hi" ? "बीमारी का खतरा" : "Disease risk"}: {currentStage.disease_risk}
            </span>
          )}
        </div>
      )}

      {/* Advice notification */}
      {advice && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">{advice}</p>
          <button
            onClick={() => setAdvice(null)}
            className="mt-2 text-xs text-yellow-600 underline"
          >
            {lang === "hi" ? "ठीक है" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Overdue activities */}
      {overdue.length > 0 && (
        <div>
          <h2 className="font-bold text-lg text-red-600 mb-2">
            {lang === "hi" ? `बाकी काम (${overdue.length})` : `Overdue (${overdue.length})`}
          </h2>
          <div className="space-y-2">
            {overdue.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                lang={lang}
                isOverdue
                loading={actionLoading === activity.id}
                onComplete={() => handleAction(activity, "complete")}
                onSkip={() => handleAction(activity, "skip")}
                strings={strings}
              />
            ))}
          </div>
        </div>
      )}

      {/* This week's tasks */}
      <div>
        <h2 className="font-bold text-lg mb-2">
          {lang === "hi"
            ? `इस हफ्ते के काम (${thisWeek.length})`
            : `This Week (${thisWeek.length})`}
        </h2>
        {thisWeek.length === 0 ? (
          <p className="text-gray-500">
            {lang === "hi"
              ? "इस हफ्ते कोई काम नहीं"
              : "No tasks this week"}
          </p>
        ) : (
          <div className="space-y-2">
            {thisWeek.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                lang={lang}
                loading={actionLoading === activity.id}
                onComplete={() => handleAction(activity, "complete")}
                onSkip={() => handleAction(activity, "skip")}
                strings={strings}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recently completed */}
      {recentlyDone.length > 0 && (
        <div>
          <h2 className="font-bold text-lg text-gray-500 mb-2">
            {lang === "hi"
              ? `पूरे हुए (${recentlyDone.length})`
              : `Completed (${recentlyDone.length})`}
          </h2>
          <div className="space-y-2">
            {recentlyDone.map((activity) => (
              <div
                key={activity.id}
                className="rounded-xl bg-gray-50 p-3 border border-gray-100 opacity-60"
              >
                <p className="line-through text-gray-600">
                  {lang === "hi"
                    ? activity.title_hi
                    : activity.title_en || activity.title_hi}
                </p>
                {activity.deviation_days !== 0 && (
                  <p className="text-xs text-orange-500 mt-0.5">
                    {activity.deviation_days > 0
                      ? `${activity.deviation_days} दिन देर से`
                      : `${Math.abs(activity.deviation_days)} दिन पहले`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityCard({
  activity,
  lang,
  isOverdue,
  loading,
  onComplete,
  onSkip,
  strings,
}: {
  activity: FarmActivity;
  lang: string;
  isOverdue?: boolean;
  loading: boolean;
  onComplete: () => void;
  onSkip: () => void;
  strings: ReturnType<typeof import("@/hooks/useLanguage").useLanguage>["strings"];
}) {
  return (
    <div
      className={`rounded-xl bg-white p-4 shadow-sm border ${
        isOverdue ? "border-red-200" : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className={`font-medium ${isOverdue ? "text-red-700" : "text-gray-900"}`}>
            {lang === "hi"
              ? activity.title_hi
              : activity.title_en || activity.title_hi}
          </p>
          {activity.scheduled_date && (
            <p className="mt-0.5 text-sm text-gray-500">
              {new Date(activity.scheduled_date).toLocaleDateString(
                lang === "hi" ? "hi-IN" : "en-IN",
                { day: "numeric", month: "short" }
              )}
              {isOverdue && (
                <span className="ml-2 text-red-500 font-medium">
                  {lang === "hi" ? "देर हो गई!" : "Overdue!"}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={onSkip}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 disabled:opacity-50"
          >
            {lang === "hi" ? "छोड़ें" : "Skip"}
          </button>
          <button
            onClick={onComplete}
            disabled={loading}
            className="rounded-lg bg-khet-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "..." : strings.tasks.mark_done}
          </button>
        </div>
      </div>
    </div>
  );
}
