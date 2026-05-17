"use client";
import { create } from "zustand";
import { User } from "firebase/auth";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  elo: number;
  wins: number;
  losses: number;
  isPro: boolean;
  selectedCoach: string;
  selectedSkin: string;
  city: string;
  gamesPlayed: number;
  aiReviewsToday: number;
}

interface LocalStats {
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  // Local Pro flag — works without login (for guests/judges)
  localPro: boolean;
  guestId: string;
  localStats: LocalStats;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setLocalPro: (isPro: boolean) => void;
  initGuest: () => void;
  // Computed: combined Pro state — true if either logged-in user is Pro OR local flag is set
  isPro: () => boolean;
  // Update ELO after game finishes. opponentElo = opponent rating, result = "win"/"loss"/"draw"
  recordGameResult: (opponentElo: number, result: "win" | "loss" | "draw") => void;
  // Get current ELO (profile if logged in, else local)
  getElo: () => number;
}

const STORAGE_KEY_PRO = "dama-dojo-pro";
const STORAGE_KEY_GUEST = "dama-dojo-guest-id";
const STORAGE_KEY_STATS = "dama-dojo-stats";

function readLocalPro(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_PRO) === "true";
}

function readGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_KEY_GUEST);
  if (!id) {
    id = "guest_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(STORAGE_KEY_GUEST, id);
  }
  return id;
}

const DEFAULT_STATS: LocalStats = { elo: 1000, wins: 0, losses: 0, draws: 0, gamesPlayed: 0 };

function readLocalStats(): LocalStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function writeLocalStats(stats: LocalStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
}

// Standard ELO calc with K=32
function calcEloChange(myElo: number, oppElo: number, result: "win" | "loss" | "draw"): number {
  const expected = 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
  const actual = result === "win" ? 1 : result === "loss" ? 0 : 0.5;
  return Math.round(32 * (actual - expected));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  localPro: false,
  guestId: "",
  localStats: DEFAULT_STATS,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setLocalPro: (isPro) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PRO, String(isPro));
    }
    set({ localPro: isPro });
  },
  initGuest: () => {
    const localPro = readLocalPro();
    const guestId = readGuestId();
    const localStats = readLocalStats();
    set({ localPro, guestId, localStats });
  },
  isPro: () => {
    const state = get();
    return state.localPro || (state.profile?.isPro ?? false);
  },
  recordGameResult: (opponentElo, result) => {
    const state = get();
    const currentElo = state.profile?.elo ?? state.localStats.elo;
    const change = calcEloChange(currentElo, opponentElo, result);
    const newStats: LocalStats = {
      elo: Math.max(100, currentElo + change),
      wins: state.localStats.wins + (result === "win" ? 1 : 0),
      losses: state.localStats.losses + (result === "loss" ? 1 : 0),
      draws: state.localStats.draws + (result === "draw" ? 1 : 0),
      gamesPlayed: state.localStats.gamesPlayed + 1,
    };
    writeLocalStats(newStats);
    set({ localStats: newStats });
    // Also update profile if logged in
    if (state.profile) {
      set({
        profile: {
          ...state.profile,
          elo: newStats.elo,
          wins: state.profile.wins + (result === "win" ? 1 : 0),
          losses: state.profile.losses + (result === "loss" ? 1 : 0),
          gamesPlayed: state.profile.gamesPlayed + 1,
        },
      });
    }
  },
  getElo: () => {
    const state = get();
    // If user has played games locally, that's the authoritative number
    // (since we don't yet persist Firestore-side on game end).
    if (state.localStats.gamesPlayed > 0) return state.localStats.elo;
    return state.profile?.elo ?? state.localStats.elo;
  },
}));
