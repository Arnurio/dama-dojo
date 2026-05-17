"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { COACHES, getCoach } from "@/lib/coaches";
import {
  OnlineGame,
  PlayerInfo,
  subscribeToGame,
  submitMove,
  resignGame,
  joinGameById,
  deserializeBoard,
} from "@/lib/multiplayer";
import { Board, Move, PieceColor, getAllValidMoves, getMovesForPiece } from "@/lib/checkers-engine";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function OnlineGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  const router = useRouter();
  const { user, profile, guestId } = useAuthStore();
  const { t } = useI18n();

  const [game, setGame] = useState<OnlineGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedPos, setSelectedPos] = useState<{ row: number; col: number } | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const myUid = user?.uid ?? guestId;

  const playerInfo: PlayerInfo = {
    uid: myUid || "guest_" + Math.random().toString(36).slice(2, 8),
    name: user?.displayName ?? profile?.displayName ?? "Guest " + (guestId.slice(-4) || "Player"),
    photo: user?.photoURL ?? "",
    coach: profile?.selectedCoach ?? "arman",
    elo: profile?.elo ?? 1000,
    city: profile?.city ?? "Almaty",
  };

  // My color in this game
  const myColor: PieceColor | null = game
    ? game.players.red?.uid === myUid
      ? "red"
      : game.players.black?.uid === myUid
      ? "black"
      : null
    : null;

  // Subscribe to game updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToGame(gameId, (g) => {
      if (!g) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setGame(g);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [gameId]);

  // Auto-join as black if I'm not in the game and there's an open slot
  useEffect(() => {
    if (!game || loading) return;
    if (game.players.red?.uid === myUid || game.players.black?.uid === myUid) return;
    if (game.players.red && game.players.black) return; // full
    if (game.status !== "waiting") return;

    joinGameById(gameId, playerInfo).catch(e => {
      console.error(e);
      setError("Couldn't join the game.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, loading]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!game || !myColor) return;
    if (game.status !== "active") return;
    if (game.currentTurn !== myColor) return;

    const board: Board = deserializeBoard(game.board);

    // Check if clicked a valid target
    const targetMove = validMoves.find(m => m.to.row === row && m.to.col === col);
    if (targetMove) {
      submitMove(gameId, targetMove, myColor).catch(e => {
        console.error(e);
        setError("Move failed: " + e.message);
      });
      setSelectedPos(null);
      setValidMoves([]);
      return;
    }

    // Try selecting a piece
    const piece = board[row][col];
    if (!piece || piece.color !== myColor) {
      setSelectedPos(null);
      setValidMoves([]);
      return;
    }

    const moves = getMovesForPiece(board, { row, col }, myColor);
    setSelectedPos({ row, col });
    setValidMoves(moves);
  }, [game, gameId, myColor, validMoves]);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareWhatsApp = () => {
    if (typeof window === "undefined") return;
    const msg = encodeURIComponent(`Сыграй со мной в дамку! ${window.location.href}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const shareTelegram = () => {
    if (typeof window === "undefined") return;
    const msg = encodeURIComponent("Сыграй со мной в дамку!");
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${msg}`, "_blank");
  };

  const handleResign = async () => {
    if (!myColor || !game || game.status !== "active") return;
    if (!confirm(t("room.resignConfirm"))) return;
    try {
      await resignGame(gameId, myColor);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl animate-spin">⟳</div>
          <div className="mt-2 text-white/60">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white px-4">
        <div className="text-5xl mb-3">🤔</div>
        <h1 className="text-2xl font-bold mb-2">{t("common.error")}</h1>
        <p className="text-white/50 text-center mb-6">This room doesn&apos;t exist or has been closed.</p>
        <Link href="/play/online" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-semibold">
          {t("room.backToLobby")}
        </Link>
      </div>
    );
  }

  if (!game) return null;

  const board: Board = deserializeBoard(game.board);
  const opponent = myColor === "red" ? game.players.black : myColor === "black" ? game.players.red : null;
  const me = myColor === "red" ? game.players.red : myColor === "black" ? game.players.black : null;
  const isMyTurn = game.currentTurn === myColor && game.status === "active";
  const myCoach = me ? getCoach(me.coach) : COACHES[0];
  const oppCoach = opponent ? getCoach(opponent.coach) : null;

  // For spectators (not in game)
  const isSpectator = !myColor;

  // Display orientation: black player views from black side
  const flipped = myColor === "black";
  const rows = flipped ? [...Array(8)].map((_, i) => 7 - i) : [...Array(8)].map((_, i) => i);
  const cols = flipped ? [...Array(8)].map((_, i) => 7 - i) : [...Array(8)].map((_, i) => i);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-indigo-600/8 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <Link href="/play/online" className="text-indigo-400 hover:text-indigo-300 text-sm">{t("room.backToLobby")}</Link>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/10 px-2 py-1 rounded font-mono">{game.code}</span>
          <button
            onClick={handleCopyLink}
            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
          >
            {copySuccess ? "✅" : `📋 ${t("room.copyLink")}`}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <Link href="/" className="text-white/40 hover:text-white text-sm">{t("nav.home")}</Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto p-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Waiting state */}
        {game.status === "waiting" && (
          <div className="bg-gradient-to-br from-amber-500/15 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-6 mb-4 text-center">
            <div className="text-3xl mb-2 animate-pulse">⏳</div>
            <div className="text-lg font-bold text-amber-300">{t("room.waiting")}</div>
            <p className="text-sm text-white/60 mt-1 mb-3">{t("room.shareCode")} <span className="font-bold tabular-nums tracking-wider text-amber-200">{game.code}</span></p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleCopyLink}
                className="bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-2 rounded-xl font-bold transition-all text-sm"
              >
                {copySuccess ? t("online.copied") : `📋 ${t("online.copyLink")}`}
              </button>
              <button
                onClick={shareWhatsApp}
                className="bg-green-600/30 hover:bg-green-600/40 border border-green-600/50 text-green-200 px-4 py-2 rounded-xl font-medium transition-all text-sm"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={shareTelegram}
                className="bg-sky-600/30 hover:bg-sky-600/40 border border-sky-600/50 text-sky-200 px-4 py-2 rounded-xl font-medium transition-all text-sm"
              >
                ✈️ Telegram
              </button>
            </div>
          </div>
        )}

        {/* Game over banner */}
        {game.status === "finished" && (
          <div className={cn(
            "border rounded-2xl p-5 mb-4 text-center",
            game.winner === myColor
              ? "bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/40"
              : game.winner === "draw"
              ? "bg-white/5 border-white/10"
              : "bg-red-500/10 border-red-500/30"
          )}>
            <div className="text-4xl mb-1">
              {game.winner === myColor ? "🏆" : game.winner === "draw" ? "🤝" : "💀"}
            </div>
            <div className="text-xl font-black">
              {game.winner === myColor ? t("room.youWon") : game.winner === "draw" ? t("analysis.draw") : t("room.gameOver")}
            </div>
            <p className="text-sm text-white/60 mt-1">
              {game.winner === "red" ? t("play.redWins") : game.winner === "black" ? t("play.blackWins") : t("analysis.draw")}
            </p>
            <Link
              href="/play/online"
              className="inline-block mt-3 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl font-semibold transition-all"
            >
              {t("room.rematch")}
            </Link>
          </div>
        )}

        {/* Players header */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <PlayerCard player={game.players.red} color="red" isTurn={game.currentTurn === "red" && game.status === "active"} isMe={myColor === "red"} />
          <PlayerCard player={game.players.black} color="black" isTurn={game.currentTurn === "black" && game.status === "active"} isMe={myColor === "black"} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Board */}
          <div className="flex flex-col items-center gap-3 mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm">
              {game.status === "waiting" && `⏳ ${t("room.waiting")}`}
              {game.status === "active" && (isMyTurn
                ? <span className="text-green-400 font-semibold">✓ {t("room.you")}</span>
                : <span className="text-white/60">{t("room.opponent")}</span>)}
              {game.status === "finished" && t("room.gameOver")}
              {isSpectator && game.status === "active" && <span className="text-amber-400">👁 {t("room.spectator")}</span>}
            </div>

            <div className="inline-block border-4 border-amber-900/60 rounded-lg overflow-hidden shadow-2xl">
              {rows.map(row => (
                <div key={row} className="flex">
                  {cols.map(col => {
                    const isDark = (row + col) % 2 === 1;
                    const piece = board[row][col];
                    const selected = selectedPos?.row === row && selectedPos?.col === col;
                    const isTarget = validMoves.some(m => m.to.row === row && m.to.col === col);

                    return (
                      <div
                        key={col}
                        onClick={() => handleCellClick(row, col)}
                        className={cn(
                          "board-cell w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center relative",
                          isDark ? "bg-[#b58863]" : "bg-[#f0d9b5]",
                          isMyTurn && piece?.color === myColor && "cursor-pointer hover:brightness-110",
                          isTarget && "cursor-pointer",
                        )}
                      >
                        {isTarget && isDark && (
                          <div className="valid-move-hint absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-yellow-400/60 border-2 border-yellow-400" />
                          </div>
                        )}
                        {piece && (
                          <div className={cn(
                            "piece relative w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 z-10",
                            piece.color === "red"
                              ? "bg-red-600 border-red-300 shadow-[0_3px_0_#7f1d1d]"
                              : "bg-gray-900 border-gray-600 shadow-[0_3px_0_#000]",
                            selected && "selected",
                          )}>
                            {piece.type === "king" && (
                              <span className="text-yellow-400 text-base font-black leading-none">♛</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {game.status === "active" && myColor && (
              <button
                onClick={handleResign}
                className="text-xs text-red-400/70 hover:text-red-400 mt-2"
              >
                🏳️ {t("room.resign")}
              </button>
            )}
          </div>

          {/* Sidebar: Move log */}
          <div className="w-full lg:w-72 bg-white/5 border border-white/10 rounded-2xl p-4 max-h-96 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white/60 mb-2">{t("play.moveHistory")} ({game.moves.length})</h3>
            {game.moves.length === 0 ? (
              <p className="text-xs text-white/30">—</p>
            ) : (
              <div className="space-y-1">
                {game.moves.slice().reverse().map((m, i) => {
                  const moveNum = game.moves.length - i;
                  return (
                    <div key={i} className="text-xs flex items-center gap-2">
                      <span className="text-white/30 w-6">{moveNum}.</span>
                      <span className={m.player === "red" ? "text-red-400" : "text-gray-400"}>●</span>
                      <span className="text-white/70">
                        ({m.from.row},{m.from.col}) → ({m.to.row},{m.to.col})
                        {m.captures.length > 0 && <span className="text-amber-400"> ×{m.captures.length}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  player,
  color,
  isTurn,
  isMe,
}: {
  player: PlayerInfo | null;
  color: PieceColor;
  isTurn: boolean;
  isMe: boolean;
}) {
  if (!player) {
    return (
      <div className="bg-white/3 border border-dashed border-white/15 rounded-2xl p-3 flex items-center gap-3 opacity-60">
        <div className={cn("w-10 h-10 rounded-full border-2", color === "red" ? "bg-red-600 border-red-300" : "bg-gray-900 border-gray-500")} />
        <div className="flex-1">
          <div className="font-semibold text-sm text-white/60">Waiting...</div>
          <div className="text-xs text-white/30">Empty slot</div>
        </div>
      </div>
    );
  }

  const coach = getCoach(player.coach);

  return (
    <div className={cn(
      "border rounded-2xl p-3 flex items-center gap-3 transition-all",
      isTurn ? "bg-gradient-to-r from-indigo-500/15 to-transparent border-indigo-500/40 shadow-lg" : "bg-white/5 border-white/10"
    )}>
      <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0", color === "red" ? "bg-red-600 border-red-300" : "bg-gray-900 border-gray-500")} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {player.name} {isMe && <span className="text-indigo-400 text-xs">(You)</span>}
        </div>
        <div className="text-xs text-white/40 truncate">
          {player.elo} ELO · {coach.shortName}
        </div>
      </div>
      {isTurn && <div className="text-xs text-green-400 font-bold animate-pulse shrink-0">●</div>}
    </div>
  );
}
