"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { STATES, type StateData, type District } from "@/lib/geo/districts";
import { reverseGeocode } from "@/lib/geo/reverse-geocode";

type Step = 1 | 2 | 3;

export default function SetupPage() {
  const [step, setStep] = useState<Step>(1);

  // Step 1: Basic info
  const [fullName, setFullName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [farmArea, setFarmArea] = useState("");

  // Step 2: Location
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [village, setVillage] = useState("");
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Step 3: Crop
  const [plantingDate, setPlantingDate] = useState("");
  const [treeAge, setTreeAge] = useState("2");
  const [pruningWarnings, setPruningWarnings] = useState<
    { message_hi: string; message_en: string; severity: string }[]
  >([]);
  const [pruningMitigations, setPruningMitigations] = useState<
    { message_hi: string; message_en: string }[]
  >([]);
  const [pruningValidated, setPruningValidated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setPhone(user.phone ?? "");
    });
  }, [supabase, router]);

  // ─── Pruning date validation ───
  async function validatePruning(dateStr: string) {
    if (!dateStr || !selectedState) return;
    setPruningWarnings([]);
    setPruningMitigations([]);
    setPruningValidated(false);

    try {
      const res = await fetch(
        `/api/farm/validate-pruning?crop=apple_ber&state=${selectedState.name}&date=${dateStr}`
      );
      if (!res.ok) return;
      const data = await res.json();

      if (data.warnings?.length > 0) {
        setPruningWarnings(data.warnings);
      }
      if (data.mitigations?.length > 0) {
        setPruningMitigations(data.mitigations);
      }
      setPruningValidated(true);
    } catch {
      // Validation failed silently — allow proceeding
    }
  }

  // ─── GPS Location ───
  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGpsError("GPS उपलब्ध नहीं है। मैन्युअल चुनें।");
      setManualMode(true);
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        // Reverse geocode to find nearest district
        const geo = reverseGeocode(lat, lon);
        if (geo) {
          const stateData = STATES.find((s) => s.name === geo.state);
          const districtData = stateData?.districts.find(
            (d) => d.name === geo.district
          );
          if (stateData) setSelectedState(stateData);
          if (districtData) setSelectedDistrict(districtData);
          setLocationConfirmed(true);
        }

        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("GPS अनुमति नहीं दी। नीचे से मैन्युअल चुनें।");
        } else {
          setGpsError("लोकेशन नहीं मिली। मैन्युअल चुनें।");
        }
        setManualMode(true);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function handleManualState(stateName: string) {
    const state = STATES.find((s) => s.name === stateName);
    setSelectedState(state || null);
    setSelectedDistrict(null);
    setLocationConfirmed(false);
  }

  function handleManualDistrict(districtName: string) {
    if (!selectedState) return;
    const dist = selectedState.districts.find((d) => d.name === districtName);
    if (dist) {
      setSelectedDistrict(dist);
      setLatitude(dist.lat);
      setLongitude(dist.lon);
      setLocationConfirmed(true);
    }
  }

  // ─── Submit ───
  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // 1. Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        full_name: fullName.trim(),
        phone: phone || user.phone || "",
        farm_name: farmName.trim() || null,
        village: village.trim() || null,
        district: selectedDistrict?.name || null,
        state: selectedState?.name || "Haryana",
        farm_area_acres: farmArea ? parseFloat(farmArea) : null,
        latitude,
        longitude,
        migrated_to_v2: true,
      });

      if (profileError) {
        if (profileError.code === "23505") {
          router.replace("/home");
          return;
        }
        setError(profileError.message);
        return;
      }

      // 2. Create farm
      const { data: farm, error: farmError } = await supabase
        .from("farms")
        .insert({
          user_id: user.id,
          farm_name: farmName.trim() || fullName.trim() + " का खेत",
          area_acres: farmArea ? parseFloat(farmArea) : null,
          latitude,
          longitude,
          village: village.trim() || null,
          district: selectedDistrict?.name || null,
          state: selectedState?.name || "Haryana",
        })
        .select("id")
        .single();

      if (farmError) {
        console.error("Farm creation failed:", farmError);
        // Profile was created, continue anyway
        router.replace("/home");
        return;
      }

      // 3. Create farm crop (Apple Ber for now)
      const { data: template } = await supabase
        .from("crop_templates")
        .select("id")
        .eq("crop_key", "apple_ber")
        .maybeSingle();

      if (template && farm) {
        const pDate = plantingDate || "2025-05-01";
        const { data: farmCrop } = await supabase
          .from("farm_crops")
          .insert({
            farm_id: farm.id,
            crop_template_id: template.id,
            planting_date: pDate,
            tree_age_years: parseInt(treeAge) || 2,
            status: "active",
          })
          .select("id")
          .single();

        // Generate personal timeline from template
        if (farmCrop) {
          await fetch("/api/farm/activities/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              farmCropId: farmCrop.id,
              cropTemplateId: template.id,
              plantingDate: pDate,
              state: selectedState?.name || "Haryana",
            }),
          });
        }
      }

      router.replace("/home");
    } catch {
      setError("कुछ गड़बड़ हुई। फिर से कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Progress indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-khet-green" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* ─── STEP 1: Basic Info ─── */}
      {step === 1 && (
        <div>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-khet-green text-2xl text-white">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">अपनी जानकारी भरें</h1>
            <p className="mt-1 text-gray-600">खेत बडी में आपका स्वागत है!</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-lg font-semibold text-gray-800">
                आपका नाम <span className="text-khet-red">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="जैसे: रामकुमार"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg outline-none focus:border-khet-green"
              />
            </div>

            <div>
              <label htmlFor="farmName" className="mb-1 block text-lg font-semibold text-gray-800">
                खेत/फार्म का नाम
              </label>
              <input
                id="farmName"
                type="text"
                placeholder="जैसे: रामकुमार फार्म"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg outline-none focus:border-khet-green"
              />
            </div>

            <div>
              <label htmlFor="farmArea" className="mb-1 block text-lg font-semibold text-gray-800">
                खेत का क्षेत्रफल (एकड़)
              </label>
              <input
                id="farmArea"
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                placeholder="जैसे: 2.5"
                value={farmArea}
                onChange={(e) => setFarmArea(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg outline-none focus:border-khet-green"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!fullName.trim()}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-khet-green px-6 py-3.5 text-lg font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              अगला — लोकेशन
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Location ─── */}
      {step === 2 && (
        <div>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-khet-green text-2xl text-white">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">खेत की लोकेशन</h1>
            <p className="mt-1 text-gray-600">सही मौसम और सलाह के लिए</p>
          </div>

          <div className="space-y-4">
            {/* GPS Button */}
            {!locationConfirmed && !manualMode && (
              <button
                onClick={handleGetLocation}
                disabled={gpsLoading}
                className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-xl border-2 border-khet-green bg-green-50 px-6 py-4 text-lg font-bold text-khet-green transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {gpsLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    लोकेशन ढूंढ रहे हैं...
                  </span>
                ) : (
                  <>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    GPS से लोकेशन लें
                  </>
                )}
              </button>
            )}

            {gpsError && (
              <div className="rounded-lg bg-yellow-50 px-4 py-3 text-base text-yellow-800">
                {gpsError}
              </div>
            )}

            {/* GPS confirmed location */}
            {locationConfirmed && !manualMode && (
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-lg font-semibold text-khet-green">
                  {selectedDistrict?.name_hi}, {selectedState?.name_hi}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedDistrict?.name}, {selectedState?.name}
                </p>
                <button
                  onClick={() => { setManualMode(true); setLocationConfirmed(false); }}
                  className="mt-2 text-sm text-khet-green underline"
                >
                  गलत है? मैन्युअल बदलें
                </button>
              </div>
            )}

            {/* Manual selection */}
            {(manualMode || (!locationConfirmed && !gpsLoading)) && (
              <>
                {!locationConfirmed && !gpsLoading && !gpsError && (
                  <div className="text-center text-sm text-gray-500">या</div>
                )}

                <div>
                  <label className="mb-1 block text-lg font-semibold text-gray-800">
                    राज्य चुनें
                  </label>
                  <select
                    value={selectedState?.name || ""}
                    onChange={(e) => handleManualState(e.target.value)}
                    className="min-h-[48px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg outline-none focus:border-khet-green"
                  >
                    <option value="">-- राज्य चुनें --</option>
                    {STATES.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name_hi} ({s.name})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedState && (
                  <div>
                    <label className="mb-1 block text-lg font-semibold text-gray-800">
                      जिला चुनें
                    </label>
                    <select
                      value={selectedDistrict?.name || ""}
                      onChange={(e) => handleManualDistrict(e.target.value)}
                      className="min-h-[48px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg outline-none focus:border-khet-green"
                    >
                      <option value="">-- जिला चुनें --</option>
                      {selectedState.districts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name_hi} ({d.name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Village */}
            <div>
              <label htmlFor="village" className="mb-1 block text-lg font-semibold text-gray-800">
                गांव
              </label>
              <input
                id="village"
                type="text"
                placeholder="जैसे: जाखल"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg outline-none focus:border-khet-green"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border-2 border-gray-300 px-4 py-3 text-lg font-semibold text-gray-700"
              >
                पीछे
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!locationConfirmed}
                className="flex min-h-[48px] flex-[2] items-center justify-center rounded-xl bg-khet-green px-6 py-3 text-lg font-bold text-white shadow-md disabled:opacity-50"
              >
                अगला — फसल
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Crop Selection ─── */}
      {step === 3 && (
        <div>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-khet-green text-2xl text-white">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">फसल की जानकारी</h1>
            <p className="mt-1 text-gray-600">आपकी फसल के अनुसार कैलेंडर बनेगा</p>
          </div>

          <div className="space-y-4">
            {/* Crop selection — only Apple Ber for now */}
            <div className="rounded-xl border-2 border-khet-green bg-green-50 p-4">
              <p className="text-lg font-bold text-khet-green">
                एप्पल बेर (थाई बेर)
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Apple Ber (Ziziphus mauritiana)
              </p>
              <p className="mt-2 text-xs text-gray-500">
                जल्द आ रहे हैं: किन्नू, अमरूद, नींबू
              </p>
            </div>

            <div>
              <label htmlFor="treeAge" className="mb-1 block text-lg font-semibold text-gray-800">
                पेड़ की उम्र (साल)
              </label>
              <select
                id="treeAge"
                value={treeAge}
                onChange={(e) => setTreeAge(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg outline-none focus:border-khet-green"
              >
                <option value="1">1 साल (पहला साल)</option>
                <option value="2">2 साल (दूसरा साल)</option>
                <option value="3">3 साल (तीसरा साल)</option>
                <option value="4">4 साल</option>
                <option value="5">5+ साल</option>
              </select>
            </div>

            <div>
              <label htmlFor="plantingDate" className="mb-1 block text-lg font-semibold text-gray-800">
                आखिरी कड़ी छंटाई कब की?
              </label>
              <input
                id="plantingDate"
                type="date"
                value={plantingDate}
                onChange={(e) => {
                  setPlantingDate(e.target.value);
                  validatePruning(e.target.value);
                }}
                className="min-h-[48px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg outline-none focus:border-khet-green"
              />
              <p className="mt-1 text-sm text-gray-500">
                याद नहीं? खाली छोड़ें — हम मई 2025 मानेंगे
              </p>

              {/* Pruning date validation warnings */}
              {pruningWarnings.length > 0 && (
                <div className="mt-3 space-y-2">
                  {pruningWarnings.map((w, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-3 text-sm ${
                        w.severity === "danger"
                          ? "bg-red-50 border border-red-200 text-red-800"
                          : "bg-yellow-50 border border-yellow-200 text-yellow-800"
                      }`}
                    >
                      <p className="font-medium">
                        {w.severity === "danger" ? "⚠️ " : "⚡ "}
                        {w.message_hi}
                      </p>
                    </div>
                  ))}

                  {/* Mitigation advice */}
                  {pruningMitigations.length > 0 && (
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                      <p className="font-medium mb-1">✅ चिंता न करें, हम सही कैलेंडर बनाएंगे:</p>
                      {pruningMitigations.map((m, i) => (
                        <p key={i} className="mt-1">{m.message_hi}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Valid date confirmation */}
              {pruningValidated && pruningWarnings.length === 0 && plantingDate && (
                <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  ✅ {selectedState?.name_hi || "आपके राज्य"} के लिए छंटाई की सही तारीख है
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-base text-khet-red">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border-2 border-gray-300 px-4 py-3 text-lg font-semibold text-gray-700"
              >
                पीछे
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex min-h-[48px] flex-[2] items-center justify-center rounded-xl bg-khet-green px-6 py-3 text-lg font-bold text-white shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    सेव हो रहा है...
                  </span>
                ) : (
                  "शुरू करें"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
