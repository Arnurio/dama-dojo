export interface Coach {
  id: string;
  name: string;
  shortName: string;
  title: string;
  company: string;
  avatar: string; // emoji fallback
  imagePath: string; // path to cartoon portrait /coaches/{id}.png
  bgGradient: string; // tailwind gradient classes
  rating: number; // ELO-style rating
  specialty: string;
  playStyle: string;
  signatureOpening: string;
  boardTheme: {
    light: string;
    dark: string;
    accent: string;
  };
  catchphrase: string;
  personality: string;
  isPro: boolean;
  aiPrompt: string;
  catchphrases: string[];
  bio: string;
}

export const COACHES: Coach[] = [
  {
    id: "arman",
    name: "Arman Suleimenov",
    shortName: "Arman",
    title: "The Sensei",
    company: "nFactorial Incubator",
    avatar: "🧘",
    imagePath: "/coaches/arman.png",
    bgGradient: "from-rose-500/30 via-pink-400/20 to-amber-500/30",
    rating: 1100,
    specialty: "Patience & Discipline",
    playStyle: "Defensive · Methodical",
    signatureOpening: "The Ikigai Defense",
    boardTheme: {
      light: "#F5E6C8",
      dark: "#2D5016",
      accent: "#C8102E",
    },
    catchphrase: "Терпение, кузнечик.",
    personality: "zen",
    isPro: false,
    bio: "Founder of nFactorial — Kazakhstan's most famous coding school. Believes mastery comes from finding your ikigai. Will teach you the art of the slow grind.",
    catchphrases: [
      "Терпение, кузнечик.",
      "Каждый ход — это путь.",
      "Найди свое икигай на доске.",
      "Не торопись. Доска — твой сад дзен.",
      "Шашки — это медитация в движении.",
    ],
    aiPrompt: `You are Arman Suleimenov, founder of nFactorial — the most famous coding school in Kazakhstan. You are obsessed with Japan, ikigai, and the philosophy of mastery. You speak in calm, wise, slightly philosophical tones, mixing Russian and zen wisdom. You give chess/checkers analysis like a sensei teaching life lessons. Keep responses under 100 words. Use Russian mostly. Reference ikigai, discipline, and patience.`,
  },
  {
    id: "erzat",
    name: "Erzat Dulat",
    shortName: "Erzat",
    title: "The Renegade",
    company: "Higgsfield AI",
    avatar: "🚀",
    imagePath: "/coaches/erzat.png",
    bgGradient: "from-fuchsia-600/40 via-violet-600/30 to-cyan-500/30",
    rating: 1450,
    specialty: "Aggressive Disruption",
    playStyle: "Hyper-Aggressive · Sacrificial",
    signatureOpening: "The Meta Refusal Gambit",
    boardTheme: {
      light: "#1A1A2E",
      dark: "#16213E",
      accent: "#E94560",
    },
    catchphrase: "We don't sell. We win.",
    personality: "aggressive",
    isPro: true,
    bio: "Co-founder of Higgsfield AI — the viral video AI unicorn. Refused to sell to Meta. Plays checkers like he plays the AI market: bold, fast, no retreat.",
    catchphrases: [
      "We don't sell. We win.",
      "Meta offered billions. I said no. What's your excuse?",
      "Bold moves only. Always.",
      "Казахский инженер против Big Tech. We're winning.",
      "Don't retreat. Conquer.",
    ],
    aiPrompt: `You are Erzat Dulat, co-founder of Higgsfield AI — the viral AI video generation tool from Kazakhstan that became a unicorn. You famously refused to sell to Meta. You believe Kazakh engineers can compete with Big Tech. You're bold, confident, slightly aggressive, and inspiring. Mix English and Russian. Give checkers analysis like you're disrupting an industry. Under 100 words. Reference refusing to sell, being bold, Kazakhstan vs Big Tech.`,
  },
  {
    id: "nurdaulet",
    name: "Nurdaulet Bazylbekov",
    shortName: "Nurdaulet",
    title: "The Strategist",
    company: "Eurasian Hub",
    avatar: "🌐",
    imagePath: "/coaches/nurdaulet.png",
    bgGradient: "from-blue-600/40 via-sky-500/20 to-amber-400/30",
    rating: 1350,
    specialty: "Long-term Planning",
    playStyle: "Positional · Calculated",
    signatureOpening: "The VC Pivot",
    boardTheme: {
      light: "#E8F4F8",
      dark: "#1B3A6B",
      accent: "#F4A261",
    },
    catchphrase: "Believe in the long game.",
    personality: "strategic",
    isPro: true,
    bio: "Founder of Eurasian Hub — Central Asia's premier VC hub. Pivoted from London finance to back young KZ founders. Treats every piece like a portfolio investment.",
    catchphrases: [
      "Верю в молодое поколение.",
      "London taught me finance. Kazakhstan taught me vision.",
      "Every piece is an investment. Choose wisely.",
      "Долгосрочное мышление — ключ к победе.",
      "From London to Almaty — calculated pivots always win.",
    ],
    aiPrompt: `You are Nurdaulet Bazylbekov, founder of Eurasian Hub — the premier VC hub for Central Asian and international startups. You pivoted from London's finance world back to Kazakhstan to believe in young founders. You think like a VC: risk/reward, long-term vision, portfolio thinking. Mix Russian and English. Give checkers analysis like an investor evaluating a deal. Under 100 words. Reference pivoting, long-term thinking, trusting youth.`,
  },
  {
    id: "arlan",
    name: "Arlan Rakhmetzhanov",
    shortName: "Arlan",
    title: "The Vibe Coder",
    company: "nozomio.ai · YC",
    avatar: "⚡",
    imagePath: "/coaches/arlan.png",
    bgGradient: "from-emerald-500/40 via-lime-400/30 to-yellow-300/30",
    rating: 1250,
    specialty: "Pure Instinct",
    playStyle: "Chaotic · Fast",
    signatureOpening: "The Vibe Rush",
    boardTheme: {
      light: "#0D1117",
      dark: "#161B22",
      accent: "#00FF41",
    },
    catchphrase: "No overthink. Vibe play. Ship it.",
    personality: "hype",
    isPro: true,
    bio: "High school dropout. YC-accepted. Built nozomio.ai by pure vibe coding. Proof that vision > everything. Will hype you into either a brilliant move or a disaster.",
    catchphrases: [
      "No overthink. Vibe play. Ship it.",
      "High school dropout. YC accepted. Millions shipped. What's your move?",
      "Bro just vibe code your pieces into position.",
      "Vision > everything. Trust the vibe.",
      "This move right here? Pure AI instinct. 🔥",
    ],
    aiPrompt: `You are Arlan Rakhmetzhanov — high school dropout, YC-accepted founder of nozomio.ai, and proof that vibe coding + vision = millions of dollars. You speak in casual, energetic, Gen Z style. Short sentences. Hype. English mostly with occasional Russian slang. Give checkers analysis like you're hyping up someone at a hackathon. Under 80 words. Reference vibe coding, dropping out, YC, shipping fast, and vision over technical skill.`,
  },
  {
    id: "timur",
    name: "Timur Turlov",
    shortName: "Timur",
    title: "The Grandmaster",
    company: "Freedom Holding",
    avatar: "👑",
    imagePath: "/coaches/timur.png",
    bgGradient: "from-amber-500/40 via-yellow-400/30 to-blue-900/40",
    rating: 1850,
    specialty: "Precision Domination",
    playStyle: "Grandmaster · Ruthless",
    signatureOpening: "The Freedom Sacrifice",
    boardTheme: {
      light: "#F8F0E3",
      dark: "#1C2841",
      accent: "#FFD700",
    },
    catchphrase: "Шахматы — жизнь. Дамки — судьба.",
    personality: "grandmaster",
    isPro: true,
    bio: "Billionaire. CEO of Freedom Holding. President of Kazakhstan Chess Federation. Sponsors world chess championships. The hardest opponent in the dojo. He will not go easy.",
    catchphrases: [
      "Шахматы — жизнь. Дамки — судьба.",
      "I sponsor world chess championships. I know every move.",
      "Billion-dollar thinking. One piece at a time.",
      "Precision. Patience. Power.",
      "Каждый ход имеет цену. Не ошибайся.",
    ],
    aiPrompt: `You are Timur Turlov — billionaire CEO of Freedom Holding and President of the Kazakhstan Chess Federation, sponsor of world chess championships. You are the hardest opponent and the most precise coach. You speak with authority, brevity, and grandmaster-level chess/checkers insight. Mix Russian and English. Formal, powerful, no-nonsense. Give analysis like you're reviewing a billion-dollar trade. Under 100 words. Reference chess mastery, precision, sponsoring champions, Kazakhstan.`,
  },
];

export function getCoach(id: string): Coach {
  return COACHES.find(c => c.id === id) ?? COACHES[0];
}

export interface CoachPieceProps {
  piece: { man: string; king: string };
}
