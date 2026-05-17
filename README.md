<div align="center">

# ♟️ Dama Dojo

### The modern home for Kazakh checkers.

**Play online · Train with AI coaches · Climb the ELO ladder**

[🎮 **Play Live**](https://dama-dojo.vercel.app) · 🇰🇿 Made in Kazakhstan

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 🎯 What is Dama Dojo?

**Dama Dojo** is a modern web platform for `dama` — Kazakh checkers — built for the millions of players who grew up with the game but have nowhere decent to play it online.

Every existing dama app is from 2014 and looks like Windows XP. We're fixing that.

- 🤖 **Train against AI coaches** with distinct personalities, openings, and play styles
- 🌐 **Play friends online** in realtime — Quick Match or share an invite code
- 🧠 **Get post-game analysis** from your coach: turning points, missed combinations, lessons
- 🏆 **Climb the ELO ladder** with global and city-level leaderboards (Almaty, Astana, Shymkent...)
- 🇰🇿 **Localized fully** in English, Russian, and Kazakh
- ✨ **Daily streaks, challenges, achievements** keep you coming back

---

## ⚡ Try It

- **Play instantly →** [dama-dojo.vercel.app](https://dama-dojo.vercel.app) — no signup required
- **Online multiplayer →** Quick Match auto-pairs you, or create a private room and share a `DAMA-XXXXX` code via WhatsApp / Telegram
- **Free Pro trial →** 3 days of full Pro access, no card required

---

## 🌟 What Makes It Different

| | Other dama apps | Dama Dojo |
|---|---|---|
| **Coaches** | Generic engines | 5 distinct coach personalities with their own play style & voice |
| **Multiplayer** | Email a PGN to your friend | Realtime Firestore sync, Quick Match, invite codes, link-share |
| **AI** | Stockfish, no commentary | GPT-4o-mini post-game review in your coach's voice |
| **Localization** | English/Russian flags | Full RU/KK/EN — built for the KZ market |
| **Payments** | International only | Kaspi Pay & Freedom Pay on the roadmap (₸ pricing) |
| **Retention** | None | Daily streaks, daily challenges, 10 achievements, free Pro trial |

---

## 🥷 The Coaches

Each coach is a distinct archetype with their own opening style, board temperament, and signature voice. Speech bubbles update live based on what's happening on the board.

| Coach | Tier | Style |
|---|---|---|
| 🟢 **Arman the Patient** | Free | Slow positional play. *"Don't rush. The board tells you when."* |
| 🔵 **Erzat the Strategist** | Pro | Long-term planning. Calculates 6 moves ahead. |
| 🟣 **Nurdaulet the Calculator** | Pro | Pure tactics. Sees every capture chain. |
| 🟡 **Arlan the Hype Founder** | Pro | Trusts the gut. Casual, energetic, ships fast. |
| 🔴 **Timur the Dominator** | Pro | Aggressive king-hunter. Crushes early. |

---

## 🛠️ Built With

**Frontend**
- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict mode, fully typed end-to-end)
- **Tailwind CSS** (hand-tuned components, no UI lib)
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
Firebase config is **lazy + nullable** — the app runs perfectly without any backend env vars set. Build succeeds even before secrets are configured. Guest mode is a first-class citizen, not a fallback.

```ts
const fb = initFirebase(); // returns null if env missing
export const auth = fb?.auth ?? null;
export const db = fb?.db ?? null;
export const isFirebaseReady = () => fb !== null;
```

### Realtime multiplayer
Two players → one Firestore doc → `onSnapshot` syncs every move in <100ms. Game state lives in the cloud, the client is just a view layer. Resign, draw offers, reconnection all work.

### KZ-aware monetization
Three tiers — Free / Pro (2,990 ₸/mo) / Pro+ (5,990 ₸/mo) — plus add-on purchases (Gift Pro, single Coach Pack, Tournament Entry). Kaspi Pay & Freedom Pay integration on the roadmap as the production payment path for the Kazakhstani market.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing
│   ├── play/                     # Single-player + setup
│   ├── play/online/              # Multiplayer lobby + game room
│   ├── coaches/                  # Coach showcase
│   ├── shop/                     # Pro / skins / free trial
│   ├── leaderboard/              # ELO ranking with city filter
│   └── api/coach-analysis/       # POST endpoint for GPT analysis
├── components/
│   ├── game/                     # CheckersBoard, CoachCompanion, CoachAnalysis
│   └── coach/                    # CoachCard
├── lib/
│   ├── checkers-engine.ts        # Game rules + minimax AI
│   ├── coaches.ts                # 5 coach profiles + AI prompts
│   ├── multiplayer.ts            # Firestore realtime ops
│   ├── retention.ts              # Streaks, challenges, achievements
│   ├── leaderboard.ts            # ELO leaderboard
│   ├── i18n/                     # EN / RU / KK dictionary + context
│   └── firebase.ts               # Lazy init
└── store/
    ├── auth-store.ts             # User, profile, Pro flag (Zustand)
    └── game-store.ts             # Board, turn, history, AI control
```

---

## 🚀 Running Locally

```bash
git clone https://github.com/Arnurio/dama-dojo
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
    match /leaderboard/{uid} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

---

## 🗺️ Roadmap

- [x] Russian checkers engine + minimax AI
- [x] 5 coach personalities
- [x] Realtime Firestore multiplayer + Quick Match + invite link
- [x] Coach companion with live speech bubbles
- [x] 3-tier Pro pricing + free trial
- [x] GPT-4o-mini post-game analysis
- [x] Global + city-level ELO leaderboards
- [x] Daily streaks, challenges, achievements
- [x] Full EN / RU / KK localization
- [x] Surrender + draw offer flow
- [ ] Kaspi Pay / Freedom Pay (production payment)
- [ ] Tournaments + clans
- [ ] Mobile app (React Native, shared engine)
- [ ] Voice commentary during games (TTS)

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<details>
<summary><strong>About this submission</strong></summary>

Dama Dojo was built by **Arnur Kemerbek**, an 11th-grader from Almaty, as a submission for **nFactorial Incubator 2026**. The product is designed not as a hackathon throwaway but as the first working version of a real service for the Kazakhstani gaming market.

</details>

<div align="center">

♟️ [Play Now](https://dama-dojo.vercel.app)

</div>
