"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import PageHeader from "@/components/site/PageHeader";
import { Parallax, Reveal, SafeImg } from "@/components/motion";

export default function ServicesPage() {
  const categories = useStore((s) => s.categories).filter((c) => c.published);
  const services = useStore((s) => s.services).filter((s) => s.published);
  const currency = useStore((s) => s.settings.currency);
  const [active, setActive] = useState(categories[0]?.id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("cat-", ""))),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [categories]);

  return (
    <>
      <PageHeader eyebrow="Service menu" title="The full" italic="menu." intro="Transparent pricing. Every service includes a consultation, a cup of something warm and zero rush." />

      {/* sticky category nav */}
      <div className="sticky top-[78px] z-30 mx-auto max-w-[1400px] px-5 md:top-[88px] md:px-10">
        <div className="no-scrollbar glass flex gap-1 overflow-x-auto rounded-full border border-black/5 p-1.5 shadow-sm md:w-fit">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                const el = document.getElementById(`cat-${c.id}`);
                if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -150 }) : el.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm", active === c.id ? "text-bg" : "hover:bg-black/5")}
            >
              {active === c.id && <motion.span layoutId="svc-nav" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10">
        {categories.map((c, ci) => (
          <section key={c.id} id={`cat-${c.id}`} className="grid gap-8 border-b hairline py-16 md:grid-cols-12 md:gap-12 md:py-24">
            <div className="md:col-span-5">
              <div className="md:sticky md:top-40">
                <div className="eyebrow text-accent">({String(ci + 1).padStart(2, "0")})</div>
                <h2 className="display mt-3 text-6xl md:text-8xl">{c.name}</h2>
                <p className="mt-2 text-soft">{c.tagline}</p>
                <Parallax src={c.image} className="mt-8 aspect-[4/5] w-full rounded-[var(--radius)] md:w-[85%]" />
              </div>
            </div>
            <div className="md:col-span-7">
              {services
                .filter((s) => s.category === c.id)
                .map((s, i) => (
                  <Reveal key={s.id} delay={i * 0.05}>
                    <div className="group flex gap-5 border-b hairline py-7 last:border-b-0">
                      <SafeImg src={s.image} alt="" className="h-24 w-20 shrink-0 rounded-2xl object-cover md:h-28 md:w-24" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="display text-3xl md:text-4xl">{s.name}</h3>
                          <span className="shrink-0 pt-1 text-lg">{formatPrice(s.price, currency)}</span>
                        </div>
                        <p className="mt-2 max-w-lg text-sm text-soft">{s.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm text-soft">
                            <Clock size={14} /> {s.duration} min
                          </span>
                          <Link href={`/book?service=${s.id}`} className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] text-bg transition-transform group-hover:scale-105">
                            Book <ArrowUpRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
