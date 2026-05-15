import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dama Dojo — Play Checkers with KZ Tech Legends",
  description: "Master checkers with AI coaches inspired by Kazakhstan's top founders. Online multiplayer, ELO rankings, and post-game analysis by your favourite KZ tech legend.",
  keywords: ["checkers", "draughts", "Kazakhstan", "AI coach", "nFactorial", "online multiplayer"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0a0a0f] text-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
