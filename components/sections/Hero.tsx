"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { addDays, cn, formatPrice, openStatus, toISODate } from "@/lib/utils";
import { EASE, Magnetic, SafeImg } from "@/components/motion";

const CYCLE = 3200;

function Line({ children, delay, play }: { children: React.ReactNode; delay: number; play: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span className="block" initial={{ y: "110%" }} animate={play ? { y: "0%" } : {}} transition={{ duration: 1.1, ease: EASE, delay }}>
        {children}
      </motion.span>
    </span>
  );
}

/** Word that rolls inside an accent pill — the pill resizes to fit each word */
function Roller({ words, index }: { words: string[]; index: number }) {
  const w = words[index % words.length] ?? "";
  return (
    <motion.span
      layout
      transition={{ layout: { type: "spring", stiffness: 260, damping: 28 } }}
      className="relative inline-flex -rotate-2 overflow-hidden rounded-[0.22em] bg-accent px-[0.16em] align-bottom text-white"
      style={{ height: "0.98em" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={w}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="block leading-[0.98]"
        >
          {w}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

function SpinBadge() {
  return (
    <Link href="/book" aria-label="Book a ritual" className="group relative flex h-28 w-28 items-center justify-center md:h-32 md:w-32">
      <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full">
        <defs>
          <path id="circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <circle cx="50" cy="50" r="50" className="fill-ink" />
        <text className="fill-bg text-[9.5px] font-semibold uppercase tracking-[0.22em]">
          <textPath href="#circle">Book a ritual • Book a ritual • </textPath>
        </text>
      </svg>
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110">
        <ArrowUpRight size={20} />
      </span>
    </Link>
  );
}

export default function Hero() {
  const router = useRouter();
  const hero = useStore((s) => s.hero);
  const settings = useStore((s) => s.settings);
  const categories = useStore((s) => s.categories);
  const services = useStore((s) => s.services);
  const play = useUI((s) => s.introDone);
  const words = useMemo(() => hero.words.split(",").map((w) => w.trim()).filter(Boolean), [hero.words]);

  const cards = useMemo(
    () =>
      categories
        .filter((c) => c.published)
        .map((c) => {
          const list = services.filter((s) => s.published && s.category === c.id);
          return { ...c, from: list.length ? Math.min(...list.map((s) => s.price)) : 0, count: list.length };
        }),
    [categories, services]
  );

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!play || paused) return;
    const t = setTimeout(() => setIdx((i) => i + 1), CYCLE);
    return () => clearTimeout(t);
  }, [idx, play, paused]);

  const [status, setStatus] = useState({ open: true, label: "" });
  useEffect(() => setStatus(openStatus(settings.hours)), [settings.hours]);

  // quick book
  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => toISODate(addDays(new Date(), i))), []);
  const [svc, setSvc] = useState("");
  const [day, setDay] = useState(days[0]);

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const deckY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const headY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  const n = cards.length || 1;
  const visible = [0, 1, 2].map((k) => cards[(idx + k) % n]).filter(Boolean);

  return (
    <section ref={ref} className="relative overflow-hidden pb-6 pt-[140px] md:pb-10 md:pt-[136px]" aria-label="Hero">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 md:px-8 lg:grid-cols-12 lg:gap-6">
        {/* ── left: type ── */}
        <motion.div style={{ y: headY, opacity: fade }} className="flex flex-col lg:col-span-7 lg:pt-8">
          <motion.div
            className="flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={play ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-[12.5px] font-medium">
              <span className={cn("h-2 w-2 rounded-full", status.open ? "bg-emerald-500" : "bg-accent")} />
              {status.label || "Open today"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-[12.5px] font-medium">
              <Star size={12} className="fill-accent text-accent" /> {settings.rating} · {settings.reviewsCount} reviews
            </span>
            <span className="hidden rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-[12.5px] font-medium sm:inline-flex">{hero.eyebrow}</span>
          </motion.div>

          <h1 className="display mt-7 text-[16vw] leading-[0.88] md:text-[10.5vw] lg:text-[8.4vw] 2xl:text-[150px]">
            <Line play={play} delay={0.1}>
              {hero.line1}
            </Line>
            <Line play={play} delay={0.2}>
              <Roller words={words} index={idx} />
            </Line>
            <Line play={play} delay={0.3}>
              {hero.line2}
            </Line>
          </h1>

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mt-auto lg:pt-10">
            <motion.p
              className="max-w-[400px] text-[16px] leading-relaxed text-soft md:text-[17px]"
              initial={{ opacity: 0, y: 16 }}
              animate={play ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: EASE, delay: 0.5 }}
            >
              {hero.subtitle}
            </motion.p>
            <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 16 }} animate={play ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: EASE, delay: 0.6 }}>
              <Magnetic>
                <Link href="/book" className="group flex h-14 items-center gap-3 rounded-full bg-ink pl-6 pr-2 text-[15px] font-medium text-bg">
                  {hero.ctaPrimary}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white transition-transform duration-500 group-hover:rotate-[-45deg]">
                    <ArrowRight size={17} />
                  </span>
                </Link>
              </Magnetic>
              <Link href="/services" className="link-underline hidden text-[15px] font-medium sm:block">
                {hero.ctaSecondary}
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── right: swipeable deck ── */}
        <motion.div style={{ y: deckY }} className="relative lg:col-span-5">
          <div
            className="relative mx-auto aspect-[4/5] w-[86%] max-w-[480px] lg:mr-6 lg:w-full"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence initial={false}>
              {visible
                .map((c, k) => ({ c, k }))
                .reverse()
                .map(({ c, k }) => (
                  <motion.div
                    key={c.id + "-" + Math.floor((idx + k) / n)}
                    className="absolute inset-0 touch-pan-y"
                    style={{ zIndex: 10 - k }}
                    initial={play ? { opacity: 0, scale: 0.8, y: 40, rotate: 10 } : { opacity: 0, y: 120, rotate: 12 }}
                    animate={
                      play
                        ? { opacity: 1 - k * 0.12, scale: 1 - k * 0.06, x: `${k * -9}%`, y: k * -10, rotate: k === 0 ? 2 : k === 1 ? -5 : -11 }
                        : { opacity: 0, y: 120, rotate: 12 }
                    }
                    exit={{ x: "-130%", rotate: -24, opacity: 0, transition: { duration: 0.7, ease: EASE } }}
                    transition={{ duration: 0.9, ease: EASE, delay: play && idx === 0 ? 0.3 + (2 - k) * 0.12 : 0 }}
                    drag={k === 0 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragStart={() => setPaused(true)}
                    onDragEnd={(_, info) => {
                      setPaused(false);
                      if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 400) setIdx((i) => i + 1);
                    }}
                    whileTap={k === 0 ? { cursor: "grabbing", scale: 0.98 } : undefined}
                    data-cursor={k === 0 ? "Drag" : undefined}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-[var(--radius)] bg-ink shadow-[0_30px_60px_-25px_rgba(0,0,0,0.45)]">
                      <SafeImg src={c.image} alt={c.name} className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover" draggable={false} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/10" />
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-ink backdrop-blur">
                        {String(((idx + k) % n) + 1).padStart(2, "0")} — {String(n).padStart(2, "0")}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                        <div>
                          <div className="display text-[44px] md:text-[56px]">{c.name}</div>
                          <div className="mt-1 text-[13.5px] text-white/75">
                            {c.tagline} · {c.count} services · from {formatPrice(c.from, settings.currency)}
                          </div>
                        </div>
                        <Link
                          href={`/services#cat-${c.id}`}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform hover:rotate-45"
                          aria-label={`See ${c.name}`}
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* progress dots */}
            <div className="absolute -bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {cards.map((c, i) => (
                <button key={c.id} onClick={() => setIdx(idx + ((i - (idx % n) + n) % n))} className="relative h-1.5 overflow-hidden rounded-full bg-ink/15 transition-all" style={{ width: i === idx % n ? 28 : 6 }} aria-label={c.name}>
                  {i === idx % n && !paused && play && (
                    <motion.span key={idx} className="absolute inset-y-0 left-0 bg-accent" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: CYCLE / 1000, ease: "linear" }} />
                  )}
                </button>
              ))}
            </div>

            <motion.div
              className="absolute -right-3 -top-8 z-30 md:-right-8 md:-top-10"
              initial={{ scale: 0, rotate: -90 }}
              animate={play ? { scale: 1, rotate: 0 } : {}}
              transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.9 }}
            >
              <SpinBadge />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── quick-book bar ── */}
      <motion.div
        className="mx-auto mt-16 max-w-[1440px] px-4 md:mt-14 md:px-8"
        initial={{ opacity: 0, y: 40 }}
        animate={play ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: EASE, delay: 0.7 }}
      >
        <div className="flex flex-col gap-3 rounded-[calc(var(--radius)*0.9)] bg-ink p-3 text-bg md:flex-row md:items-center md:gap-2 md:rounded-full md:p-2 md:pl-6">
          <div className="flex items-center justify-between gap-3 px-2 pt-1 md:px-0 md:pt-0">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-bg/60">Quick book</span>
            <span className="text-[12px] text-bg/40 md:hidden">60-second booking</span>
          </div>
          <div className="relative md:ml-3 md:w-[260px]">
            <select
              value={svc}
              onChange={(e) => setSvc(e.target.value)}
              className="h-12 w-full appearance-none rounded-full bg-white/10 pl-5 pr-10 text-[14px] text-bg outline-none transition-colors hover:bg-white/15"
              aria-label="Service"
            >
              <option value="" className="text-ink">Choose a service</option>
              {services
                .filter((s) => s.published)
                .map((s) => (
                  <option key={s.id} value={s.id} className="text-ink">
                    {s.name} — {formatPrice(s.price, settings.currency)}
                  </option>
                ))}
            </select>
            <ArrowRight size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-bg/60" />
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto md:flex-1 md:px-2">
            {days.map((d, i) => {
              const dt = new Date(d + "T00:00:00");
              const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : dt.toLocaleDateString("en", { weekday: "short", day: "numeric" });
              return (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={cn("relative h-12 shrink-0 rounded-full px-4 text-[13.5px] transition-colors", day === d ? "text-ink" : "text-bg/70 hover:text-bg")}
                >
                  {day === d && <motion.span layoutId="qb-day" className="absolute inset-0 rounded-full bg-bg" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => router.push(`/book?${svc ? `service=${svc}&` : ""}date=${day}`)}
            className="group flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-[14.5px] font-semibold text-white transition-transform active:scale-95 md:h-14"
          >
            Find a slot <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
