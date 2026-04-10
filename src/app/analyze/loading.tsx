import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={styles.container} style={{ alignItems: "center", justifyItems: "center", minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Loader2 className={styles.spinner} size={48} color="var(--accent-color)" />
      <h2 style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Analyzing Matches...</h2>
    </div>
  );
}
