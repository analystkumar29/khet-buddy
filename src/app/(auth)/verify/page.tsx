"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

function VerifyForm() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const router = useRouter();
  const supabase = createClient();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no phone number present
  useEffect(() => {
    if (!phone) {
      router.replace("/login");
    }
  }, [phone, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function handleOtpChange(index: number, value: string) {
    // Accept only single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    // Focus the next empty input or the last one
    const nextEmpty = newOtp.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  }

  const handleVerify = useCallback(
    async (otpCode: string) => {
      if (otpCode.length !== 6 || !phone) return;

      setLoading(true);
      setError(null);

      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone,
          token: otpCode,
          type: "sms",
        });

        if (verifyError) {
          setError(verifyError.message || "OTP गलत है। फिर से कोशिश करें।");
          setLoading(false);
          return;
        }

        // Check if farmer profile exists
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("प्रमाणीकरण विफल। फिर से लॉगिन करें।");
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          router.replace("/");
        } else {
          router.replace("/setup");
        }
      } catch {
        setError("कुछ गड़बड़ हुई। फिर से कोशिश करें।");
        setLoading(false);
      }
    },
    [phone, router, supabase]
  );

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    const code = otp.join("");
    if (code.length === 6) {
      handleVerify(code);
    }
  }, [otp, handleVerify]);

  async function handleResendOtp() {
    if (resendCooldown > 0 || !phone) return;

    setError(null);
    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (resendError) {
        setError(resendError.message || "OTP भेजने में समस्या हुई।");
        return;
      }

      setResendCooldown(30);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      setError("कुछ गड़बड़ हुई। फिर से कोशिश करें।");
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("कृपया 6 अंकों का OTP डालें");
      return;
    }
    await handleVerify(code);
  }

  // Mask phone for display: +91 98****3210
  const maskedPhone = phone
    ? `${phone.slice(0, 5)}****${phone.slice(-4)}`
    : "";

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-khet-green text-2xl text-white">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">OTP जांचें</h1>
        <p className="mt-2 text-lg text-gray-600">
          {maskedPhone} पर भेजा गया OTP डालें
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* 6-digit OTP input boxes */}
        <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="h-14 w-12 rounded-xl border-2 border-gray-300 bg-white text-center text-2xl font-bold text-gray-900 outline-none transition-colors focus:border-khet-green disabled:opacity-50"
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-base text-khet-red">
            {error}
          </div>
        )}

        {/* Verify button */}
        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
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
              जांच रहे हैं...
            </span>
          ) : (
            "जांचें"
          )}
        </button>

        {/* Resend OTP */}
        <div className="text-center">
          {resendCooldown > 0 ? (
            <p className="text-base text-gray-500">
              OTP फिर से भेजें ({resendCooldown}s)
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              className="min-h-[48px] text-lg font-semibold text-khet-green underline underline-offset-2 active:opacity-70"
            >
              OTP फिर से भेजें
            </button>
          )}
        </div>
      </form>

      {/* Back to login */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="min-h-[48px] text-base text-gray-500 underline underline-offset-2"
        >
          दूसरा नंबर इस्तेमाल करें
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center">
          <svg
            className="h-8 w-8 animate-spin text-khet-green"
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
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
