"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Record<string, string | number | null> | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({
      full_name: profile.full_name,
      preferred_language: profile.preferred_language,
      farm_name: profile.farm_name,
      farm_area_acres: profile.farm_area_acres,
      village: profile.village,
      district: profile.district,
    }).eq("id", user.id);
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!profile) return <p className="p-4 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
        {[
          { label: "Name", key: "full_name", type: "text" },
          { label: "Farm Name", key: "farm_name", type: "text" },
          { label: "Farm Area (acres)", key: "farm_area_acres", type: "number" },
          { label: "Village", key: "village", type: "text" },
          { label: "District", key: "district", type: "text" },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} value={(profile[key] as string) || ""} onChange={(e) => setProfile({ ...profile, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select value={(profile.preferred_language as string) || "hi"} onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="hi">हिंदी</option>
            <option value="en">English</option>
          </select>
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full bg-khet-green text-white py-2.5 rounded-lg font-medium disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
      </div>
      <button onClick={handleLogout} className="w-full border border-red-300 text-red-600 py-2.5 rounded-lg font-medium hover:bg-red-50">Sign Out</button>
    </div>
  );
}
