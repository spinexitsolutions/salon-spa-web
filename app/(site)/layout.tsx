"use client";

import Intro from "@/components/site/Intro";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Cursor, SmoothScroll, WhatsAppFab } from "@/components/site/Chrome";
import { useStore } from "@/lib/store";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const grain = useStore((s) => s.theme.grain);
  return (
    <div className={grain ? "grain" : undefined}>
      <SmoothScroll />
      <Intro />
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
      <WhatsAppFab />
      <Cursor />
    </div>
  );
}
