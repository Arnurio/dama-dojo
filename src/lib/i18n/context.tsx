"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Locale, translate, TranslationKey } from "./dictionary";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "dama-dojo-locale";

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (saved && ["en", "ru", "kk"].includes(saved)) return saved;
  // Auto-detect from browser
  const lang = (navigator.language || "").toLowerCase();
  if (lang.startsWith("ru")) return "ru";
  if (lang.startsWith("kk") || lang.startsWith("kz")) return "kk";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Start with "en" on SSR + first client paint to avoid hydration mismatch,
  // then swap to detected locale after mount.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    }
  }, []);

  const t = useCallback((key: TranslationKey) => translate(key, locale), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback for components rendered outside provider (shouldn't happen normally)
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      t: (key: TranslationKey) => translate(key, "en"),
    };
  }
  return ctx;
}
