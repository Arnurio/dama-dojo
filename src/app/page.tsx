"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { COACHES } from "@/lib/coaches";
import CoachCard from "@/components/coach/CoachCard";

export default function Home() {
  const { user, profile, localPro, isPro } = useAuthStore();
  const userIsPro = isPro();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      alert("Login failed. If you're on a deployed site, the domain may need to be authorized in Firebase. Try playing as a guest — no login needed!");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">♟️</span>
          <span className="text-xl font-bold gradient-text">Dama Dojo</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/leaderboard" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline">
            Leaderboard
          </Link>
          <Link href="/shop" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline">
            {userIsPro ? "✨ Pro" : "Shop"}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {user.photoURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-indigo-500" />
              )}
              <span className="text-sm text-white/80 hidden sm:inline">{profile?.elo ?? 1000} ELO</span>
              <button onClick={handleLogout} className="text-sm text-white/40 hover:text-white/80 transition-colors hidden sm:inline">
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              Sign in (optional)
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-4 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
          🇰🇿 &nbsp; Built by a KZ vibe coder · nFactorial 2026
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
          Learn Checkers From
          <br />
          <span className="gradient-text">KZ Tech Legends</span>
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mb-8">
          Play online, get coached by Kazakhstan&apos;s top founders, climb the ELO ladder.
          <br />Arman teaches patience. Timur teaches dominance. Arlan says just vibe.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/play"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
          >
            Play Now ⚡
          </Link>
          <Link
            href="/play?mode=online"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all"
          >
            Find Match 🌐
          </Link>
        </div>
        <p className="text-xs text-white/40 mt-3">No signup required · Play instantly as guest</p>

        {/* Judge Pro banner */}
        {!userIsPro && (
          <div className="mt-6 bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/30 rounded-2xl px-6 py-3 flex items-center gap-3 backdrop-blur-sm">
            <span className="text-2xl">🧑‍⚖️</span>
            <div className="text-left">
              <div className="text-sm font-bold text-amber-300">For nFactorial Judges</div>
              <div className="text-xs text-white/60">Unlock all Pro features instantly — no login, no payment.</div>
            </div>
            <Link
              href="/shop?demo=true"
              className="ml-auto bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-2 rounded-lg text-sm font-bold transition-all shrink-0"
            >
              Unlock Pro · 0 ₸
            </Link>
          </div>
        )}
        {userIsPro && (
          <div className="mt-6 bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-500/30 rounded-2xl px-6 py-3 flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div className="text-left">
              <div className="text-sm font-bold text-green-300">Pro Active</div>
              <div className="text-xs text-white/60">All 5 coaches and unlimited AI analysis unlocked.</div>
            </div>
          </div>
        )}
        <div className="flex gap-8 mt-12 text-center">
          {[
            { label: "Active Players", value: "2,847" },
            { label: "Games Played", value: "14,203" },
            { label: "KZ Coaches", value: "5" },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-indigo-400">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Coach Roster */}
      <section className="relative z-10 px-4 md:px-8 py-12 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black mb-1">Top Coaches</h2>
            <p className="text-white/50 text-sm">5 founders · AI-powered · Real personalities</p>
          </div>
          <Link href="/coaches" className="text-sm text-indigo-400 hover:text-indigo-300 hidden md:inline">
            View all →
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
            { icon: "🧠", title: "AI Coach", desc: "Post-game analysis in your coach's voice." },
            { icon: "🌐", title: "Multiplayer", desc: "Online matchmaking or invite via link." },
            { icon: "📊", title: "ELO Ranking", desc: "City and global leaderboards." },
            { icon: "🎨", title: "Customize", desc: "Board skins, piece designs, coach outfits." },
          ].map(f => (
            <div key={f.title} className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="font-semibold text-sm mb-1">{f.title}</div>
              <div className="text-xs text-white/50">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pro CTA */}
      <section className="relative z-10 px-4 py-16 max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-8">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-2xl font-bold mb-2">Go Pro</h3>
          <p className="text-white/60 mb-6">
            All 5 coaches, unlimited AI analysis, exclusive skins, priority matchmaking.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Upgrade to Pro ✨
            </Link>
            <Link
              href="/shop?demo=true"
              className="bg-white/5 hover:bg-white/10 border border-white/20 px-6 py-3 rounded-xl font-semibold transition-all text-white/80"
            >
              🧑‍⚖️ Judge Demo — 0 ₸
            </Link>
          </div>
          <p className="text-xs text-white/30 mt-3">
            Production: Kaspi Pay / Freedom Pay · Demo: test card 4242 4242 4242 4242
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-sm text-white/30">
        <p>Built by Arnur Kemerbek · nFactorial Incubator 2026 · 2.5 days · Vibe coded with AI 🚀</p>
      </footer>
    </main>
  );
}
