import { getAccountInfo, getLastMatches } from "@/lib/henrikdev";
import { analyzePlaystyle } from "@/lib/gemini";
import { hardRefresh } from "./actions";
import { RefreshCw, Sparkles, Activity } from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";

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
    const matches = await getLastMatches(account.region, name, tag);

    // 3. Send to Gemini for intelligent bullet point feedback
    const aiFeedback = await analyzePlaystyle(name, tag, matches);

    // Prepare the hard refresh server action with bound arguments
    // This allows the button in the UI to trigger the server logic safely
    const refreshAction = hardRefresh.bind(null, name, tag);

    return (
      <div className={styles.container}>
        {/* Header with Player Info and Refresh Button */}
        <div className={styles.header}>
          <div className={styles.playerInfo}>
            <span className={styles.playerName}>{account.name}</span>
            <span className={styles.playerTag}>#{account.tag}</span>
            <span style={{ marginLeft: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Level {account.account_level} • {account.region.toUpperCase()}
            </span>
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
          {/* We format the LLM results cleanly. 
              Because we explicitly asked Gemini for bullet points formatted cleanly, we can just render the text. */}
          <div className={styles.aiResponse}>
            {aiFeedback.split("\n").map((line, idx) => {
              if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
                return <li key={idx}>{line.replace(/^[-*]\s*/, "")}</li>;
              }
              return <p key={idx}>{line}</p>;
            })}
          </div>
        </div>

        {/* Raw Quantifiable Stats Display */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Activity size={24} color="var(--accent-color)" />
            Last 5 Matches Data
          </h2>
          <div className={styles.matchesGrid}>
            {matches.map((m, idx) => {
              const myPlayer = m.players.all_players.find(
                (p) => p.name.toLowerCase() === name.toLowerCase() && p.tag.toLowerCase() === tag.toLowerCase()
              );
              
              if (!myPlayer) return null;

              return (
                <div key={idx} className={styles.matchPill}>
                  <div className={styles.matchHeader}>
                    <span>{m.metadata.map}</span>
                    <span>{myPlayer.character}</span>
                  </div>
                  <div className={styles.matchKDA}>
                    {myPlayer.stats.kills} / {myPlayer.stats.deaths} / {myPlayer.stats.assists}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Score: {myPlayer.stats.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
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
