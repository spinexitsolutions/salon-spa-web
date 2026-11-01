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
      <main className="relative md:pl-[76px]">{children}</main>
      <div className="pb-[64px] md:pb-0 md:pl-[76px]">
        <Footer />
      </div>
      <WhatsAppFab />
      <Cursor />
    </div>
  );
}
