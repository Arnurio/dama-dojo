"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { tickStreak, readChallengeProgress, getTodayChallenge, StreakData, ChallengeProgress } from "@/lib/retention";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function DailyWidget() {
  const { locale } = useI18n();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [challenge, setChallenge] = useState<ChallengeProgress | null>(null);

  useEffect(() => {
    setStreak(tickStreak());
    setChallenge(readChallengeProgress());
  }, []);

  if (!streak || !challenge) return null;

  const todayCh = getTodayChallenge();
  const progressPct = Math.min(100, (challenge.progress / todayCh.goalValue) * 100);
  const localized = (field: "title" | "desc") => todayCh[field][locale];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto px-4 mb-12">
      {/* Streak card */}
      <div className={cn(
        "rounded-2xl border p-5 flex items-center gap-4",
        streak.current >= 7
          ? "bg-gradient-to-br from-orange-500/20 to-red-500/15 border-orange-500/40"
          : streak.current >= 3
          ? "bg-gradient-to-br from-amber-500/15 to-yellow-500/10 border-amber-500/30"
          : "bg-white/5 border-white/10"
      )}>
        <div className="text-5xl">🔥</div>
        <div className="flex-1">
          <div className="text-3xl font-black tabular-nums">
            {streak.current} <span className="text-sm font-normal text-white/60">
              {locale === "ru" ? "дней подряд" : locale === "kk" ? "күн қатарынан" : "day streak"}
            </span>
          </div>
          <div className="text-xs text-white/50 mt-1">
            {locale === "ru" ? "Лучшая серия" : locale === "kk" ? "Ең үздік серия" : "Best"}: {streak.longest} ·{" "}
            {locale === "ru" ? "Всего" : locale === "kk" ? "Барлығы" : "Total"}: {streak.totalDays}
          </div>
        </div>
      </div>

      {/* Daily Challenge */}
      <Link
        href="/play?mode=ai"
        className={cn(
          "rounded-2xl border p-5 flex items-center gap-4 transition-all hover:scale-[1.02]",
          challenge.completed
            ? "bg-gradient-to-br from-green-500/20 to-emerald-500/15 border-green-500/40"
            : "bg-gradient-to-br from-indigo-600/15 to-purple-600/10 border-indigo-500/30 hover:border-indigo-500/50"
        )}
      >
        <div className="text-4xl">{challenge.completed ? "✅" : todayCh.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-sm uppercase tracking-wider text-indigo-300">
              {locale === "ru" ? "Дневной челлендж" : locale === "kk" ? "Күнделікті челлендж" : "Daily Challenge"}
            </div>
            <div className="text-xs font-bold text-amber-300 shrink-0">+{todayCh.reward} 🪙</div>
          </div>
          <div className="font-bold text-base mt-0.5">{localized("title")}</div>
          <div className="text-xs text-white/60">{localized("desc")}</div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                challenge.completed ? "bg-green-400" : "bg-gradient-to-r from-indigo-500 to-purple-500"
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            {challenge.progress}/{todayCh.goalValue}
          </div>
        </div>
      </Link>
    </div>
  );
}
