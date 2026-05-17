"use client";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES, Locale } from "@/lib/i18n/dictionary";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors",
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
        )}
        aria-label="Change language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="font-medium text-white/80">{compact ? current.code.toUpperCase() : current.name}</span>
        <svg className="w-3 h-3 text-white/40" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-[#161620] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px]">
          {LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code as Locale); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left",
                l.code === locale
                  ? "bg-indigo-600/20 text-indigo-200"
                  : "hover:bg-white/5 text-white/80"
              )}
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1">{l.name}</span>
              {l.code === locale && <span className="text-indigo-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
