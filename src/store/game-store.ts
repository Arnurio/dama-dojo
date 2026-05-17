"use client";
import { create } from "zustand";
import {
  Board,
  PieceColor,
  Move,
  Position,
  createInitialBoard,
  getAllValidMoves,
  applyMove,
  checkWinner,
} from "@/lib/checkers-engine";

export type GameMode = "local" | "ai" | "online";
export type Difficulty = "easy" | "medium" | "hard";
export type GameStatus = "waiting" | "playing" | "finished";

export interface MoveRecord {
  from: Position;
  to: Position;
  captures: Position[];
  piece: string;
  player: PieceColor;
}

interface GameState {
  board: Board;
  currentTurn: PieceColor;
  selectedPiece: Position | null;
  validMoves: Move[];
  winner: PieceColor | "draw" | null;
  status: GameStatus;
  mode: GameMode;
  difficulty: Difficulty;
  selectedCoach: string;
  moveHistory: MoveRecord[];
  playerColor: PieceColor;
  roomId: string | null;

  initGame: (mode: GameMode, difficulty?: Difficulty, coach?: string, playerColor?: PieceColor) => void;
  selectPiece: (pos: Position) => void;
  makeMove: (move: Move) => void;
  resetGame: () => void;
  setRoomId: (id: string | null) => void;
  applyRemoteMove: (move: Move) => void;
  surrender: (loser: PieceColor) => void;
  declareDraw: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: createInitialBoard(),
  currentTurn: "red",
  selectedPiece: null,
  validMoves: [],
  winner: null,
  status: "waiting",
  mode: "local",
  difficulty: "medium",
  selectedCoach: "arman",
  moveHistory: [],
  playerColor: "red",
  roomId: null,

  initGame: (mode, difficulty = "medium", coach = "arman", playerColor = "red") => {
    const board = createInitialBoard();
    set({
      board,
      currentTurn: "red",
      selectedPiece: null,
      validMoves: [],
      winner: null,
      status: "playing",
      mode,
      difficulty,
      selectedCoach: coach,
      moveHistory: [],
      playerColor,
    });
  },

  selectPiece: (pos) => {
    const { board, currentTurn, mode, playerColor } = get();
    if (mode === "ai" && currentTurn !== playerColor) return;

    const piece = board[pos.row][pos.col];
    if (!piece || piece.color !== currentTurn) {
      set({ selectedPiece: null, validMoves: [] });
      return;
    }

    const all = getAllValidMoves(board, currentTurn);
    const moves = all.filter(m => m.from.row === pos.row && m.from.col === pos.col);
    set({ selectedPiece: pos, validMoves: moves });
  },

  makeMove: (move) => {
    const { board, currentTurn, moveHistory } = get();
    const piece = board[move.from.row][move.from.col];
    const newBoard = applyMove(board, move);
    const winner = checkWinner(newBoard);
    const nextTurn: PieceColor = currentTurn === "red" ? "black" : "red";

    const record: MoveRecord = {
      from: move.from,
      to: move.to,
      captures: move.captures,
      piece: piece?.type ?? "man",
      player: currentTurn,
    };

    set({
      board: newBoard,
      currentTurn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      winner,
      status: winner ? "finished" : "playing",
      moveHistory: [...moveHistory, record],
    });
  },

  applyRemoteMove: (move) => {
    const { board, currentTurn, moveHistory } = get();
    const piece = board[move.from.row][move.from.col];
    const newBoard = applyMove(board, move);
    const winner = checkWinner(newBoard);
    const nextTurn: PieceColor = currentTurn === "red" ? "black" : "red";

    const record: MoveRecord = {
      from: move.from,
      to: move.to,
      captures: move.captures,
      piece: piece?.type ?? "man",
      player: currentTurn,
    };

    set({
      board: newBoard,
      currentTurn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      winner,
      status: winner ? "finished" : "playing",
      moveHistory: [...moveHistory, record],
    });
  },

  resetGame: () => {
    set({
      board: createInitialBoard(),
      currentTurn: "red",
      selectedPiece: null,
      validMoves: [],
      winner: null,
      status: "waiting",
      moveHistory: [],
    });
  },

  setRoomId: (id) => set({ roomId: id }),

  surrender: (loser) => {
    const winner: PieceColor = loser === "red" ? "black" : "red";
    set({ winner, status: "finished", selectedPiece: null, validMoves: [] });
  },

  declareDraw: () => {
    set({ winner: "draw", status: "finished", selectedPiece: null, validMoves: [] });
  },
}));
