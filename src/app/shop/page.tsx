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
  const { user, profile, setProfile } = useAuthStore();
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isJudgeDemo && profile && !profile.isPro) {
      handleJudgeUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJudgeDemo, profile]);

  const handleLogin = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const handleJudgeUnlock = async () => {
    if (!user || !profile) return;
    setActivating(true);
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { isPro: true });
      setProfile({ ...profile, isPro: true });
      setActivated(true);
    } catch (e) {
      console.error(e);
    } finally {
      setActivating(false);
    }
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
        {user && profile && (
          <div className="text-sm text-white/60">
            {profile.isPro ? <span className="text-amber-400">✨ Pro Member</span> : "Free Plan"}
          </div>
        )}
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-center mb-2">Shop</h1>
        <p className="text-white/50 text-center mb-8">Unlock coaches, skins, and pro features</p>

        {/* Judge Demo Banner */}
        {isJudgeDemo && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 text-center">
            <div className="text-2xl mb-2">🧑‍⚖️</div>
            <div className="font-semibold text-amber-300">Judge Demo Mode</div>
            <p className="text-sm text-white/60 mt-1">
              This button unlocks Pro for 0 ₸ so judges can evaluate all features without spending money.
              In production, Pro costs 2,990 ₸/month via Kaspi Pay.
            </p>
            {activated ? (
              <div className="mt-3 text-green-400 font-semibold">✅ Pro unlocked! All features available.</div>
            ) : !user ? (
              <button onClick={handleLogin} className="mt-3 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-xl font-semibold transition-all">
                Sign in to unlock
              </button>
            ) : (
              <button
                onClick={handleJudgeUnlock}
                disabled={activating || profile?.isPro}
                className="mt-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black px-6 py-2 rounded-xl font-semibold transition-all"
              >
                {activating ? "Unlocking..." : profile?.isPro ? "✅ Already Pro" : "Unlock Pro for 0 ₸"}
              </button>
            )}
          </div>
        )}

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
                disabled={checkoutLoading === "pro" || profile?.isPro}
                className="mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all w-full"
              >
                {profile?.isPro ? "✅ Active" : checkoutLoading === "pro" ? "Loading..." : "Upgrade Now"}
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
