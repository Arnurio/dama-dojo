// Translation dictionary for Dama Dojo
// Supports: en (English), ru (Russian), kk (Kazakh)

export type Locale = "en" | "ru" | "kk";

export const LOCALES: { code: Locale; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "kk", name: "Қазақша", flag: "🇰🇿" },
];

export const dict = {
  // ─── Navigation ──────────────────────────────────────────
  "nav.leaderboard": { en: "Leaderboard", ru: "Рейтинг", kk: "Рейтинг" },
  "nav.shop": { en: "Shop", ru: "Магазин", kk: "Дүкен" },
  "nav.pro": { en: "Pro", ru: "Pro", kk: "Pro" },
  "nav.signIn": { en: "Sign in (optional)", ru: "Войти (необязательно)", kk: "Кіру (қажет емес)" },
  "nav.signOut": { en: "Sign out", ru: "Выйти", kk: "Шығу" },
  "nav.home": { en: "Home", ru: "Главная", kk: "Басты бет" },
  "nav.backHome": { en: "← Back to home", ru: "← На главную", kk: "← Басты бетке" },

  // ─── Home / Landing ──────────────────────────────────────
  "home.badge": { en: "🇰🇿 Built by a KZ vibe coder · nFactorial 2026", ru: "🇰🇿 Сделано казахстанским vibe-кодером · nFactorial 2026", kk: "🇰🇿 Қазақстандық vibe-кодер жасаған · nFactorial 2026" },
  "home.title1": { en: "Learn Checkers From", ru: "Учись играть в шашки у", kk: "Дамканы үйрен — ұстаз" },
  "home.title2": { en: "KZ Tech Legends", ru: "Tech-Легенд Казахстана", kk: "Қазақстан Tech-Аңыздары" },
  "home.subtitle": { en: "Play online, get coached by Kazakhstan's top founders, climb the ELO ladder.", ru: "Играй онлайн, тренируйся у топ-фаундеров Казахстана, поднимайся в рейтинге ELO.", kk: "Онлайн ойна, Қазақстанның үздік құрылтайшыларынан үйрен, ELO рейтингіне көтеріл." },
  "home.subtitle2": { en: "Arman teaches patience. Timur teaches dominance. Arlan says just vibe.", ru: "Арман учит терпению. Тимур — доминированию. Арлан говорит: просто чувствуй вайб.", kk: "Арман шыдамдылыққа үйретеді. Тимур үстемдікке. Арлан: жай ғана vibe ұста." },
  "home.playNow": { en: "Play Now ⚡", ru: "Играть ⚡", kk: "Ойнау ⚡" },
  "home.findMatch": { en: "Find Match 🌐", ru: "Найти соперника 🌐", kk: "Қарсылас табу 🌐" },
  "home.noSignup": { en: "No signup required · Play instantly as guest", ru: "Регистрация не нужна · Играй сразу как гость", kk: "Тіркелу қажет емес · Қонақ ретінде бірден ойна" },
  "home.judgeBannerTitle": { en: "For nFactorial Judges", ru: "Для жюри nFactorial", kk: "nFactorial қазылар алқасы үшін" },
  "home.judgeBannerDesc": { en: "Unlock all Pro features instantly — no login, no payment.", ru: "Открой все Pro-функции сразу — без входа, без оплаты.", kk: "Барлық Pro мүмкіндіктерді бірден аш — кірусіз, төлемсіз." },
  "home.judgeBannerCta": { en: "Unlock Pro · 0 ₸", ru: "Открыть Pro · 0 ₸", kk: "Pro аш · 0 ₸" },
  "home.proActive": { en: "Pro Active", ru: "Pro Активен", kk: "Pro Белсенді" },
  "home.proActiveDesc": { en: "All 5 coaches and unlimited AI analysis unlocked.", ru: "Все 5 коучей и безлимитный AI-анализ открыты.", kk: "Барлық 5 коуч және шексіз AI-талдау ашық." },
  "home.stats.activePlayers": { en: "Active Players", ru: "Активных игроков", kk: "Белсенді ойыншылар" },
  "home.stats.gamesPlayed": { en: "Games Played", ru: "Сыгранных партий", kk: "Ойналған партиялар" },
  "home.stats.coaches": { en: "KZ Coaches", ru: "KZ Коучей", kk: "KZ Коучтер" },
  "home.coachesTitle": { en: "Top Coaches", ru: "Топ Коучи", kk: "Үздік Коучтер" },
  "home.coachesDesc": { en: "5 founders · AI-powered · Real personalities", ru: "5 фаундеров · AI · Реальные личности", kk: "5 құрылтайшы · AI · Нақты тұлғалар" },
  "home.viewAll": { en: "View all →", ru: "Все →", kk: "Барлығы →" },
  "home.features.ai.title": { en: "AI Coach", ru: "AI Коуч", kk: "AI Коуч" },
  "home.features.ai.desc": { en: "Post-game analysis in your coach's voice.", ru: "Разбор партии голосом твоего коуча.", kk: "Партияны коучыңның дауысымен талдау." },
  "home.features.multi.title": { en: "Multiplayer", ru: "Мультиплеер", kk: "Мультиплеер" },
  "home.features.multi.desc": { en: "Online matchmaking or invite via link.", ru: "Подбор соперника или приглашение по ссылке.", kk: "Қарсылас табу немесе сілтемемен шақыру." },
  "home.features.elo.title": { en: "ELO Ranking", ru: "ELO Рейтинг", kk: "ELO Рейтинг" },
  "home.features.elo.desc": { en: "City and global leaderboards.", ru: "Рейтинги по городам и глобальный.", kk: "Қалалық және жаһандық рейтингтер." },
  "home.features.custom.title": { en: "Customize", ru: "Кастомизация", kk: "Кастомизация" },
  "home.features.custom.desc": { en: "Board skins, piece designs, coach outfits.", ru: "Скины доски, дизайн фишек, образы коучей.", kk: "Тақта скиндері, фишка дизайндары, коуч киімдері." },
  "home.proCta.title": { en: "Go Pro", ru: "Открой Pro", kk: "Pro-ға өт" },
  "home.proCta.desc": { en: "All 5 coaches, unlimited AI analysis, exclusive skins, priority matchmaking.", ru: "Все 5 коучей, безлимитный AI-анализ, эксклюзивные скины, приоритетный матчмейкинг.", kk: "Барлық 5 коуч, шексіз AI-талдау, эксклюзивті скиндер, басым матчмейкинг." },
  "home.proCta.upgrade": { en: "Upgrade to Pro ✨", ru: "Получить Pro ✨", kk: "Pro алу ✨" },
  "home.proCta.demo": { en: "🧑‍⚖️ Judge Demo — 0 ₸", ru: "🧑‍⚖️ Демо для жюри — 0 ₸", kk: "🧑‍⚖️ Қазылар үшін демо — 0 ₸" },
  "home.proCta.note": { en: "Production: Kaspi Pay / Freedom Pay · Demo: test card 4242 4242 4242 4242", ru: "Прод: Kaspi Pay / Freedom Pay · Демо: тест-карта 4242 4242 4242 4242", kk: "Прод: Kaspi Pay / Freedom Pay · Демо: тест-карта 4242 4242 4242 4242" },
  "home.footer": { en: "Built by Arnur Kemerbek · nFactorial Incubator 2026 · 2.5 days · Vibe coded with AI 🚀", ru: "Сделал Арнур Кемербек · nFactorial Incubator 2026 · 2.5 дня · Vibe-кодинг с AI 🚀", kk: "Арнұр Кемербек жасады · nFactorial Incubator 2026 · 2.5 күн · AI-мен vibe-кодинг 🚀" },

  // ─── Play / Game Setup ───────────────────────────────────
  "play.newGame": { en: "New Game", ru: "Новая Игра", kk: "Жаңа Ойын" },
  "play.chooseSettings": { en: "Choose your settings", ru: "Выбери настройки", kk: "Параметрлерді таңда" },
  "play.gameMode": { en: "Game Mode", ru: "Режим игры", kk: "Ойын режимі" },
  "play.mode.local": { en: "🤝 2 Players", ru: "🤝 2 Игрока", kk: "🤝 2 Ойыншы" },
  "play.mode.ai": { en: "🤖 vs AI", ru: "🤖 Против AI", kk: "🤖 AI-ға қарсы" },
  "play.mode.online": { en: "🌐 Online", ru: "🌐 Онлайн", kk: "🌐 Онлайн" },
  "play.difficulty": { en: "Difficulty", ru: "Сложность", kk: "Қиындық" },
  "play.difficulty.easy": { en: "😊 Easy", ru: "😊 Легко", kk: "😊 Оңай" },
  "play.difficulty.medium": { en: "🧠 Medium", ru: "🧠 Средне", kk: "🧠 Орташа" },
  "play.difficulty.hard": { en: "💀 Hard", ru: "💀 Сложно", kk: "💀 Қиын" },
  "play.hardWarning": { en: "Warning: Hard AI thinks 6 moves ahead. Brutal.", ru: "Внимание: Hard AI просчитывает 6 ходов вперёд. Жёстко.", kk: "Ескерту: Hard AI 6 қадам алдын ойлайды. Қатал." },
  "play.yourCoach": { en: "Your Coach", ru: "Твой коуч", kk: "Сенің коучың" },
  "play.locked": { en: "4 coaches locked", ru: "4 коуча заблокированы", kk: "4 коуч жабық" },
  "play.unlockPro": { en: "Unlock Pro", ru: "Открыть Pro", kk: "Pro ашу" },
  "play.judgeDemo": { en: "Judge Demo (0 ₸)", ru: "Демо для жюри (0 ₸)", kk: "Қазылар демосы (0 ₸)" },
  "play.startGame": { en: "Start Game ⚡", ru: "Начать Игру ⚡", kk: "Ойынды Бастау ⚡" },
  "play.findMatch": { en: "Find Match 🌐", ru: "Найти соперника 🌐", kk: "Қарсылас табу 🌐" },
  "play.coaching": { en: "coaching", ru: "тренирует", kk: "жаттықтырады" },
  "play.redsTurn": { en: "🔴 Red's turn", ru: "🔴 Ход красных", kk: "🔴 Қызылдың кезегі" },
  "play.blacksTurn": { en: "⚫ Black's turn", ru: "⚫ Ход чёрных", kk: "⚫ Қараның кезегі" },
  "play.redWins": { en: "🔴 Red wins!", ru: "🔴 Красные победили!", kk: "🔴 Қызыл жеңді!" },
  "play.blackWins": { en: "⚫ Black wins!", ru: "⚫ Чёрные победили!", kk: "⚫ Қара жеңді!" },
  "play.aiThinking": { en: "AI thinking...", ru: "AI думает...", kk: "AI ойлануда..." },
  "play.moveHistory": { en: "Move history", ru: "История ходов", kk: "Қадамдар тарихы" },
  "play.boardCount": { en: "Board Count", ru: "На доске", kk: "Тақтада" },
  "play.red": { en: "Red", ru: "Красные", kk: "Қызыл" },
  "play.black": { en: "Black", ru: "Чёрные", kk: "Қара" },
  "play.pieces": { en: "pieces", ru: "фишек", kk: "фишка" },
  "play.getAnalysis": { en: "Get Coach Analysis", ru: "Получить разбор коуча", kk: "Коуч талдауын алу" },
  "play.playAgain": { en: "🔄 Play Again", ru: "🔄 Сыграть Ещё", kk: "🔄 Қайта Ойнау" },
  "play.newGameBtn": { en: "← New Game", ru: "← Новая Игра", kk: "← Жаңа Ойын" },

  // ─── Online Lobby ────────────────────────────────────────
  "online.title": { en: "Play Online 🌐", ru: "Игра Онлайн 🌐", kk: "Онлайн Ойын 🌐" },
  "online.subtitle": { en: "Quick match, invite a friend, or join with a code", ru: "Быстрый матч, пригласи друга или войди по коду", kk: "Жылдам матч, досыңды шақыр немесе кодпен қосыл" },
  "online.signedIn": { en: "Signed in", ru: "Вошёл", kk: "Кірді" },
  "online.guest": { en: "Guest", ru: "Гость", kk: "Қонақ" },
  "online.quickMatch": { en: "⚡ Quick Match", ru: "⚡ Быстрый Матч", kk: "⚡ Жылдам Матч" },
  "online.searching": { en: "Searching for opponent...", ru: "Поиск соперника...", kk: "Қарсылас ізделуде..." },
  "online.quickMatchDesc": { en: "Get matched with a random player worldwide", ru: "Найди случайного соперника со всего мира", kk: "Әлемдегі кез келген ойыншымен матч" },
  "online.playFriend": { en: "Play with Friend", ru: "Играть с Другом", kk: "Доспен Ойнау" },
  "online.playFriendDesc": { en: "Create a private room and share the link.", ru: "Создай приватную комнату и поделись ссылкой.", kk: "Жеке бөлме жасап, сілтемені бөліс." },
  "online.createRoom": { en: "Create Room", ru: "Создать Комнату", kk: "Бөлме Жасау" },
  "online.creating": { en: "Creating...", ru: "Создание...", kk: "Жасалуда..." },
  "online.joinRoom": { en: "Join Room", ru: "Войти в Комнату", kk: "Бөлмеге Кіру" },
  "online.joinRoomDesc": { en: "Got a code from a friend?", ru: "Есть код от друга?", kk: "Достан код бар ма?" },
  "online.join": { en: "Join", ru: "Войти", kk: "Кіру" },
  "online.joining": { en: "Joining...", ru: "Вход...", kk: "Кіруде..." },
  "online.roomCreated": { en: "Room Created!", ru: "Комната Создана!", kk: "Бөлме Жасалды!" },
  "online.shareCode": { en: "Share this code or link with a friend:", ru: "Поделись кодом или ссылкой с другом:", kk: "Кодты немесе сілтемені доспен бөліс:" },
  "online.copyLink": { en: "📋 Copy Invite Link", ru: "📋 Копировать Ссылку", kk: "📋 Сілтемені Көшіру" },
  "online.copied": { en: "✅ Copied!", ru: "✅ Скопировано!", kk: "✅ Көшірілді!" },
  "online.enterRoom": { en: "Enter Room →", ru: "Войти в Комнату →", kk: "Бөлмеге Кіру →" },
  "online.howItWorks": { en: "💡 How it works", ru: "💡 Как это работает", kk: "💡 Қалай жұмыс істейді" },
  "online.howQuick": { en: "Quick Match — Auto-matches you with any waiting player. Public games.", ru: "Быстрый Матч — Автоматический матч с любым ждущим игроком. Публичные игры.", kk: "Жылдам Матч — Күтіп тұрған кез келген ойыншымен автоматты матч. Ашық ойындар." },
  "online.howFriend": { en: "Play with Friend — Creates a private room with a 5-letter code. Share it.", ru: "Играть с Другом — Создаёт приватную комнату с кодом из 5 букв. Поделись им.", kk: "Доспен Ойнау — 5 әріптік кодпен жеке бөлме жасайды. Бөліс." },
  "online.howRealtime": { en: "Real-time — Moves sync instantly via Firestore. No lag.", ru: "Реалтайм — Ходы синхронизируются мгновенно через Firestore. Без лагов.", kk: "Шынайы уақыт — Қадамдар Firestore арқылы бірден синхрондалады. Лагсыз." },
  "online.fbError": { en: "Online multiplayer requires Firebase setup. The local game still works fully — try playing vs AI!", ru: "Онлайн режим требует настройки Firebase. Локальная игра работает полностью — попробуй против AI!", kk: "Онлайн режим Firebase баптауын талап етеді. Жергілікті ойын толық жұмыс істейді — AI-ға қарсы ойнап көр!" },

  // ─── Common ──────────────────────────────────────────────
  "common.loading": { en: "Loading...", ru: "Загрузка...", kk: "Жүктелуде..." },
  "common.error": { en: "Error", ru: "Ошибка", kk: "Қате" },
  "common.close": { en: "Close", ru: "Закрыть", kk: "Жабу" },
  "common.elo": { en: "ELO", ru: "ELO", kk: "ELO" },
  "common.language": { en: "Language", ru: "Язык", kk: "Тіл" },
} as const;

export type TranslationKey = keyof typeof dict;

export function translate(key: TranslationKey, locale: Locale): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[locale] || entry.en || key;
}
