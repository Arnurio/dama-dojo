"use client";
import Link from "next/link";
import { useState } from "react";
import { COACHES, Coach } from "@/lib/coaches";
import { useAuthStore } from "@/store/auth-store";
import CoachCard from "@/components/coach/CoachCard";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function CoachesPage() {
  const { isPro } = useAuthStore();
  const { t } = useI18n();
  const userIsPro = isPro();
  const [selected, setSelected] = useState<Coach>(COACHES[0]);

  const unlocked = (c: Coach) => !c.isPro || userIsPro;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

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

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-1">{t("home.coachesTitle")}</h1>
            <p className="text-white/60 text-base">
              {COACHES.length} {t("home.coachesDesc").split(" · ")[0].replace(/\d+\s+/, "")}
            </p>
          </div>
          <div className="text-sm text-white/40 hidden md:block">
            {userIsPro ? <span className="text-amber-400">✨ Pro · All unlocked</span> : "4 locked · Upgrade Pro"}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Coach grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {COACHES.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
                unlocked={unlocked(coach)}
                selected={selected.id === coach.id}
                onClick={() => setSelected(coach)}
                size="md"
              />
            ))}
          </div>

          {/* Detail panel */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sticky top-4 h-fit">
            <div className={cn("relative h-48 rounded-2xl mb-4 overflow-hidden bg-gradient-to-br", selected.bgGradient)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.imagePath}
                alt={selected.name}
                className="w-full h-full object-contain drop-shadow-2xl"
                onError={(e) => {
                  (e.currentTarget.style.display = "none");
                  const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = "flex";
                }}
              />
              <div className="absolute inset-0 hidden items-center justify-center text-8xl">
                {selected.avatar}
              </div>
              {selected.isPro && (
                <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full tracking-wider shadow-lg">
                  PRO
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-black">{selected.name}</h2>
              <div className="bg-indigo-600/30 text-indigo-300 font-black tabular-nums px-3 py-1 rounded-lg border border-indigo-500/30">
                {selected.rating}
              </div>
            </div>
            <div className="text-sm uppercase tracking-wider text-indigo-400 font-bold mb-1">
              {selected.title}
            </div>
            <div className="text-xs text-white/50 mb-4">{selected.company}</div>

            <p className="text-sm text-white/70 mb-4 leading-relaxed">{selected.bio}</p>

            <div className="space-y-2 mb-4">
              <Detail label="Specialty" value={selected.specialty} />
              <Detail label="Play Style" value={selected.playStyle} />
              <Detail label="Signature Opening" value={selected.signatureOpening} />
            </div>

            <div className="bg-black/30 rounded-xl p-3 mb-4 border border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Catchphrase</div>
              <div className="text-sm italic text-white/80">&ldquo;{selected.catchphrase}&rdquo;</div>
            </div>

            {unlocked(selected) ? (
              <Link
                href={`/play?coach=${selected.id}`}
                className="block w-full bg-indigo-600 hover:bg-indigo-500 text-center py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95"
              >
                Play with {selected.shortName} ⚡
              </Link>
            ) : (
              <Link
                href="/shop"
                className="block w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 text-center py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
              >
                🔒 Unlock Pro to Play
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
      <span className="text-white/50">{label}</span>
      <span className="font-semibold text-white/90 text-right">{value}</span>
    </div>
  );
}
