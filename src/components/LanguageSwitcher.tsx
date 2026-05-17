"use client";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES, Locale } from "@/lib/i18n/dictionary";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0];

  useEffect(() => { setMounted(true); }, []);

  // Position dropdown via fixed coords so it escapes parent stacking contexts
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuWidth = 160;
    setCoords({
      top: rect.bottom + 8,
      left: Math.max(8, rect.right - menuWidth),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onScroll() { setOpen(false); }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
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
      {mounted && open && coords && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: coords.top, left: coords.left, width: 168, zIndex: 9999 }}
          className="bg-[#161620] border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-sm"
        >
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 border-b border-white/5">
            Language
          </div>
          {LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code as Locale); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left",
                l.code === locale
                  ? "bg-indigo-600/20 text-indigo-100 font-semibold"
                  : "hover:bg-white/5 text-white/80"
              )}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span className="flex-1">{l.name}</span>
              {l.code === locale && <span className="text-indigo-400 text-xs">✓</span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
