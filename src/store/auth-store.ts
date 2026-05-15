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

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  // Local Pro flag — works without login (for guests/judges)
  localPro: boolean;
  guestId: string;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setLocalPro: (isPro: boolean) => void;
  initGuest: () => void;
  // Computed: combined Pro state — true if either logged-in user is Pro OR local flag is set
  isPro: () => boolean;
}

const STORAGE_KEY_PRO = "dama-dojo-pro";
const STORAGE_KEY_GUEST = "dama-dojo-guest-id";

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  localPro: false,
  guestId: "",
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
    set({ localPro, guestId });
  },
  isPro: () => {
    const state = get();
    return state.localPro || (state.profile?.isPro ?? false);
  },
}));
