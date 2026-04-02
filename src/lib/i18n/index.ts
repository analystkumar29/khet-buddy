import { hi } from "./hi";
import { en } from "./en";

export type Language = "hi" | "en";

/** Deeply widen readonly literal strings to `string` and readonly tuples to readonly string[]. */
type DeepStringify<T> = T extends readonly string[]
  ? readonly string[]
  : T extends object
    ? { readonly [K in keyof T]: DeepStringify<T[K]> }
    : T extends string
      ? string
      : T;

export type TranslationStrings = DeepStringify<typeof hi>;

const translations: Record<Language, TranslationStrings> = {
  hi: hi as TranslationStrings,
  en: en as TranslationStrings,
};

export function t(lang: Language = "hi"): TranslationStrings {
  return translations[lang];
}
