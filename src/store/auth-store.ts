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
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}));
