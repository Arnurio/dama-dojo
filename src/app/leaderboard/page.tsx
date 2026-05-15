"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/store/auth-store";

const CITIES = ["All", "Almaty", "Astana", "Shymkent", "Karaganda", "Aktobe"];

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("elo", "desc"), limit(50));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => d.data() as UserProfile);
        setPlayers(data);
      } catch (e) {
        console.error(e);
        // Fallback demo data
        setPlayers(DEMO_PLAYERS);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const filtered = selectedCity === "All" ? players : players.filter(p => p.city === selectedCity);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">♟️</span>
          <span className="font-bold gradient-text">Dama Dojo</span>
        </Link>
        <Link href="/play" className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Play Now
        </Link>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-center mb-2">Leaderboard</h1>
        <p className="text-white/50 text-center mb-8">Top checkers players in Kazakhstan 🇰🇿</p>

        {/* City filter */}
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedCity === city
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-white/40 py-12">Loading rankings...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((player, index) => (
              <div
                key={player.uid}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  index < 3
                    ? "bg-gradient-to-r from-amber-600/10 to-transparent border-amber-500/20"
                    : "bg-white/3 border-white/8"
                }`}
              >
                <div className="w-8 text-center font-bold">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center text-sm font-bold">
                  {player.displayName?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{player.displayName}</div>
                  <div className="text-xs text-white/40">{player.city ?? "Almaty"}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-400">{player.elo}</div>
                  <div className="text-xs text-white/40">ELO</div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-sm">{player.wins}W / {player.losses}L</div>
                  <div className="text-xs text-white/40">
                    {player.wins + player.losses > 0
                      ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%`
                      : "—"} WR
                  </div>
                </div>
                {player.isPro && <span className="text-xs text-amber-400">✨</span>}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-white/40 py-12">
                No players from {selectedCity} yet. Be the first! 🚀
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const DEMO_PLAYERS: UserProfile[] = [
  { uid: "1", displayName: "Dias K.", email: "", photoURL: "", elo: 1842, wins: 47, losses: 12, isPro: true, selectedCoach: "timur", selectedSkin: "freedom", city: "Almaty", gamesPlayed: 59, aiReviewsToday: 0 },
  { uid: "2", displayName: "Aizat M.", email: "", photoURL: "", elo: 1791, wins: 38, losses: 15, isPro: true, selectedCoach: "erzat", selectedSkin: "higgsfield", city: "Astana", gamesPlayed: 53, aiReviewsToday: 0 },
  { uid: "3", displayName: "Bekzat N.", email: "", photoURL: "", elo: 1724, wins: 31, losses: 18, isPro: false, selectedCoach: "arman", selectedSkin: "sakura", city: "Almaty", gamesPlayed: 49, aiReviewsToday: 0 },
  { uid: "4", displayName: "Kamila S.", email: "", photoURL: "", elo: 1689, wins: 29, losses: 20, isPro: true, selectedCoach: "arlan", selectedSkin: "neon", city: "Shymkent", gamesPlayed: 49, aiReviewsToday: 0 },
  { uid: "5", displayName: "Yerlan B.", email: "", photoURL: "", elo: 1654, wins: 25, losses: 22, isPro: false, selectedCoach: "arman", selectedSkin: "classic", city: "Almaty", gamesPlayed: 47, aiReviewsToday: 0 },
  { uid: "6", displayName: "Alina Z.", email: "", photoURL: "", elo: 1621, wins: 22, losses: 24, isPro: false, selectedCoach: "nurdaulet", selectedSkin: "classic", city: "Karaganda", gamesPlayed: 46, aiReviewsToday: 0 },
  { uid: "7", displayName: "Arnur K.", email: "", photoURL: "", elo: 1598, wins: 20, losses: 25, isPro: true, selectedCoach: "arlan", selectedSkin: "neon", city: "Almaty", gamesPlayed: 45, aiReviewsToday: 0 },
];
