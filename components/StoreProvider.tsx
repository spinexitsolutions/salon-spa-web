"use client";

import { useEffect } from "react";
import { STORE_KEY, useStore } from "@/lib/store";

const FONT_VAR = {
  instrument: "var(--font-instrument)",
  playfair: "var(--font-playfair)",
  cormorant: "var(--font-cormorant)",
} as const;

function ThemeVars() {
  const theme = useStore((s) => s.theme);
  const seo = useStore((s) => s.settings.seoTitle);
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--c-bg", theme.bg);
    r.setProperty("--c-ink", theme.ink);
    r.setProperty("--c-accent", theme.accent);
    r.setProperty("--c-night", theme.night);
    r.setProperty("--c-cream", theme.cream);
    r.setProperty("--radius", `${theme.radius}px`);
    r.setProperty("--font-display", FONT_VAR[theme.displayFont] ?? FONT_VAR.instrument);
  }, [theme]);
  useEffect(() => {
    if (seo && !location.pathname.startsWith("/admin")) document.title = seo;
  }, [seo]);
  return null;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Promise.resolve(useStore.persist.rehydrate()).then(() => useStore.getState().setHydrated(true));
    // live-sync between admin tab and website tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORE_KEY) useStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return (
    <>
      <ThemeVars />
      {children}
    </>
  );
}
