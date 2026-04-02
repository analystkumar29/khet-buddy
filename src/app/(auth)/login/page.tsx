"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Strip non-digits and limit to 10 digits
  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    setError(null);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (phone.length !== 10) {
      setError("कृपया 10 अंकों का मोबाइल नंबर डालें");
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `+91${phone}`;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (otpError) {
        setError(otpError.message || "OTP भेजने में समस्या हुई। फिर से कोशिश करें।");
        return;
      }

      // Redirect to verify page with phone in search params
      router.push(`/verify?phone=${encodeURIComponent(fullPhone)}`);
    } catch {
      setError("कुछ गड़बड़ हुई। फिर से कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo header */}
      <div className="mb-8 rounded-2xl bg-khet-green px-6 py-8 text-center shadow-lg">
        <h1 className="text-4xl font-bold text-white">खेत बडी</h1>
        <p className="mt-2 text-lg text-green-200">स्मार्ट खेती, बेहतर कमाई</p>
      </div>

      {/* Login form */}
      <form onSubmit={handleSendOtp} className="space-y-5">
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-lg font-semibold text-gray-800"
          >
            मोबाइल नंबर
          </label>
          <div className="flex items-stretch overflow-hidden rounded-xl border-2 border-gray-300 bg-white focus-within:border-khet-green">
            <span className="flex min-h-[48px] items-center bg-gray-100 px-4 text-lg font-semibold text-gray-600">
              +91
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="min-h-[48px] flex-1 px-4 text-xl outline-none placeholder:text-gray-400"
              disabled={loading}
            />
          </div>
          <p className="mt-1.5 text-sm text-gray-500">
            आपके नंबर पर OTP भेजा जाएगा
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-base text-khet-red">
            {error}
          </div>
        )}

        {/* Send OTP button */}
        <button
          type="submit"
          disabled={loading || phone.length !== 10}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-khet-green px-6 py-3.5 text-lg font-bold text-white shadow-md transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              OTP भेज रहे हैं...
            </span>
          ) : (
            "OTP भेजें"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-500">
        लॉगिन करके आप हमारी सेवा की शर्तों से सहमत होते हैं
      </p>
    </div>
  );
}
