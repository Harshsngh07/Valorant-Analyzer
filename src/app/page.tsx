"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoveRight,
  Sparkles,
  Activity,
  Trophy,
  Brain,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "./page.module.css";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Coach Insights",
    desc: "A Radiant-level coach reviews your last 5 ranked games and tells you exactly why rounds are being lost.",
  },
  {
    icon: Activity,
    title: "Performance Trends",
    desc: "Combat score, K/D and headshot trends across games — see your form before it matters.",
  },
  {
    icon: Brain,
    title: "Coach Grading",
    desc: "Every match is graded S through F. You'll know instantly which games were your best work.",
  },
];

const STEPS = [
  { n: "01", title: "Enter Your Riot ID", desc: "Name#Tag. Region is detected automatically." },
  { n: "02", title: "AI Scouts Your Games", desc: "Your last 5 competitive matches are pulled and graded." },
  { n: "03", title: "Get Your Coaching Plan", desc: "Actionable bullets on mechanics, positioning and game sense." },
];

export default function Home() {
  const [riotId, setRiotId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = riotId.split("#");
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      setError("Enter your full Riot ID — format: Name#Tag");
      return;
    }
    setError("");
    const [name, tag] = parts;
    router.push(
      `/analyze?name=${encodeURIComponent(name.trim())}&tag=${encodeURIComponent(tag.trim())}`,
    );
  };

  return (
    <div className={styles.page}>
      {/* Ambient glow background */}
      <div className={styles.glowA} />
      <div className={styles.glowB} />

      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.heroInner}
        >
          <span className={styles.eyebrow}>
            <Trophy size={14} /> PERSONAL VALORANT COACHING PLATFORM
          </span>

          <h1 className={styles.title}>
            Stop Guessing.
            <br />
            <span className={styles.highlight}>Start Climbing.</span>
          </h1>

          <p className={styles.subtitle}>
            Enter your Riot ID and get a full coaching session on your last 5
            competitive matches — grades, trends, and a scouted plan from an AI
            that thinks like a Radiant coach.
          </p>

          <form onSubmit={handleAnalyze} className={styles.formBox} noValidate>
            <div className={styles.inputGroup}>
              <label htmlFor="riotId">RIOT ID #TAG</label>
              <div className={styles.inputWrap}>
                <Search size={18} className={styles.inputIcon} />
                <input
                  id="riotId"
                  type="text"
                  placeholder="FNC Flash#FTW"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  className={styles.inputField}
                  spellCheck={false}
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </div>

            <button type="submit" className={styles.submitBtn}>
              Get Coached <MoveRight size={18} />
            </button>
          </form>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <strong>5</strong>
              <span>Matches Scouted</span>
            </div>
            <div className={styles.heroStat}>
              <strong>S–F</strong>
              <span>Match Grades</span>
            </div>
            <div className={styles.heroStat}>
              <strong>AI</strong>
              <span>Radiant Coach</span>
            </div>
          </div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={styles.features}
      >
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <f.icon size={22} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={styles.steps}
      >
        <h2 className={styles.sectionTitle}>
          HOW YOUR <span className={styles.highlight}>SESSION</span> WORKS
        </h2>
        <div className={styles.stepsGrid}>
          {STEPS.map((s) => (
            <div key={s.n} className={styles.step}>
              <span className={styles.stepNumber}>{s.n}</span>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <footer className={styles.footer}>
        <p>
          Powered by HenrikDev API & Groq AI — for practice, improvement and
          fun. Not affiliated with Riot Games.
        </p>
      </footer>
    </div>
  );
}
