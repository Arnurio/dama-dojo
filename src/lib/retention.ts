// Retention systems — daily streaks, challenges, achievements
// All client-side (localStorage) for instant feel + zero backend cost.

const STREAK_KEY = "dama-dojo-streak";
const CHALLENGE_KEY = "dama-dojo-challenges";
const ACHIEVE_KEY = "dama-dojo-achievements";
const TRIAL_KEY = "dama-dojo-pro-trial";

// ─── Daily Streak ────────────────────────────────────────────
export interface StreakData {
  current: number;        // consecutive days
  longest: number;
  lastVisit: string;      // YYYY-MM-DD
  totalDays: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function readStreak(): StreakData {
  if (typeof window === "undefined") return { current: 0, longest: 0, lastVisit: "", totalDays: 0 };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { current: 0, longest: 0, lastVisit: "", totalDays: 0 };
    return JSON.parse(raw);
  } catch {
    return { current: 0, longest: 0, lastVisit: "", totalDays: 0 };
  }
}

export function tickStreak(): StreakData {
  if (typeof window === "undefined") return readStreak();
  const data = readStreak();
  const t = today();
  if (data.lastVisit === t) return data; // already counted today
  const continuing = data.lastVisit === yesterday();
  const next: StreakData = {
    current: continuing ? data.current + 1 : 1,
    longest: Math.max(data.longest, continuing ? data.current + 1 : 1),
    lastVisit: t,
    totalDays: data.totalDays + 1,
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  return next;
}

// ─── Daily Challenges ────────────────────────────────────────
export interface DailyChallenge {
  id: string;
  title: { en: string; ru: string; kk: string };
  desc: { en: string; ru: string; kk: string };
  goalKind: "win_hard" | "captures_in_game" | "win_streak" | "play_games" | "win_with_coach";
  goalValue: number;
  reward: number; // coins
  emoji: string;
}

const CHALLENGE_POOL: DailyChallenge[] = [
  { id: "win_easy", emoji: "😊", title: { en: "First Blood", ru: "Первая Кровь", kk: "Алғашқы Жеңіс" }, desc: { en: "Win 1 game vs Easy AI", ru: "Победи 1 партию против Easy AI", kk: "Easy AI-ға қарсы 1 ойын жең" }, goalKind: "play_games", goalValue: 1, reward: 50 },
  { id: "win_medium", emoji: "🧠", title: { en: "Brain Game", ru: "Игра Ума", kk: "Ақыл Ойыны" }, desc: { en: "Win 1 game vs Medium AI", ru: "Победи 1 партию против Medium AI", kk: "Medium AI-ға қарсы 1 ойын жең" }, goalKind: "play_games", goalValue: 1, reward: 100 },
  { id: "win_hard", emoji: "💀", title: { en: "Boss Slayer", ru: "Убийца Босса", kk: "Бастар Жоюшы" }, desc: { en: "Beat the Hard AI once", ru: "Победи Hard AI один раз", kk: "Hard AI-ды бір рет жең" }, goalKind: "win_hard", goalValue: 1, reward: 250 },
  { id: "captures_3", emoji: "⚡", title: { en: "Combo Master", ru: "Мастер Комбо", kk: "Комбо Шебері" }, desc: { en: "Make 3 captures in one game", ru: "Сделай 3 взятия за одну партию", kk: "Бір ойында 3 жеу жаса" }, goalKind: "captures_in_game", goalValue: 3, reward: 150 },
  { id: "streak_3", emoji: "🔥", title: { en: "Hot Streak", ru: "Серия Побед", kk: "Жеңіс Сериясы" }, desc: { en: "Win 3 games in a row", ru: "Победи 3 партии подряд", kk: "Қатарынан 3 ойын жең" }, goalKind: "win_streak", goalValue: 3, reward: 300 },
  { id: "play_5", emoji: "♟️", title: { en: "Dedicated", ru: "Преданный", kk: "Берілген" }, desc: { en: "Play 5 games today", ru: "Сыграй 5 партий сегодня", kk: "Бүгін 5 ойын ойна" }, goalKind: "play_games", goalValue: 5, reward: 200 },
];

export interface ChallengeProgress {
  date: string;
  challengeId: string;
  progress: number;
  completed: boolean;
}

export function getTodayChallenge(): DailyChallenge {
  // Deterministic: same challenge per day for everyone
  const t = today();
  const hash = t.split("-").reduce((s, n) => s + parseInt(n, 10), 0);
  return CHALLENGE_POOL[hash % CHALLENGE_POOL.length];
}

export function readChallengeProgress(): ChallengeProgress {
  if (typeof window === "undefined") {
    return { date: today(), challengeId: getTodayChallenge().id, progress: 0, completed: false };
  }
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY);
    const parsed: ChallengeProgress | null = raw ? JSON.parse(raw) : null;
    const todayCh = getTodayChallenge();
    if (!parsed || parsed.date !== today() || parsed.challengeId !== todayCh.id) {
      return { date: today(), challengeId: todayCh.id, progress: 0, completed: false };
    }
    return parsed;
  } catch {
    return { date: today(), challengeId: getTodayChallenge().id, progress: 0, completed: false };
  }
}

