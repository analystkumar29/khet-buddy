"use client";

import { useLanguage } from "@/hooks/useLanguage";

export function LanguageSwitcher() {
  const { lang, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      className="touch-target flex items-center justify-center rounded-lg bg-white/20 px-3 py-2 text-base font-bold text-white transition-colors active:bg-white/30"
      aria-label={lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
    >
      {lang === "hi" ? "En" : "हि"}
    </button>
  );
}
