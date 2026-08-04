"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ko, ja, type TranslationKey } from "@/lib/i18n/translations";

export type Locale = "ko" | "ja";

type TranslationParams = Record<string, string | number>;
const LANGUAGE_STORAGE_KEY = "itakura-language";

function interpolate(value: string, params?: TranslationParams): string {
  if (!params) return value;
  return value.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : ""
  );
}

interface LanguageValue {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: TranslationKey | string, params?: TranslationParams) => string;
}

const LanguageContext = createContext<LanguageValue>({
  language: "ko",
  setLanguage: () => {},
  t: () => "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>("ko");

  useEffect(() => {
    const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Locale | null;
    if (savedLang === "ko" || savedLang === "ja") {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "ja" ? "ja" : "ko";
  }, [language]);

  const setLanguage = useCallback((lang: Locale) => {
    setLanguageState(lang);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey | string, params?: TranslationParams) => {
      const dictionary = language === "ja" ? ja : ko;
      const fallbackDictionary = ko;
      const value = dictionary[key as TranslationKey] || fallbackDictionary[key as TranslationKey];
      if (!value) {
        if (process.env.NODE_ENV !== "production") console.error(`[ui] Missing translation text: ${key}`);
        return String(key);
      }
      return interpolate(value, params);
    },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
