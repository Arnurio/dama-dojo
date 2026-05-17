import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  city: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  isPro: boolean;
  selectedCoach: string;
  lastSeen?: number;
}

const COLLECTION = "leaderboard";

/**
 * Upsert a player's entry on the global leaderboard.
 * Works for both authenticated users and guests.
 */
export async function recordLeaderboardEntry(entry: Omit<LeaderboardEntry, "lastSeen">): Promise<void> {
  if (!db) return;
  try {
    await setDoc(
      doc(db, COLLECTION, entry.uid),
      { ...entry, lastSeen: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.error("Leaderboard write failed:", e);
  }
}

/**
 * Fetch the top N players globally, or filtered by city.
 */
export async function fetchTopPlayers(opts: { city?: string; limit?: number } = {}): Promise<LeaderboardEntry[]> {
  const { city, limit: lim = 100 } = opts;
  if (!db) return [];
  try {
    const baseQuery = city && city !== "All"
      ? query(collection(db, COLLECTION), where("city", "==", city), orderBy("elo", "desc"), limit(lim))
      : query(collection(db, COLLECTION), orderBy("elo", "desc"), limit(lim));
    const snap = await getDocs(baseQuery);
    return snap.docs.map(d => d.data() as LeaderboardEntry);
  } catch (e) {
    console.error("Leaderboard read failed:", e);
    return [];
  }
}

/**
 * Get a single player's rank globally.
 */
export async function getPlayerRank(uid: string): Promise<number | null> {
  if (!db) return null;
  try {
    const meRef = doc(db, COLLECTION, uid);
    const meSnap = await getDoc(meRef);
    if (!meSnap.exists()) return null;
    const me = meSnap.data() as LeaderboardEntry;
    const q = query(collection(db, COLLECTION), where("elo", ">", me.elo));
    const snap = await getDocs(q);
    return snap.size + 1;
  } catch {
    return null;
  }
}

// ─── Fake seed data — realistic KZ players ───────────────────
export const SEED_PLAYERS: LeaderboardEntry[] = [
  { uid: "seed_01", displayName: "Timur Turlov", city: "Almaty", elo: 2412, wins: 312, losses: 47, draws: 8, gamesPlayed: 367, isPro: true, selectedCoach: "timur" },
  { uid: "seed_02", displayName: "Aibek Tursynov", city: "Astana", elo: 2287, wins: 198, losses: 52, draws: 12, gamesPlayed: 262, isPro: true, selectedCoach: "erzat" },
  { uid: "seed_03", displayName: "Daniyar Sembiyev", city: "Almaty", elo: 2198, wins: 176, losses: 49, draws: 10, gamesPlayed: 235, isPro: true, selectedCoach: "nurdaulet" },
  { uid: "seed_04", displayName: "Madina Yerlanqyzy", city: "Shymkent", elo: 2154, wins: 162, losses: 51, draws: 7, gamesPlayed: 220, isPro: true, selectedCoach: "arman" },
  { uid: "seed_05", displayName: "Erkin Asanov", city: "Karaganda", elo: 2098, wins: 144, losses: 58, draws: 9, gamesPlayed: 211, isPro: true, selectedCoach: "timur" },
  { uid: "seed_06", displayName: "Zhansaya Bekova", city: "Almaty", elo: 2042, wins: 138, losses: 62, draws: 11, gamesPlayed: 211, isPro: true, selectedCoach: "arlan" },
  { uid: "seed_07", displayName: "Nurzhan Kalimoldayev", city: "Aktobe", elo: 1987, wins: 121, losses: 67, draws: 14, gamesPlayed: 202, isPro: true, selectedCoach: "nurdaulet" },
  { uid: "seed_08", displayName: "Aizere Sagatova", city: "Astana", elo: 1942, wins: 109, losses: 71, draws: 10, gamesPlayed: 190, isPro: true, selectedCoach: "erzat" },
  { uid: "seed_09", displayName: "Olzhas Mukhamedov", city: "Almaty", elo: 1898, wins: 102, losses: 73, draws: 12, gamesPlayed: 187, isPro: false, selectedCoach: "arman" },
  { uid: "seed_10", displayName: "Saltanat Aliyeva", city: "Shymkent", elo: 1854, wins: 94, losses: 72, draws: 8, gamesPlayed: 174, isPro: true, selectedCoach: "arlan" },
  { uid: "seed_11", displayName: "Bekzhan Nurpeisov", city: "Almaty", elo: 1812, wins: 87, losses: 71, draws: 9, gamesPlayed: 167, isPro: false, selectedCoach: "timur" },
  { uid: "seed_12", displayName: "Aigerim Daulet", city: "Karaganda", elo: 1773, wins: 81, losses: 68, draws: 11, gamesPlayed: 160, isPro: true, selectedCoach: "erzat" },
  { uid: "seed_13", displayName: "Yerassyl Bolat", city: "Astana", elo: 1734, wins: 75, losses: 67, draws: 8, gamesPlayed: 150, isPro: false, selectedCoach: "nurdaulet" },
  { uid: "seed_14", displayName: "Kamila Serikova", city: "Almaty", elo: 1698, wins: 71, losses: 64, draws: 10, gamesPlayed: 145, isPro: true, selectedCoach: "arman" },
  { uid: "seed_15", displayName: "Arman Imashev", city: "Shymkent", elo: 1662, wins: 67, losses: 62, draws: 9, gamesPlayed: 138, isPro: false, selectedCoach: "arlan" },
  { uid: "seed_16", displayName: "Dinara Bekturova", city: "Aktobe", elo: 1628, wins: 62, losses: 60, draws: 7, gamesPlayed: 129, isPro: true, selectedCoach: "timur" },
  { uid: "seed_17", displayName: "Sayan Kulzhanov", city: "Almaty", elo: 1594, wins: 58, losses: 59, draws: 8, gamesPlayed: 125, isPro: false, selectedCoach: "erzat" },
  { uid: "seed_18", displayName: "Tomiris Janseit", city: "Astana", elo: 1561, wins: 54, losses: 57, draws: 10, gamesPlayed: 121, isPro: true, selectedCoach: "arman" },
  { uid: "seed_19", displayName: "Maksat Aubakirov", city: "Karaganda", elo: 1529, wins: 50, losses: 55, draws: 9, gamesPlayed: 114, isPro: false, selectedCoach: "nurdaulet" },
  { uid: "seed_20", displayName: "Anel Bostanqyzy", city: "Almaty", elo: 1498, wins: 47, losses: 53, draws: 8, gamesPlayed: 108, isPro: false, selectedCoach: "arlan" },
  { uid: "seed_21", displayName: "Rashid Sultanov", city: "Shymkent", elo: 1467, wins: 43, losses: 52, draws: 7, gamesPlayed: 102, isPro: false, selectedCoach: "timur" },
  { uid: "seed_22", displayName: "Gulnaz Tolepova", city: "Astana", elo: 1438, wins: 40, losses: 49, draws: 8, gamesPlayed: 97, isPro: true, selectedCoach: "erzat" },
  { uid: "seed_23", displayName: "Daulet Ospanov", city: "Almaty", elo: 1408, wins: 37, losses: 47, draws: 9, gamesPlayed: 93, isPro: false, selectedCoach: "arman" },
  { uid: "seed_24", displayName: "Zere Akhmetova", city: "Aktobe", elo: 1379, wins: 34, losses: 45, draws: 7, gamesPlayed: 86, isPro: false, selectedCoach: "nurdaulet" },
  { uid: "seed_25", displayName: "Ilyas Kenzhetay", city: "Karaganda", elo: 1351, wins: 32, losses: 43, draws: 6, gamesPlayed: 81, isPro: true, selectedCoach: "arlan" },
  { uid: "seed_26", displayName: "Aruzhan Daniyar", city: "Almaty", elo: 1322, wins: 29, losses: 41, draws: 8, gamesPlayed: 78, isPro: false, selectedCoach: "timur" },
  { uid: "seed_27", displayName: "Nurali Beketov", city: "Astana", elo: 1296, wins: 27, losses: 39, draws: 7, gamesPlayed: 73, isPro: false, selectedCoach: "erzat" },
  { uid: "seed_28", displayName: "Sezim Khamitova", city: "Shymkent", elo: 1268, wins: 24, losses: 37, draws: 9, gamesPlayed: 70, isPro: false, selectedCoach: "arman" },
  { uid: "seed_29", displayName: "Bauyrzhan Kim", city: "Almaty", elo: 1242, wins: 22, losses: 35, draws: 6, gamesPlayed: 63, isPro: false, selectedCoach: "nurdaulet" },
  { uid: "seed_30", displayName: "Asem Zhumabay", city: "Aktobe", elo: 1217, wins: 20, losses: 33, draws: 7, gamesPlayed: 60, isPro: false, selectedCoach: "arlan" },
  { uid: "seed_31", displayName: "Diaz Begaliyev", city: "Karaganda", elo: 1191, wins: 18, losses: 31, draws: 8, gamesPlayed: 57, isPro: false, selectedCoach: "timur" },
  { uid: "seed_32", displayName: "Adina Tursynbai", city: "Astana", elo: 1167, wins: 16, losses: 29, draws: 5, gamesPlayed: 50, isPro: false, selectedCoach: "erzat" },
  { uid: "seed_33", displayName: "Ramazan Yelubay", city: "Almaty", elo: 1142, wins: 14, losses: 28, draws: 6, gamesPlayed: 48, isPro: true, selectedCoach: "arman" },
  { uid: "seed_34", displayName: "Aiana Suleimen", city: "Shymkent", elo: 1118, wins: 13, losses: 26, draws: 7, gamesPlayed: 46, isPro: false, selectedCoach: "nurdaulet" },
  { uid: "seed_35", displayName: "Yernur Kassenov", city: "Almaty", elo: 1094, wins: 11, losses: 24, draws: 5, gamesPlayed: 40, isPro: false, selectedCoach: "arlan" },
  { uid: "seed_36", displayName: "Damira Begim", city: "Aktobe", elo: 1071, wins: 10, losses: 22, draws: 6, gamesPlayed: 38, isPro: false, selectedCoach: "timur" },
  { uid: "seed_37", displayName: "Galymzhan Aitkali", city: "Karaganda", elo: 1048, wins: 9, losses: 21, draws: 4, gamesPlayed: 34, isPro: false, selectedCoach: "erzat" },
  { uid: "seed_38", displayName: "Madiyar Ospan", city: "Astana", elo: 1024, wins: 8, losses: 19, draws: 5, gamesPlayed: 32, isPro: false, selectedCoach: "arman" },
  { uid: "seed_39", displayName: "Zhulduz Erkin", city: "Almaty", elo: 1002, wins: 7, losses: 18, draws: 4, gamesPlayed: 29, isPro: false, selectedCoach: "nurdaulet" },
  { uid: "seed_40", displayName: "Nursat Berdibek", city: "Shymkent", elo: 980, wins: 6, losses: 16, draws: 5, gamesPlayed: 27, isPro: false, selectedCoach: "arlan" },
  { uid: "seed_41", displayName: "Sabira Talgat", city: "Aktobe", elo: 957, wins: 5, losses: 15, draws: 4, gamesPlayed: 24, isPro: false, selectedCoach: "timur" },
  { uid: "seed_42", displayName: "Zhansultan Aldiyar", city: "Almaty", elo: 934, wins: 4, losses: 13, draws: 3, gamesPlayed: 20, isPro: false, selectedCoach: "erzat" },
  { uid: "seed_43", displayName: "Aizada Mukhtar", city: "Karaganda", elo: 912, wins: 4, losses: 12, draws: 4, gamesPlayed: 20, isPro: false, selectedCoach: "arman" },
  { uid: "seed_44", displayName: "Beibarys Aitbay", city: "Astana", elo: 889, wins: 3, losses: 11, draws: 3, gamesPlayed: 17, isPro: false, selectedCoach: "nurdaulet" },
  { uid: "seed_45", displayName: "Inkar Kuandyk", city: "Almaty", elo: 866, wins: 3, losses: 10, draws: 2, gamesPlayed: 15, isPro: false, selectedCoach: "arlan" },
  { uid: "seed_46", displayName: "Yerlan Tuleu", city: "Shymkent", elo: 842, wins: 2, losses: 9, draws: 3, gamesPlayed: 14, isPro: false, selectedCoach: "timur" },
  { uid: "seed_47", displayName: "Aiym Bekzat", city: "Almaty", elo: 818, wins: 2, losses: 8, draws: 2, gamesPlayed: 12, isPro: false, selectedCoach: "erzat" },
  { uid: "seed_48", displayName: "Mansur Beken", city: "Aktobe", elo: 794, wins: 1, losses: 7, draws: 3, gamesPlayed: 11, isPro: false, selectedCoach: "arman" },
  { uid: "seed_49", displayName: "Karina Aset", city: "Karaganda", elo: 770, wins: 1, losses: 6, draws: 2, gamesPlayed: 9, isPro: false, selectedCoach: "nurdaulet" },
  { uid: "seed_50", displayName: "Daniyar Zhan", city: "Astana", elo: 745, wins: 0, losses: 5, draws: 2, gamesPlayed: 7, isPro: false, selectedCoach: "arlan" },
];

/**
 * Seed the leaderboard with fake players. Idempotent — only runs once.
 * Marked client-only via a localStorage flag so we don't spam Firestore.
 */
export async function seedLeaderboardOnce(): Promise<void> {
  if (typeof window === "undefined" || !db) return;
  const KEY = "dama-dojo-seeded-v1";
  if (localStorage.getItem(KEY) === "true") return;
  try {
    await Promise.all(
      SEED_PLAYERS.map(p =>
        setDoc(doc(db, COLLECTION, p.uid), { ...p, lastSeen: serverTimestamp() }, { merge: true })
      )
    );
    localStorage.setItem(KEY, "true");
  } catch (e) {
    console.error("Seed failed (ok in dev):", e);
  }
}
