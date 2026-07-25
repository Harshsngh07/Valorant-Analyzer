# 🎯 Valorant Analyzer & AI Tactical Coach

A high-performance Valorant stats tracker and AI-powered tactical coaching platform built with **Next.js 16**, **React 19**, **Recharts**, **Google Gemini**, and **Groq (Llama 3.1 8B)**.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Groq](https://img.shields.io/badge/Groq-Llama_3.1-F05032?style=for-the-badge&logo=meta)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E44AD?style=for-the-badge&logo=google)
![Recharts](https://img.shields.io/badge/Recharts-Analytics-22B5BF?style=for-the-badge)

---

## ✨ Features

- 🎮 **Live Match History & Stats Tracker**: Pull real-time match data, KDA ratios, damage per round (ADR), headshot percentages, and rank rating using the HenrikDev Valorant API.
- 🧠 **Dual AI Tactical Coaching Engine**:
  - **Groq AI (Llama 3.1 8B Instant)**: Analyzes clutch performance, round-advantage conversion, post-plant utility efficiency, isolated deaths, and entry timing.
  - **Google Gemini AI**: Delivers quick, punchy, 3-point actionable bullet insights to improve your overall gameplay.
- 📊 **Interactive Visual Analytics**: Interactive match trend charts, agent distribution graphs, and map win rates rendered with [Recharts](https://recharts.org/).
- ⚡ **Fluid Animations & Dark UI**: Seamless layout transitions powered by [Framer Motion](https://www.framer.com/motion/) and stylized with custom CSS & Lucide icons.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: TypeScript
- **AI Engines**:
  - `groq-sdk` (Meta Llama 3.1 8B Instant)
  - `@google/genai` & `@google/generative-ai` (Gemini Flash)
- **Valorant API**: HenrikDev Unofficial Valorant API
- **Data Visualization**: Recharts (`recharts`)
- **Animation & Styling**: Framer Motion (`framer-motion`), `lucide-react`, Tailwind utilities (`clsx`, `tailwind-merge`)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Groq API Key**: Get your free key at [console.groq.com](https://console.groq.com/)
- **Google Gemini API Key**: Get your key at [aistudio.google.com](https://aistudio.google.com/)
- **HenrikDev Valorant API Key** (Optional / Recommended for high rate limits)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harshsngh07/Valorant-Analyzer.git
   cd Valorant-Analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # AI API Keys
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here

   # HenrikDev Valorant API Key (Optional)
   HENRIK_API_KEY=your_henrik_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open application:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser. Enter any Riot ID (e.g. `TenZ#SEN`) to analyze matches and generate AI coaching breakdowns!

---

## 📁 Project Structure

```
valorant-analyzer/
├── src/
│   ├── app/
│   │   ├── analyze/       # Match details & AI analysis page
│   │   ├── page.tsx       # Search portal landing page
│   │   ├── layout.tsx     # Root layout & providers
│   │   └── globals.css    # Dark mode tactical styles
│   └── lib/
│       ├── gemini.ts      # Google Gemini coaching provider
│       ├── groq.ts        # Groq Llama 3.1 tactical analyzer
│       ├── henrikdev.ts   # Valorant API fetcher & TypeScript types
│       └── utils.ts       # Classnames helper functions
├── public/                # Static assets & favicons
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript config
```

---

## 📄 License

This repository is distributed under the [MIT License](LICENSE).
