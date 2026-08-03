"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { ko, type TranslationKey } from "@/lib/i18n/translations";

type TranslationParams = Record<string, string | number>;

function interpolate(value: string, params?: TranslationParams): string {
  if (!params) return value;
  return value.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : ""
  );
}

interface LanguageValue {
  t: (key: TranslationKey | string, params?: TranslationParams) => string;
}

const LanguageContext = createContext<LanguageValue>({
  t: () => "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const t = useCallback((key: TranslationKey | string, params?: TranslationParams) => {
    const value = ko[key as TranslationKey];
    if (!value) {
      if (process.env.NODE_ENV !== "production") console.error(`[ui] Missing Korean text: ${key}`);
      return "";
    }
    return interpolate(value, params);
  }, []);

  const value = useMemo(() => ({ t }), [t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
