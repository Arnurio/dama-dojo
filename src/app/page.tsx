"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { COACHES } from "@/lib/coaches";
import CoachCard from "@/components/coach/CoachCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DailyWidget from "@/components/DailyWidget";
import { useI18n } from "@/lib/i18n/context";

export default function Home() {
  const { user, profile, isPro, getElo } = useAuthStore();
  const { t } = useI18n();
  const userIsPro = isPro();
  const currentElo = getElo();

  const handleLogin = async () => {
    if (!auth) {
      alert("Sign-in is not configured. You can still play and use Pro features as a guest!");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      alert("Login failed. If you're on a deployed site, the domain may need to be authorized in Firebase. Try playing as a guest — no login needed!");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">♟️</span>
          <span className="text-xl font-bold gradient-text">Dama Dojo</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/leaderboard" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline">
            {t("nav.leaderboard")}
          </Link>
          <Link href="/shop" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline">
            {userIsPro ? `✨ ${t("nav.pro")}` : t("nav.shop")}
          </Link>
          <LanguageSwitcher compact />
          {user ? (
            <div className="flex items-center gap-2">
              {user.photoURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-indigo-500" />
              )}
              <span className="text-sm text-white/80 hidden sm:inline">{currentElo} ELO</span>
              <button onClick={handleLogout} className="text-sm text-white/40 hover:text-white/80 transition-colors hidden sm:inline">
                {t("nav.signOut")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70 hidden sm:inline">{currentElo} ELO</span>
              <button
                onClick={handleLogin}
                className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                {t("nav.signIn")}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-4 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
          {t("home.badge")}
        </div>
        <h1 className="text-[clamp(2.5rem,5.2vw,4.5rem)] font-black leading-[1.05] tracking-[-0.02em] mb-5">
          {t("home.title1")}
          <br />
          <span className="gradient-text">{t("home.title2")}</span>
        </h1>
        <p className="text-base md:text-lg text-white/70 max-w-2xl mb-8 leading-relaxed">
          {t("home.subtitle")}
          <br />{t("home.subtitle2")}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/play"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
          >
            {t("home.playNow")}
          </Link>
          <Link
            href="/play/online"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all"
          >
            {t("home.findMatch")}
          </Link>
        </div>
        <p className="text-sm text-white/60 mt-4">{t("home.noSignup")}</p>

        {/* Free trial banner */}
        {!userIsPro && (
          <div className="mt-6 bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/30 rounded-2xl px-6 py-3 flex items-center gap-3 backdrop-blur-sm">
            <span className="text-2xl">🎁</span>
            <div className="text-left">
              <div className="text-base font-bold text-amber-300">{t("home.judgeBannerTitle")}</div>
              <div className="text-sm text-white/70">{t("home.judgeBannerDesc")}</div>
            </div>
            <Link
              href="/shop?demo=true"
              className="ml-auto bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-2 rounded-lg text-sm font-bold transition-all shrink-0"
            >
              {t("home.judgeBannerCta")}
            </Link>
          </div>
        )}
        {userIsPro && (
          <div className="mt-6 bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-500/30 rounded-2xl px-6 py-3 flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div className="text-left">
              <div className="text-base font-bold text-green-300">{t("home.proActive")}</div>
              <div className="text-sm text-white/70">{t("home.proActiveDesc")}</div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-12 text-center">
          {[
            { label: t("home.stats.activePlayers"), value: "2,847" },
            { label: t("home.stats.gamesPlayed"), value: "14,203" },
            { label: t("home.stats.coaches"), value: "5" },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-black text-indigo-400 tabular-nums tracking-tight">{stat.value}</div>
              <div className="text-xs sm:text-sm text-white/60 mt-1.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Streak + Challenge widgets */}
      <DailyWidget />

      {/* Coach Roster */}
      <section className="relative z-10 px-4 md:px-8 py-12 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{t("home.coachesTitle")}</h2>
            <p className="text-white/60 text-sm md:text-base mt-1">{t("home.coachesDesc")}</p>
          </div>
          <Link href="/coaches" className="text-sm text-indigo-400 hover:text-indigo-300 hidden md:inline">
            {t("home.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {COACHES.map((coach) => (
            <CoachCard
              key={coach.id}
              coach={coach}
              unlocked={!coach.isPro || userIsPro}
              size="md"
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 md:px-8 py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🧠", title: t("home.features.ai.title"), desc: t("home.features.ai.desc") },
            { icon: "🌐", title: t("home.features.multi.title"), desc: t("home.features.multi.desc") },
            { icon: "📊", title: t("home.features.elo.title"), desc: t("home.features.elo.desc") },
            { icon: "🎨", title: t("home.features.custom.title"), desc: t("home.features.custom.desc") },
          ].map(f => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 transition-all hover:border-white/20 hover:bg-white/[0.07]">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-bold text-lg mb-1.5 tracking-tight">{f.title}</div>
              <div className="text-sm text-white/60 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pro CTA */}
      <section className="relative z-10 px-4 py-16 max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-8 md:p-10">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">{t("home.proCta.title")}</h3>
          <p className="text-white/60 text-base mb-6 max-w-md mx-auto leading-relaxed">
            {t("home.proCta.desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              {t("home.proCta.upgrade")}
            </Link>
            <Link
              href="/shop?demo=true"
              className="bg-white/5 hover:bg-white/10 border border-white/20 px-6 py-3 rounded-xl font-semibold transition-all text-white/80"
            >
              {t("home.proCta.demo")}
            </Link>
          </div>
          <p className="text-sm text-white/50 mt-4">
            {t("home.proCta.note")}
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-white/40 tracking-wide">
        <p>{t("home.footer")}</p>
      </footer>
    </main>
  );
}
