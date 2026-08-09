"use client";

import { PlayerMatchStats } from "@/lib/analytics";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import styles from "./page.module.css";

const tooltipStyle = {
  backgroundColor: "var(--surface-color)",
  borderColor: "var(--border-color)",
  borderRadius: "8px",
  fontSize: "13px",
};

export default function AnalyticsDashboard({ matches }: { matches: PlayerMatchStats[] }) {
  // Chronological order: left = oldest
  const chartData = [...matches].reverse().map((m, i) => ({
    name: m.map,
    index: i + 1,
    score: m.score,
    kills: m.kills,
    deaths: m.deaths,
    hsPercent: m.hsPercent,
    kdRatio: m.kdRatio,
  }));

  if (chartData.length === 0) return null;

  const wins = matches.filter((m) => m.win).length;
  const losses = matches.filter((m) => !m.win).length;
  const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;
  const avgHS = matches.length > 0 ? matches.reduce((s, m) => s + m.hsPercent, 0) / matches.length : 0;
  const avgKD = matches.length > 0 ? matches.reduce((s, m) => s + m.kdRatio, 0) / matches.length : 0;

  const pieData = [
    { name: "Wins", value: wins, color: "var(--win-color)" },
    { name: "Losses", value: losses, color: "var(--loss-color)" },
  ];

  return (
    <div className={styles.chartsGrid}>
      {/* 1. Combat Score Trend */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Combat Score Trend</h3>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "var(--text-primary)" }} labelStyle={{ color: "var(--text-secondary)" }} />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} name="ACS" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. K/D Ratio with baseline */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>K/D Ratio (baseline 1.00)</h3>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barSize={26}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} domain={[0, "auto"]} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "var(--text-primary)" }} labelStyle={{ color: "var(--text-secondary)" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <ReferenceLine y={1} stroke="var(--text-secondary)" strokeDasharray="4 4" strokeWidth={1.5} />
              <Bar dataKey="kdRatio" name="K/D" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.kdRatio >= 1 ? "var(--win-color)" : "var(--loss-color)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Headshot % Trend */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Headshot % Trend</h3>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} domain={[0, "auto"]} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "var(--text-primary)" }} labelStyle={{ color: "var(--text-secondary)" }} />
              <ReferenceLine y={avgHS} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "avg", fill: "#eab308", fontSize: 11, position: "insideTopRight" }} />
              <Line type="monotone" dataKey="hsPercent" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: "#eab308" }} name="HS%" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Win / Loss Donut */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Win / Loss Split</h3>
        <div className={`${styles.chartBox} ${styles.donutBox}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "var(--text-primary)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.donutCenter}>
            <strong>{winRate}%</strong>
            <span>WIN RATE</span>
          </div>
        </div>
        <div className={styles.legendRow}>
          <span><i style={{ background: "var(--win-color)" }} /> {wins} Wins</span>
          <span><i style={{ background: "var(--loss-color)" }} /> {losses} Losses</span>
          <span className={styles.legendAvg}>Avg K/D {avgKD.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
