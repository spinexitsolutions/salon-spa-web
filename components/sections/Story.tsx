"use client";

import {
  type MotionValue,
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Clock, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { Counter, EASE, Reveal, SafeImg, SectionLabel, Shutter, SplitText } from "@/components/motion";

/* ───────────── Marquee (velocity-reactive) ───────────── */
export function Marquee() {
  const categories = useStore((s) => s.categories);
  const services = useStore((s) => s.services);
  const words = useMemo(
    () => [...categories.filter((c) => c.published).map((c) => c.name), ...services.filter((s) => s.featured).map((s) => s.name)],
    [categories, services]
  );
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const smooth = useSpring(vel, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const skew = useTransform(smooth, [-2000, 0, 2000], [8, 0, -8]);
  const dir = useRef(1);
  useAnimationFrame((_, delta) => {
    let move = dir.current * -2.2 * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * -Math.abs(f) * (delta / 1000) * 2.2;
    let v = baseX.get() + move;
    if (v <= -50) v += 50;
    if (v > 0) v -= 50;
    baseX.set(v);
  });
  const x = useTransform(baseX, (v) => `${v}%`);
  const row = (
    <div className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className={cn("display px-6 text-[7.8vw] md:px-10 md:text-[4.5vw]", i % 2 && "text-accent")}>{w}</span>
          <svg width="34" height="34" viewBox="0 0 24 24" className="shrink-0 text-ink/30">
            <path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
          </svg>
        </span>
      ))}
    </div>
  );
  return (
    <section className="overflow-hidden border-y hairline py-6 md:py-10" aria-hidden>
      <motion.div style={{ x, skewX: skew }} className="flex w-max whitespace-nowrap">
        {row}
        {row}
      </motion.div>
    </section>
  );
}

/* ───────────── Philosophy — text with inline image pills ───────────── */
function LitWord({ children, progress, range }: { children: React.ReactNode; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.22em] inline-block">
      {children}
    </motion.span>
  );
}

function InlineImg({ src, progress, range }: { src?: string; progress: MotionValue<number>; range: [number, number] }) {
  const w = useTransform(progress, range, ["0em", "1.9em"]);
  const r = useTransform(progress, range, [-12, 0]);
  return (
    <motion.span style={{ width: w, rotate: r }} className="mr-[0.22em] inline-block h-[0.82em] overflow-hidden rounded-[var(--radius)] align-[-0.06em]">
      <SafeImg src={src} alt="" className="h-full w-[1.9em] max-w-none object-cover" />
    </motion.span>
  );
}

export function Philosophy() {
  const gallery = useStore((s) => s.gallery);
  const settings = useStore((s) => s.settings);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const imgs = [gallery[1]?.image, gallery[3]?.image, gallery[7]?.image, gallery[10]?.image];
  const tokens = `${settings.brandName} is where beauty {0} slows down. Hair, skin {1} and body rituals by artists who listen first {2} and rush never. You leave lighter {3} — every single time.`.split(" ");
  return (
    <section className="px-4 pb-24 pt-16 md:px-8 md:pb-32 md:pt-20">
      <SectionLabel index="01">Our philosophy</SectionLabel>
      <div ref={ref} className="display mt-10 text-[6.3vw] leading-[1] md:text-[3.7vw] md:leading-[0.98]">
        {tokens.map((t, i) => {
          const range: [number, number] = [i / tokens.length, (i + 1) / tokens.length];
          const m = t.match(/^\{(\d)\}$/);
          if (m) return <InlineImg key={i} src={imgs[Number(m[1])]} progress={scrollYProgress} range={range} />;
          return (
            <LitWord key={i} progress={scrollYProgress} range={range}>
              {t}
            </LitWord>
          );
        })}
      </div>
      <div className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Clean formulas", "Olaplex, Kérastase & Dermalogica only."],
          ["Unhurried time", "We never double-book an artist."],
          ["Single-use tools", "Hospital-grade hygiene, always."],
          ["Free consults", "Every visit starts with a chat."],
        ].map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.06}>
            <div className="group h-full rounded-[var(--radius)] border border-ink/10 p-5 transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-[#0E0E0E]">
              <div className="text-[26px] font-semibold tracking-tight">0{i + 1}</div>
              <div className="mt-5 text-[16px] font-semibold md:mt-8 md:text-[17px]">{t}</div>
              <div className="mt-1 text-[14px] opacity-60">{d}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Services — printed price list, rows unfold inline ───────────── */
