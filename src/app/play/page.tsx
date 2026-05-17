"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGameStore, GameMode, Difficulty } from "@/store/game-store";
import { useAuthStore } from "@/store/auth-store";
import { getBestMove } from "@/lib/checkers-engine";
import { COACHES } from "@/lib/coaches";
import CheckersBoard from "@/components/game/CheckersBoard";
import CoachAnalysis from "@/components/game/CoachAnalysis";
import CoachCard from "@/components/coach/CoachCard";
import CoachCompanion from "@/components/game/CoachCompanion";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { useI18n } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteBackground from "@/components/SiteBackground";
import { updateChallengeProgress, unlockAchievement } from "@/lib/retention";
import { readPreferences } from "@/lib/preferences";

function PlayPageInner() {
  const searchParams = useSearchParams();
  const initMode = (searchParams.get("mode") as GameMode) ?? "local";

  const { profile, isPro, recordGameResult } = useAuthStore();
  const { t } = useI18n();
  const userIsPro = isPro();
  const [eloRecorded, setEloRecorded] = useState(false);
  const {
    status, mode, currentTurn, winner, difficulty, selectedCoach,
    moveHistory, playerColor, initGame, board, surrender, declareDraw,
  } = useGameStore();
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [showSetup, setShowSetup] = useState(true);
  const [setupMode, setSetupMode] = useState<GameMode>(initMode);
  const [setupDifficulty, setSetupDifficulty] = useState<Difficulty>("medium");
  const [setupCoach, setSetupCoach] = useState(profile?.selectedCoach ?? "arman");

  // Hydrate from preferences on mount
  useEffect(() => {
    const prefs = readPreferences();
    setSetupDifficulty(prefs.defaultDifficulty);
    if (!profile?.selectedCoach) setSetupCoach(prefs.defaultCoach);
  }, [profile?.selectedCoach]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const makeMove = useGameStore(s => s.makeMove);

  // AI move effect
  const triggerAiMove = useCallback(() => {
    const { board, currentTurn, playerColor, status, mode } = useGameStore.getState();
    if (mode !== "ai" || status !== "playing") return;
    if (currentTurn === playerColor) return;

    const aiColor = playerColor === "red" ? "black" : "red";
    setTimeout(() => {
      const best = getBestMove(board, aiColor, useGameStore.getState().difficulty);
      if (best) makeMove(best);
    }, 400);
  }, [makeMove]);

  useEffect(() => {
    if (mode === "ai" && status === "playing" && currentTurn !== playerColor) {
      triggerAiMove();
    }
  }, [currentTurn, mode, status, playerColor, triggerAiMove]);

  useEffect(() => {
    if (status === "finished") {
      setShowAnalysis(true);
      // Update ELO only for AI mode (local 2-player doesn't change ELO)
      if (mode === "ai" && !eloRecorded) {
        const opponentElo =
          difficulty === "easy" ? 800 : difficulty === "medium" ? 1200 : 1700;
        const result =
          winner === playerColor ? "win" : winner === "draw" ? "draw" : "loss";
        recordGameResult(opponentElo, result);
        // Retention hooks
        updateChallengeProgress(1);
        if (result === "win") {
          unlockAchievement("first_win");
          if (difficulty === "hard") unlockAchievement("beat_hard");
        }
        setEloRecorded(true);
      }
    }
    if (status === "playing" && eloRecorded) setEloRecorded(false);
  }, [status, mode, winner, playerColor, difficulty, recordGameResult, eloRecorded]);

  const handleStart = () => {
    if (setupMode === "online") {
      // Online mode lives in its own page with Firestore
      window.location.href = "/play/online";
      return;
    }
    initGame(setupMode, setupDifficulty, setupCoach);
    setShowSetup(false);
    setShowAnalysis(false);
  };

  const coach = COACHES.find(c => c.id === selectedCoach) ?? COACHES[0];

  if (showSetup) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        <SiteBackground />
        <div className="absolute top-4 right-4 z-10"><LanguageSwitcher compact /></div>
        <Link href="/" className="relative z-10 text-indigo-400 hover:text-indigo-300 mb-8 text-sm transition-colors">{t("nav.backHome")}</Link>
        <h1 className="relative z-10 text-3xl md:text-4xl font-black tracking-tight mb-2">{t("play.newGame")}</h1>
        <p className="relative z-10 text-white/60 mb-8 text-sm md:text-base">{t("play.chooseSettings")}</p>

        {/* Mode */}
        <div className="w-full max-w-md mb-6">
          <label className="text-sm text-white/60 mb-2 block">{t("play.gameMode")}</label>
          <div className="grid grid-cols-3 gap-2">
            {(["local", "ai", "online"] as GameMode[]).map(m => (
              <button
                key={m}
                onClick={() => setSetupMode(m)}
                className={cn(
                  "py-3 rounded-xl text-sm font-medium border transition-all",
                  setupMode === m
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                )}
              >
                {m === "local" ? t("play.mode.local") : m === "ai" ? t("play.mode.ai") : t("play.mode.online")}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty (AI only) */}
        {setupMode === "ai" && (
          <div className="w-full max-w-md mb-6">
            <label className="text-sm text-white/60 mb-2 block">{t("play.difficulty")}</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setSetupDifficulty(d)}
                  className={cn(
                    "py-3 rounded-xl text-sm font-medium border transition-all",
                    setupDifficulty === d
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                  )}
                >
                  {d === "easy" ? t("play.difficulty.easy") : d === "medium" ? t("play.difficulty.medium") : t("play.difficulty.hard")}
                </button>
              ))}
            </div>
            {setupDifficulty === "hard" && (
              <p className="text-xs text-amber-400/80 mt-2 text-center">{t("play.hardWarning")}</p>
            )}
          </div>
        )}

        {/* Coach */}
        <div className="w-full max-w-2xl mb-8">
          <label className="text-sm text-white/60 mb-3 block">{t("play.yourCoach")}</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {COACHES.map(c => {
              const unlocked = !c.isPro || userIsPro;
              return (
                <CoachCard
                  key={c.id}
                  coach={c}
                  unlocked={unlocked}
                  selected={setupCoach === c.id}
                  onClick={() => unlocked && setSetupCoach(c.id)}
                  size="sm"
                />
              );
            })}
          </div>
          {!userIsPro && (
            <p className="text-xs text-amber-400/70 mt-3 text-center">
              {t("play.locked")} · <Link href="/shop" className="underline">{t("play.unlockPro")}</Link> · <Link href="/shop?demo=true" className="underline">{t("play.judgeDemo")}</Link>
            </p>
          )}
        </div>

        <button
          onClick={handleStart}
          className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
        >
          {setupMode === "online" ? t("play.findMatch") : t("play.startGame")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <SiteBackground />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5 gap-2">
        <button onClick={() => setShowSetup(true)} className="text-indigo-400 hover:text-indigo-300 text-sm">
          {t("play.newGameBtn")}
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">{coach.avatar}</span>
          <span className="text-sm font-medium truncate">{coach.name}</span>
          <span className="text-xs text-white/40 hidden sm:inline">{t("play.coaching")}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <Link href="/" className="text-white/40 hover:text-white/80 text-sm">{t("nav.home")}</Link>
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start justify-center gap-6 p-4 md:p-8">
        {/* Game area */}
        <div className="flex flex-col items-center gap-4">
          {/* Turn indicator */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
            <div className={cn(
              "w-4 h-4 rounded-full transition-all",
              currentTurn === "red" ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" : "bg-gray-200 shadow-[0_0_12px_rgba(229,231,235,0.4)]"
            )} />
            <span className="text-sm font-semibold tracking-tight">
              {status === "finished"
                ? (winner === "red" ? t("play.redWins") : t("play.blackWins"))
                : (currentTurn === "red" ? t("play.redsTurn") : t("play.blacksTurn"))}
            </span>
            {mode === "ai" && status === "playing" && currentTurn !== playerColor && (
              <span className="text-[10px] uppercase tracking-[0.08em] font-bold text-indigo-300 animate-pulse">{t("play.aiThinking")}</span>
            )}
          </div>

          <CheckersBoard />

          {/* Move history */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 w-full max-w-sm max-h-32 overflow-y-auto">
            <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-2">
              {t("play.moveHistory")} · <span className="tabular-nums">{moveHistory.length}</span>
            </div>
            <div className="space-y-0.5">
              {moveHistory.slice(-10).map((m, i) => (
                <div key={i} className="text-xs text-white/60 flex gap-2 font-mono tabular-nums">
                  <span className={m.player === "red" ? "text-red-400" : "text-gray-400"}>●</span>
                  <span>
                    ({m.from.row},{m.from.col}) → ({m.to.row},{m.to.col})
                    {m.captures.length > 0 && <span className="text-amber-400 font-bold"> ×{m.captures.length}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 w-full lg:w-80">
          {/* Coach Companion — big chess.com-style panel */}
          <CoachCompanion
            coach={coach}
            gameStatus={status}
            winner={winner}
            playerColor={playerColor}
            movesPlayed={moveHistory.length}
            lastCaptureBy={moveHistory.length > 0 && moveHistory[moveHistory.length - 1].captures.length > 0
              ? moveHistory[moveHistory.length - 1].player
              : null}
          />

          {/* Scoreboard */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-3">{t("play.boardCount")}</h3>
            {["red", "black"].map(color => {
              const count = board.flat().filter(p => p?.color === color).length;
              const kings = board.flat().filter(p => p?.color === color && p.type === "king").length;
              return (
                <div key={color} className="flex items-center justify-between mb-2 last:mb-0">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2",
                      color === "red" ? "bg-red-600 border-red-300 shadow-[0_2px_0_#7f1d1d]" : "bg-gray-900 border-gray-500 shadow-[0_2px_0_#000]"
                    )} />
                    <span className="text-sm font-semibold">{color === "red" ? t("play.red") : t("play.black")}</span>
                  </div>
                  <span className="text-sm font-black tabular-nums">
                    {count} <span className="text-xs font-normal text-white/40">{t("play.pieces")}</span>
                    {kings > 0 && <span className="text-amber-400 ml-1">({kings}♛)</span>}
                  </span>
                </div>
              );
            })}
          </div>

          {/* In-game actions: surrender / draw / ask surrender */}
          {status === "playing" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-3">{t("play.actions")}</h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    if (!confirm(t("play.confirmSurrender"))) return;
                    surrender(playerColor);
                  }}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 py-2 rounded-xl text-sm font-medium transition-all"
                >
                  🏳️ {t("play.surrender")}
                </button>
                <button
                  onClick={() => {
                    if (mode === "local") {
                      declareDraw();
                      return;
                    }
                    // AI mode: piece-count heuristic
                    const aiColor = playerColor === "red" ? "black" : "red";
                    const myCount = board.flat().filter(p => p?.color === playerColor).length;
                    const aiCount = board.flat().filter(p => p?.color === aiColor).length;
                    const aiAhead = aiCount - myCount;
                    // AI accepts if not clearly winning
                    if (aiAhead < 2) {
                      setActionMsg(t("play.drawAccepted"));
                      setTimeout(() => declareDraw(), 600);
                    } else {
                      setActionMsg(t("play.drawDeclined"));
                      setTimeout(() => setActionMsg(null), 2500);
                    }
                  }}
                  className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 py-2 rounded-xl text-sm font-medium transition-all"
                >
                  🤝 {t("play.offerDraw")}
                </button>
                {mode === "ai" && (
                  <button
                    onClick={() => {
                      const aiColor = playerColor === "red" ? "black" : "red";
                      const myCount = board.flat().filter(p => p?.color === playerColor).length;
                      const aiCount = board.flat().filter(p => p?.color === aiColor).length;
                      const myAdvantage = myCount - aiCount;
                      // AI surrenders only if far behind
                      if (myAdvantage >= 4) {
                        setActionMsg(t("play.aiSurrendered"));
                        setTimeout(() => surrender(aiColor), 600);
                      } else {
                        setActionMsg(t("play.aiRefusedSurrender"));
                        setTimeout(() => setActionMsg(null), 2500);
                      }
                    }}
                    className="bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-200 py-2 rounded-xl text-sm font-medium transition-all"
                  >
                    🫣 {t("play.askSurrender")}
                  </button>
                )}
                {actionMsg && (
                  <div className="text-xs text-center text-white/70 bg-white/5 rounded-lg py-2 px-3 mt-1">
                    {actionMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* End-of-game buttons */}
          {status === "finished" && (
            <>
              <button
                onClick={() => setShowAnalysis(true)}
                className="bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
              >
                {coach.avatar} {t("play.getAnalysis")}
              </button>
              <button
                onClick={() => { setShowSetup(true); setShowAnalysis(false); }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-medium transition-all"
              >
                {t("play.playAgain")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Analysis modal */}
      {showAnalysis && (
        <CoachAnalysis
          onClose={() => setShowAnalysis(false)}
          coach={coach}
          moveHistory={moveHistory}
          winner={winner}
          playerColor={playerColor}
          isPro={userIsPro}
          reviewsToday={profile?.aiReviewsToday ?? 0}
        />
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">⏳</div>}>
      <PlayPageInner />
    </Suspense>
  );
}