export function updateChallengeProgress(advance = 1): ChallengeProgress {
  const ch = getTodayChallenge();
  const cur = readChallengeProgress();
  const next: ChallengeProgress = {
    date: today(),
    challengeId: ch.id,
    progress: Math.min(cur.progress + advance, ch.goalValue),
    completed: cur.progress + advance >= ch.goalValue,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(next));
  }
  return next;
}

// ─── Achievements ────────────────────────────────────────────
export interface Achievement {
  id: string;
  emoji: string;
  title: { en: string; ru: string; kk: string };
  desc: { en: string; ru: string; kk: string };
  unlocked: boolean;
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Omit<Achievement, "unlocked" | "unlockedAt">[] = [
  { id: "first_win", emoji: "🌱", title: { en: "First Win", ru: "Первая Победа", kk: "Алғашқы Жеңіс" }, desc: { en: "Win your first game", ru: "Победи свою первую партию", kk: "Алғашқы ойыныңды жең" } },
  { id: "first_king", emoji: "♛", title: { en: "Crowned", ru: "Коронован", kk: "Тәж Кигізілген" }, desc: { en: "Promote a piece to king", ru: "Преврати шашку в дамку", kk: "Шашканы дамкаға айналдыр" } },
  { id: "win_10", emoji: "🥉", title: { en: "Apprentice", ru: "Ученик", kk: "Шәкірт" }, desc: { en: "Win 10 games", ru: "Победи 10 партий", kk: "10 ойын жең" } },
  { id: "win_50", emoji: "🥈", title: { en: "Adept", ru: "Адепт", kk: "Адепт" }, desc: { en: "Win 50 games", ru: "Победи 50 партий", kk: "50 ойын жең" } },
  { id: "win_100", emoji: "🥇", title: { en: "Master", ru: "Мастер", kk: "Шебер" }, desc: { en: "Win 100 games", ru: "Победи 100 партий", kk: "100 ойын жең" } },
  { id: "beat_hard", emoji: "💀", title: { en: "Boss Slayer", ru: "Убийца Босса", kk: "Бастар Жоюшы" }, desc: { en: "Beat Hard AI", ru: "Победи Hard AI", kk: "Hard AI-ды жең" } },
  { id: "elo_1500", emoji: "📈", title: { en: "Climber", ru: "Карьерист", kk: "Көтерілуші" }, desc: { en: "Reach 1500 ELO", ru: "Достигни 1500 ELO", kk: "1500 ELO-ға жет" } },
  { id: "elo_2000", emoji: "🚀", title: { en: "Expert", ru: "Эксперт", kk: "Сарапшы" }, desc: { en: "Reach 2000 ELO", ru: "Достигни 2000 ELO", kk: "2000 ELO-ға жет" } },
  { id: "streak_7", emoji: "🔥", title: { en: "Week Streak", ru: "Неделя Подряд", kk: "Апта Қатарынан" }, desc: { en: "7-day streak", ru: "Серия в 7 дней", kk: "7 күндік серия" } },
  { id: "all_coaches", emoji: "👑", title: { en: "Collector", ru: "Коллекционер", kk: "Жинаушы" }, desc: { en: "Play with all 5 coaches", ru: "Сыграй со всеми 5 коучами", kk: "5 коучпен де ойна" } },
];

export function readAchievements(): Record<string, { unlocked: boolean; at?: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ACHIEVE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function unlockAchievement(id: string): boolean {
  const all = readAchievements();
  if (all[id]?.unlocked) return false;
  all[id] = { unlocked: true, at: new Date().toISOString() };
  if (typeof window !== "undefined") localStorage.setItem(ACHIEVE_KEY, JSON.stringify(all));
  return true; // newly unlocked
}

// ─── Pro Free Trial (3 days) ─────────────────────────────────
export function startProTrial(): { active: boolean; expiresAt: string } {
  if (typeof window === "undefined") return { active: false, expiresAt: "" };
  const existing = localStorage.getItem(TRIAL_KEY);
  if (existing) {
    try {
      const p = JSON.parse(existing);
      return { active: new Date(p.expiresAt) > new Date(), expiresAt: p.expiresAt };
    } catch {/* fallthrough */}
  }
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const trial = { startedAt: new Date().toISOString(), expiresAt };
  localStorage.setItem(TRIAL_KEY, JSON.stringify(trial));
  return { active: true, expiresAt };
}

export function isProTrialActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(TRIAL_KEY);
    if (!raw) return false;
    const p = JSON.parse(raw);
    return new Date(p.expiresAt) > new Date();
  } catch {
    return false;
  }
}

export function getTrialDaysLeft(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(TRIAL_KEY);
    if (!raw) return 0;
    const p = JSON.parse(raw);
    const ms = new Date(p.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  } catch {
    return 0;
  }
}
