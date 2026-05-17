"use client";

/**
 * User preferences — persisted in localStorage.
 *
 * Decoupled from auth-store on purpose: prefs are local-first (work for guests),
 * survive sign-out, and don't need Firestore round-trips. If we later want to
 * sync to a logged-in profile, we can hydrate from Firestore on login.
 */

export type BoardTheme = "classic" | "minimal" | "zen";
export type DifficultyDefault = "easy" | "medium" | "hard";

export interface Preferences {
  defaultCoach: string;        // coach.id
  boardTheme: BoardTheme;
  defaultDifficulty: DifficultyDefault;
  soundEnabled: boolean;
  showMoveHints: boolean;
}

const STORAGE_KEY = "dama-prefs:v1";

export const DEFAULT_PREFERENCES: Preferences = {
  defaultCoach: "arman",
  boardTheme: "classic",
  defaultDifficulty: "medium",
  soundEnabled: true,
  showMoveHints: true,
};

export const BOARD_THEMES: Record<BoardTheme, {
  light: string;
  dark: string;
  frame: string;
  label: { en: string; ru: string; kk: string };
}> = {
  classic: {
    light: "#f0d9b5",
    dark: "#b58863",
    frame: "rgba(146, 64, 14, 0.6)",
    label: { en: "Classic Wood", ru: "Классическое Дерево", kk: "Классикалық Ағаш" },
  },
  minimal: {
    // Cold minimal — for those who want calm focus
    light: "#e5e7eb",
    dark: "#4b5563",
    frame: "rgba(255, 255, 255, 0.20)",
    label: { en: "Minimal Gray", ru: "Минимал Серый", kk: "Минимал Сұр" },
  },
  zen: {
    // Dark zen — barely-there contrast
    light: "#27272a",
    dark: "#09090b",
    frame: "rgba(99, 102, 241, 0.30)",
    label: { en: "Dark Zen", ru: "Тёмный Дзен", kk: "Қара Дзен" },
  },
};

export function readPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function writePreferences(prefs: Partial<Preferences>): Preferences {
  const current = readPreferences();
  const next = { ...current, ...prefs };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function resetPreferences(): Preferences {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_PREFERENCES;
}
