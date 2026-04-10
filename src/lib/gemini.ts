import { GoogleGenAI } from "@google/genai";
import { MatchData } from "./henrikdev";

export async function analyzePlaystyle(playerName: string, playerTag: string, matches: MatchData[]) {
  if (!matches || matches.length === 0) return "Not enough recent matches to analyze.";

  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return "API Key missing in environment variables.";
  
  const ai = new GoogleGenAI({ apiKey });

  const summarizedMatches = matches.map((match, idx) => {
    const myPlayer = match.players.all_players.find(
      (p) => p.name?.toLowerCase() === playerName.toLowerCase() && p.tag?.toLowerCase() === playerTag.toLowerCase()
    );

    if (!myPlayer) return null;

    return `
      Match ${idx + 1} - Map: ${match.metadata.map}
      Agent Played: ${myPlayer.character}
      Kills/Deaths/Assists: ${myPlayer.stats.kills} / ${myPlayer.stats.deaths} / ${myPlayer.stats.assists}
      Score: ${myPlayer.stats.score}
    `;
  }).filter(Boolean);

  const aiPromptData = summarizedMatches.join("\n");

  const prompt = `
    You are an expert Valorant Coach. Analyze the following stats from the last ${summarizedMatches.length} matches for the player ${playerName}#${playerTag}.
    Give them exactly 3 specific, actionable short bullet points about their playstyle, similar to these examples:
    - "Your Reyna is a great duelist, but try to avoid dying first as much."
    - "Your Jett play on Haven is strong, keep taking those aggressive angles."
    
    Here is the data:
    ${aiPromptData}
    
    Format the response as bullet points. Do not include extra introductions or filler text. Be direct, coaching, and analytical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });
    
    return response.text;
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return `Failure from AI: ${err.message}`;
  }
}
