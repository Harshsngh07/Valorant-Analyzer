import Groq from "groq-sdk";
import { MatchData } from "./henrikdev";

export async function analyzePlaystyleGroq(playerName: string, playerTag: string, matches: MatchData[]) {
  if (!matches || matches.length === 0) return "Not enough recent matches to analyze.";

  const apiKey = process.env.GROQ_API_KEY || "";
  if (!apiKey) return "API Key missing in environment variables. Did you name it GROQ_API_KEY?";
  
  const groq = new Groq({ apiKey });

  const summarizedMatches = matches.map((match, idx) => {
    const myPlayer = match.players.all_players.find(
      (p) => p.name?.toLowerCase() === playerName.toLowerCase() && p.tag?.toLowerCase() === playerTag.toLowerCase()
    );

    if (!myPlayer) return null;

    const myTeam = myPlayer.team?.toLowerCase() as "red" | "blue" | undefined;
    const teamData = myTeam && match.teams ? match.teams[myTeam] : null;
    const result = teamData
      ? teamData.has_won ? "WIN" : teamData.rounds_won === teamData.rounds_lost ? "DRAW" : "LOSS"
      : "UNKNOWN";
    const roundScore = teamData ? `${teamData.rounds_won} - ${teamData.rounds_lost}` : "? - ?";

    const head = myPlayer.stats.headshots || 0;
    const body = myPlayer.stats.bodyshots || 0;
    const leg = myPlayer.stats.legshots || 0;
    const shots = head + body + leg;
    const hsPercent = shots > 0 ? Math.round((head / shots) * 100) : 0;

    const lobbyACS = match.players.all_players.reduce((sum, p) => sum + p.stats.score, 0) / Math.max(1, match.players.all_players.length);

    return `
      Match ${idx + 1} - Map: ${match.metadata.map}
      Result: ${result} (${roundScore})
      Agent Played: ${myPlayer.character}
      Kills/Deaths/Assists: ${myPlayer.stats.kills} / ${myPlayer.stats.deaths} / ${myPlayer.stats.assists}
      Combat Score (ACS): ${myPlayer.stats.score} | Lobby average: ${Math.round(lobbyACS)}
      Headshot %: ${hsPercent}%
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

    Strict Requirements:
    - Use "High-Pressure Failure" or "Conversion Gap" terminology.
    - Focus on the 'Why' behind lost rounds (e.g., "over-peeking in man-advantage" or "ineffective utility stalling").
    - Compare the player's Combat Score against the lobby average each match. If they are below lobby average in losses, call out "Impact Drops in Losing Games." If above, acknowledge it but still find the deficit.
    - AIM BENCHMARK: Compare Headshot % against typical Radiant-level 22-30%. If HS% is <20%, highlight "Click-Timing Deficit." If HS% is >30% but K/D is low, highlight "Over-reliance on Aim/Poor Positioning."
    - When they lost rounds, call out the specific map and scoreline so it feels scouted (e.g., "Your Ascent 4-13 loss shows..."). When they won, mention what to keep doing.
    - Format: Strict bullet points. No intro, no outro, no filler. No markdown bold.

    Data:
    ${aiPromptData}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an elite, direct Valorant Coach. You only output bullet points without any fluffy introductions.' },
        { role: 'user', content: prompt }
      ],
      model: "llama-3.3-70b-versatile", // Smarter model for accurate scouting
    });
    
    return chatCompletion.choices[0]?.message?.content || "No analysis generated.";
  } catch (err: unknown) {
    console.error("Groq API Error:", err);
    return `Failure from AI: ${err instanceof Error ? err.message : "Unknown error"}`;
  }
}
