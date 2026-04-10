"use client";

import { MatchData } from "@/lib/henrikdev";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function AnalyticsDashboard({ matches, playerName, playerTag }: { matches: MatchData[], playerName: string, playerTag: string }) {
  // Parse match data into an array of flat objects that recharts natively renders
  // Reverse to ensure chronological order (left = oldest)
  const chartData = [...matches].reverse().map((m, i) => {
    const myPlayer = m.players.all_players.find(
      (p) => p.name?.toLowerCase() === playerName.toLowerCase() && p.tag?.toLowerCase() === playerTag.toLowerCase()
    );
    if (!myPlayer) return null;

    return {
      name: m.metadata.map,
      score: myPlayer.stats.score,
      kills: myPlayer.stats.kills,
      deaths: myPlayer.stats.deaths,
    };
  }).filter(Boolean);

  if (chartData.length === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
      
      {/* 1. Combat Score Consistency (Area Chart) */}
      <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
        <h3 style={{ marginBottom: "1.5rem", color: "var(--accent-color)", fontWeight: 600, fontSize: "1.1rem" }}>Trend: Combat Score</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--surface-color)", borderColor: "var(--border-color)", borderRadius: "8px" }}
                itemStyle={{ color: "var(--text-primary)" }}
              />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} name="Combat Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Kills vs Deaths (Side-by-side Bar Chart) */}
      <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
        <h3 style={{ marginBottom: "1.5rem", color: "var(--accent-color)", fontWeight: 600, fontSize: "1.1rem" }}>Trend: Kills vs Deaths</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4} barSize={20}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--surface-color)", borderColor: "var(--border-color)", borderRadius: "8px" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
              <Bar dataKey="kills" fill="#10b981" radius={[4, 4, 0, 0]} name="Kills" />
              <Bar dataKey="deaths" fill="#ef4444" radius={[4, 4, 0, 0]} name="Deaths" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
