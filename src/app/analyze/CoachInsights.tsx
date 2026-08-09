import { Sparkles, ChevronRight } from "lucide-react";
import styles from "./page.module.css";

/**
 * Renders the AI coach's bullet-point feedback.
 * Splits plain-text output into paragraphs and bullet items.
 */
export default function CoachInsights({ feedback }: { feedback: string }) {
  return (
    <section className={`${styles.card} ${styles.coachCard}`}>
      <div className={styles.coachHeader}>
        <div className={styles.coachAvatar}>
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className={styles.cardTitle} style={{ marginBottom: "0.1rem" }}>
            AI COACH&apos;S BRIEF
          </h2>
          <p className={styles.coachSub}>Scouted from your last games — take these into ranked.</p>
        </div>
      </div>

      <ul className={styles.aiList}>
        {feedback.split("\n").map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          const isBullet = /^([-*•]|\d+\.)\s+/.test(trimmed);
          const cleanText = trimmed
            .replace(/\*\*/g, "")
            .replace(/^([-*•]|\d+\.)\s+/, "");

          if (isBullet) {
            return (
              <li key={idx} className={styles.aiListItem}>
                <ChevronRight size={16} className={styles.aiBulletIcon} />
                <span>{cleanText}</span>
              </li>
            );
          }
          return (
            <p key={idx} className={styles.aiParagraph}>
              {cleanText}
            </p>
          );
        })}
      </ul>
    </section>
  );
}
