"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { useFarmData } from "@/hooks/useFarmData";
import type { SoilSensor } from "@/types/database";

export default function SensorsPage() {
  const { lang, strings } = useLanguage();
  const { farm } = useFarmData();

  const [sensors, setSensors] = useState<SoilSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      const res = await fetch("/api/sensors");
      if (res.ok) {
        const json = await res.json();
        setSensors(json.sensors || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSensors(); }, [fetchSensors]);

  async function registerSensor() {
    if (!farm?.id || !deviceId.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sensors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farm_id: farm.id,
          device_id: deviceId.trim(),
          sensor_type: "diy_esp32",
          label: label.trim() || null,
        }),
      });
      if (res.ok) {
        setMsg(lang === "hi" ? "सेंसर जोड़ दिया गया!" : "Sensor registered!");
        setDeviceId("");
        setLabel("");
        setShowForm(false);
        fetchSensors();
        setTimeout(() => setMsg(null), 3000);
      } else {
        const json = await res.json();
        setError(json.error || "Failed");
      }
    } catch {
      setError("Network error");
    }
    setSaving(false);
  }

  async function deactivateSensor(id: string) {
    await fetch(`/api/sensors?id=${id}`, { method: "DELETE" });
    setSensors((prev) => prev.filter((s) => s.id !== id));
  }

  function timeSince(dateStr: string | null): string {
    if (!dateStr) return lang === "hi" ? "कभी नहीं" : "Never";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return lang === "hi" ? `${mins} मिनट पहले` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return lang === "hi" ? `${hrs} घंटे पहले` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return lang === "hi" ? `${days} दिन पहले` : `${days}d ago`;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-khet-green">
          {strings.sensors.title}
        </h1>
        <Link
          href="/paani"
          className="text-sm text-khet-green underline"
        >
          {lang === "hi" ? "वापस" : "Back"}
        </Link>
      </div>

      {/* Success message */}
      {msg && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center text-green-700 font-medium">
          {msg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Sensor list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <svg className="h-8 w-8 animate-spin text-khet-green" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : sensors.length === 0 && !showForm ? (
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 text-center">
          <p className="text-4xl mb-3">📡</p>
          <p className="text-lg text-gray-600 mb-1">{strings.sensors.no_sensors}</p>
          <p className="text-sm text-gray-400 mb-4">{strings.sensors.no_sensors_desc}</p>
          <button
            onClick={() => setShowForm(true)}
            className="min-h-[48px] px-6 bg-khet-green text-white text-lg font-semibold rounded-xl active:bg-green-800"
          >
            {strings.sensors.add_sensor}
          </button>
        </div>
      ) : (
        <>
          {sensors.map((sensor) => {
            const lastSeen = sensor.last_seen_at;
            const isOnline = lastSeen && (Date.now() - new Date(lastSeen).getTime()) < 3600000; // 1hr
            return (
              <div key={sensor.id} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-300"}`} />
                    <h3 className="font-bold text-gray-800">
                      {sensor.label || sensor.device_id}
                    </h3>
                  </div>
                  <button
                    onClick={() => deactivateSensor(sensor.id)}
                    className="text-sm text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50"
                  >
                    {lang === "hi" ? "हटाएं" : "Remove"}
                  </button>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{sensor.device_id}</code></p>
                  <p>{strings.sensors.last_seen}: {timeSince(sensor.last_seen_at)}</p>
                  <p>{lang === "hi" ? "प्रकार" : "Type"}: {sensor.sensor_type}</p>
                </div>
              </div>
            );
          })}

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full min-h-[44px] bg-khet-green text-white font-semibold rounded-xl active:bg-green-800"
            >
              {strings.sensors.add_sensor}
            </button>
          )}
        </>
      )}

      {/* Registration form */}
      {showForm && (
        <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
          <h3 className="font-bold text-lg">{strings.sensors.add_sensor}</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {strings.sensors.device_id_label}
            </label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="AA:BB:CC:DD:EE:FF"
              className="w-full min-h-[44px] px-3 rounded-lg border border-gray-300 text-base font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">{strings.sensors.device_id_help}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {strings.sensors.label_field}
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={lang === "hi" ? "खेत A सेंसर" : "Field A Sensor"}
              className="w-full min-h-[44px] px-3 rounded-lg border border-gray-300 text-base"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setError(null); }}
              className="flex-1 min-h-[44px] bg-gray-100 text-gray-600 font-medium rounded-xl"
            >
              {strings.common.cancel}
            </button>
            <button
              onClick={registerSensor}
              disabled={saving || !deviceId.trim()}
              className="flex-1 min-h-[44px] bg-khet-green text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {saving ? strings.common.loading : strings.common.save}
            </button>
          </div>
        </div>
      )}

      {/* Setup instructions */}
      <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 space-y-2">
        <h3 className="font-bold text-blue-800">{strings.sensors.setup_title}</h3>
        <ol className="space-y-1.5 text-sm text-blue-700">
          <li>1. {strings.sensors.step1}</li>
          <li>2. {strings.sensors.step2}</li>
          <li>3. {strings.sensors.step3}</li>
          <li>4. {strings.sensors.step4}</li>
          <li>5. {strings.sensors.step5}</li>
        </ol>
        <div className="mt-2 p-2 bg-white rounded-lg">
          <p className="text-xs text-gray-500 mb-1">API Endpoint:</p>
          <code className="text-xs break-all text-blue-600">
            POST https://khet-buddy-two.vercel.app/api/soil/readings
          </code>
        </div>
      </div>

      {/* Purchase info */}
      <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
        <h3 className="font-bold text-green-800 mb-2">{strings.sensors.purchase_title}</h3>
        <p className="text-sm text-green-700 mb-2">{strings.sensors.purchase_budget}</p>
        <div className="space-y-1 text-sm text-green-700">
          <p>1. ESP32 DevKit — ₹350-500</p>
          <p>2. {lang === "hi" ? "नमी सेंसर (Capacitive)" : "Moisture Sensor (Capacitive)"} — ₹250-400</p>
          <p>3. NPK Sensor (RS485) — ₹2,500-3,500</p>
          <p>4. MAX485 {lang === "hi" ? "कनवर्टर" : "Converter"} — ₹80-150</p>
          <p>5. pH Sensor — ₹500-800</p>
          <p>6. DHT22 ({lang === "hi" ? "तापमान+नमी" : "Temp+Humidity"}) — ₹200-350</p>
          <p>7. DS18B20 ({lang === "hi" ? "मिट्टी तापमान" : "Soil Temp"}) — ₹120-200</p>
          <p>8. 12V {lang === "hi" ? "पावर सप्लाई" : "Power Supply"} — ₹200-400</p>
          <p>9. {lang === "hi" ? "तार, बॉक्स" : "Wires, Box"} — ₹200-400</p>
        </div>
        <p className="mt-2 font-bold text-green-800">
          {lang === "hi" ? "कुल: ₹4,400-6,700" : "Total: ₹4,400-6,700"}
        </p>
        <p className="text-xs text-green-600 mt-1">
          {lang === "hi" ? "Amazon.in, Robu.in, IndiaMART से खरीदें" : "Buy from Amazon.in, Robu.in, IndiaMART"}
        </p>
      </div>
    </div>
  );
}
