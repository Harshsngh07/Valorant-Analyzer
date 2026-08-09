import { PlayerMatchStats } from "@/lib/analytics";
import { timeAgo } from "@/lib/utils";
import { Crown, Shield, CalendarDays } from "lucide-react";
import styles from "./page.module.css";

export default function MatchCard({ match }: { match: PlayerMatchStats }) {
  const resultClass = match.draw
    ? styles.matchPillDraw
    : match.win
      ? styles.matchPillWin
      : styles.matchPillLoss;

  const resultText = match.draw ? "DRAW" : match.win ? "VICTORY" : "DEFEAT";
  const roundScore = `${match.roundsWon} - ${match.roundsLost}`;

  return (
    <article className={`${styles.matchCard} ${resultClass}`}>
      <div className={styles.matchTop}>
        <img
          src={match.agentImage}
          alt={match.agent}
          className={styles.matchAgent}
          loading="lazy"
        />
        <div className={styles.matchMeta}>
          <span className={styles.matchMap}>{match.map}</span>
          <span className={`${styles.matchResult} ${match.win ? styles.textWin : match.draw ? styles.textDraw : styles.textLoss}`}>
            {resultText} {roundScore}
          </span>
        </div>
        <span className={`${styles.gradeBadge} ${styles[`grade${match.grade}`]}`}>
          {match.grade}
        </span>
      </div>

      <div className={styles.matchStats}>
        <div className={styles.matchStat}>
          <span>ACS</span>
          <strong>{match.score}</strong>
        </div>
        <div className={styles.matchStat}>
          <span>K/D</span>
          <strong className={match.kdRatio >= 1 ? styles.textWin : styles.textLoss}>
            {match.kdRatio}
          </strong>
        </div>
        <div className={styles.matchStat}>
          <span>KDA</span>
          <strong>
            {match.kills}/{match.deaths}/{match.assists}
          </strong>
        </div>
        <div className={styles.matchStat}>
          <span>HS%</span>
          <strong>{match.hsPercent}%</strong>
        </div>
      </div>

      <div className={styles.matchFooter}>
        <span className={styles.matchAgentName}>{match.agent}</span>
        <span className={styles.matchDate}>
          <CalendarDays size={12} /> {timeAgo(match.startedAt)}
        </span>
        {match.matchMvp && (
          <span className={styles.mvpPill}>
            <Crown size={12} /> MATCH MVP
          </span>
        )}
        {!match.matchMvp && match.teamMvp && (
          <span className={styles.teamMvpPill}>
            <Shield size={12} /> TEAM MVP
          </span>
        )}
      </div>
    </article>
  );
}
