import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { I18nProvider } from "@/lib/i18n/context";

const inter = Inter({ subsets: ["latin", "cyrillic", "cyrillic-ext"] });

export const metadata: Metadata = {
  title: "Dama Dojo — Play Checkers with KZ Tech Legends",
  description: "Master checkers with AI coaches inspired by Kazakhstan's top founders. Online multiplayer, ELO rankings, and post-game analysis by your favourite KZ tech legend.",
  keywords: ["checkers", "draughts", "dama", "Kazakhstan", "AI coach", "online multiplayer", "ELO rating"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0a0a0f] text-white`}>
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
