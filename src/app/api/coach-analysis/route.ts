import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { coachId, coachPrompt, playerWon, totalMoves, playerCaptures, playerColor, winner } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "sk-placeholder") {
      return NextResponse.json({ analysis: getOfflineAnalysis(coachId, playerWon, playerCaptures, totalMoves) });
    }

    const userMessage = `Game results:
- Player color: ${playerColor}
- Result: ${playerWon ? "player won" : winner === "draw" ? "draw" : "player lost"}
- Total moves in game: ${totalMoves}
- Player's successful captures: ${playerCaptures}

Analyze this game briefly in your coaching style. Give 2-3 sentences of insight.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: coachPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content ?? getOfflineAnalysis(coachId, playerWon, playerCaptures, totalMoves);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ analysis: "Временно недоступно. Попробуй позже." }, { status: 200 });
  }
}

function getOfflineAnalysis(coachId: string, playerWon: boolean, captures: number, totalMoves: number): string {
  const templates: Record<string, string> = {
    arman: `${playerWon ? "Победа — лишь начало пути." : "Поражение — твой лучший учитель."} ${captures} взятий за ${totalMoves} ходов. ${captures < 3 ? "Больше агрессии, кузнечик." : "Хорошее давление."} Найди свое икигай на доске. 🌸`,
    erzat: `${playerWon ? "KZ engineers WIN. Bold moves only." : "We collect data from losses. Get back in."} ${captures} captures, ${totalMoves} moves. ${captures < 3 ? "Too passive — attack from move 1." : "Aggressive. I like it."} We don't sell, we conquer. 🚀`,
    nurdaulet: `${playerWon ? "Excellent ROI." : "Bad investment. Fix the portfolio."} ${captures} captures, ${totalMoves} moves. ${captures / Math.max(totalMoves, 1) < 0.2 ? "Too conservative — no risk, no return." : "Good capital deployment."} Calculated pivots always win. 💼`,
    arlan: `bro ${playerWon ? "WE WON 🔥" : "rematch immediately."} ${captures} caps in ${totalMoves} moves. ${captures < 2 ? "bro capture more pieces that's literally free 💀" : "clean plays fr"} vision > skill always ⚡`,
    timur: `${playerWon ? "Acceptable." : "Unacceptable."} ${captures} captures, ${totalMoves} moves. ${captures < 4 ? "Insufficient aggression — kings are built on captured pieces." : "Capture rate noted."} Every move has a price. ♟️`,
  };
  return templates[coachId] ?? templates.arman;
}
