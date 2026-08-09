import { getAccountInfo, getLastMatches, getMMRInfo } from "@/lib/henrikdev";
import { analyzePlaystyleGroq as analyzePlaystyle } from "@/lib/groq";
import { buildAnalytics } from "@/lib/analytics";
import { hardRefresh } from "./actions";
import { RefreshCw, Shield, MapPin, Activity, TrendingUp, Crosshair } from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";
import AnalyticsDashboard from "./AnalyticsDashboard";
import OverviewStats from "./OverviewStats";
import CoachInsights from "./CoachInsights";
import MatchCard from "./MatchCard";

/**
 * Server Component: fetches account, MMR and last matches on the server,
 * computes local analytics, then asks the AI coach for a scouted brief.
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
        <Link href="/" className={styles.refreshBtn} style={{ width: "fit-content" }}>
          Go Back
        </Link>
      </div>
    );
  }

  try {
    const account = await getAccountInfo(name, tag);
    const matchesPromise = getLastMatches(account.region, name, tag);
    const mmrPromise = getMMRInfo(account.region, name, tag);

    const [matches, mmrData] = await Promise.all([matchesPromise, mmrPromise]);
    const analytics = buildAnalytics(matches, name, tag);

    // If zero competitive games found, skip the AI call entirely
    const aiFeedback =
      analytics.matches.length > 0
        ? await analyzePlaystyle(name, tag, matches)
        : "No competitive matches found in the last 15 games — queue ranked and refresh when you're done.";

    const refreshAction = hardRefresh.bind(null, name, tag);

    // Most played agent portrait becomes the ambient background
    const mainAgentImage = analytics.mostPlayedAgent
      ? analytics.agentStats[analytics.mostPlayedAgent]?.image
      : "";

    return (
      <>
        {mainAgentImage && (
          <div
            className={styles.dynamicBackground}
            style={{ backgroundImage: `url(${mainAgentImage})` }}
          />
        )}

        <div className={styles.container}>
          {/* ===== Player Header ===== */}
          <header className={styles.header}>
            <div className={styles.playerInfo}>
              {account.card && account.card.small && (
                <div className={styles.bannerContainer}>
                  <img src={account.card.small} alt="Player Avatar" className={styles.bannerImage} />
                </div>
              )}

              <div className={styles.playerIdentity}>
                <div className={styles.nameRow}>
                  <span className={styles.playerName}>{account.name}</span>
                  <span className={styles.playerTag}>#{account.tag}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaChip} title="Account level">
                    <Crosshair size={12} /> Level {account.account_level}
                  </span>
                  <span className={styles.metaChip} title="Account region">
                    <MapPin size={12} /> {account.region.toUpperCase()}
                  </span>
                </div>
              </div>

              {mmrData && (
                <div className={styles.rankWidget} title="Current rank">
                  {mmrData.images?.small && (
                    <img src={mmrData.images.small} alt="Rank Badge" className={styles.rankImage} />
                  )}
                  <div className={styles.rankDetails}>
                    <span className={styles.rankName}>{mmrData.currenttierpatched}</span>
                    <span className={styles.rankRR}>
                      {mmrData.ranking_in_tier} RR{" "}
                      <span className={mmrData.mmr_change_to_last_game >= 0 ? styles.rrChangePos : styles.rrChangeNeg}>
                        ({mmrData.mmr_change_to_last_game >= 0 ? "+" : ""}
                        {mmrData.mmr_change_to_last_game})
                      </span>{" "}
                      · {mmrData.elo} ELO
                    </span>
                  </div>
                </div>
              )}
            </div>

            <form action={refreshAction}>
              <button type="submit" className={styles.refreshBtn} title="Bust cache and refetch last 5 games!">
                <RefreshCw size={16} /> Force Refresh
              </button>
            </form>
          </header>

          {/* ===== Overview Stats ===== */}
          {analytics.matches.length > 0 && <OverviewStats analytics={analytics} />}

          {/* ===== AI Coach Insights ===== */}
          <CoachInsights feedback={aiFeedback} />

          {/* ===== Performance Trends ===== */}
          {analytics.matches.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>
                  <TrendingUp size={22} /> Performance Trends
                </h2>
                <p className={styles.sectionSub}>
                  Last {analytics.matches.length} competitive games, oldest → newest
                </p>
              </div>
              <AnalyticsDashboard matches={analytics.matches} />
            </section>
          )}

          {/* ===== Match History ===== */}
          {analytics.matches.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>
                  <Activity size={22} /> Match History — Graded
                </h2>
                <p className={styles.sectionSub}>
                  {analytics.mostPlayedAgent && (
                    <span>
                      Main agent: <strong>{analytics.mostPlayedAgent}</strong> ·{" "}
                    </span>
                  )}
                  {analytics.bestAgent && (
                    <span>
                      Best performer: <strong>{analytics.bestAgent}</strong>
                    </span>
                  )}
                </p>
              </div>
              <div className={styles.matchesGrid}>
                {analytics.matches.map((m) => (
                  <MatchCard key={m.index} match={m} />
                ))}
              </div>
            </section>
          ) : (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Shield size={24} color="var(--accent-color)" /> No Competitive Matches
              </h2>
              <p className={styles.aiParagraph}>
                We couldn&apos;t find ranked games in your last 15 matches. Play a few
                competitive games, then hit{" "}
                <form action={refreshAction} style={{ display: "inline-block" }}>
                  <button type="submit" className={styles.inlineBtn}>
                    Force Refresh
                  </button>
                </form>{" "}
                to get your coaching brief.
              </p>
            </div>
          )}
        </div>
      </>
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error while analyzing the profile.";
    return (
      <div className={styles.container}>
        <h2>Error analyzing profile</h2>
        <p style={{ color: "var(--accent-color)", marginTop: "1rem" }}>{message}</p>
        <Link href="/" className={styles.refreshBtn} style={{ width: "fit-content", marginTop: "2rem" }}>
          Try Again
        </Link>
      </div>
    );
  }
}
