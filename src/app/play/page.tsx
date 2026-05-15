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

function PlayPageInner() {
  const searchParams = useSearchParams();
  const initMode = (searchParams.get("mode") as GameMode) ?? "local";

  const { profile, isPro } = useAuthStore();
  const userIsPro = isPro();
  const {
    status, mode, currentTurn, winner, difficulty, selectedCoach,
    moveHistory, playerColor, initGame, board,
  } = useGameStore();

  const [showSetup, setShowSetup] = useState(true);
  const [setupMode, setSetupMode] = useState<GameMode>(initMode);
  const [setupDifficulty, setSetupDifficulty] = useState<Difficulty>("medium");
  const [setupCoach, setSetupCoach] = useState(profile?.selectedCoach ?? "arman");
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
    if (status === "finished") setShowAnalysis(true);
  }, [status]);

  const handleStart = () => {
    initGame(setupMode, setupDifficulty, setupCoach);
    setShowSetup(false);
    setShowAnalysis(false);
  };

  const coach = COACHES.find(c => c.id === selectedCoach) ?? COACHES[0];

  if (showSetup) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 mb-8 text-sm">← Back to home</Link>
        <h1 className="text-3xl font-bold mb-2">New Game</h1>
        <p className="text-white/50 mb-8">Choose your settings</p>

        {/* Mode */}
        <div className="w-full max-w-md mb-6">
          <label className="text-sm text-white/60 mb-2 block">Game Mode</label>
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
                {m === "local" ? "🤝 2 Players" : m === "ai" ? "🤖 vs AI" : "🌐 Online"}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty (AI only) */}
        {setupMode === "ai" && (
          <div className="w-full max-w-md mb-6">
            <label className="text-sm text-white/60 mb-2 block">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setSetupDifficulty(d)}
                  className={cn(
                    "py-3 rounded-xl text-sm font-medium border transition-all capitalize",
                    setupDifficulty === d
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                  )}
                >
                  {d === "easy" ? "😊 Easy" : d === "medium" ? "🧠 Medium" : "💀 Timur"}
                </button>
              ))}
            </div>
            {setupDifficulty === "hard" && (
              <p className="text-xs text-amber-400/80 mt-1 text-center">Warning: Timur Turlov difficulty is ruthless.</p>
            )}
          </div>
        )}

        {/* Coach */}
        <div className="w-full max-w-2xl mb-8">
          <label className="text-sm text-white/60 mb-3 block">Your Coach</label>
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
              4 coaches locked · <Link href="/shop" className="underline">Unlock Pro</Link> or use{" "}
              <Link href="/shop?demo=true" className="underline">Judge Demo (0 ₸)</Link>
            </p>
          )}
        </div>

        <button
          onClick={handleStart}
          className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
        >
          {setupMode === "online" ? "Find Match 🌐" : "Start Game ⚡"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/8 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button onClick={() => setShowSetup(true)} className="text-indigo-400 hover:text-indigo-300 text-sm">
          ← New Game
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{coach.avatar}</span>
          <span className="text-sm font-medium">{coach.name}</span>
          <span className="text-xs text-white/40">coaching</span>
        </div>
        <Link href="/" className="text-white/40 hover:text-white/80 text-sm">Home</Link>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start justify-center gap-6 p-4 md:p-8">
        {/* Game area */}
        <div className="flex flex-col items-center gap-4">
          {/* Turn indicator */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <div className={cn(
              "w-4 h-4 rounded-full",
              currentTurn === "red" ? "bg-red-500" : "bg-gray-200"
            )} />
            <span className="text-sm">
              {status === "finished"
                ? `${winner === "red" ? "🔴 Red" : "⚫ Black"} wins!`
                : `${currentTurn === "red" ? "🔴 Red" : "⚫ Black"}'s turn`}
            </span>
            {mode === "ai" && status === "playing" && currentTurn !== playerColor && (
              <span className="text-xs text-white/40">AI thinking...</span>
            )}
          </div>

          <CheckersBoard />

          {/* Move history */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 w-full max-w-sm max-h-32 overflow-y-auto">
            <div className="text-xs text-white/40 mb-2">Move history ({moveHistory.length})</div>
            <div className="space-y-0.5">
              {moveHistory.slice(-10).map((m, i) => (
                <div key={i} className="text-xs text-white/60 flex gap-2">
                  <span className={m.player === "red" ? "text-red-400" : "text-gray-400"}>●</span>
                  <span>
                    ({m.from.row},{m.from.col}) → ({m.to.row},{m.to.col})
                    {m.captures.length > 0 && <span className="text-amber-400"> ×{m.captures.length}</span>}
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
            <h3 className="text-sm font-semibold text-white/60 mb-3">Board Count</h3>
            {["red", "black"].map(color => {
              const count = board.flat().filter(p => p?.color === color).length;
              const kings = board.flat().filter(p => p?.color === color && p.type === "king").length;
              return (
                <div key={color} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-5 h-5 rounded-full border-2", color === "red" ? "bg-red-600 border-red-300" : "bg-gray-900 border-gray-500")} />
                    <span className="text-sm capitalize">{color}</span>
                  </div>
                  <span className="text-sm font-mono">{count} pieces {kings > 0 && <span className="text-amber-400">({kings}♛)</span>}</span>
                </div>
              );
            })}
          </div>

          {/* End-of-game buttons */}
          {status === "finished" && (
            <>
              <button
                onClick={() => setShowAnalysis(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
              >
                {coach.avatar} Get Coach Analysis
              </button>
              <button
                onClick={() => { setShowSetup(true); setShowAnalysis(false); }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-medium transition-all"
              >
                🔄 Play Again
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
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>}>
      <PlayPageInner />
    </Suspense>
  );
}
