"use client";
import { useState } from "react";
import { Coach } from "@/lib/coaches";
import { MoveRecord } from "@/store/game-store";
import { PieceColor } from "@/lib/checkers-engine";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  coach: Coach;
  moveHistory: MoveRecord[];
  winner: PieceColor | "draw" | null;
  playerColor: PieceColor;
  isPro: boolean;
  reviewsToday: number;
  onClose: () => void;
}

export default function CoachAnalysis({ coach, moveHistory, winner, playerColor, isPro, reviewsToday, onClose }: Props) {
  const { t, locale } = useI18n();
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(isPro);

  const freeLimit = 3;
  const canUseForFree = reviewsToday < freeLimit;
  const canAnalyze = unlocked || canUseForFree;

  const playerWon = winner === playerColor;
  const totalMoves = moveHistory.length;
  const playerCaptures = moveHistory.filter(m => m.player === playerColor && m.captures.length > 0).length;

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coach-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          coachPrompt: coach.aiPrompt,
          playerWon,
          totalMoves,
          playerCaptures,
          playerColor,
          winner,
          locale,
          moveHistory: moveHistory.map(m => ({
            from: m.from,
            to: m.to,
            captures: m.captures.length,
            player: m.player,
            piece: m.piece,
          })),
        }),
      });
      const data = await res.json();
      setAnalysis(data.analysis ?? t("analysis.fetchError"));
    } catch {
      setAnalysis(getOfflineAnalysis(coach, playerWon, playerCaptures, totalMoves, locale));
    } finally {
      setLoading(false);
    }
  };

  const handleJudgeUnlock = () => {
    setUnlocked(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111118] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{coach.avatar}</div>
            <div>
              <div className="font-black tracking-tight">{coach.name}</div>
              <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-indigo-400">{coach.title}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none transition-colors" aria-label="Close">×</button>
        </div>

        {/* Game summary */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
          <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-3">{t("analysis.summary")}</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className={`text-xl font-black tracking-tight ${playerWon ? "text-green-400" : "text-red-400"}`}>
                {playerWon ? t("analysis.win") : winner === "draw" ? t("analysis.draw") : t("analysis.loss")}
              </div>
              <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mt-1">{t("analysis.result")}</div>
            </div>
            <div>
              <div className="text-xl font-black tabular-nums text-indigo-400">{totalMoves}</div>
              <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mt-1">{t("analysis.totalMoves")}</div>
            </div>
            <div>
              <div className="text-xl font-black tabular-nums text-amber-400">{playerCaptures}</div>
              <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mt-1">{t("analysis.yourCaptures")}</div>
            </div>
          </div>
        </div>

        {/* Analysis section */}
        {!canAnalyze && !unlocked ? (
          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <div className="font-semibold mb-1">{t("analysis.dailyLimit")} ({freeLimit}/day)</div>
            <div className="text-sm text-white/60 mb-4">{t("analysis.proUpsell")}</div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleJudgeUnlock}
                className="bg-amber-500/20 border border-amber-500/40 text-amber-300 py-2 rounded-xl text-sm font-medium"
              >
                {t("analysis.judgeUnlock")}
              </button>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 py-2 rounded-xl text-sm font-medium">
                {t("analysis.upgradePro")}
              </button>
            </div>
          </div>
        ) : analysis ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-2">{t("analysis.coachSays")}</div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-white/85">{analysis}</div>
          </div>
        ) : (
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 py-3 rounded-xl font-semibold transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⟳</span> {coach.shortName} {t("analysis.analyzing")}
              </span>
            ) : (
              `${coach.avatar} ${t("analysis.getAnalysis")}`
            )}
          </button>
        )}

        {!isPro && canAnalyze && !analysis && (
          <p className="text-xs text-white/40 mt-2 text-center">
            {freeLimit - reviewsToday} {t("analysis.remaining")}
          </p>
        )}
      </div>
    </div>
  );
}

function getOfflineAnalysis(coach: Coach, playerWon: boolean, captures: number, totalMoves: number, _locale: string): string {
  const analyses: Record<string, string[]> = {
    arman: [
      `${playerWon ? "Победа — лишь начало пути. Истинное мастерство в том, чтобы понять, почему ты победил." : "Поражение — твой лучший учитель. Не убегай от него."}

Ты сделал ${totalMoves} ходов и взял ${captures} фигуры. ${captures < 3 ? "Больше атаки. Размен фигур — двигатель победы." : "Хорошее давление."}

Найди свое икигай в каждом ходе, кузнечик. 🌸`,
    ],
    erzat: [
      `${playerWon ? "YESSSS. That's how KZ engineers play. Bold. No retreat." : "We don't lose. We collect data. Get back in there."}

${captures} captures in ${totalMoves} moves. ${captures < 3 ? "Too passive. Next game — attack from move 1." : "Aggressive. I like it."}

Meta offered me billions. I said no. Now say no to losing. 🚀`,
    ],
    nurdaulet: [
      `${playerWon ? "Excellent ROI on this game." : "This game was a bad investment. Let's fix the portfolio."}

Analysis: ${totalMoves} moves, ${captures} captures. ${captures / totalMoves < 0.2 ? "Low capture rate — you're playing too conservatively. A VC who doesn't take risks doesn't get returns." : "Good aggression. Deploying capital well."}

From London to Almaty, I learned: patience + calculated risk = victory. 💼`,
    ],
    arlan: [
      `bro ${playerWon ? "WE WON LETS GOOO 🔥" : "nah we don't vibe that way. rematch."}

${totalMoves} moves. ${captures} caps. ${captures < 2 ? "bro u gotta capture more. that's literally free pieces 💀" : "the captures were clean fr fr"}

i dropped out of high school and got into YC. you can definitely learn checkers. vibe play next time ⚡`,
    ],
    timur: [
      `${playerWon ? "Acceptable." : "Unacceptable. I sponsor world champions. This was not champion-level play."}

${totalMoves} moves. ${captures} captures. ${captures < 4 ? "Insufficient aggression. Kings are built on the back of captured pieces." : "Capture rate noted."}

The board is a chess game. Every move has a price. Don't waste them. — Timur Turlov, President, Kazakhstan Chess Federation ♟️`,
    ],
  };

  const coachAnalyses = analyses[coach.id] ?? analyses.arman;
  return coachAnalyses[Math.floor(Math.random() * coachAnalyses.length)];
}
