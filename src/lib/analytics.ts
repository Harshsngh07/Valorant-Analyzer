import { MatchData } from "./henrikdev";

/**
 * Local analytics engine — the "coach's brain".
 * Computes performance grades, streaks, agent mastery and quick read notes
 * directly from raw match data so the player gets instant feedback,
 * not just the AI summary.
 */

export interface PlayerMatchStats {
  index: number;
  map: string;
  win: boolean;
  draw: boolean;
  roundsWon: number;
  roundsLost: number;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  hsPercent: number;
  kdRatio: number;
  agent: string;
  agentImage: string;
  startedAt: string;
  matchMvp: boolean;
  teamMvp: boolean;
  grade: string;
  gradeScore: number;
}

export interface PlayerAnalytics {
  matches: PlayerMatchStats[]; // newest first (same order as API)
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgACS: number;
  avgKDRatio: number;
  avgHS: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  streak: number; // positive = win streak, negative = loss streak
  agentStats: Record<string, { count: number; image: string; totalACS: number }>;
  mostPlayedAgent: string | null;
  bestAgent: string | null;
  overallGrade: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
}

/**
 * Convert per-match stats into a 0-100 coach score.
 * Weights: ACS 25, K/D 25, HS% 25, Result 25.
 */
export function gradeScore(acs: number, kd: number, hs: number, win: boolean): number {
  const acsScore = Math.min(25, (acs / 320) * 25);
  const kdScore = Math.min(25, (kd / 1.8) * 25);
  const hsScore = Math.min(25, (hs / 30) * 25);
  const winScore = win ? 25 : 8;
  return Math.round(acsScore + kdScore + hsScore + winScore);
}

export function gradeLetter(score: number): string {
  if (score >= 85) return "S";
  if (score >= 70) return "A";
  if (score >= 55) return "B";
  if (score >= 40) return "C";
  if (score >= 25) return "D";
  return "F";
}

