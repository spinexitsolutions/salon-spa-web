"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { addDays, cn, formatPrice, formatTime, slotsFor, toISODate } from "@/lib/utils";
import { EASE, SafeImg, Shutter } from "@/components/motion";

/** Brand name sized to exactly fill the column, condensing into place on load */
function Masthead({ text, play }: { text: string; play: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(0);
  useLayoutEffect(() => {
    const fit = () => {
      if (!wrap.current || !probe.current) return;
      const w = probe.current.getBoundingClientRect().width;
      if (w) setSize((wrap.current.clientWidth / w) * 100 * 0.995);
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [text]);
  return (
    <div ref={wrap} className="relative overflow-hidden">
      <span ref={probe} aria-hidden className="display invisible absolute left-0 top-0 whitespace-nowrap" style={{ fontSize: 100, ["--wdth" as string]: 62 }}>
        {text}
      </span>
      <h1
        className="display whitespace-nowrap leading-[0.8] transition-[font-variation-settings] duration-[1600ms] ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ fontSize: size || "22vw", ["--wdth" as string]: play ? 62 : 125 }}
      >
        {text.split("").map((ch, i) => (
          <span key={i} className="inline-block overflow-hidden pt-[0.16em] align-bottom">
            <motion.span className="inline-block" initial={{ y: "100%" }} animate={play ? { y: "0%" } : {}} transition={{ duration: 1.1, ease: EASE, delay: i * 0.05 }}>
              {ch}
            </motion.span>
          </span>
        ))}
      </h1>
    </div>
  );
}

export default function Hero() {
  const hero = useStore((s) => s.hero);
  const settings = useStore((s) => s.settings);
  const categories = useStore((s) => s.categories);
  const services = useStore((s) => s.services);
  const appointments = useStore((s) => s.appointments);
  const team = useStore((s) => s.team);
  const play = useUI((s) => s.introDone);
  const [hover, setHover] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const index = useMemo(
    () =>
      categories
        .filter((c) => c.published)
        .map((c) => {
          const list = services.filter((s) => s.published && s.category === c.id);
          return { ...c, from: list.length ? Math.min(...list.map((s) => s.price)) : 0 };
        }),
    [categories, services]
  );

  // live openings from real opening hours + existing bookings
  const openings = useMemo(() => {
    if (!now) return { label: "Today", date: "", rows: [] as { t: string; free: number }[] };
    const chairs = Math.max(1, team.filter((t) => t.published).length);
    for (let d = 0; d < 7; d++) {
      const date = toISODate(addDays(now, d));
      const mins = now.getHours() * 60 + now.getMinutes();
      const rows = slotsFor(settings.hours, date, 30, 60)
        .filter((t) => d > 0 || Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) > mins + 30)
        .map((t) => ({ t, free: chairs - appointments.filter((a) => a.date === date && a.time === t && a.status !== "cancelled").length }))
        .filter((r) => r.free > 0)
        .slice(0, 5);
      if (rows.length) return { label: d === 0 ? "Today" : d === 1 ? "Tomorrow" : addDays(now, d).toLocaleDateString("en", { weekday: "long" }), date, rows };
    }
    return { label: "This week", date: "", rows: [] };
  }, [now, settings.hours, appointments, team]);

  const active = index.find((c) => c.id === hover);
  const image = active?.image ?? hero.image;
  const words = hero.words.split(",").map((w) => w.trim()).filter(Boolean);

  return (
    <section className="px-4 pb-6 pt-4 md:px-8 md:pb-10 md:pt-6" aria-label="Hero">
      <motion.div
        className="wide flex items-center justify-between gap-4 border-b border-ink/25 pb-2 text-ink/70"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <span>
          Issue {now ? String(Math.ceil((+now - +new Date(now.getFullYear(), 0, 1)) / 864e5)).padStart(3, "0") : "—"} · Vol. {now ? now.getFullYear() : ""}
        </span>
        <span className="hidden md:inline">{hero.eyebrow}</span>
        <span>{now ? now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : ""}</span>
      </motion.div>

      <Masthead text={settings.brandName} play={play} />

      <motion.div
        className="wide no-scrollbar flex justify-between gap-6 overflow-x-auto border-y border-ink/25 py-2.5"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {index.map((c, i) => (
          <Link key={c.id} href={`/services#cat-${c.id}`} onMouseEnter={() => setHover(c.id)} className="shrink-0 hover:text-accent">
            <span className="text-accent">{String(i + 1).padStart(2, "0")}</span> {c.name}
          </Link>
        ))}
        <span className="shrink-0 text-ink/50">Since 2014</span>
      </motion.div>

      <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-12 md:gap-0">
        {/* image */}
        <div className="md:order-2 md:col-span-5 md:border-x md:border-ink/20 md:px-6">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink/5 md:aspect-auto md:h-[66vh]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={image}
                className="absolute inset-0"
                initial={{ clipPath: "inset(0 0 0 100%)" }}
                animate={{ clipPath: "inset(0 0 0 0%)" }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <SafeImg src={image} alt={active?.name ?? "Studio"} className="h-full w-full object-cover" loading="eager" />
              </motion.div>
            </AnimatePresence>
            <Shutter slats={7} delay={0.4} play={play} />
            <div className="wide absolute left-0 top-0 z-[3] bg-bg px-2.5 py-1.5">{active ? `Now showing — ${active.name}` : "The Bandra studio"}</div>
          </div>
          <div className="wide mt-2 flex justify-between text-ink/55">
            <span>Fig. 1</span>
            <span>{active ? active.tagline : "Photographed in-house"}</span>
          </div>
        </div>

        {/* headline + live openings */}
        <div className="flex flex-col md:order-1 md:col-span-4 md:pr-6">
          <h2 className="display text-[17vw] md:text-[5.6vw]">
            {hero.line1} <span className="text-accent">{words[0] ?? ""}</span> {hero.line2}
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink/70">{hero.subtitle}</p>

          <div className="relative mt-6 bg-night p-5 text-cream md:mt-auto">
            <span className="absolute -left-2 top-[52px] h-4 w-4 rounded-[50%] bg-[var(--shutter,var(--c-bg))]" />
            <span className="absolute -right-2 top-[52px] h-4 w-4 rounded-[50%] bg-[var(--shutter,var(--c-bg))]" />
            <div className="flex items-baseline justify-between border-b border-dashed border-cream/25 pb-3">
              <span className="font-serif text-[26px] leading-none">{openings.label}&apos;s openings</span>
              <span className="wide flex items-center gap-1.5 text-cream/60">
                <span className="h-1.5 w-1.5 animate-pulse bg-emerald-400" /> Live
              </span>
            </div>
            <ul className="mt-2">
              {openings.rows.map((r) => (
                <li key={r.t}>
                  <Link href={`/book?date=${openings.date}`} className="group flex items-baseline gap-2 py-1.5 text-[14px]">
                    <span className="font-serif text-[20px] tabular-nums">{formatTime(r.t)}</span>
                    <span className="leaders" />
                    <span className="wide text-cream/55">
                      {r.free} {r.free === 1 ? "chair" : "chairs"}
                    </span>
                    <ArrowUpRight size={14} className="translate-y-0.5 text-cream/40 transition-colors group-hover:text-accent" />
                  </Link>
                </li>
              ))}
              {!openings.rows.length && <li className="py-2 text-[14px] text-cream/60">Fully booked — call us for a waitlist spot.</li>}
            </ul>
          </div>
        </div>

        {/* the index */}
        <div className="md:order-3 md:col-span-3 md:pl-6">
          <div className="wide flex justify-between border-b border-ink/25 pb-2 text-ink/60">
            <span>The index</span>
            <span>From</span>
          </div>
          <ul>
            {index.map((c, i) => (
              <li key={c.id} onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}>
                <Link href={`/services#cat-${c.id}`} className="group flex items-baseline gap-2 border-b border-ink/10 py-2">
                  <span className="wide w-5 text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("display text-[34px] transition-all duration-500 group-hover:text-accent md:text-[2.5vw]")} style={{ ["--wdth" as string]: hover === c.id ? 100 : 62 }}>
                    {c.name}
                  </span>
                  <span className="leaders" />
                  <span className="text-[13px] tabular-nums">{formatPrice(c.from, settings.currency)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-end justify-between border-b border-ink/25 pb-4">
            <div>
              <div className="display text-[64px]">{settings.rating}</div>
              <div className="wide text-ink/60">{settings.reviewsCount} reviews</div>
            </div>
            <div className="flex gap-0.5 pb-1 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-current" />
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Link href="/book" className="wide group flex h-12 items-center justify-between bg-accent px-4 text-white">
              {hero.ctaPrimary} <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
            </Link>
            <Link href="/services" className="wide flex h-12 items-center justify-between border border-ink/30 px-4 hover:bg-ink hover:text-bg">
              {hero.ctaSecondary} <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
