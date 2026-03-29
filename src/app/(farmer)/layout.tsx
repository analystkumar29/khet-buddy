"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { useVoice } from "@/hooks/useVoice";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

const NAV_ITEMS = [
  { href: "/", labelHi: "होम", labelEn: "Home", icon: "🏠" },
  { href: "/scan", labelHi: "स्कैन", labelEn: "Scan", icon: "📷" },
  { href: "/tasks", labelHi: "काम", labelEn: "Tasks", icon: "📋" },
  { href: "/mandi", labelHi: "मंडी", labelEn: "Mandi", icon: "💰" },
  { href: "/calendar", labelHi: "कैलेंडर", labelEn: "Calendar", icon: "📅" },
] as const;

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { lang, strings } = useLanguage();
  const { speak, stop } = useVoice();
  const [voiceOn, setVoiceOn] = useState(false);

  function handleVoiceToggle() {
    if (voiceOn) {
      stop();
      setVoiceOn(false);
    } else {
      setVoiceOn(true);
      speak(strings.app.name, lang);
    }
  }

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen flex-col bg-khet-green-light">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-khet-green px-4 py-3 shadow-md safe-top">
        <h1 className="text-xl font-bold text-white">{strings.app.name}</h1>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <LanguageSwitcher />

          {/* Voice toggle */}
          <button
            onClick={handleVoiceToggle}
            className="touch-target flex items-center justify-center rounded-lg bg-white/20 px-3 py-2 text-lg text-white transition-colors active:bg-white/30"
            aria-label={voiceOn ? "Voice off / आवाज़ बंद" : "Voice on / आवाज़ चालू"}
            title={voiceOn ? "Voice off" : "Voice on"}
          >
            {voiceOn ? "🔊" : "🔇"}
          </button>
        </div>
      </header>

      {/* ─── Offline Banner ─── */}
      <OfflineBanner />

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {children}
      </main>

      {/* ─── Bottom Navigation ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white safe-bottom"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch justify-around">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`touch-target flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-center transition-colors ${
                  active
                    ? "bg-khet-green-light text-khet-green"
                    : "text-gray-500 active:bg-gray-100"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {item.icon}
                </span>
                <span
                  className={`text-xs font-medium ${
                    active ? "font-bold text-khet-green" : ""
                  }`}
                >
                  {lang === "hi" ? item.labelHi : item.labelEn}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
