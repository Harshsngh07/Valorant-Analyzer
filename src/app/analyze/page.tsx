import { getAccountInfo, getLastMatches, getMMRInfo } from "@/lib/henrikdev";
import { analyzePlaystyleGroq as analyzePlaystyle } from "@/lib/groq";
import { hardRefresh } from "./actions";
import { RefreshCw, Sparkles, Activity, Target } from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";
import AnalyticsDashboard from "./AnalyticsDashboard";

/**
 * Since this is a Next.js Server Component, it runs entirely on the server!
 * The GEMINI_API_KEY is completely safe here.
 * The `searchParams` are passed automatically by Next.js from the URL (e.g. ?name=TenZ&tag=NA1)
 */
export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const name = params.name;
  const tag = params.tag;

  if (!name || !tag) {
    return (
      <div className={styles.container}>
        <h1>Missing Riot ID</h1>
        <Link href="/" className={styles.refreshBtn} style={{ width: "fit-content" }}>Go Back</Link>
      </div>
    );
  }

  try {
    // 1. Fetch Account (automatically retrieves region instead of asking user)
    const account = await getAccountInfo(name, tag);
    
    // 2. Fetch the Match Stats using the region we just detected!
    const matchesPromise = getLastMatches(account.region, name, tag);
    
    // 3. Fetch MMR
    const mmrPromise = getMMRInfo(account.region, name, tag);

    const [matches, mmrData] = await Promise.all([matchesPromise, mmrPromise]);

    // 4. Send to Gemini for intelligent bullet point feedback
    const aiFeedback = await analyzePlaystyle(name, tag, matches);

    // Prepare the hard refresh server action with bound arguments
    // This allows the button in the UI to trigger the server logic safely
    const refreshAction = hardRefresh.bind(null, name, tag);

    // Determine most played agent for background
    const agentCounts: Record<string, { count: number; image: string }> = {};
    matches.forEach(m => {
      const myP = m.players.all_players.find(p => p.name?.toLowerCase() === name.toLowerCase() && p.tag?.toLowerCase() === tag.toLowerCase());
      if (myP && myP.assets?.agent?.full) {
        if (!agentCounts[myP.character]) {
          agentCounts[myP.character] = { count: 0, image: myP.assets.agent.full };
        }
        agentCounts[myP.character].count += 1;
      }
    });
    
    let mainAgentImage = "";
    let maxCount = 0;
    Object.values(agentCounts).forEach(agent => {
      if (agent.count > maxCount) {
        maxCount = agent.count;
        mainAgentImage = agent.image;
      }
    });

    return (
      <>
        {mainAgentImage && (
          <div 
            className={styles.dynamicBackground} 
            style={{ backgroundImage: `url(${mainAgentImage})` }} 
          />
        )}
        <div className={styles.container}>
          {/* Header with Player Banner, Info and Refresh Button */}
          <div className={styles.header}>
            <div className={styles.playerInfo} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              {/* Player Small Image (Avatar) */}
              {account.card && account.card.small && (
                <div className={styles.bannerContainer}>
                  <img 
                    src={account.card.small} 
                    alt="Player Avatar" 
                    className={styles.bannerImage}
                  />
                </div>
              )}
              
              <span className={styles.playerName}>{account.name}</span>
              <span className={styles.playerTag}>#{account.tag}</span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Level {account.account_level} • {account.region.toUpperCase()}
              </span>

              {/* Rank UI inline */}
              {mmrData && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderLeft: "1px solid var(--border-color)", paddingLeft: "1rem", height: "40px" }}>
                  {mmrData.images?.small && (
                    <img src={mmrData.images.small} alt="Rank Badge" style={{ width: "32px", height: "32px", filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))" }} />
                  )}
                  <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>{mmrData.currenttierpatched}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {mmrData.ranking_in_tier} RR (
                    <span className={mmrData.mmr_change_to_last_game >= 0 ? styles.rrChangePos : styles.rrChangeNeg}>
                      {mmrData.mmr_change_to_last_game > 0 ? "+" : ""}{mmrData.mmr_change_to_last_game}
                    </span>)
                  </span>
                </div>
              )}
            </div>

            {/* Form wrapper for Server Action */}
            <form action={refreshAction}>
              <button type="submit" className={styles.refreshBtn} title="Bust cache and refetch last 5 games!">
                <RefreshCw size={16} /> Force Refresh
              </button>
            </form>
          </div>

          {/* AI Analysis Display */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Sparkles size={24} color="var(--accent-color)" />
              AI Coach Insights
            </h2>
            {/* We format the LLM results cleanly. */}
            <ul className={styles.aiList}>
              {aiFeedback.split("\n").map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return null; // Drop empty spacer lines entirely
                
                const isBullet = /^([-*•]|\d+\.)\s+/.test(trimmed);
                const cleanText = trimmed.replace(/\*\*/g, "").replace(/^([-*•]|\d+\.)\s+/, "");

                if (isBullet) {
                  return (
                    <li key={idx} className={styles.aiListItem}>
                      {cleanText}
                    </li>
                  );
                }
                return <p key={idx} className={styles.aiParagraph}>{cleanText}</p>;
              })}
            </ul>
          </div>

          {/* Raw Quantifiable Stats Display */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Activity size={24} color="var(--accent-color)" />
              Last 5 Competitive Matches
            </h2>

            <AnalyticsDashboard matches={matches} playerName={name} playerTag={tag} />


            <div className={styles.matchesGrid}>
              {matches.map((m, idx) => {
                const myPlayer = m.players.all_players.find(
                  (p) => p.name?.toLowerCase() === name.toLowerCase() && p.tag?.toLowerCase() === tag.toLowerCase()
                );
                
                if (!myPlayer) return null;

                const myTeam = myPlayer.team?.toLowerCase() as 'red' | 'blue' | undefined;
                const teamData = myTeam && m.teams ? m.teams[myTeam] : null;
                
                let matchResultClass = "";
                if (teamData) {
                  if (teamData.rounds_won === teamData.rounds_lost) {
                    matchResultClass = styles.matchPillDraw;
                  } else if (teamData.has_won) {
                    matchResultClass = styles.matchPillWin;
                  } else {
                    matchResultClass = styles.matchPillLoss;
                  }
                }

                const matchScore = teamData ? `${teamData.rounds_won} - ${teamData.rounds_lost}` : "";
                const pillClass = `${styles.matchPill} ${styles.pillRelative} ${matchResultClass}`;

                // MVP Logic
                let isMatchMvp = false;
                let isTeamMvp = false;
                let highestMatchScore = 0;
                let highestTeamScore = 0;
                
                m.players.all_players.forEach(p => {
                  if (p.stats.score > highestMatchScore) highestMatchScore = p.stats.score;
                  if (p.team?.toLowerCase() === myTeam && p.stats.score > highestTeamScore) highestTeamScore = p.stats.score;
                });

                if (myPlayer.stats.score === highestMatchScore) isMatchMvp = true;
                else if (myPlayer.stats.score === highestTeamScore) isTeamMvp = true;

                // HitZone Logic
                const head = myPlayer.stats.headshots || 0;
                const body = myPlayer.stats.bodyshots || 0;
                const leg = myPlayer.stats.legshots || 0;
                const totalShots = head + body + leg;
                const hsPercent = totalShots > 0 ? ((head / totalShots) * 100).toFixed(0) : 0;
                const bsPercent = totalShots > 0 ? ((body / totalShots) * 100).toFixed(0) : 0;
                const lsPercent = totalShots > 0 ? ((leg / totalShots) * 100).toFixed(0) : 0;

                return (
                  <div key={idx} className={pillClass}>
                    {/* MVP Tags */}
                    {isMatchMvp && <div className={styles.mvpBadge}>MATCH MVP</div>}
                    {!isMatchMvp && isTeamMvp && <div className={styles.teamMvpBadge}>TEAM MVP</div>}

                    <div className={styles.matchHeader}>
                      <span>{m.metadata.map} {matchScore ? `(${matchScore})` : ""}</span>
                      <span style={{ fontWeight: 600 }}>{myPlayer.character}</span>
                    </div>
                    
                    {/* Agent Image rendering */}
                    {myPlayer.assets?.agent?.bust && (
                      <img 
                        src={myPlayer.assets.agent.bust} 
                        alt={myPlayer.character} 
                        className={styles.agentImage}
                      />
                    )}

                    <div className={styles.matchKDA}>
                      {myPlayer.stats.kills} / {myPlayer.stats.deaths} / {myPlayer.stats.assists}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Score: {myPlayer.stats.score}
                    </div>

                    {/* HitZone Visuals */}
                    {totalShots > 0 && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "4px" }}>
                         <Target size={14} color="#10b981" /> 
                         <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{hsPercent}%</span> Headshot
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </>
    );
  } catch (err: any) {
    return (
      <div className={styles.container}>
        <h2>Error analyzing profile</h2>
        <p style={{ color: "var(--accent-color)", marginTop: "1rem" }}>{err.message}</p>
        <Link href="/" className={styles.refreshBtn} style={{ width: "fit-content", marginTop: "2rem" }}>
          Try Again
        </Link>
      </div>
    );
  }
}
