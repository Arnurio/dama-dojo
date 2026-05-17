"use client";
import { useGameStore } from "@/store/game-store";
import { Position, Move } from "@/lib/checkers-engine";
import { cn } from "@/lib/utils";

interface Props {
  onMoveComplete?: (move: Move) => void;
  flipped?: boolean;
}

export default function CheckersBoard({ onMoveComplete, flipped = false }: Props) {
  const { board, currentTurn, selectedPiece, validMoves, selectPiece, makeMove, status, playerColor, mode } = useGameStore();

  const isMyTurn = mode === "online" ? currentTurn === playerColor : true;
  const isValidMoveTarget = (row: number, col: number) =>
    validMoves.some(m => m.to.row === row && m.to.col === col);
  const isSelected = (row: number, col: number) =>
    selectedPiece?.row === row && selectedPiece?.col === col;

  const handleCellClick = (row: number, col: number) => {
    if (status !== "playing" || !isMyTurn) return;

    const moveTarget = validMoves.find(m => m.to.row === row && m.to.col === col);
    if (moveTarget) {
      makeMove(moveTarget);
      onMoveComplete?.(moveTarget);
      return;
    }

    selectPiece({ row, col });
  };

  const rows = flipped ? [...Array(8)].map((_, i) => 7 - i) : [...Array(8)].map((_, i) => i);
  const cols = flipped ? [...Array(8)].map((_, i) => 7 - i) : [...Array(8)].map((_, i) => i);

  return (
    <div className="inline-block border-4 border-amber-900/60 rounded-lg overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
      {rows.map((row) => (
        <div key={row} className="flex">
          {cols.map((col) => {
            const isDark = (row + col) % 2 === 1;
            const piece = board[row][col];
            const selected = isSelected(row, col);
            const isTarget = isValidMoveTarget(row, col);

            return (
              <div
                key={col}
                onClick={() => handleCellClick(row, col)}
                className={cn(
                  "board-cell w-14 h-14 md:w-16 md:h-16 flex items-center justify-center relative cursor-pointer",
                  isDark ? "bg-[#b58863]" : "bg-[#f0d9b5]",
                  isDark && "hover:brightness-110",
                )}
              >
                {/* Valid move hint */}
                {isTarget && isDark && (
                  <div className="valid-move-hint absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-yellow-400/60 border-2 border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.5)]" />
                  </div>
                )}

                {/* Piece */}
                {piece && (
                  <div
                    className={cn(
                      "piece relative w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 z-10",
                      piece.color === "red"
                        ? "bg-red-600 border-red-300 shadow-[0_4px_0_#7f1d1d]"
                        : "bg-gray-900 border-gray-600 shadow-[0_4px_0_#000]",
                      selected && "selected",
                    )}
                  >
                    {piece.type === "king" && (
                      <span className="text-yellow-400 text-lg font-black leading-none">♛</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
