"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { COACHES } from "@/lib/coaches";
import CoachCard from "@/components/coach/CoachCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteBackground from "@/components/SiteBackground";
import { useI18n } from "@/lib/i18n/context";
import { useAuthStore } from "@/store/auth-store";
import {
  readPreferences,
  writePreferences,
  resetPreferences,
  Preferences,
  BoardTheme,
  DifficultyDefault,
  BOARD_THEMES,
} from "@/lib/preferences";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t, locale } = useI18n();
  const { isPro } = useAuthStore();
  const userIsPro = isPro();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setPrefs(readPreferences());
  }, []);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    const next = writePreferences({ [key]: value });
    setPrefs(next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  const handleReset = () => {
    setPrefs(resetPreferences());
  };

  if (!prefs) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <SiteBackground />

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">♟️</span>
          <span className="font-bold gradient-text">Dama Dojo</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <Link href="/play" className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {t("home.playNow")}
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{t("settings.title")}</h1>
          {savedFlash && (
            <div className="text-xs uppercase tracking-[0.08em] font-bold text-emerald-400 animate-pulse">
              ✓ {t("settings.saved")}
            </div>
          )}
        </div>
        <p className="text-white/60 text-sm md:text-base mb-10">{t("settings.subtitle")}</p>

        {/* Default Coach */}
        <section className="mb-10">
          <h2 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-2">
            {t("settings.defaultCoach")}
          </h2>
          <p className="text-sm text-white/60 mb-4">{t("settings.defaultCoachDesc")}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {COACHES.map(c => {
              const unlocked = !c.isPro || userIsPro;
              return (
                <CoachCard
                  key={c.id}
                  coach={c}
                  unlocked={unlocked}
                  selected={prefs.defaultCoach === c.id}
                  onClick={() => unlocked && update("defaultCoach", c.id)}
                  size="sm"
                />
              );
            })}
          </div>
        </section>

        {/* Board Theme */}
        <section className="mb-10">
          <h2 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-2">
            {t("settings.boardTheme")}
          </h2>
          <p className="text-sm text-white/60 mb-4">{t("settings.boardThemeDesc")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(BOARD_THEMES) as BoardTheme[]).map(themeId => {
              const theme = BOARD_THEMES[themeId];
              const selected = prefs.boardTheme === themeId;
              return (
                <button
                  key={themeId}
                  onClick={() => update("boardTheme", themeId)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all",
                    selected
                      ? "border-indigo-500/60 bg-indigo-500/[0.08] ring-1 ring-indigo-500/30"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  )}
                >
                  <div
                    className="w-full aspect-square rounded-lg overflow-hidden mb-3 grid grid-cols-4 grid-rows-4"
                    style={{ border: `3px solid ${theme.frame}` }}
                  >
                    {Array.from({ length: 16 }, (_, i) => {
                      const r = Math.floor(i / 4);
                      const c = i % 4;
                      const isDark = (r + c) % 2 === 1;
                      return <div key={i} style={{ background: isDark ? theme.dark : theme.light }} />;
                    })}
                  </div>
                  <div className="font-bold tracking-tight text-sm">{theme.label[locale]}</div>
                  {selected && (
                    <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-indigo-300 mt-1">
                      ✓ {t("common.selected")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Difficulty */}
        <section className="mb-10">
          <h2 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-3">
            {t("settings.defaultDifficulty")}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as DifficultyDefault[]).map(d => (
              <button
                key={d}
                onClick={() => update("defaultDifficulty", d)}
                className={cn(
                  "py-3 rounded-xl text-sm font-medium border transition-all",
                  prefs.defaultDifficulty === d
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-white/[0.03] border-white/10 text-white/60 hover:border-white/30"
                )}
              >
                {d === "easy" ? t("play.difficulty.easy") : d === "medium" ? t("play.difficulty.medium") : t("play.difficulty.hard")}
              </button>
            ))}
          </div>
        </section>

        {/* Toggles */}
        <section className="mb-10 space-y-3">
          <Toggle
            label={t("settings.soundEnabled")}
            on={prefs.soundEnabled}
            onChange={v => update("soundEnabled", v)}
          />
          <Toggle
            label={t("settings.showMoveHints")}
            on={prefs.showMoveHints}
            onChange={v => update("showMoveHints", v)}
          />
        </section>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="text-xs uppercase tracking-[0.08em] font-bold text-white/40 hover:text-white/70 transition-colors"
        >
          {t("settings.reset")}
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="w-full flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 hover:border-white/20 transition-all"
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={cn(
          "w-10 h-6 rounded-full relative transition-colors",
          on ? "bg-indigo-600" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all",
            on ? "left-[18px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}
