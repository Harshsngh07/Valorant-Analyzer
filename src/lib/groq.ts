import Groq from "groq-sdk";
import { MatchData } from "./henrikdev";

export async function analyzePlaystyleGroq(playerName: string, playerTag: string, matches: MatchData[]) {
  if (!matches || matches.length === 0) return "Not enough recent matches to analyze.";

  const apiKey = process.env.GROQ_API_KEY || "";
  if (!apiKey) return "API Key missing in environment variables. Did you name it GROQ_API_KEY?";
  
  const groq = new Groq({ apiKey });

  const summarizedMatches = matches.map((match, idx) => {
    const myPlayer = match.players.all_players.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase() && p.tag.toLowerCase() === playerTag.toLowerCase()
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
    Act as a high-level Valorant Radiant coach speaking directly to the player. Analyze the following data from ${summarizedMatches.length} matches with a focus on tactical efficiency and round-loss attribution.

    Provide exactly 5 dense, actionable bullet points addressed directly to the player (use "You" and "Your", NEVER use third-person names or their Riot ID). Each point must identify a specific mechanical or strategic deficit based on the following priority:
    1. Clutch Performance: Success rate in 1vX scenarios vs. expected win percentage.
    2. Advantage Conversion: Frequency of lost rounds after securing the first blood or being in a 5v4/5v3.
    3. Post-Plant Utility: Deaths with utility still available or failure to hold crossfires.
    4. 1v1 Engagement Logic: Trade percentage and whether deaths are being traded by teammates.
    5. Agent-Specific Execution: Efficiency of ability usage (e.g., flashes leading to kills vs. wasted utility).

    1. INDIVIDUAL MECHANICS (Aim & Duel Efficiency)
    2. POSITIONING & GAMESENSE (Survival & Trading)
    3. TACTICAL CONVERSION (Clutches & Advantageous Rounds)
    4. AGENT MASTERY (Role-Specific Execution)
    5. TEAMPLAY & COMMUNICATION (Synergy & Support)

    Strict Requirements:
    - Use "High-Pressure Failure" or "Conversion Gap" terminology.
    - Focus on the 'Why' behind lost rounds (e.g., "over-peeking in man-advantage" or "ineffective utility stalling").
    - AIM BENCHMARK: Compare Headshot % (HS%) against the lobby average. If HS% is <20%, highlight "Click-Timing Deficit." If HS% is >30% but K/D is low, highlight "Over-reliance on Aim/Poor Positioning."
    - POSITIONING: Analyze "Killed By" vs "Kills." Are they dying to the same person? Are they being traded? Mention "Isolated Deaths" if Trade % is low.
    - GAMESENSE: Look at "First Bloods" vs "First Deaths." If First Deaths > First Bloods, call out "Entry Timing Errors." 
    - CLUTCH/POST-PLANT: Identify "Advantage Bleed"—rounds lost when the team had a man advantage (5v4, 4v3).
    - Format: Strict bullet points. No intro, no outro, no filler.

    Data:
    ${aiPromptData}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an elite, direct Valorant Coach. You only output bullet points without any fluffy introductions.' },
        { role: 'user', content: prompt }
      ],
      model: "llama-3.1-8b-instant", // Cutting edge open source Meta model, extremely fast!
    });
    
    return chatCompletion.choices[0]?.message?.content || "No analysis generated.";
  } catch (err: any) {
    console.error("Groq API Error:", err);
    return `Failure from AI: ${err.message}`;
  }
}
