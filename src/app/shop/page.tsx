"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { COACHES } from "@/lib/coaches";
import { Suspense } from "react";
import { useI18n } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

const SKINS = [
  { id: "classic", name: "Classic Dojo", price: 0, emoji: "🏡", desc: "The original. Clean, timeless." },
  { id: "neon", name: "Neon Terminal", price: 990, emoji: "💻", desc: "Arlan-approved. Green on black. Vibe aesthetic." },
  { id: "sakura", name: "Sakura Garden", price: 1490, emoji: "🌸", desc: "Arman's favorite. Cherry blossom board." },
  { id: "freedom", name: "Freedom Gold", price: 1990, emoji: "🏆", desc: "Timur's board. Navy and gold. Championship edition." },
  { id: "higgsfield", name: "Higgsfield Dark", price: 1490, emoji: "🎬", desc: "Erzat's palette. Dark neon. Refuse to lose." },
];

function ShopPageInner() {
  const searchParams = useSearchParams();
  const isJudgeDemo = searchParams.get("demo") === "true";
  const { user, profile, setProfile, setLocalPro, isPro } = useAuthStore();
  const { t } = useI18n();
  const userIsPro = isPro();
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(userIsPro);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isJudgeDemo && !userIsPro) {
      handleJudgeUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJudgeDemo, userIsPro]);

  const handleLogin = async () => {
    if (!auth) {
      alert("Sign-in unavailable — but you can still unlock Pro as a guest below!");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      alert("Sign-in unavailable on this domain — but you can still unlock Pro as a guest below!");
    }
  };

  const handleJudgeUnlock = async () => {
    setActivating(true);
    // Always set local Pro flag (works without login)
    setLocalPro(true);

    // Also sync to Firestore if logged in (optional bonus)
    if (user && profile && db) {
      try {
        const ref = doc(db, "users", user.uid);
        await updateDoc(ref, { isPro: true });
        setProfile({ ...profile, isPro: true });
      } catch (e) {
        console.error("Firestore sync failed (not blocking):", e);
      }
    }
    setActivated(true);
    setActivating(false);
  };

  const handleStripeCheckout = async (item: string, price: number) => {
    setCheckoutLoading(item);
    // In production: call /api/create-checkout-session
    // For demo: show test card info
    setTimeout(() => {
      alert(`Demo mode: Use test card 4242 4242 4242 4242, any future expiry, any CVC.\n\nIn production this would charge ${price} ₸ via Kaspi Pay or Stripe.`);
      setCheckoutLoading(null);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">♟️</span>
          <span className="font-bold gradient-text">Dama Dojo</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-sm text-white/60">
            {userIsPro ? <span className="text-amber-400">✨ {t("home.proActive")}</span> : "Free Plan"}
          </div>
          <LanguageSwitcher compact />
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-center mb-2">{t("shop.title")}</h1>
        <p className="text-white/60 text-center mb-8 text-base">{t("shop.subtitle")}</p>

        {/* Judge Demo Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-5 mb-8 text-center">
          <div className="text-3xl mb-2">🧑‍⚖️</div>
          <div className="text-lg font-bold text-amber-300 mb-1">For nFactorial Judges</div>
          <p className="text-sm text-white/70 max-w-md mx-auto mb-4">
            Click below to instantly unlock all Pro features — no login, no payment, no friction.
            Evaluate every coach, get unlimited AI analysis, and try every Pro skin.
          </p>
          {userIsPro || activated ? (
            <div className="text-green-400 font-semibold flex items-center justify-center gap-2">
              <span>✅ Pro Unlocked!</span>
              <Link href="/play" className="text-sm underline">Play now →</Link>
            </div>
          ) : (
            <button
              onClick={handleJudgeUnlock}
              disabled={activating}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-amber-950 px-8 py-3 rounded-xl font-bold transition-all text-base shadow-lg hover:scale-105 active:scale-95"
            >
              {activating ? "Unlocking..." : "🔓 Unlock Pro · 0 ₸"}
            </button>
          )}
          <p className="text-[10px] text-white/40 mt-3">
            In production: 2,990 ₸/month via Kaspi Pay or Stripe test card 4242 4242 4242 4242
          </p>
        </div>

        {/* Tier comparison: Free / Pro / Pro+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { tier: "Free", price: "0 ₸", color: "white/10", border: "white/10", features: ["1 free coach (Arman)", "3 AI analyses/day", "Local + AI play", "Classic skin"] },
            { tier: "Pro", price: "2,990 ₸/мес", color: "indigo-600/15", border: "indigo-500/40", badge: "Most Popular", features: ["All 5 KZ coaches", "Unlimited AI analysis", "All Pro skins", "Priority matchmaking", "Tournament entries"] },
            { tier: "Pro+", price: "5,990 ₸/мес", color: "amber-500/15", border: "amber-500/40", badge: "Premium", features: ["Everything in Pro", "Live AI analysis", "Private tournaments", "Custom coach voice", "Early access features", "Direct support"] },
          ].map(tier => (
            <div
              key={tier.tier}
              className={cn(
                "rounded-2xl p-5 flex flex-col border bg-gradient-to-br",
                tier.tier === "Pro" ? "from-indigo-600/15 to-purple-600/10 border-indigo-500/40 ring-2 ring-indigo-500/20" :
                tier.tier === "Pro+" ? "from-amber-500/15 to-yellow-500/10 border-amber-500/40" :
                "from-white/5 to-white/0 border-white/10"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-lg">{tier.tier}</div>
                {tier.badge && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{tier.badge}</span>}
              </div>
              <div className="text-2xl font-black mb-3">{tier.price}</div>
              <ul className="text-sm text-white/70 space-y-1.5 mb-4 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-green-400 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {tier.tier === "Free" ? (
                <div className="text-xs text-white/40 text-center">Current default</div>
              ) : (
                <button
                  onClick={() => handleStripeCheckout(tier.tier.toLowerCase(), tier.tier === "Pro" ? 2990 : 5990)}
                  disabled={!!checkoutLoading}
                  className={cn(
                    "w-full py-2.5 rounded-xl font-semibold text-sm transition-all",
                    tier.tier === "Pro+"
                      ? "bg-amber-500 hover:bg-amber-400 text-amber-950"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
                  )}
                >
                  {checkoutLoading === tier.tier.toLowerCase() ? "..." : `Get ${tier.tier}`}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Extras row: Gift Pro, Coach Pack, Tournament Entry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { id: "gift", emoji: "🎁", title: "Gift Pro", desc: "Send 1 month of Pro to a friend", price: "1,990 ₸" },
            { id: "coach_pack", emoji: "👑", title: "Coach Pack", desc: "Unlock 1 coach without full Pro", price: "990 ₸" },
            { id: "tournament", emoji: "🎫", title: "Tournament Entry", desc: "Enter weekly tournament (prize: 1mo Pro)", price: "490 ₸" },
          ].map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col">
              <div className="text-3xl mb-2">{item.emoji}</div>
              <div className="font-bold text-base mb-1">{item.title}</div>
              <p className="text-xs text-white/60 mb-3 flex-1">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{item.price}</span>
                <button
                  onClick={() => handleStripeCheckout(item.id, parseInt(item.price))}
                  disabled={!!checkoutLoading}
                  className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                >
                  {checkoutLoading === item.id ? "..." : "Buy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 rounded-3xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">✨</span>
                <span className="text-xl font-bold">Pro Plan</span>
                <span className="bg-indigo-600/30 text-indigo-300 text-xs px-2 py-0.5 rounded-full">Most Popular</span>
              </div>
              <p className="text-white/60 text-sm mb-3">Everything in free + all coaches + unlimited AI analysis + exclusive skins</p>
              <ul className="text-sm text-white/70 space-y-1">
                {["All 5 KZ founder coaches", "Unlimited AI Coach analysis", "Exclusive Pro board skins", "Priority matchmaking", "Extended move history"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-indigo-400">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center shrink-0">
              <div className="text-3xl font-black text-white">2,990 ₸</div>
              <div className="text-xs text-white/40">per month</div>
              <div className="text-xs text-white/30 mt-1">~$6 USD</div>
              <button
                onClick={() => handleStripeCheckout("pro", 2990)}
                disabled={checkoutLoading === "pro" || userIsPro}
                className="mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all w-full"
              >
                {userIsPro ? "✅ Active" : checkoutLoading === "pro" ? "Loading..." : "Upgrade Now"}
              </button>
              <Link href="/shop?demo=true" className="block text-xs text-amber-400/70 hover:text-amber-400 mt-2 underline">
                🧑‍⚖️ Judge Demo (0 ₸)
              </Link>
            </div>
          </div>
        </div>

        {/* Coaches */}
        <h2 className="text-xl font-bold mb-4">Coaches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {COACHES.map(coach => (
            <div key={coach.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{coach.avatar}</div>
                <div>
                  <div className="font-semibold text-sm">{coach.name}</div>
                  <div className="text-xs text-indigo-400">{coach.title}</div>
                </div>
                {!coach.isPro && <span className="ml-auto bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">FREE</span>}
                {coach.isPro && <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">PRO</span>}
              </div>
              <div className="text-xs italic text-white/50">&ldquo;{coach.catchphrase}&rdquo;</div>
            </div>
          ))}
        </div>

        {/* Board Skins */}
        <h2 className="text-xl font-bold mb-4">Board Skins</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKINS.map(skin => (
            <div key={skin.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{skin.emoji}</div>
                <div>
                  <div className="font-semibold text-sm">{skin.name}</div>
                  <div className="text-xs text-white/50">{skin.desc}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                {skin.price === 0 ? (
                  <span className="text-green-400 text-sm font-medium">Free</span>
                ) : (
                  <>
                    <div className="text-sm font-bold">{skin.price} ₸</div>
                    <button
                      onClick={() => handleStripeCheckout(skin.id, skin.price)}
                      disabled={!!checkoutLoading}
                      className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1 rounded-lg mt-1 transition-all disabled:opacity-50"
                    >
                      {checkoutLoading === skin.id ? "..." : "Buy"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment note */}
        <div className="mt-8 bg-white/3 border border-white/8 rounded-2xl p-4 text-sm text-white/50">
          <div className="font-semibold text-white/70 mb-1">💳 Payment Info</div>
          <p>Demo: Use Stripe test card <code className="bg-white/10 px-1 rounded">4242 4242 4242 4242</code> (any future date, any CVC).</p>
          <p className="mt-1">Production roadmap: Kaspi Pay + Freedom Pay integration for KZ users. Stripe for international.</p>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>}>
      <ShopPageInner />
    </Suspense>
  );
}
