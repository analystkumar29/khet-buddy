"use client";

import { useFarmData } from "@/hooks/useFarmData";
import { useLanguage } from "@/hooks/useLanguage";
import type { FarmActivity } from "@/types/database";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "border-gray-200 bg-white",
  completed: "border-green-300 bg-green-50",
  late: "border-orange-300 bg-orange-50",
  skipped: "border-red-200 bg-red-50 opacity-70",
};

const STATUS_LABELS: Record<string, { hi: string; en: string }> = {
  scheduled: { hi: "बाकी", en: "Upcoming" },
  completed: { hi: "पूरा", en: "Done" },
  late: { hi: "देर से किया", en: "Done (Late)" },
  skipped: { hi: "छोड़ा", en: "Skipped" },
};

function formatDate(dateStr: string | null, lang: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  });
}

function groupByMonth(activities: FarmActivity[]): Map<string, FarmActivity[]> {
  const groups = new Map<string, FarmActivity[]>();
  for (const act of activities) {
    if (!act.scheduled_date) continue;
    const key = act.scheduled_date.slice(0, 7); // "2025-05"
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(act);
  }
  return groups;
}

function getMonthLabel(yearMonth: string, lang: string): string {
  const [year, month] = yearMonth.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default function CalendarPage() {
  const { lang } = useLanguage();
  const { allActivities, currentStage, farmCrop, loading } = useFarmData();

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

  if (!farmCrop || allActivities.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg text-gray-600">
          {lang === "hi"
            ? "कोई फसल नहीं मिली। पहले फसल जोड़ें।"
            : "No crop found. Add a crop first."}
        </p>
      </div>
    );
  }

  // Filter out sub-activities — show only stage milestones (those with template_stage_id and title matching stage name)
  // Actually show all activities for full timeline
  const grouped = groupByMonth(allActivities);
  const today = new Date().toISOString().split("T")[0];
  const currentYearMonth = today.slice(0, 7);

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-2xl font-bold text-khet-green">
        {lang === "hi" ? "मेरा फसल कैलेंडर" : "My Crop Calendar"}
      </h1>

      {currentStage && (
        <div className="rounded-xl bg-khet-green px-4 py-3 text-white">
          <p className="text-sm opacity-80">
            {lang === "hi" ? "अभी का चरण" : "Current Stage"}
          </p>
          <p className="text-lg font-bold">
            {lang === "hi"
              ? currentStage.stage_name_hi
              : currentStage.stage_name_en}
          </p>
        </div>
      )}

      {/* Timeline by month */}
      {Array.from(grouped.entries()).map(([yearMonth, activities]) => {
        const isCurrentMonth = yearMonth === currentYearMonth;

        return (
          <div key={yearMonth} className="space-y-2">
            {/* Month header */}
            <div
              className={`sticky top-0 z-10 flex items-center gap-2 rounded-lg px-3 py-2 ${
                isCurrentMonth
                  ? "bg-khet-green text-white shadow"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {isCurrentMonth && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-khet-green">
                  {lang === "hi" ? "अभी" : "NOW"}
                </span>
              )}
              <span className="font-bold">
                {getMonthLabel(yearMonth, lang)}
              </span>
              <span className="ml-auto text-sm opacity-75">
                {activities.filter((a) => a.status === "completed" || a.status === "late").length}/
                {activities.length}
              </span>
            </div>

            {/* Activities in this month */}
            {activities.map((activity) => {
              const isPast = activity.scheduled_date && activity.scheduled_date < today;
              const isToday = activity.scheduled_date === today;

              return (
                <div
                  key={activity.id}
                  className={`rounded-xl border-2 p-3 transition-all ${
                    isToday
                      ? "border-khet-green bg-green-50 ring-2 ring-green-200"
                      : STATUS_STYLES[activity.status] || STATUS_STYLES.scheduled
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {isToday && (
                        <span className="mb-1 inline-block rounded-full bg-khet-green px-2 py-0.5 text-xs font-bold text-white">
                          {lang === "hi" ? "आज" : "TODAY"}
                        </span>
                      )}
                      <p className={`font-semibold ${isPast && activity.status === "scheduled" ? "text-red-600" : "text-gray-900"}`}>
                        {lang === "hi" ? activity.title_hi : (activity.title_en || activity.title_hi)}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {formatDate(activity.scheduled_date, lang)}
                        {activity.actual_date && activity.actual_date !== activity.scheduled_date && (
                          <span className="ml-2 text-orange-600">
                            → {formatDate(activity.actual_date, lang)}
                          </span>
                        )}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        activity.status === "completed"
                          ? "bg-green-200 text-green-800"
                          : activity.status === "late"
                            ? "bg-orange-200 text-orange-800"
                            : activity.status === "skipped"
                              ? "bg-red-200 text-red-800"
                              : isPast
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isPast && activity.status === "scheduled"
                        ? lang === "hi" ? "बाकी!" : "Overdue!"
                        : STATUS_LABELS[activity.status]?.[lang] || activity.status}
                    </span>
                  </div>

                  {activity.deviation_days !== 0 && activity.status !== "scheduled" && (
                    <p className="mt-1 text-xs text-orange-600">
                      {activity.deviation_days > 0
                        ? `${activity.deviation_days} दिन देर से`
                        : `${Math.abs(activity.deviation_days)} दिन पहले`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
