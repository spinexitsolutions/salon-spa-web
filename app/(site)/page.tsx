"use client";

import { Fragment } from "react";
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

export default function Home() {
  const sections = useStore((s) => s.sections);
  return (
    <>
      {sections
        .filter((s) => s.visible && MAP[s.id])
        .map((s) => {
          const C = MAP[s.id];
          return (
            <Fragment key={s.id}>
              <C />
            </Fragment>
          );
        })}
    </>
  );
}
