import { GoogleGenerativeAI } from "@google/generative-ai";
import { MatchData } from "./henrikdev";

/**
 * Initializes the Gemini API SDK.
 * We'll use the 'gemini-1.5-pro-latest' or 'gemini-1.5-flash' model for quick, smart analysis!
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzePlaystyle(playerName: string, playerTag: string, matches: MatchData[]) {
  // If we don't have enough matches, we fail early.
  if (!matches || matches.length === 0) return "Not enough recent matches to analyze.";

  // We need to parse the raw match data and extract only what matters for the AI to read.
  // Sending the entire raw JSON would cost too many tokens and confuse the LLM.
  const summarizedMatches = matches.map((match, idx) => {
    // Find our specific player in the big list of players
    const myPlayer = match.players.all_players.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase() && p.tag.toLowerCase() === playerTag.toLowerCase()
    );

    if (!myPlayer) return null;

    // Return a clean, condensed summary string just for this match
    return `
      Match ${idx + 1} - Map: ${match.metadata.map}
      Agent Played: ${myPlayer.character}
      Kills/Deaths/Assists: ${myPlayer.stats.kills} / ${myPlayer.stats.deaths} / ${myPlayer.stats.assists}
      Score: ${myPlayer.stats.score}
    `;
  }).filter(Boolean); // Filter out any nulls if the player somehow wasn't found in a match

  // Combine them into one big text payload
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
    // We get the generative model instance.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Pass the prompt and wait for the response!
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Could not analyze at this time. Did you provide the Gemini API Key?";
  }
}
