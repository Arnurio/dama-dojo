import { NextRequest, NextResponse } from "next/server";

interface MoveSummary {
  from: { row: number; col: number };
  to: { row: number; col: number };
  captures: number;
  player: "red" | "black";
  piece: string;
}

export async function POST(req: NextRequest) {
  try {
    const { coachId, coachPrompt, playerWon, totalMoves, playerCaptures, playerColor, winner, locale, moveHistory } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    // Build move log + extract turning points
    const moves: MoveSummary[] = moveHistory ?? [];
    const playerMoves = moves.filter(m => m.player === playerColor);
    const oppMoves = moves.filter(m => m.player !== playerColor);
    const oppCaptures = oppMoves.filter(m => m.captures > 0).length;
    const captureBalance = playerCaptures - oppCaptures;

    // Find turning points — moves that included captures
    const captureMoves = moves
      .map((m, i) => ({ ...m, ply: i + 1 }))
      .filter(m => m.captures > 0);

    // Big swings — multi-piece captures
    const bigCaptures = captureMoves.filter(m => m.captures >= 2);

    // Notation helper (row,col -> like "a3" using A-H + 1-8)
    const notate = (p: { row: number; col: number }) =>
      `${String.fromCharCode(97 + p.col)}${8 - p.row}`;

    const moveLog = moves.slice(0, 30).map((m, i) => {
      const sep = m.captures > 0 ? "×" : "-";
      const tag = m.captures >= 2 ? ` ⚡(${m.captures} pieces!)` : m.captures > 0 ? " (capture)" : "";
      return `${i + 1}. ${m.player === "red" ? "🔴" : "⚫"} ${notate(m.from)}${sep}${notate(m.to)}${tag}`;
    }).join("\n");

    const turningPoints = bigCaptures.map(m =>
      `Move ${m.ply}: ${m.player === playerColor ? "YOU" : "opponent"} captured ${m.captures} pieces in one combo at ${notate(m.to)}`
    ).join("; ") || "no major combos";

    // Localized language directive
    const langDirective =
      locale === "ru" ? "RESPOND IN RUSSIAN. Use natural conversational Russian."
      : locale === "kk" ? "RESPOND IN KAZAKH. Use natural conversational Kazakh (қазақша)."
      : "RESPOND IN ENGLISH.";

    const apiKeyMissing = !apiKey || apiKey === "sk-placeholder" || apiKey.length < 20;

    if (apiKeyMissing) {
      return NextResponse.json({
        analysis: getOfflineAnalysis(coachId, playerWon, playerCaptures, totalMoves, oppCaptures, bigCaptures.length, locale),
      });
    }

    const userMessage = `Analyze this checkers (dama) game in detail.

📊 STATS:
- Player color: ${playerColor}
- Result: ${playerWon ? "PLAYER WON 🏆" : winner === "draw" ? "DRAW 🤝" : "PLAYER LOST 💀"}
- Total moves: ${totalMoves}
- Player captures: ${playerCaptures}
- Opponent captures: ${oppCaptures}
- Capture balance: ${captureBalance > 0 ? "+" : ""}${captureBalance}

🔥 TURNING POINTS:
${turningPoints}

📝 MOVE LOG (first 30 moves):
${moveLog}

YOUR TASK: Give a structured analysis as the coach. Output EXACTLY this format:

**Поворотный момент** / **Turning point** (1 sentence): Reference a SPECIFIC move number where the game shifted.

**3 урока** / **3 lessons** from THIS game (each 1 sentence, concrete — reference actual moves or numbers):
1. ...
2. ...
3. ...

**${getCoachClosingLabel(coachId)}**: end with 1 line in your signature voice.

Rules:
- Be SPECIFIC to this game's moves, not generic
- Reference real move numbers (e.g. "на ходу 12...")
- Keep total under 180 words
- ${langDirective}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `${coachPrompt}\n\nIMPORTANT: You are reviewing a real checkers game. Reference SPECIFIC move numbers from the log. ${langDirective}` },
          { role: "user", content: userMessage },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content
      ?? getOfflineAnalysis(coachId, playerWon, playerCaptures, totalMoves, oppCaptures, bigCaptures.length, locale);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ analysis: "Временно недоступно. Попробуй позже." }, { status: 200 });
  }
}

function getCoachClosingLabel(coachId: string): string {
  const map: Record<string, string> = {
    arman: "Совет сенсея",
    erzat: "Renegade verdict",
    nurdaulet: "VC closing",
    arlan: "vibe check",
    timur: "Final word",
  };
  return map[coachId] ?? "Coach";
}

function getOfflineAnalysis(
  coachId: string,
  playerWon: boolean,
  captures: number,
  totalMoves: number,
  oppCaptures: number,
  bigCombos: number,
  locale: string,
): string {
  const ratio = captures / Math.max(totalMoves, 1);
  const tempo = totalMoves < 15 ? "fast" : totalMoves < 30 ? "balanced" : "long";

  const ruTempo = totalMoves < 15 ? "быстрая" : totalMoves < 30 ? "сбалансированная" : "длинная";
  const kkTempo = totalMoves < 15 ? "жылдам" : totalMoves < 30 ? "теңдестірілген" : "ұзақ";

  if (locale === "ru") {
    return buildRu(coachId, playerWon, captures, oppCaptures, totalMoves, bigCombos, ratio, ruTempo);
  }
  if (locale === "kk") {
    return buildKk(coachId, playerWon, captures, oppCaptures, totalMoves, bigCombos, ratio, kkTempo);
  }
  return buildEn(coachId, playerWon, captures, oppCaptures, totalMoves, bigCombos, ratio, tempo);
}

function buildRu(id: string, won: boolean, caps: number, oppCaps: number, total: number, combos: number, ratio: number, tempo: string): string {
  const turn = combos > 0
    ? `Партия решилась в момент, когда было выполнено ${combos} ${combos === 1 ? "комбо-взятие" : "комбо-взятий"}.`
    : `Перелом случился в середине партии — на ${Math.round(total / 2)}-м ходу.`;
  const lessons: Record<string, string[]> = {
    arman: [
      `1. Твой темп: ${tempo}. ${won ? "Терпение принесло плоды." : "В этот раз торопился — медитируй на доске дольше."}`,
      `2. Соотношение взятий: ты ${caps} — ${oppCaps} соперник. ${caps > oppCaps ? "Энергия в твоих руках." : "Защищайся осознаннее."}`,
      `3. ${ratio < 0.15 ? "Мало атак. Найди икигай в нападении." : "Хорошая активность. Доска — твой сад."}`,
    ],
    erzat: [
      `1. Tempo был ${tempo === "быстрая" ? "BOLD как надо" : "слишком медленный для KZ engineer"}.`,
      `2. ${caps} vs ${oppCaps} — ${caps > oppCaps ? "доминирование, я уважаю" : "соперник прессовал, в следующий раз — атакуй первым"}.`,
      `3. ${combos === 0 ? "Ни одного комбо — это не Higgsfield-energy. Ищи цепочки взятий." : `${combos} комбо — bold, no retreat.`}`,
    ],
    nurdaulet: [
      `1. Tempo: ${tempo}. ${won ? "Хорошее распределение капитала." : "Перерасход ресурсов."}`,
      `2. ROI: ${caps}/${total} = ${(ratio * 100).toFixed(0)}%. ${ratio < 0.2 ? "Низкая доходность. Бери больше рисков." : "Доходный портфель."}`,
      `3. ${combos > 0 ? `${combos} крупных сделок — компаунд работает.` : "Не вижу крупных сделок — играй на форки."}`,
    ],
    arlan: [
      `1. вайб был ${tempo === "быстрая" ? "IMMACULATE 🔥" : "slow burn fr"}`,
      `2. ${caps}-${oppCaps} caps. ${caps > oppCaps ? "we cooking 🔥" : "next time we lock in"}`,
      `3. ${combos > 0 ? "комбо были чистые fr" : "next game: vibe coding the captures bro"}`,
    ],
    timur: [
      `1. Темп ${tempo}. ${won ? "Приемлемо." : "Слабо. Точность важнее скорости."}`,
      `2. Размен ${caps}:${oppCaps}. ${caps > oppCaps ? "Контроль был у тебя." : "Соперник дожимал — не допусти повтора."}`,
      `3. ${combos === 0 ? "Ни одного крупного размена. Чемпион ищет форки." : `${combos} крупных размена — точно.`}`,
    ],
  };
  const closing: Record<string, string> = {
    arman: "Совет сенсея: каждый ход — медитация. Найди свое икигай. 🌸",
    erzat: "Renegade verdict: WE DON'T SELL. WE WIN. 🚀",
    nurdaulet: "VC closing: компаунд преимущества — путь к чемпионству. 💼",
    arlan: "vibe check: ship the W next time bro ⚡",
    timur: "Final word: каждый ход имеет цену. Не ошибайся. ♟️",
  };
  const ls = lessons[id] ?? lessons.arman;
  return `**Поворотный момент:** ${turn}\n\n**3 урока:**\n${ls.join("\n")}\n\n**${closing[id] ?? closing.arman}**`;
}

function buildEn(id: string, won: boolean, caps: number, oppCaps: number, total: number, combos: number, ratio: number, tempo: string): string {
  const turn = combos > 0
    ? `The game pivoted when ${combos} multi-piece combo${combos > 1 ? "s" : ""} happened.`
    : `The midgame swing came around move ${Math.round(total / 2)}.`;
  const lessons: Record<string, string[]> = {
    arman: [
      `1. Tempo: ${tempo}. ${won ? "Patience paid off." : "Rushed — meditate on the board longer."}`,
      `2. Captures ${caps} vs ${oppCaps}. ${caps > oppCaps ? "Energy was yours." : "Defend with more awareness."}`,
      `3. ${ratio < 0.15 ? "Low aggression. Find your ikigai in attack." : "Good board presence. The board is your garden."}`,
    ],
    erzat: [
      `1. Tempo was ${tempo === "fast" ? "BOLD" : "too slow for KZ engineer"}.`,
      `2. ${caps} vs ${oppCaps} — ${caps > oppCaps ? "domination, I respect" : "opponent pressed you — next game attack first"}.`,
      `3. ${combos === 0 ? "Zero combos — not Higgsfield energy. Look for capture chains." : `${combos} combo${combos > 1 ? "s" : ""} — bold, no retreat.`}`,
    ],
    nurdaulet: [
      `1. Tempo: ${tempo}. ${won ? "Good capital allocation." : "Resource overspend."}`,
      `2. ROI: ${caps}/${total} = ${(ratio * 100).toFixed(0)}%. ${ratio < 0.2 ? "Low yield. Take more risk." : "Profitable portfolio."}`,
      `3. ${combos > 0 ? `${combos} big trades — compounding works.` : "No major trades — play for forks."}`,
    ],
    arlan: [
      `1. vibe was ${tempo === "fast" ? "IMMACULATE 🔥" : "slow burn fr"}`,
      `2. ${caps}-${oppCaps} caps. ${caps > oppCaps ? "we cooking 🔥" : "next time we lock in"}`,
      `3. ${combos > 0 ? "combos were clean fr" : "next game: vibe coding the captures bro"}`,
    ],
    timur: [
      `1. Tempo ${tempo}. ${won ? "Acceptable." : "Weak. Precision over speed."}`,
      `2. Exchange ${caps}:${oppCaps}. ${caps > oppCaps ? "You controlled." : "Opponent pressed — don't repeat."}`,
      `3. ${combos === 0 ? "No major exchanges. Champions look for forks." : `${combos} big exchange${combos > 1 ? "s" : ""} — precise.`}`,
    ],
  };
  const closing: Record<string, string> = {
    arman: "Sensei's advice: every move is meditation. Find your ikigai. 🌸",
    erzat: "Renegade verdict: WE DON'T SELL. WE WIN. 🚀",
    nurdaulet: "VC closing: compound your advantages — that's the championship path. 💼",
    arlan: "vibe check: ship the W next time bro ⚡",
    timur: "Final word: every move has a price. Don't waste them. ♟️",
  };
  const ls = lessons[id] ?? lessons.arman;
  return `**Turning point:** ${turn}\n\n**3 lessons:**\n${ls.join("\n")}\n\n**${closing[id] ?? closing.arman}**`;
}

function buildKk(id: string, won: boolean, caps: number, oppCaps: number, total: number, combos: number, ratio: number, tempo: string): string {
  const turn = combos > 0
    ? `Партия ${combos} комбо-жеу болғанда бұрылды.`
    : `Орта ойында ${Math.round(total / 2)}-ші қадамда шешілді.`;
  const lessons: Record<string, string[]> = {
    arman: [
      `1. Қарқын: ${tempo}. ${won ? "Шыдамдылық жеңіс әкелді." : "Асықтың — тақтаға тереңірек қара."}`,
      `2. Жеу: ${caps} — ${oppCaps}. ${caps > oppCaps ? "Күш сенің қолыңда болды." : "Қорғанышыңды күшейт."}`,
      `3. ${ratio < 0.15 ? "Шабуыл аз. Шабуылдан икигайды тап." : "Жақсы белсенділік. Тақта — сенің бағың."}`,
    ],
    erzat: [
      `1. Tempo ${tempo === "жылдам" ? "BOLD" : "KZ engineer үшін тым баяу"} болды.`,
      `2. ${caps} vs ${oppCaps} — ${caps > oppCaps ? "үстемдік, құрметтеймін" : "қарсылас қысты — келесіде сен бірінші шабуылда"}.`,
      `3. ${combos === 0 ? "Бір де комбо жоқ — Higgsfield энергиясы емес." : `${combos} комбо — bold, no retreat.`}`,
    ],
    nurdaulet: [
      `1. Қарқын: ${tempo}. ${won ? "Капиталды дұрыс бөлдің." : "Ресурс шығыны."}`,
      `2. ROI: ${caps}/${total} = ${(ratio * 100).toFixed(0)}%. ${ratio < 0.2 ? "Кірісі төмен. Тәуекелге бар." : "Табысты портфель."}`,
      `3. ${combos > 0 ? `${combos} ірі мәміле — compounding жұмыс істейді.` : "Ірі мәміле жоқ — форкке ойна."}`,
    ],
    arlan: [
      `1. вайб ${tempo === "жылдам" ? "IMMACULATE 🔥" : "slow burn fr"}`,
      `2. ${caps}-${oppCaps} caps. ${caps > oppCaps ? "we cooking 🔥" : "келесіде we lock in"}`,
      `3. ${combos > 0 ? "комбо таза болды fr" : "келесі ойын: vibe coding the captures bro"}`,
    ],
    timur: [
      `1. Қарқын ${tempo}. ${won ? "Қолайлы." : "Әлсіз. Дәлдік жылдамдықтан маңызды."}`,
      `2. Алмасу ${caps}:${oppCaps}. ${caps > oppCaps ? "Сен басқардың." : "Қарсылас қысты — қайталама."}`,
      `3. ${combos === 0 ? "Ірі алмасу жоқ. Чемпион форкті іздейді." : `${combos} ірі алмасу — дәл.`}`,
    ],
  };
  const closing: Record<string, string> = {
    arman: "Сенсей кеңесі: әр қадам — медитация. Икигайыңды тап. 🌸",
    erzat: "Renegade verdict: WE DON'T SELL. WE WIN. 🚀",
    nurdaulet: "VC closing: артықшылықты компаунд ет — чемпиондық жол. 💼",
    arlan: "vibe check: келесіде W ship ет bro ⚡",
    timur: "Соңғы сөз: әр қадамның бағасы бар. Қатені жасама. ♟️",
  };
  const ls = lessons[id] ?? lessons.arman;
  return `**Бұрылыс кезі:** ${turn}\n\n**3 сабақ:**\n${ls.join("\n")}\n\n**${closing[id] ?? closing.arman}**`;
}