export function buildAnalytics(
  matches: MatchData[],
  playerName: string,
  playerTag: string,
): PlayerAnalytics {
  const stats: PlayerMatchStats[] = [];
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalACS = 0;
  let totalShotsPct = 0;
  const agentStats: Record<string, { count: number; image: string; totalACS: number }> = {};

  matches.forEach((m, idx) => {
    const myPlayer = m.players.all_players.find(
      (p) =>
        p.name?.toLowerCase() === playerName.toLowerCase() &&
        p.tag?.toLowerCase() === playerTag.toLowerCase(),
    );
    if (!myPlayer) return;

    const myTeam = myPlayer.team?.toLowerCase() as "red" | "blue" | undefined;
    const teamData = myTeam && m.teams ? m.teams[myTeam] : null;

    const roundsWon = teamData ? teamData.rounds_won : 0;
    const roundsLost = teamData ? teamData.rounds_lost : 0;
    const isDraw = teamData ? roundsWon === roundsLost : false;
    const isWin = teamData ? teamData.has_won : false;

    const kills = myPlayer.stats.kills;
    const deaths = myPlayer.stats.deaths;
    const assists = myPlayer.stats.assists;
    const score = myPlayer.stats.score;
    const head = myPlayer.stats.headshots || 0;
    const body = myPlayer.stats.bodyshots || 0;
    const leg = myPlayer.stats.legshots || 0;
    const shots = head + body + leg;
    const hsPercent = shots > 0 ? (head / shots) * 100 : 0;
    const kdRatio = deaths > 0 ? kills / deaths : kills;

    // MVP detection
    let highestLobbyScore = 0;
    let highestTeamScore = 0;
    m.players.all_players.forEach((p) => {
      if (p.stats.score > highestLobbyScore) highestLobbyScore = p.stats.score;
      if (p.team?.toLowerCase() === myTeam && p.stats.score > highestTeamScore)
        highestTeamScore = p.stats.score;
    });
    const isMatchMvp = score === highestLobbyScore;
    const isTeamMvp = !isMatchMvp && score === highestTeamScore;

    if (isWin) wins++;
    else if (isDraw) draws++;
    else losses++;

    totalKills += kills;
    totalDeaths += deaths;
    totalAssists += assists;
    totalACS += score;
    totalShotsPct += hsPercent;

    if (!agentStats[myPlayer.character]) {
      agentStats[myPlayer.character] = {
        count: 0,
        image: myPlayer.assets?.agent?.bust || "",
        totalACS: 0,
      };
    }
    agentStats[myPlayer.character].count += 1;
    agentStats[myPlayer.character].totalACS += score;

    const gScore = gradeScore(score, kdRatio, hsPercent, isWin);

    stats.push({
      index: idx,
      map: m.metadata.map,
      win: isWin,
      draw: isDraw,
      roundsWon,
      roundsLost,
      kills,
      deaths,
      assists,
      score,
      hsPercent: Math.round(hsPercent * 10) / 10,
      kdRatio: Math.round(kdRatio * 100) / 100,
      agent: myPlayer.character,
      agentImage: myPlayer.assets?.agent?.bust || myPlayer.assets?.agent?.full || "",
      startedAt: m.metadata.started_at || "",
      matchMvp: isMatchMvp,
      teamMvp: isTeamMvp,
      grade: gradeLetter(gScore),
      gradeScore: gScore,
    });
  });

  const played = stats.length;
  const avgACS = played > 0 ? Math.round(totalACS / played) : 0;
  const avgHS = played > 0 ? Math.round((totalShotsPct / played) * 10) / 10 : 0;
  const avgKDRatio =
    played > 0 ? Math.round((totalKills / Math.max(1, totalDeaths)) * 100) / 100 : 0;
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;

  // Current streak (newest first)
  let streak = 0;
  for (const s of stats) {
    if (s.draw) break;
    if (streak === 0) {
      streak = s.win ? 1 : -1;
    } else if ((streak > 0 && s.win) || (streak < 0 && !s.win)) {
      streak += streak > 0 ? 1 : -1;
    } else {
      break;
    }
  }

  // Overall grade
  const acsScore = Math.min(25, (avgACS / 320) * 25);
  const kdScore = Math.min(25, (avgKDRatio / 1.8) * 25);
  const hsScore = Math.min(25, (avgHS / 30) * 25);
  const winScore = Math.min(25, (winRate / 100) * 25);
  const overallScore = Math.round(acsScore + kdScore + hsScore + winScore);

  // Agent mastery
  let mostPlayedAgent: string | null = null;
  let bestAgent: string | null = null;
  let mostCount = 0;
  let bestAvg = 0;
  Object.entries(agentStats).forEach(([agent, s]) => {
    if (s.count > mostCount) {
      mostCount = s.count;
      mostPlayedAgent = agent;
    }
    const avg = s.totalACS / s.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestAgent = agent;
    }
  });

  // Quick-read coach notes (local, instant feedback)
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (avgHS >= 22) strengths.push("Elite crosshair discipline — your headshot rate wins duels.");
  if (avgKDRatio >= 1.15) strengths.push("Strong duel efficiency — you win more engagements than you lose.");
  if (winRate >= 55) strengths.push("Positive record — you're converting individual plays into wins.");
  if (avgACS >= 230) strengths.push("High damage output — you're a primary contributor to rounds.");
  if (streak >= 2) strengths.push(`Momentum is on your side — ${streak} game win streak.`);

  if (avgHS < 15)
    weaknesses.push("Aim deficit — train crosshair placement & pre-aim in Deathmatch before queueing.");
  if (avgKDRatio < 1)
    weaknesses.push("Negative K/D — losing too many duels; rework your peeking angles and utility usage.");
  if (winRate < 45)
    weaknesses.push("Below-average win rate — focus on round impact (plants, trades, entry) beyond raw kills.");
  if (avgACS < 180)
    weaknesses.push("Low combat score — farm damage on your primary instead of over-trading utility.");
  if (streak <= -2) weaknesses.push(`Cold streak — ${Math.abs(streak)} straight losses. Change your routine, warm up 20 minutes before queueing.`);
  if (weaknesses.length === 0)
    weaknesses.push("No clear red flags in this sample — keep the routine and grind consistency.");

  return {
    matches: stats,
    wins,
    losses,
    draws,
    winRate,
    avgACS,
    avgKDRatio,
    avgHS,
    totalKills,
    totalDeaths,
    totalAssists,
    streak,
    agentStats,
    mostPlayedAgent,
    bestAgent,
    overallGrade: gradeLetter(overallScore),
    overallScore,
    strengths,
    weaknesses,
  };
}
