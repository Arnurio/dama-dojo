<div align="center">

# ♟️ Dama Dojo

### Learn checkers from Kazakhstan's top tech founders.

**Play online · Get coached by KZ legends · Climb the ELO ladder**

[🎮 **Play Live**](https://dama-dojo.vercel.app) · 🇰🇿 nFactorial Incubator 2026

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 🎯 The Pitch

**Chess.com made chess cool again with 1500 bots.** Lichess made it free.
**Nobody did this for `dama` (Kazakh checkers).** Every dama app on the store is from 2014 and looks like Windows XP.

So I built a checkers platform that doesn't just clone chess.com — it has a **niche nobody else has**: you don't learn from anonymous engines, you learn from **real Kazakhstani tech founders** with distinct personalities and play styles. Patient. Aggressive. Vibes-only.

Built solo in **2.5 days** for nFactorial Incubator 2026.

---

## ⚡ Try It Right Now

- **Play instantly →** [dama-dojo.vercel.app](https://dama-dojo.vercel.app) (no signup, guest mode works)
- **Judge demo Pro →** [/shop?demo=true](https://dama-dojo.vercel.app/shop?demo=true) — unlock all 5 coaches and AI analysis for **0 ₸** (Stripe doesn't operate in KZ, so this is the judge path)
- **Online multiplayer →** Quick Match auto-pairs you with a random player, or create a private room and share a `DAMA-XXXXX` code

---

## 🌟 What Makes It Stand Out

| | Other dama apps | Dama Dojo |
|---|---|---|
| **Coaches** | Generic engines | **5 real KZ founders** with personalities, voice lines & AI analysis |
| **Multiplayer** | Email a friend a PGN | **Realtime Firestore** sync + Quick Match + invite codes |
| **AI** | Stockfish, no commentary | **GPT-4o-mini** post-game review *in your coach's voice* |
| **Vibes** | 2014 wood texture | Chess.com-inspired gradient UI, animated speech bubbles |
| **Localization** | English/Russian flags | Built for KZ — Kaspi/Freedom Pay roadmap, ₸ pricing, KZ city leaderboards |

---

## 🥷 The Coaches

Each coach is a **real archetype** of a KZ tech founder, with their own opening, play style, and signature catchphrase. Speech bubbles update live based on what happens on the board.

| Coach | Tier | Vibe |
|---|---|---|
| 🟢 **Arman the Patient** | Free | Slow positional grind. *"Don't rush. The board tells you when."* |
| 🔵 **Erzat the Strategist** | Pro | Long-term planning. Calculates 6 moves ahead. |
| 🟣 **Nurdaulet the Calculator** | Pro | Pure tactics. Sees every capture chain. |
| 🟡 **Arlan the Vibe Coder** | Pro | Trusts the vibes. *"Bro just trust the move."* |
| 🔴 **Timur the Dominator** | Pro | Aggressive king-hunter. Crushes early. |

---

## 🛠️ Built With

**Frontend**
- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict mode, end-to-end typed)
- **Tailwind CSS** (no UI lib — every component hand-tuned)
- **Zustand** for game + auth state

**Backend / Infra**
- **Firebase Auth** — Google sign-in, optional (guest mode is first-class)
- **Firestore** — realtime multiplayer sync via `onSnapshot`
- **Vercel** — CI/CD on every push to `main`

**Game Engine**
- Hand-written **Russian checkers engine** (8×8, mandatory captures, king promotion, multi-jumps)
- **Minimax + alpha-beta pruning** AI (depths: easy=1 · medium=3 · hard=6 plies)
- **Position evaluation** weights pieces, kings, center control, advancement, mobility

**AI Analysis**
- **OpenAI GPT-4o-mini** for post-game commentary in each coach's voice
- Graceful **offline fallback** — template-based analysis when no API key

---

## 🧠 Technical Highlights

### Bulletproof Firebase init
Firebase config is **lazy + nullable** — the app runs perfectly without any backend env vars set. Build succeeds on Vercel even before secrets are configured. Guest mode is a first-class citizen, not a fallback.

```ts
const fb = initFirebase(); // returns null if env missing
export const auth = fb?.auth ?? null;
export const db = fb?.db ?? null;
export const isFirebaseReady = () => fb !== null;
```

### Realtime multiplayer
Two players → one Firestore doc → `onSnapshot` syncs every move in <100ms. Game state lives in the cloud, the client is just a view layer. Resign, spectator mode, reconnection all work.

### KZ-aware monetization
Stripe doesn't operate in Kazakhstan. So the Pro tier has **three paths**:
1. **Stripe test mode** for international users (`4242 4242 4242 4242`)
2. **Kaspi Pay / Freedom Pay** roadmap (production path for KZ)
3. **Judge Demo (0 ₸)** — `localStorage` flag unlocks Pro instantly with no login, so nFactorial judges can review the full product without payment

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing
│   ├── play/                     # Single-player + setup
│   ├── play/online/              # Multiplayer lobby + game room
│   ├── coaches/                  # Coach showcase
│   ├── shop/                     # Pro / skins / judge demo
│   ├── leaderboard/              # ELO ranking with city filter
│   └── api/coach-analysis/       # POST endpoint for GPT analysis
├── components/
│   ├── game/                     # CheckersBoard, CoachCompanion, CoachAnalysis
│   └── coach/                    # CoachCard (chess.com bot style)
├── lib/
│   ├── checkers-engine.ts        # Game rules + minimax AI
│   ├── coaches.ts                # 5 coach profiles + AI prompts
│   ├── multiplayer.ts            # Firestore realtime ops
│   └── firebase.ts               # Bulletproof lazy init
└── store/
    ├── auth-store.ts             # User, profile, Pro flag (Zustand)
    └── game-store.ts             # Board, turn, history, AI control
```

---

## 🚀 Running Locally

```bash
git clone https://github.com/arnurkemer/dama-dojo
cd dama-dojo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **It works out of the box** — Firebase + OpenAI are optional.

### Optional: enable multiplayer + AI analysis

Add to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
OPENAI_API_KEY=...
```

Then publish these Firestore rules:
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read, create, update: if true;
      allow delete: if false;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🗺️ Roadmap

- [x] Russian checkers engine + minimax AI
- [x] 5 KZ founder coaches with unique voices
- [x] Realtime Firestore multiplayer + Quick Match
- [x] Coach companion w/ live speech bubbles
- [x] Pro tier + Judge Demo (0 ₸)
- [x] GPT-4o-mini post-game analysis
- [x] ELO leaderboard with city filter
- [ ] Kaspi Pay / Freedom Pay integration (production)
- [ ] Tournaments + clans
- [ ] Mobile app (React Native, shared engine)
- [ ] Voice commentary during games (TTS in coach's voice)

---

## 👨‍💻 Built by

**Arnur Kemerbek** — 11th grader, Almaty 🇰🇿
*nFactorial Incubator 2026 applicant · 2.5 days · vibe coded with Claude*

Inspired by [chess.com](https://chess.com) bot system, fueled by the fact that *dama* (Kazakh checkers) deserves the same love. Built in public, shipped fast.

---

<div align="center">

**Don't rush. The board tells you when.** — *Arman the Patient*

♟️ [Play Now](https://dama-dojo.vercel.app) · ⚖️ [Judge Demo](https://dama-dojo.vercel.app/shop?demo=true)

</div>
