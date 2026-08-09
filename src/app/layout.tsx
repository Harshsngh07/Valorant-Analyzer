import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import { Crosshair, Swords } from "lucide-react";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ValoCoach - AI Valorant Coaching",
  description:
    "Get graded on your last 5 Valorant matches, see performance trends and receive a coaching plan from an AI that thinks like a Radiant coach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container">
          <header className={styles.nav}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>
                <Crosshair size={18} />
              </span>
              VALO
              <span className={styles.logoAccent}>COACH</span>
            </Link>
            <div className={styles.navRight}>
              <span className={styles.navTag}>
                <Swords size={13} style={{ verticalAlign: "-2px", marginRight: "0.3rem" }} />
                RADIANT AI COACHING
              </span>
              <Link href="/" className={styles.navCta}>
                Analyze Me
              </Link>
            </div>
          </header>
          <main>{children}</main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
