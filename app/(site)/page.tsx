"use client";

import { Fragment, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { SectionKey } from "@/lib/types";
import Hero from "@/components/sections/Hero";
import { Marquee, Philosophy, Rituals, ServicesMenu, Stats } from "@/components/sections/Story";
import { Cta, Faq, Gallery, Journal, Offers, Packages, Team, Testimonials } from "@/components/sections/People";

const MAP: Record<SectionKey, () => React.ReactNode> = {
  hero: Hero,
  marquee: Marquee,
  philosophy: Philosophy,
  services: ServicesMenu,
  rituals: Rituals,
  stats: Stats,
  team: Team,
  gallery: Gallery,
  packages: Packages,
  testimonials: Testimonials,
  offers: Offers,
  journal: Journal,
  faq: Faq,
  cta: Cta,
};

/** Page background shifts between the two light tones as each section takes the stage */
const TONE: Partial<Record<SectionKey, "a" | "b">> = {
  hero: "b",
  philosophy: "a",
  services: "a",
  stats: "b",
  team: "a",
  gallery: "b",
  packages: "a",
  offers: "b",
  journal: "a",
  faq: "b",
  cta: "a",
};

function useToneMorph(key: string) {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-tone]"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const t = (e.target as HTMLElement).dataset.tone;
          document.body.style.backgroundColor = t === "b" ? theme.cream : theme.bg;
          document.documentElement.style.setProperty("--shutter", t === "b" ? theme.cream : theme.bg);
        }),
      { rootMargin: "-50% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      document.body.style.backgroundColor = "";
      document.documentElement.style.removeProperty("--shutter");
    };
  }, [theme, key]);
}

export default function Home() {
  const sections = useStore((s) => s.sections);
  useToneMorph(sections.map((s) => s.id + s.visible).join());
  return (
    <>
      {sections
        .filter((s) => s.visible && MAP[s.id])
        .map((s) => {
          const C = MAP[s.id];
          return (
            <Fragment key={s.id}>
              <div data-tone={TONE[s.id] ?? "a"}>
                <C />
              </div>
            </Fragment>
          );
        })}
    </>
  );
}
