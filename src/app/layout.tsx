import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// We import Inter font from Google Fonts automatically via Next.js!
// This satisfies the modern typography requirement perfectly.
const inter = Inter({ subsets: ["latin"] });

// Next.js App Router uses standard exports for SEO metadata!
// This will render perfect Title and Meta descriptions.
export const metadata: Metadata = {
  title: "ValoAnalyzer - AI Powered Playstyle Insights",
  description: "Analyze your last 5 Valorant matches with AI to find your strengths and weaknesses.",
};

/**
 * RootLayout defines the base HTML wrapper for every page.
 * We include the Inter font className here so it applies app-wide!
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
