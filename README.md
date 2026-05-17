<div align="center">

# ♟️ Dama Dojo

### Современная платформа для казахской дамки.

**Играй онлайн · Тренируйся с AI-коучами · Поднимайся в ELO-рейтинге**

[🎮 **Открыть сайт**](https://dama-dojo.vercel.app) · 🇰🇿 Сделано в Казахстане

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 🎯 Что это

**Dama Dojo** — современная веб-платформа для игры в **дамку** (казахские/русские шашки). Сделана для миллионов казахстанцев, которые выросли играя в дамку, но в интернете до сих пор нет приличного места, где в неё можно играть.

Все существующие приложения для дамки — из 2014 года и выглядят как Windows XP. Мы это исправляем.

- 🤖 **Играй против AI-коучей** с уникальными характерами, дебютами и стилями игры
- 🌐 **Играй с друзьями онлайн** в реальном времени — Quick Match или приватная комната по ссылке
- 🧠 **Получай разбор партии** от своего коуча: ключевые моменты, упущенные комбинации, уроки
- 🏆 **Поднимайся в ELO** — глобальный и городской рейтинги (Алматы, Астана, Шымкент…)
- 🇰🇿 **Три языка**: English / Русский / Қазақша
- ✨ **Стрики, дневные челленджи, ачивки** — заставляют возвращаться

---

## ⚡ Попробовать

- **Играть сразу →** [dama-dojo.vercel.app](https://dama-dojo.vercel.app) — без регистрации
- **Онлайн с другом →** Quick Match подбирает соперника автоматически, либо создаёшь приватную комнату и кидаешь код `DAMA-XXXXX` в WhatsApp / Telegram
- **Бесплатный Pro на 3 дня →** все функции открыты, карта не нужна

---

## 🌟 В чём отличие

| | Другие приложения для дамки | Dama Dojo |
|---|---|---|
| **Коучи** | Безликие движки | 5 коучей с характером, своей манерой игры и голосом |
| **Мультиплеер** | Скинь другу PGN-файл | Realtime Firestore-синк, Quick Match, приглашение по коду/ссылке |
| **AI** | Stockfish, без объяснений | GPT-4o-mini делает разбор партии **голосом твоего коуча** |
| **Локализация** | Только русский | Полные RU / KK / EN — заточено под KZ-рынок |
| **Платежи** | Только международные | Kaspi Pay и Freedom Pay в дорожной карте, цены в ₸ |
| **Удержание** | Нет | Стрики, дневные челленджи, 10 ачивок, бесплатный Pro-триал |

---

## 🥷 Коучи

Каждый коуч — отдельный архетип со своим стилем, темпераментом доски и характерной речью. Реплики в диалоге обновляются в реальном времени в зависимости от того, что происходит на доске.

| Коуч | Тариф | Стиль |
|---|---|---|
| 🟢 **Арман Сулейменов · Сэнсэй** | Free | Медленная позиционная игра. *«Не торопись. Доска сама подскажет, когда»* |
| 🔵 **Ерзат Дулат · Бунтарь** | Pro | Долгосрочный план. Считает на 6 ходов вперёд. |
| 🟣 **Нурдаулет Базылбеков · Стратег** | Pro | Чистая тактика. Видит каждую серию взятий. |
| 🟡 **Арлан Рахметжанов · Хайп-фаундер** | Pro | Доверяет интуиции. Casual-стиль, шиппит быстро. |
| 🔴 **Тимур Турлов · Гроссмейстер** | Pro | Агрессивная охота за дамкой. Давит сразу. |

---

## 🛠️ Стек

**Frontend**
- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict mode, типы по всему проекту)
- **Tailwind CSS** (без UI-библиотек, каждый компонент собран вручную)
- **Zustand** — состояние игры и авторизации

**Backend / Infra**
- **Firebase Auth** — Google sign-in (опционально, гостевой режим — first-class)
- **Firestore** — реалтайм-синхронизация мультиплеера через `onSnapshot`
- **Vercel** — CI/CD на каждый пуш в `main`

**Игровой движок**
- Свой **движок дамки** (8×8, обязательные взятия, превращение в дамку, серии)
- **Minimax + alpha-beta pruning** AI (глубины: easy=1 · medium=3 · hard=6 полуходов)
- **Оценка позиции** учитывает фишки, дамки, центр, продвижение, мобильность

**AI-анализ**
- **OpenAI GPT-4o-mini** для разбора партии голосом каждого коуча
- **Offline-fallback** — шаблонный анализ, если API-ключ не настроен

---

## 🧠 Технические особенности

### Устойчивая инициализация Firebase
Конфиг Firebase **ленивый и nullable** — приложение работает без бэкенда. Build на Vercel проходит даже когда секреты ещё не настроены. Гостевой режим — равноправный игрок, а не fallback.

```ts
const fb = initFirebase(); // вернёт null, если env не задан
export const auth = fb?.auth ?? null;
export const db = fb?.db ?? null;
export const isFirebaseReady = () => fb !== null;
```

### Реалтайм-мультиплеер
Два игрока → один Firestore-документ → `onSnapshot` синхронизирует каждый ход за <100 мс. Состояние партии живёт в облаке, клиент — только view-слой. Капитуляция, предложение ничьей и переподключение — работают.

### Монетизация под KZ
Три тарифа — Free / Pro (2 990 ₸/мес) / Pro+ (5 990 ₸/мес) + дополнения (Подари Pro, Coach-Pack, билет в турнир). Интеграция с Kaspi Pay и Freedom Pay — в дорожной карте как основной канал оплаты для казахстанского рынка.

---

## 📂 Структура проекта

```
src/
├── app/
│   ├── page.tsx                  # Главная
│   ├── play/                     # Одиночная игра + сетап
│   ├── play/online/              # Лобби и комната мультиплеера
│   ├── coaches/                  # Витрина коучей
│   ├── profile/                  # Профиль с никнеймом, аватаром, статами
│   ├── settings/                 # Тема доски, дефолтный коуч, сложность
│   ├── shop/                     # Pro / скины / триал
│   ├── leaderboard/              # ELO-рейтинг с фильтром по городам
│   └── api/coach-analysis/       # POST-эндпоинт для GPT-разбора
├── components/
│   ├── game/                     # CheckersBoard, CoachCompanion, CoachAnalysis
│   ├── coach/                    # CoachCard
│   └── SiteBackground.tsx        # Общий фоновый слой (чекер + глифы)
├── lib/
│   ├── checkers-engine.ts        # Правила + minimax AI
│   ├── coaches.ts                # 5 коучей и их AI-промпты
│   ├── multiplayer.ts            # Firestore-операции
│   ├── retention.ts              # Стрики, челленджи, ачивки
│   ├── leaderboard.ts            # ELO-рейтинг (+120 фейковых игроков)
│   ├── preferences.ts            # localStorage-настройки игрока
│   ├── i18n/                     # Словарь EN / RU / KK + контекст
│   └── firebase.ts               # Ленивая инициализация
└── store/
    ├── auth-store.ts             # Пользователь, профиль, Pro-флаг (Zustand)
    └── game-store.ts             # Доска, ходы, история, AI
```

---

## 🚀 Запуск локально

```bash
git clone https://github.com/Arnurio/dama-dojo
cd dama-dojo
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000). **Работает из коробки** — Firebase и OpenAI опциональны.

### Опционально: подключить мультиплеер и AI-анализ

Создай `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
OPENAI_API_KEY=...
```

И опубликуй эти правила Firestore:
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

## 🗺️ Дорожная карта

- [x] Движок русских шашек + minimax AI
- [x] 5 коучей с уникальными характерами
- [x] Реалтайм Firestore-мультиплеер + Quick Match + приглашение по ссылке
- [x] Speech-bubble компаньон-коуч во время партии
- [x] 3 тарифа Pro + бесплатный триал
- [x] GPT-4o-mini разбор партии
- [x] Глобальный и городской ELO-лидерборд
- [x] Стрики, дневные челленджи, 10 ачивок
- [x] Полная локализация EN / RU / KK
- [x] Капитуляция и предложение ничьей
- [x] Профиль (никнейм, аватар, город), пресет настроек (тема доски, дефолтный коуч)
- [ ] Kaspi Pay / Freedom Pay (production-канал)
- [ ] Турниры и кланы
- [ ] Мобильное приложение (React Native, общий движок)
- [ ] Голосовая озвучка партии (TTS)

---

## 📄 Лицензия

MIT — см. [LICENSE](LICENSE).

---

<details>
<summary><strong>О заявке</strong></summary>

Dama Dojo сделал **Арнур Кемербек**, 11-классник из Алматы, в рамках заявки в **nFactorial Incubator 2026**. Проект задуман не как одноразовая хакатон-сборка, а как первая рабочая версия реального сервиса для казахстанского игрового рынка.

</details>

<div align="center">

♟️ [Играть](https://dama-dojo.vercel.app)

</div>
