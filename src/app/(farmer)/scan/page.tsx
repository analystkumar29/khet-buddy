"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ScanPage() {
  const router = useRouter();
  const supabase = createClient();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("कृपया एक फोटो चुनें");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("फोटो बहुत बड़ी है (10MB से कम होनी चाहिए)");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleCameraCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleGallerySelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix (e.g. "data:image/jpeg;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getMediaType = (
    file: File
  ): "image/jpeg" | "image/png" | "image/webp" => {
    if (file.type === "image/png") return "image/png";
    if (file.type === "image/webp") return "image/webp";
    return "image/jpeg";
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("कृपया पहले लॉगिन करें");
        setIsAnalyzing(false);
        return;
      }

      // Convert image to base64
      const imageBase64 = await convertToBase64(selectedFile);
      const mediaType = getMediaType(selectedFile);

      // Upload photo to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop() || "jpg";
      const storagePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("disease-scans")
        .upload(storagePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload failed:", uploadError);
        setError("फोटो अपलोड नहीं हो पाई। फिर से कोशिश करें।");
        setIsAnalyzing(false);
        return;
      }

      // Get public URL for the photo
      const {
        data: { publicUrl },
      } = supabase.storage.from("disease-scans").getPublicUrl(storagePath);

      // Create disease_scans row with status='pending'
      const { data: scanRow, error: insertError } = await supabase
        .from("disease_scans")
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          photo_storage_path: storagePath,
          scan_status: "pending",
        })
        .select("id")
        .single();

      if (insertError || !scanRow) {
        console.error("Failed to create scan record:", insertError);
        setError("जांच शुरू नहीं हो पाई। फिर से कोशिश करें।");
        setIsAnalyzing(false);
        return;
      }

      // Call analyze API
      const response = await fetch("/api/scan/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId: scanRow.id,
          imageBase64,
          mediaType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || "Analysis failed"
        );
      }

      // Redirect to result page
      router.push(`/scan/${scanRow.id}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("जांच में गड़बड़ हो गई। फिर से कोशिश करें।");
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    // Reset file inputs
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          फसल की जांच
        </h1>
        <p className="text-lg text-gray-600 mt-1">
          पेड़ या पत्ते की फोटो लो, बीमारी का पता लगाओ
        </p>
      </div>

      {/* Preview Area */}
      {previewUrl ? (
        <div className="mb-6">
          <div className="relative rounded-2xl overflow-hidden border-2 border-green-200 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="चुनी गई फोटो"
              className="w-full max-h-80 object-cover"
            />
            <button
              onClick={handleClear}
              disabled={isAnalyzing}
              className="absolute top-3 right-3 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-black/70 disabled:opacity-50"
              aria-label="फोटो हटाएं"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border-2 border-dashed border-green-300 bg-green-50/50 p-8 flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-6xl mb-3">📷</div>
          <p className="text-lg text-gray-500 text-center">
            फसल की फोटो खींचो या गैलरी से चुनो
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-lg text-red-700 text-center">{error}</p>
        </div>
      )}

      {/* Analyzing State */}
      {isAnalyzing && (
        <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col items-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full mb-4" />
          <p className="text-xl font-semibold text-amber-800">
            जांच हो रही है...
          </p>
          <p className="text-lg text-amber-600 mt-1">
            थोड़ा इंतज़ार करें, AI फोटो देख रहा है
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {!isAnalyzing && (
        <div className="space-y-4">
          {!selectedFile ? (
            <>
              {/* Camera Button */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full min-h-[64px] bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-colors"
              >
                <span className="text-2xl">📸</span>
                फोटो खींचो
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />

              {/* Gallery Button */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full min-h-[56px] bg-white hover:bg-gray-50 active:bg-gray-100 text-green-700 text-xl font-semibold rounded-2xl border-2 border-green-300 shadow flex items-center justify-center gap-3 transition-colors"
              >
                <span className="text-2xl">🖼️</span>
                गैलरी से चुनो
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleGallerySelect}
                className="hidden"
              />
            </>
          ) : (
            <>
              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                className="w-full min-h-[64px] bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-colors"
              >
                <span className="text-2xl">🔍</span>
                जांच करें
              </button>

              {/* Retake Button */}
              <button
                onClick={handleClear}
                className="w-full min-h-[48px] bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600 text-lg font-semibold rounded-2xl border-2 border-gray-200 flex items-center justify-center gap-2 transition-colors"
              >
                दूसरी फोटो चुनो
              </button>
            </>
          )}
        </div>
      )}

      {/* Tip */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-lg font-semibold text-blue-800 mb-2">
          अच्छी फोटो कैसे लें?
        </p>
        <ul className="space-y-1 text-base text-blue-700">
          <li>• बीमार पत्ते या फल को पास से फोटो लें</li>
          <li>• धूप में फोटो लें (साफ़ दिखे)</li>
          <li>• एक पत्ता/फल ज़ूम करके लें</li>
          <li>• हिलने न दें, फोकस होने दें</li>
        </ul>
      </div>
    </div>
  );
}
