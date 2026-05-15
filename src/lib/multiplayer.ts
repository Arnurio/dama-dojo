import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Board, Move, PieceColor, createInitialBoard, applyMove, checkWinner } from "@/lib/checkers-engine";

export interface PlayerInfo {
  uid: string;
  name: string;
  photo: string;
  coach: string;
  elo: number;
  city: string;
}

export interface OnlineGame {
  id: string;
  code: string; // human-friendly code like "DAMA-X7K"
  players: {
    red: PlayerInfo | null;
    black: PlayerInfo | null;
  };
  board: string; // serialized board
  currentTurn: PieceColor;
  moves: Array<{
    from: { row: number; col: number };
    to: { row: number; col: number };
    captures: Array<{ row: number; col: number }>;
    player: PieceColor;
    timestamp?: Timestamp;
  }>;
  status: "waiting" | "active" | "finished";
  winner: PieceColor | "draw" | null;
  createdAt?: Timestamp;
  isPublic: boolean; // if true, appears in matchmaking
}

const GAMES_COLLECTION = "games";

function serializeBoard(board: Board): string {
  return JSON.stringify(board);
}

export function deserializeBoard(serialized: string): Board {
  return JSON.parse(serialized);
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DAMA-${code}`;
}

function generateGameId(): string {
  return Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

/**
 * Create a new game room. Returns the game ID and human-friendly code.
 */
export async function createGame(creator: PlayerInfo, isPublic: boolean = false): Promise<{ id: string; code: string }> {
  if (!db) throw new Error("Firebase not configured");

  const id = generateGameId();
  const code = generateCode();

  const game: Omit<OnlineGame, "id" | "createdAt"> = {
    code,
    players: { red: creator, black: null },
    board: serializeBoard(createInitialBoard()),
    currentTurn: "red",
    moves: [],
    status: "waiting",
    winner: null,
    isPublic,
  };

  await setDoc(doc(db, GAMES_COLLECTION, id), {
    ...game,
    createdAt: serverTimestamp(),
  });

  return { id, code };
}

/**
 * Join a game by ID. Sets the joiner as black player.
 */
export async function joinGameById(gameId: string, joiner: PlayerInfo): Promise<OnlineGame | null> {
  if (!db) throw new Error("Firebase not configured");

  const ref = doc(db, GAMES_COLLECTION, gameId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const game = { id: snap.id, ...snap.data() } as OnlineGame;

  // Already joined as red — return as-is
  if (game.players.red?.uid === joiner.uid) return game;

  // Already has 2 players
  if (game.players.red && game.players.black) {
    // Reconnect if already in the game
    if (game.players.black.uid === joiner.uid) return game;
    return null; // room full
  }

  // Join as black + start game
  await updateDoc(ref, {
    "players.black": joiner,
    status: "active",
  });

  return { ...game, players: { ...game.players, black: joiner }, status: "active" };
}

/**
 * Join a game by code (DAMA-XXXXX). Searches recent waiting games.
 */
export async function joinGameByCode(code: string, joiner: PlayerInfo): Promise<{ gameId: string } | null> {
  if (!db) throw new Error("Firebase not configured");

  const q = query(
    collection(db, GAMES_COLLECTION),
    where("code", "==", code.toUpperCase().trim()),
    where("status", "==", "waiting"),
  );
  const snaps = await getDocs(q);
  if (snaps.empty) return null;

  const gameDoc = snaps.docs[0];
  const result = await joinGameById(gameDoc.id, joiner);
  if (!result) return null;
  return { gameId: gameDoc.id };
}

/**
 * Quick match: find any waiting public game OR create one.
 */
export async function findOrCreateQuickMatch(player: PlayerInfo): Promise<{ gameId: string; created: boolean }> {
  if (!db) throw new Error("Firebase not configured");

  // Search for a waiting public game
  const q = query(
    collection(db, GAMES_COLLECTION),
    where("status", "==", "waiting"),
    where("isPublic", "==", true),
  );
  const snaps = await getDocs(q);

  // Filter out own games and try to join the first available
  for (const docSnap of snaps.docs) {
    const game = docSnap.data() as OnlineGame;
    if (game.players.red?.uid === player.uid) continue;
    const joined = await joinGameById(docSnap.id, player);
    if (joined) return { gameId: docSnap.id, created: false };
  }

  // None found — create one
  const { id } = await createGame(player, true);
  return { gameId: id, created: true };
}

/**
 * Subscribe to live game updates.
 */
export function subscribeToGame(gameId: string, callback: (game: OnlineGame | null) => void): Unsubscribe {
  if (!db) return () => {};
  const ref = doc(db, GAMES_COLLECTION, gameId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...snap.data() } as OnlineGame);
  });
}

/**
 * Submit a move to a multiplayer game.
 */
export async function submitMove(gameId: string, move: Move, asPlayer: PieceColor): Promise<void> {
  if (!db) throw new Error("Firebase not configured");

  const ref = doc(db, GAMES_COLLECTION, gameId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Game not found");

  const game = snap.data() as Omit<OnlineGame, "id">;
  if (game.currentTurn !== asPlayer) throw new Error("Not your turn");
  if (game.status !== "active") throw new Error("Game not active");

  const board = deserializeBoard(game.board);
  const newBoard = applyMove(board, move);
  const winner = checkWinner(newBoard);
  const nextTurn: PieceColor = asPlayer === "red" ? "black" : "red";

  await updateDoc(ref, {
    board: serializeBoard(newBoard),
    currentTurn: nextTurn,
    moves: [
      ...game.moves,
      {
        from: move.from,
        to: move.to,
        captures: move.captures,
        player: asPlayer,
        timestamp: Timestamp.now(),
      },
    ],
    status: winner ? "finished" : "active",
    winner: winner ?? null,
  });
}

/**
 * Forfeit / resign a game.
 */
export async function resignGame(gameId: string, asPlayer: PieceColor): Promise<void> {
  if (!db) throw new Error("Firebase not configured");
  const ref = doc(db, GAMES_COLLECTION, gameId);
  const winner: PieceColor = asPlayer === "red" ? "black" : "red";
  await updateDoc(ref, { status: "finished", winner });
}

/**
 * Delete game (cleanup).
 */
export async function deleteGame(gameId: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, GAMES_COLLECTION, gameId));
}