export function ServicesMenu() {
  const categories = useStore((s) => s.categories).filter((c) => c.published);
  const services = useStore((s) => s.services).filter((s) => s.published);
  const currency = useStore((s) => s.settings.currency);
  const [cat, setCat] = useState(categories[0]?.id ?? "");
  const [open, setOpen] = useState<string | null>(null);
  const list = services.filter((s) => s.category === cat);
  const current = categories.find((c) => c.id === cat);

  return (
    <section id="services" className="px-4 py-20 md:px-8 md:py-28">
      <SectionLabel index="02">Price list</SectionLabel>
      <div className="mt-6 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <SplitText as="h2" text="The menu, priced plainly." className="display text-[10.2vw] md:text-[3.9vw]" />
          <div className="mt-6 grid grid-cols-3 gap-px border border-ink/20 bg-ink/20 md:grid-cols-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCat(c.id);
                  setOpen(null);
                }}
                className={cn("wide relative h-12 px-3 text-left transition-colors", cat === c.id ? "bg-accent text-[#0E0E0E]" : "bg-[var(--shutter,var(--c-bg))] hover:text-accent")}
              >
                {c.name}
                <span className="absolute right-2 top-2 text-[9px] opacity-50">{services.filter((s) => s.category === c.id).length}</span>
              </button>
            ))}
          </div>
          <Link href="/services" className="wide mt-4 inline-flex items-center gap-2 border-b border-accent pb-1 hover:text-accent">
            Full menu <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="md:col-span-8">
          <div className="wide flex justify-between border-b-2 border-accent pb-2">
            <span>
              {current?.name} — {current?.tagline}
            </span>
            <span className="hidden sm:inline">Time · Price</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.ul key={cat} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {list.map((s, i) => {
                const isOpen = open === s.id;
                return (
                  <li key={s.id} className="border-b border-ink/15">
                    <button onClick={() => setOpen(isOpen ? null : s.id)} className="group flex w-full items-baseline gap-3 py-4 text-left">
                      <span className="wide w-6 shrink-0 text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span className="display text-[22px] transition-colors group-hover:text-accent md:text-[30px]">{s.name}</span>
                      <span className="leaders" />
                      <span className="wide hidden shrink-0 text-ink/55 sm:inline">{s.duration} min</span>
                      <span className="shrink-0 text-[16px] font-semibold tabular-nums md:text-[18px]">{formatPrice(s.price, currency)}</span>
                      <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="shrink-0 self-center text-ink/50">
                        <Plus size={18} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.55, ease: EASE }} className="overflow-hidden">
                          <div className="grid gap-4 pb-6 sm:grid-cols-[200px_1fr] sm:pl-9">
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <SafeImg src={s.image} alt="" className="h-full w-full object-cover" />
                              <Shutter slats={4} />
                            </div>
                            <div className="flex flex-col justify-between gap-4">
                              <p className="max-w-md text-[15px] leading-relaxed text-ink/70">{s.description}</p>
                              <div className="flex items-center gap-4">
                                <Link href={`/book?service=${s.id}`} className="wide inline-flex h-11 items-center gap-2 bg-accent px-5 text-[#0E0E0E]">
                                  Reserve <ArrowUpRight size={14} />
                                </Link>
                                <span className="wide flex items-center gap-1.5 text-ink/55">
                                  <Clock size={13} /> {s.duration} min
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Signature rituals — sticky image story ───────────── */
export function Rituals() {
  const featured = useStore((s) => s.services).filter((s) => s.featured && s.published);
  const currency = useStore((s) => s.settings.currency);
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [featured.length]);

  const cur = featured[active];
  return (
    <section id="rituals" className="bg-night px-4 py-20 text-cream md:px-8 md:py-28" style={{ ["--shutter" as string]: "var(--c-night)" }}>
      <SectionLabel index="03" light>
        Signature rituals
      </SectionLabel>
      <div className="mt-8 grid gap-10 md:grid-cols-12">
        <div className="hidden md:col-span-6 md:block">
          <div className="sticky top-8 h-[calc(100vh-4rem)]">
            <div className="relative h-full overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={cur?.id}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={{ clipPath: "inset(0% 0 0 0)" }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <SafeImg src={cur?.image} alt={cur?.name} className="h-full w-full object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-0 left-0 z-[3] flex items-end gap-4 bg-night pr-5 pt-3">
                <span className="display text-[84px] leading-[0.8] text-accent">{String(active + 1).padStart(2, "0")}</span>
                <span className="wide pb-1 text-cream/60">/ {String(featured.length).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-6">
          {featured.map((s, i) => (
            <article
              key={s.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-i={i}
              className="flex min-h-[70vh] flex-col justify-center border-b border-cream/15 py-10 md:min-h-[85vh]"
            >
              <div className="relative mb-6 aspect-[4/3] overflow-hidden md:hidden">
                <SafeImg src={s.image} alt="" className="h-full w-full object-cover" />
                <Shutter />
              </div>
              <span className="wide text-accent">Ritual {String(i + 1).padStart(2, "0")}</span>
              <h3
                className={cn("display mt-3 text-[10.2vw] transition-[color,font-variation-settings] duration-700 md:text-[3.9vw]", active === i ? "text-cream" : "text-cream/25")}
                style={{ ["--wdth" as string]: active === i ? 62 : 100 }}
              >
                {s.name}
              </h3>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-cream/65">{s.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="font-serif text-[30px]">{formatPrice(s.price, currency)}</span>
                <span className="wide text-cream/55">{s.duration} minutes</span>
                <Link href={`/book?service=${s.id}`} className="wide inline-flex h-11 items-center gap-2 bg-cream px-5 text-night hover:bg-accent hover:text-[#0E0E0E]">
                  Reserve this <ArrowUpRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Stats — bento ───────────── */
export function Stats() {
  const stats = useStore((s) => s.stats).filter((s) => s.published);
  const styles = ["bg-accent text-[#0E0E0E] md:row-span-2", "bg-night text-ink border border-accent/15", "border border-ink/15 text-ink", "bg-night text-ink"];
  return (
    <section className="px-4 py-20 md:px-8 md:py-28">
      <div className="grid auto-rows-[minmax(170px,auto)] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.08} className={cn("flex flex-col justify-between rounded-[var(--radius)] p-5 md:p-7", styles[i % styles.length], i === 0 && "col-span-2 md:col-span-2")}>
            <div className="text-[13px] font-medium opacity-70">{s.label}</div>
            <div className={cn("display leading-none", i === 0 ? "text-[18vw] md:text-[7.8vw]" : "text-[9vw] md:text-[3.6vw]")}>
              <Counter value={s.value} decimals={s.decimals} />
              <span className={i === 0 ? "" : "text-accent"}>{s.suffix}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
