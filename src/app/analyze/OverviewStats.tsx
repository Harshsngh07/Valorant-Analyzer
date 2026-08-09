import { PlayerAnalytics } from "@/lib/analytics";
import {
  Flame,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import styles from "./page.module.css";

export default function OverviewStats({ analytics }: { analytics: PlayerAnalytics }) {
  const { avgACS, avgKDRatio, avgHS, winRate, streak, overallGrade, overallScore } = analytics;

  return (
    <section className={styles.overview}>
      {/* Featured grade card */}
      <div className={`${styles.statCard} ${styles.gradeCard}`}>
        <span className={styles.statLabel}>
          <Zap size={14} /> Coach Rating
        </span>
        <span className={styles.gradeBig}>{overallGrade}</span>
        <span className={styles.gradeScore}>{overallScore}/100</span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>
          <Trophy size={14} /> Win Rate
        </span>
        <span className={styles.statValue}>{winRate}%</span>
        <span className={styles.statSub}>
          {analytics.wins}W - {analytics.losses}L{analytics.draws > 0 ? ` - ${analytics.draws}D` : ""}
        </span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>
          <TrendingUp size={14} /> Avg Combat Score
        </span>
        <span className={styles.statValue}>{avgACS}</span>
        <span className={styles.statSub}>ACS across {analytics.matches.length} games</span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>
          <Flame size={14} /> K / D Ratio
        </span>
        <span className={`${styles.statValue} ${avgKDRatio >= 1 ? styles.textWin : styles.textLoss}`}>
          {avgKDRatio}
        </span>
        <span className={styles.statSub}>
          {analytics.totalKills}K / {analytics.totalDeaths}D / {analytics.totalAssists}A
        </span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>
          <Target size={14} /> Headshot %
        </span>
        <span className={`${styles.statValue} ${avgHS >= 20 ? styles.textWin : avgHS < 15 ? styles.textLoss : ""}`}>
          {avgHS}%
        </span>
        <span className={styles.statSub}>Radiant benchmark ~22%</span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>
          <Flame size={14} /> Current Form
        </span>
        <span className={`${styles.statValue} ${streak > 0 ? styles.textWin : streak < 0 ? styles.textLoss : ""}`}>
          {streak === 0
            ? "-"
            : `${Math.abs(streak)} ${streak > 0 ? "WIN" : "LOSS"}${Math.abs(streak) > 1 ? "S" : ""} STREAK`}
        </span>
        <span className={styles.statSub}>
          {analytics.mostPlayedAgent ? `Main: ${analytics.mostPlayedAgent}` : "Form from last games"}
        </span>
      </div>

      {/* Quick-read coach notes */}
      <div className={`${styles.statCard} ${styles.notesCard}`}>
        <span className={styles.statLabel}>
          <Zap size={14} /> Coach&apos;s Quick Read
        </span>
        <div className={styles.notesList}>
          {analytics.strengths.slice(0, 2).map((s) => (
            <span key={s} className={`${styles.note} ${styles.notePos}`}>
              <CheckCircle2 size={13} /> {s}
            </span>
          ))}
          {analytics.weaknesses.slice(0, 2).map((w) => (
            <span key={w} className={`${styles.note} ${styles.noteNeg}`}>
              <AlertTriangle size={13} /> {w}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
