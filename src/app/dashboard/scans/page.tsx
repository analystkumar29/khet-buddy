"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { DiseaseScan } from "@/types/database";

const SEVERITY_COLORS: Record<string, string> = {
  none: "bg-green-100 text-green-700",
  low: "bg-lime-100 text-lime-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function ScansPage() {
  const [scans, setScans] = useState<DiseaseScan[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadScans();
  }, []);

  async function loadScans() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("disease_scans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setScans(data || []);
    setLoading(false);
  }

  if (loading) return <p className="p-4 text-gray-500">Loading scans...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Scan History</h2>
        <Link href="/scan" className="bg-khet-green text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Scan</Link>
      </div>
      {scans.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">📷</p>
          <p>No scans yet. Take a photo of your crop to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {scans.map((scan) => (
            <Link key={scan.id} href={`/scan/${scan.id}`} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {scan.photo_url && <img src={scan.photo_url} alt="Scan" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{scan.disease_name_en || "Analyzing..."}</p>
                <p className="text-sm text-gray-500">{new Date(scan.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              {scan.severity && <span className={`px-2 py-1 rounded-full text-xs font-medium ${SEVERITY_COLORS[scan.severity]}`}>{scan.severity}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
