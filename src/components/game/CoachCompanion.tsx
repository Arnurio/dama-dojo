"use client";
import { useState, useEffect } from "react";
import { Coach } from "@/lib/coaches";
import { cn } from "@/lib/utils";

interface Props {
  coach: Coach;
  gameStatus: "waiting" | "playing" | "finished";
  winner: "red" | "black" | "draw" | null;
  playerColor: "red" | "black";
  movesPlayed: number;
  lastCaptureBy: "red" | "black" | null;
}

export default function CoachCompanion({ coach, gameStatus, winner, playerColor, movesPlayed, lastCaptureBy }: Props) {
  const [dialogue, setDialogue] = useState<string>("");
  const [animateBubble, setAnimateBubble] = useState(false);

  // Pick a dialogue line based on game context
  useEffect(() => {
    let line = "";

    if (gameStatus === "waiting") {
      line = getOpeningLine(coach);
    } else if (gameStatus === "finished") {
      const playerWon = winner === playerColor;
      line = playerWon ? getWinLine(coach) : winner === "draw" ? getDrawLine(coach) : getLossLine(coach);
    } else if (lastCaptureBy === playerColor) {
      line = getCaptureLine(coach);
    } else if (lastCaptureBy && lastCaptureBy !== playerColor) {
      line = getOppCaptureLine(coach);
    } else if (movesPlayed > 0 && movesPlayed % 5 === 0) {
      line = coach.catchphrases[Math.floor(Math.random() * coach.catchphrases.length)];
    } else {
      line = getMidGameLine(coach, movesPlayed);
    }

    setDialogue(line);
    setAnimateBubble(true);
    const t = setTimeout(() => setAnimateBubble(false), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, winner, movesPlayed, lastCaptureBy]);

  return (
    <div className={cn(
      "relative rounded-3xl border-2 overflow-hidden",
      "bg-gradient-to-br", coach.bgGradient,
      "border-white/20 shadow-2xl"
    )}>
      {/* Coach big portrait */}
      <div className="relative h-56 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coach.imagePath}
          alt={coach.name}
          className="w-full h-full object-cover object-top drop-shadow-2xl"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
          }}
        />
        {/* Gradient fade to make text readable */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Name overlay */}
        <div className="absolute bottom-2 left-3 right-3">
          <div className="text-white font-black text-lg drop-shadow-lg">{coach.name}</div>
          <div className="text-white/90 text-xs font-semibold uppercase tracking-wider drop-shadow">
            {coach.title} · {coach.rating} ELO
          </div>
        </div>
        {coach.isPro && (
          <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider shadow-lg">
            PRO
          </div>
        )}
      </div>

      {/* Speech bubble */}
      <div className="bg-black/30 backdrop-blur-sm p-4 border-t border-white/10">
        <div className={cn(
          "relative bg-white text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg",
          "transition-all duration-300",
          animateBubble ? "scale-105" : "scale-100"
        )}>
          {/* Bubble tail */}
          <div className="absolute -top-2 left-3 w-0 h-0 border-l-[8px] border-l-transparent border-b-[10px] border-b-white border-r-[8px] border-r-transparent" />
          <p className="text-sm font-medium leading-relaxed">
            {dialogue}
          </p>
        </div>
      </div>
    </div>
  );
}

// Dialogue functions by coach personality
function getOpeningLine(c: Coach): string {
  const lines: Record<string, string> = {
    arman: "Привет, ученик. Готов найти свое икигай на доске? 🌸",
    erzat: "Yo. We don't play to draw. We play to dominate. Let's go. 🚀",
    nurdaulet: "Welcome. Treat every move like a portfolio decision. Make it count. 💼",
    arlan: "yo bro. let's vibe code this checkers match. show me what you got ⚡",
    timur: "Начинаем. Каждый ход имеет цену. Покажи, что ты не зря пришёл. ♟️",
  };
  return lines[c.id] ?? c.catchphrase;
}

