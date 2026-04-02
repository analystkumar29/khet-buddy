"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentCropStage } from "@/lib/crop-data/apple-ber-fatehabad";
import type { FarmActivity } from "@/types/database";

export default function DashboardTasksPage() {
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const cropStage = getCurrentCropStage();

  useEffect(() => { loadActivities(); }, []);

  async function loadActivities() {
    const supabase = supabaseRef.current;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Get user's farm and active crop
    const { data: farms } = await supabase.from("farms").select("id").eq("user_id", user.id).limit(1);
    if (!farms?.length) { setLoading(false); return; }

    const { data: crops } = await supabase.from("farm_crops").select("id").eq("farm_id", farms[0].id).eq("status", "active").limit(1);
    if (!crops?.length) { setLoading(false); return; }

    const { data } = await supabase
      .from("farm_activities")
      .select("*")
      .eq("farm_crop_id", crops[0].id)
      .order("scheduled_date", { ascending: true })
      .limit(50);

    setActivities((data || []) as FarmActivity[]);
    setLoading(false);
  }

  async function toggleActivity(activityId: string, currentStatus: string) {
    const action = currentStatus === "completed" ? "skip" : "complete";
    const res = await fetch("/api/farm/activities/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId, action }),
    });
    if (res.ok) {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activityId
            ? { ...a, status: (action === "complete" ? "completed" : "scheduled") as FarmActivity["status"] }
            : a
        )
      );
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const scheduled = activities.filter((a) => a.status === "scheduled" && a.scheduled_date && a.scheduled_date >= today);
  const completed = activities.filter((a) => a.status === "completed");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Task Management</h2>
      <div className="bg-green-50 rounded-xl p-5 border border-green-200">
        <h3 className="font-bold text-lg text-khet-green mb-3">{cropStage.stage_en} — Recommended Activities</h3>
        <ul className="space-y-2">
          {cropStage.activities_en.map((activity, i) => (
            <li key={i} className="flex items-start gap-2 text-sm"><span className="text-khet-green mt-0.5">▸</span>{activity}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-3">Upcoming ({scheduled.length})</h3>
        {loading ? <p className="text-gray-500">Loading...</p> : scheduled.length === 0 ? <p className="text-gray-500">No upcoming activities.</p> : (
          <div className="space-y-2">
            {scheduled.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg p-4 border border-gray-100 flex items-center gap-3">
                <button onClick={() => toggleActivity(activity.id, activity.status)} className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 hover:border-khet-green" />
                <div className="flex-1">
                  <p className="font-medium">{activity.title_en || activity.title_hi}</p>
                  <p className="text-xs text-gray-500">{activity.activity_type}{activity.scheduled_date && ` • ${activity.scheduled_date}`}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {completed.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3 text-gray-500">Completed ({completed.length})</h3>
          <div className="space-y-2">
            {completed.map((activity) => (
              <div key={activity.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-khet-green flex-shrink-0 flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
                <p className="line-through">{activity.title_en || activity.title_hi}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
