"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { COACHES } from "@/lib/coaches";
import { readStreak, readChallengeProgress, readAchievements, ACHIEVEMENTS, StreakData, ChallengeProgress, Achievement } from "@/lib/retention";
import { fetchTopPlayers, SEED_PLAYERS, LeaderboardEntry } from "@/lib/leaderboard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteBackground from "@/components/SiteBackground";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const AVATAR_OPTIONS = ["🥷", "🐱", "🦅", "🐺", "🦁", "🐯", "🐉", "🦊", "🧙", "🤖", "👑", "♟️"];
const CITIES = ["Almaty", "Astana", "Shymkent", "Karaganda", "Aktobe"];

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const { user, guestId, profile, localProfile, localStats, getElo, isPro, updateLocalProfile } = useAuthStore();

  const [nameDraft, setNameDraft] = useState("");
  const [savedFlash, setSavedFlash] = useState<"name" | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [challenge, setChallenge] = useState<ChallengeProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const elo = getElo();
  const userIsPro = isPro();
  const displayName =
    localProfile.displayName ||
    user?.displayName ||
    profile?.displayName ||
    `Guest ${guestId.slice(-4)}`;
  const avatar = localProfile.avatarEmoji || "🥷";
  const city = localProfile.city || profile?.city || "Almaty";
  const selectedCoach = profile?.selectedCoach || "arman";
  const coach = COACHES.find(c => c.id === selectedCoach) ?? COACHES[0];

  const wins = localStats.wins;
  const losses = localStats.losses;
  const draws = localStats.draws;
  const gamesPlayed = localStats.gamesPlayed;
  const decided = wins + losses;
  const winRate = decided > 0 ? Math.round((wins / decided) * 100) : 0;

  useEffect(() => {
    setNameDraft(localProfile.displayName);
    setStreak(readStreak());
    setChallenge(readChallengeProgress());
    const unlocked = readAchievements();
    setAchievements(
      ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: unlocked[a.id]?.unlocked ?? false,
        unlockedAt: unlocked[a.id]?.at,
      }))
    );
  }, [localProfile.displayName]);

  // Compute global rank
  useEffect(() => {
    const compute = async () => {
      const myUid = user?.uid ?? guestId;
      try {
        const list = await fetchTopPlayers({ city: "All", limit: 200 });
        const combined: LeaderboardEntry[] = list.length < 30
          ? [...list, ...SEED_PLAYERS.filter(p => !list.find(x => x.uid === p.uid))]
          : list;
        // Inject self
        const meEntry: LeaderboardEntry = {
          uid: myUid,
          displayName,
          city,
          elo,
          wins,
          losses,
          draws,
          gamesPlayed,
          isPro: userIsPro,
          selectedCoach,
        };
        const withMe = combined.find(p => p.uid === myUid)
          ? combined
          : [...combined, meEntry];
        const sorted = [...withMe].sort((a, b) => b.elo - a.elo);
        const idx = sorted.findIndex(p => p.uid === myUid);
        setRank(idx >= 0 ? idx + 1 : null);
      } catch {
        // fallback: rank against seeds only
        const all = [...SEED_PLAYERS, { uid: myUid, elo } as LeaderboardEntry];
        const sorted = [...all].sort((a, b) => b.elo - a.elo);
        setRank(sorted.findIndex(p => p.uid === myUid) + 1);
      }
    };
    void compute();
  }, [user?.uid, guestId, displayName, city, elo, wins, losses, draws, gamesPlayed, userIsPro, selectedCoach]);

  const saveName = () => {
    const trimmed = nameDraft.trim().slice(0, 24);
    updateLocalProfile({ displayName: trimmed });
    setSavedFlash("name");
    setTimeout(() => setSavedFlash(null), 1500);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header card: avatar + name + ELO */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-indigo-600/40 to-purple-600/30 border border-white/10 flex items-center justify-center text-5xl md:text-6xl shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
                {avatar}
              </div>
              {userIsPro && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full tracking-[0.08em] shadow-lg">
                  PRO
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight truncate">{displayName}</h1>
              </div>
              <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-4">
                {user ? `🇰🇿 ${t("profile.signedIn")}` : `🥷 ${t("profile.guest")}`} · {city}
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-6">
                <Stat label={t("profile.elo")} value={elo} tone="indigo" />
                <Stat label={t("profile.rank")} value={rank ? `#${rank}` : "—"} tone="white" />
                <Stat label={t("profile.winRate")} value={`${winRate}%`} tone="emerald" />
              </div>
            </div>
          </div>
        </div>

        {/* Edit name + city + avatar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Edit display name */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <h2 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-3">
              {t("profile.editName")}
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                placeholder={t("profile.editNamePlaceholder")}
                maxLength={24}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                onKeyDown={e => e.key === "Enter" && saveName()}
              />
              <button
                onClick={saveName}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  savedFlash === "name" ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500"
                )}
              >
                {savedFlash === "name" ? t("profile.saved") : t("profile.save")}
              </button>
            </div>
          </div>

          {/* Edit city */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <h2 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-3">
              {t("profile.city")}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => updateLocalProfile({ city: c })}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    city === c
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-white/[0.03] border-white/10 text-white/60 hover:border-white/30"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar picker */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-1">
            {t("profile.avatar")}
          </h2>
          <p className="text-xs text-white/50 mb-3">{t("profile.avatarDesc")}</p>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {AVATAR_OPTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => updateLocalProfile({ avatarEmoji: emoji })}
                className={cn(
                  "aspect-square rounded-xl text-2xl flex items-center justify-center border transition-all",
                  avatar === emoji
                    ? "bg-indigo-500/20 border-indigo-500/60 ring-1 ring-indigo-500/40 scale-105"
                    : "bg-white/[0.03] border-white/10 hover:border-white/30 hover:scale-105"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed stats */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-4">
            {t("profile.stats")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label={t("profile.wins")} value={wins} tone="emerald" />
            <Stat label={t("profile.losses")} value={losses} tone="red" />
            <Stat label={t("profile.draws")} value={draws} tone="white" />
            <Stat label={t("profile.gamesPlayed")} value={gamesPlayed} tone="indigo" />
          </div>
        </div>

        {/* Streak + Coach */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {streak && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="text-4xl">🔥</div>
              <div>
                <div className="text-2xl font-black tabular-nums tracking-tight leading-none">{streak.current}</div>
                <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mt-2">
                  Day streak · Best <span className="tabular-nums text-white/60">{streak.longest}</span>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="text-4xl">{coach.avatar}</div>
            <div className="min-w-0">
              <div className="font-black tracking-tight truncate">{coach.name}</div>
              <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-indigo-400 mt-1">
                {coach.title}
              </div>
              <Link href="/settings" className="text-[10px] text-white/40 hover:text-white/70 transition-colors">
                Change in settings →
              </Link>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40">
              Achievements
            </h2>
            <div className="text-xs font-black tabular-nums text-white/60">
              {unlockedCount}/{achievements.length}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {achievements.map(a => (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl p-3 border text-center transition-all",
                  a.unlocked
                    ? "bg-amber-500/[0.08] border-amber-500/30"
                    : "bg-white/[0.02] border-white/5 opacity-50"
                )}
                title={a.desc[locale]}
              >
                <div className="text-2xl mb-1">{a.unlocked ? a.emoji : "🔒"}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/60 truncate">
                  {a.title[locale]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Challenge today */}
        {challenge && challenge.completed && (
          <div className="bg-emerald-500/[0.08] border border-emerald-500/30 rounded-2xl p-4 text-center text-sm text-emerald-300 mb-6">
            ✅ Today&apos;s challenge complete!
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: "indigo" | "emerald" | "red" | "white" }) {
  const colors = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    red: "text-red-400",
    white: "text-white",
  };
  return (
    <div>
      <div className={cn("text-2xl md:text-3xl font-black tabular-nums tracking-tight leading-none", colors[tone])}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mt-2">
        {label}
      </div>
    </div>
  );
}
