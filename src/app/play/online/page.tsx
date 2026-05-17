"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { auth, googleProvider, isFirebaseReady } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { createGame, joinGameByCode, findOrCreateQuickMatch, PlayerInfo } from "@/lib/multiplayer";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function OnlineLobbyPage() {
  const router = useRouter();
  const { user, profile, guestId } = useAuthStore();
  const { t } = useI18n();
  const [mode, setMode] = useState<"select" | "creating" | "joining" | "matching">("select");
  const [code, setCode] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const playerInfo: PlayerInfo = {
    uid: user?.uid ?? guestId ?? "guest_" + Math.random().toString(36).slice(2, 8),
    name: user?.displayName ?? profile?.displayName ?? "Guest " + (guestId.slice(-4) || "Player"),
    photo: user?.photoURL ?? "",
    coach: profile?.selectedCoach ?? "arman",
    elo: profile?.elo ?? 1000,
    city: profile?.city ?? "Almaty",
  };

  const requireFirebase = () => {
    if (!isFirebaseReady()) {
      setError(t("online.fbError"));
      return false;
    }
    return true;
  };

  const handleCreateGame = async () => {
    if (!requireFirebase()) return;
    setMode("creating");
    setError(null);
    try {
      const { id, code } = await createGame(playerInfo, false);
      setCreatedGameId(id);
      setCreatedCode(code);
    } catch (e) {
      console.error(e);
      setError("Failed to create game. Try again.");
      setMode("select");
    }
  };

  const handleQuickMatch = async () => {
    if (!requireFirebase()) return;
    setMode("matching");
    setError(null);
    try {
      const { gameId } = await findOrCreateQuickMatch(playerInfo);
      router.push(`/play/online/${gameId}`);
    } catch (e) {
      console.error(e);
      setError("Matchmaking failed. Try creating a private game and sharing the link.");
      setMode("select");
    }
  };

  const handleJoinByCode = async () => {
    if (!requireFirebase()) return;
    if (!code.trim()) return;
    setMode("joining");
    setError(null);
    try {
      const result = await joinGameByCode(code.toUpperCase().includes("DAMA-") ? code : `DAMA-${code}`, playerInfo);
      if (!result) {
        setError("Game not found or already started. Check the code.");
        setMode("select");
        return;
      }
      router.push(`/play/online/${result.gameId}`);
    } catch (e) {
      console.error(e);
      setError("Failed to join. Try again.");
      setMode("select");
    }
  };

  const inviteLink = () => {
    if (typeof window === "undefined" || !createdGameId) return "";
    return `${window.location.origin}/play/online/${createdGameId}`;
  };

  const handleCopyLink = () => {
    if (!createdGameId || typeof window === "undefined") return;
    const link = inviteLink();
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const link = inviteLink();
    const msg = encodeURIComponent(`Сыграй со мной в дамку! ${link}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const shareViaTelegram = () => {
    const link = inviteLink();
    const msg = encodeURIComponent("Сыграй со мной в дамку!");
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${msg}`, "_blank");
  };

  const handleGoToRoom = () => {
    if (createdGameId) router.push(`/play/online/${createdGameId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">♟️</span>
          <span className="font-bold gradient-text">Dama Dojo</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <Link href="/play" className="text-sm text-white/60 hover:text-white">← {t("play.newGame")}</Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-center mb-2">{t("online.title")}</h1>
        <p className="text-white/60 text-center mb-8 text-sm md:text-base">{t("online.subtitle")}</p>

        {/* Player info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-600/30 flex items-center justify-center text-lg font-bold">
            {playerInfo.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{playerInfo.name}</div>
            <div className="text-sm text-white/60">
              {user ? t("online.signedIn") : t("online.guest")} · <span className="font-black tabular-nums">{playerInfo.elo}</span> ELO · {playerInfo.city}
            </div>
          </div>
          {!user && (
            <button
              onClick={async () => {
                if (!auth) return alert("Sign-in unavailable");
                try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error(e); }
              }}
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg"
            >
              {t("nav.signIn")}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Created game waiting room */}
        {createdGameId && createdCode && (
          <div className="bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/30 rounded-3xl p-6 mb-6 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-lg font-bold text-emerald-300 mb-1">{t("online.roomCreated")}</div>
            <p className="text-sm text-white/60 mb-4">{t("online.shareCode")}</p>
            <div className="bg-black/30 rounded-2xl py-4 px-6 mb-4">
              <div className="text-3xl font-black tabular-nums tracking-wider text-emerald-200">{createdCode}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mb-2">
              <button
                onClick={handleCopyLink}
                className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl font-medium transition-all flex-1"
              >
                {copySuccess ? t("online.copied") : t("online.copyLink")}
              </button>
              <button
                onClick={handleGoToRoom}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl font-semibold transition-all flex-1"
              >
                {t("online.enterRoom")}
              </button>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={shareViaWhatsApp}
                className="bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 text-green-300 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={shareViaTelegram}
                className="bg-sky-600/20 hover:bg-sky-600/30 border border-sky-600/40 text-sky-300 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1"
              >
                ✈️ Telegram
              </button>
            </div>
          </div>
        )}

        {!createdGameId && (
          <>
            {/* Quick Match */}
            <button
              onClick={handleQuickMatch}
              disabled={mode === "matching"}
              className={cn(
                "w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 px-6 py-5 rounded-2xl font-bold text-lg transition-all mb-3",
                mode === "matching" && "opacity-70 cursor-wait"
              )}
            >
              {mode === "matching" ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="animate-spin">⟳</span> {t("online.searching")}
                </span>
              ) : (
                <>{t("online.quickMatch")}</>
              )}
            </button>
            <p className="text-sm text-white/50 text-center mb-6">{t("online.quickMatchDesc")}</p>

            {/* Two-column actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-2xl mb-2">🎮</div>
                <div className="font-bold mb-1 text-base">{t("online.playFriend")}</div>
                <p className="text-sm text-white/60 mb-4">{t("online.playFriendDesc")}</p>
                <button
                  onClick={handleCreateGame}
                  disabled={mode === "creating"}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2.5 rounded-xl font-semibold transition-all"
                >
                  {mode === "creating" ? t("online.creating") : t("online.createRoom")}
                </button>
              </div>

              {/* Join */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-2xl mb-2">🔑</div>
                <div className="font-bold mb-1 text-base">{t("online.joinRoom")}</div>
                <p className="text-sm text-white/60 mb-4">{t("online.joinRoomDesc")}</p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
                  placeholder="DAMA-XXXXX"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 mb-2 text-center font-bold tabular-nums tracking-wider focus:outline-none focus:border-indigo-500"
                  maxLength={10}
                />
                <button
                  onClick={handleJoinByCode}
                  disabled={mode === "joining" || !code.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 rounded-xl font-semibold transition-all"
                >
                  {mode === "joining" ? t("online.joining") : t("online.join")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Info */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/60 leading-relaxed">
          <p className="font-semibold text-white/80 mb-2">{t("online.howItWorks")}</p>
          <p className="mb-1">• {t("online.howQuick")}</p>
          <p className="mb-1">• {t("online.howFriend")}</p>
          <p>• {t("online.howRealtime")}</p>
        </div>
      </div>
    </div>
  );
}