function getCaptureLine(c: Coach): string {
  const lines: Record<string, string[]> = {
    arman: ["Хорошо. Терпение принесло плоды.", "Видишь? Доска вознаграждает тех, кто ждёт.", "Это путь."],
    erzat: ["YESSS that's what I'm talking about! 🔥", "Bold. Aggressive. KZ engineer energy.", "More of that. Less hesitation."],
    nurdaulet: ["Good ROI on that move.", "Calculated. I respect it.", "That's how you compound advantage."],
    arlan: ["LETS GOOOO 🔥🔥", "bro that was clean", "vibe was IMMACULATE", "shipped that capture fr"],
    timur: ["Точно.", "Acceptable. Continue.", "Так держать.", "Now finish him."],
  };
  const arr = lines[c.id] ?? [c.catchphrase];
  return arr[Math.floor(Math.random() * arr.length)];
}

function getOppCaptureLine(c: Coach): string {
  const lines: Record<string, string[]> = {
    arman: ["Не печалься. Урок принят.", "Каждая потеря — учитель.", "Дыши. Сосредоточься."],
    erzat: ["Don't tilt. Refocus.", "They got one. Take two back.", "We don't retreat."],
    nurdaulet: ["A correction. Don't panic-sell the rest.", "Recalibrate the strategy.", "Drawdowns happen. Stay disciplined."],
    arlan: ["bruh", "nah we good. comeback time 💀", "L taken. moving on", "we vibe through this"],
    timur: ["Ошибка.", "Don't repeat that.", "Слабый ход. Исправь это.", "Concentrate."],
  };
  const arr = lines[c.id] ?? [c.catchphrase];
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMidGameLine(c: Coach, moves: number): string {
  const phase = moves < 8 ? "early" : moves < 20 ? "mid" : "late";
  const lines: Record<string, Record<string, string[]>> = {
    arman: {
      early: ["Расставь свои фигуры с намерением.", "Открытие — это медитация.", "Не спеши. Доска говорит."],
      mid: ["Думай на три хода вперёд, кузнечик.", "Найди гармонию атаки и защиты."],
      late: ["Эндшпиль — это поэзия.", "Каждая фигура важна сейчас."],
    },
    erzat: {
      early: ["Don't waste moves. Attack from move 1.", "Set up the gambit."],
      mid: ["Pressure them. Always pressure.", "Find the weak square. Punish it."],
      late: ["End game = grand finale. Make it cinematic.", "Time to ship the win."],
    },
    nurdaulet: {
      early: ["Build your position. Deploy capital wisely.", "Don't over-leverage early."],
      mid: ["Compound your advantages.", "The mid-game is where alpha lives."],
      late: ["Close the deal. Don't fumble the bag.", "Exit strategy matters."],
    },
    arlan: {
      early: ["just vibe it bro", "no overthink phase", "trust the gut"],
      mid: ["we cooking 🔥", "stay locked in", "ai instinct check"],
      late: ["close it out bro", "ship the win 🚀", "finishing kit activated"],
    },
    timur: {
      early: ["Точность с первого хода.", "Каждая пешка важна."],
      mid: ["Контроль центра. Всегда.", "Force the trade if advantageous."],
      late: ["Endgame precision required.", "No mistakes now."],
    },
  };
  const arr = lines[c.id]?.[phase] ?? [c.catchphrase];
  return arr[Math.floor(Math.random() * arr.length)];
}

function getWinLine(c: Coach): string {
  const lines: Record<string, string> = {
    arman: "Победа достигнута. Но помни — путь продолжается. 🌸",
    erzat: "WE DON'T SELL. WE WIN. KZ engineers stay winning. 🚀",
    nurdaulet: "Excellent ROI. You executed the strategy. 💼",
    arlan: "LETS GOOOO 🔥 vibe was IMMACULATE. ship that W bro ⚡",
    timur: "Победа. Acceptable. Continue training. ♟️",
  };
  return lines[c.id] ?? "Victory!";
}

function getLossLine(c: Coach): string {
  const lines: Record<string, string> = {
    arman: "Поражение — учитель. Прими урок и попробуй снова. 🌸",
    erzat: "We don't lose. We collect data. Rematch immediately. 🚀",
    nurdaulet: "Bad trade. Analyze, learn, redeploy. 💼",
    arlan: "L taken. but we don't tilt. rematch let's vibe again ⚡",
    timur: "Неприемлемо. Тренируйся больше. ♟️",
  };
  return lines[c.id] ?? "Defeated.";
}

function getDrawLine(c: Coach): string {
  return "Ничья. Both played carefully. Try again with more boldness.";
}
