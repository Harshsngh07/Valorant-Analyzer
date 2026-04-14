"use client"; // We use 'use client' because we are tracking user input state and handling form submission events!

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react"; // Free open-source icon library
import { motion } from "framer-motion"; // Premium animation library
import styles from "./page.module.css"; // CSS Modules for guaranteed collision-free styles

export default function Home() {
  const [riotId, setRiotId] = useState("");
  const router = useRouter(); // Next.js router for client-side navigation

  // Form submission handler
  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the browser from refreshing the page on enter

    // Split the input into name and tag (e.g. "Harshu#1234")
    const parts = riotId.split("#");
    if (parts.length !== 2) {
      alert("Please enter a valid Riot ID format: Name#Tag");
      return;
    }

    const [name, tag] = parts;

    // Navigate to the analysis page, passing the parameters via the URL!
    router.push(
      `/analyze?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`,
    );
  };

  return (
    <div className={styles.heroBox}>
      {/* framer-motion lets us declaratively animate HTML elements on page load! */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 className={styles.title}>
          Elevate Your <span className={styles.highlight}>Playstyle</span>
        </h1>
        <p className={styles.subtitle}>
          AI-powered analysis of your recent matches. Find out why you win.
          Discover how to improve.
        </p>

        <form onSubmit={handleAnalyze} className={styles.formBox}>
          <div className={styles.inputGroup}>
            <label htmlFor="riotId">Riot ID & Tag</label>
            <input
              id="riotId"
              type="text"
              placeholder="e.g. FNC Flash#FTW"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
              className={styles.inputField}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Analyze Gameplay <MoveRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
