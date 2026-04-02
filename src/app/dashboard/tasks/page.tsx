"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentCropStage } from "@/lib/crop-data/apple-ber-fatehabad";
import type { FarmTask } from "@/types/database";

export default function DashboardTasksPage() {
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const cropStage = getCurrentCropStage();

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("farm_tasks").select("*").eq("user_id", user.id).order("due_date", { ascending: true }).limit(50);
    setTasks(data || []);
    setLoading(false);
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await supabase.from("farm_tasks").update({ status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : null }).eq("id", taskId);
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus as FarmTask["status"] } : t));
  }

  const pending = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

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
        <h3 className="font-semibold text-lg mb-3">Pending ({pending.length})</h3>
        {loading ? <p className="text-gray-500">Loading...</p> : pending.length === 0 ? <p className="text-gray-500">No pending tasks.</p> : (
          <div className="space-y-2">
            {pending.map((task) => (
              <div key={task.id} className="bg-white rounded-lg p-4 border border-gray-100 flex items-center gap-3">
                <button onClick={() => toggleTask(task.id, task.status)} className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 hover:border-khet-green" />
                <div className="flex-1">
                  <p className="font-medium">{task.title_en || task.title_hi}</p>
                  <p className="text-xs text-gray-500">{task.category} • {task.priority}{task.due_date && ` • Due ${task.due_date}`}</p>
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
            {completed.map((task) => (
              <div key={task.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center gap-3 opacity-60">
                <button onClick={() => toggleTask(task.id, task.status)} className="w-6 h-6 rounded-full bg-khet-green flex-shrink-0 flex items-center justify-center"><span className="text-white text-xs">✓</span></button>
                <p className="line-through">{task.title_en || task.title_hi}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
