import "./globals.css";
import { Inter, Sora } from "next/font/google";
import TopNav from "@/components/layout/TopNav";
import FooterReveal from "@/components/layout/FooterReveal";
import TransitionShell from "@/components/animations/TransitionShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata = {
  title: "ZonePilot — Delivery Zones & Distance Pricing",
  description: "Polygon zones, pricing slabs, caching, analytics, audit trail.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen">
        <TopNav />
        <TransitionShell>{children}</TransitionShell>
        <FooterReveal />
      </body>
    </html>
  );
}
