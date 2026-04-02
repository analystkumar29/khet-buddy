"use client";

import { useState, useEffect } from "react";
import { type Language, t, type TranslationStrings } from "@/lib/i18n";

export function useLanguage(): {
  lang: Language;
  strings: TranslationStrings;
  setLang: (lang: Language) => void;
  toggle: () => void;
} {
  const [lang, setLangState] = useState<Language>("hi");

  useEffect(() => {
    const saved = localStorage.getItem("khet-buddy-lang") as Language | null;
    if (saved) setLangState(saved);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("khet-buddy-lang", newLang);
  };

  const toggle = () => setLang(lang === "hi" ? "en" : "hi");

  return { lang, strings: t(lang), setLang, toggle };
}
