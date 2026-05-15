export type PieceColor = "red" | "black";
export type PieceType = "man" | "king";

export interface Piece {
  color: PieceColor;
  type: PieceType;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[];
}

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: "black", type: "man" };
      }
    }
  }

  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: "red", type: "man" };
      }
    }
  }

  return board;
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getCaptures(board: Board, from: Position, color: PieceColor, type: PieceType): Move[] {
  const moves: Move[] = [];
  const dirs = type === "king"
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : color === "red"
    ? [[-1, -1], [-1, 1]]
    : [[1, -1], [1, 1]];

  for (const [dr, dc] of dirs) {
    const midRow = from.row + dr;
    const midCol = from.col + dc;
    const toRow = from.row + dr * 2;
    const toCol = from.col + dc * 2;

    if (!inBounds(toRow, toCol)) continue;
    const mid = board[midRow]?.[midCol];
    const dest = board[toRow][toCol];
    if (mid && mid.color !== color && dest === null) {
      moves.push({
        from,
        to: { row: toRow, col: toCol },
        captures: [{ row: midRow, col: midCol }],
      });
    }
  }

  return moves;
}

function getSimpleMoves(board: Board, from: Position, color: PieceColor, type: PieceType): Move[] {
  const moves: Move[] = [];
  const dirs = type === "king"
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : color === "red"
    ? [[-1, -1], [-1, 1]]
    : [[1, -1], [1, 1]];

  for (const [dr, dc] of dirs) {
    const toRow = from.row + dr;
    const toCol = from.col + dc;
    if (inBounds(toRow, toCol) && board[toRow][toCol] === null) {
      moves.push({ from, to: { row: toRow, col: toCol }, captures: [] });
    }
  }

  return moves;
}

export function getAllValidMoves(board: Board, color: PieceColor): Move[] {
  const captureMoves: Move[] = [];
  const simpleMoves: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) continue;
      const pos = { row, col };
      captureMoves.push(...getCaptures(board, pos, color, piece.type));
      simpleMoves.push(...getSimpleMoves(board, pos, color, piece.type));
    }
  }

  // Mandatory capture rule
  return captureMoves.length > 0 ? captureMoves : simpleMoves;
}

export function getMovesForPiece(board: Board, pos: Position, color: PieceColor): Move[] {
  const all = getAllValidMoves(board, color);
  return all.filter(m => m.from.row === pos.row && m.from.col === pos.col);
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[move.from.row][move.from.col]!;

  newBoard[move.from.row][move.from.col] = null;
  newBoard[move.to.row][move.to.col] = piece;

  for (const cap of move.captures) {
    newBoard[cap.row][cap.col] = null;
  }

  // King promotion
  if (piece.type === "man") {
    if (piece.color === "red" && move.to.row === 0) {
      newBoard[move.to.row][move.to.col] = { color: "red", type: "king" };
    }
    if (piece.color === "black" && move.to.row === 7) {
      newBoard[move.to.row][move.to.col] = { color: "black", type: "king" };
    }
  }

  return newBoard;
}

export function checkWinner(board: Board): PieceColor | "draw" | null {
  const redPieces = board.flat().filter(p => p?.color === "red").length;
  const blackPieces = board.flat().filter(p => p?.color === "black").length;
  const redMoves = getAllValidMoves(board, "red").length;
  const blackMoves = getAllValidMoves(board, "black").length;

  if (redPieces === 0 || redMoves === 0) return "black";
  if (blackPieces === 0 || blackMoves === 0) return "red";
  return null;
}

// Minimax AI
function scoreBoard(board: Board): number {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p) continue;
      const val = p.type === "king" ? 3 : 1;
      score += p.color === "black" ? val : -val;
    }
  }
  return score;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  const winner = checkWinner(board);
  if (winner === "black") return 1000;
  if (winner === "red") return -1000;
  if (depth === 0) return scoreBoard(board);

  const color: PieceColor = maximizing ? "black" : "red";
  const moves = getAllValidMoves(board, color);

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      const next = applyMove(board, move);
      best = Math.max(best, minimax(next, depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const next = applyMove(board, move);
      best = Math.min(best, minimax(next, depth - 1, alpha, beta, true));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function getBestMove(board: Board, color: PieceColor, difficulty: "easy" | "medium" | "hard"): Move | null {
  const moves = getAllValidMoves(board, color);
  if (moves.length === 0) return null;

  const depth = difficulty === "easy" ? 1 : difficulty === "medium" ? 3 : 6;
  const maximizing = color === "black";

  let bestMove = moves[0];
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const next = applyMove(board, move);
    const score = minimax(next, depth - 1, -Infinity, Infinity, !maximizing);
    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
