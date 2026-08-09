import { Crosshair } from "lucide-react";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={styles.loadingWrap}>
      <Crosshair size={48} className={styles.spinner} color="var(--accent-color)" />
      <h2 className={styles.loadingTitle}>Coach is reviewing your games</h2>
      <p className={styles.loadingSub}>
        Pulling your matches, grading your performance and writing your coaching
        brief. This takes a few seconds.
      </p>
      <div className={styles.loadingBar}>
        <div className={styles.loadingBarInner} />
      </div>
    </div>
  );
}
