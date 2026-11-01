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
import { ArrowUpRight, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { Counter, EASE, Reveal, SafeImg, SectionLabel, SplitText } from "@/components/motion";

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
          <span className={cn("display px-6 text-[13vw] md:px-10 md:text-[7.5vw]", i % 2 && "text-accent")}>{w}</span>
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
    <motion.span style={{ width: w, rotate: r }} className="mr-[0.22em] inline-block h-[0.82em] overflow-hidden rounded-full align-[-0.06em]">
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
    <section className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-40">
      <div className="flex items-center justify-between">
        <SectionLabel index="01">Our philosophy</SectionLabel>
        <span className="hidden text-[13px] text-soft md:block">Since 2014 · Bandra, Mumbai</span>
      </div>
      <div ref={ref} className="display mt-10 text-[10.5vw] leading-[1] md:text-[6.2vw] md:leading-[0.98]">
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
      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Clean formulas", "Olaplex, Kérastase & Dermalogica only."],
          ["Unhurried time", "We never double-book an artist."],
          ["Single-use tools", "Hospital-grade hygiene, always."],
          ["Free consults", "Every visit starts with a chat."],
        ].map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.06}>
            <div className="group h-full rounded-[calc(var(--radius)*0.8)] border border-ink/10 p-5 transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-white">
              <div className="text-[26px] font-semibold tracking-tight">0{i + 1}</div>
              <div className="mt-8 text-[17px] font-semibold">{t}</div>
              <div className="mt-1 text-[14px] opacity-60">{d}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Services menu with cursor-follow preview ───────────── */
export function ServicesMenu() {
  const categories = useStore((s) => s.categories).filter((c) => c.published);
  const services = useStore((s) => s.services).filter((s) => s.published);
  const currency = useStore((s) => s.settings.currency);
  const [cat, setCat] = useState(categories[0]?.id ?? "");
  const [hover, setHover] = useState<string | null>(null);
  const list = services.filter((s) => s.category === cat);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 150, damping: 20 });
  const y = useSpring(my, { stiffness: 150, damping: 20 });
  const hovered = services.find((s) => s.id === hover);

  return (
    <section id="services" className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-32">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <SectionLabel index="02">The menu</SectionLabel>
          <SplitText as="h2" text="Rituals for every part of you." className="display mt-6 max-w-3xl text-[12vw] md:text-[6vw]" />
        </div>
        <Link href="/services" className="group flex items-center gap-2 text-sm">
          <span className="link-underline">Full menu & prices</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg transition-transform group-hover:rotate-45">
            <ArrowUpRight size={15} />
          </span>
        </Link>
      </div>

      {/* category tabs */}
      <div className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={cn("relative shrink-0 rounded-full px-5 py-2.5 text-sm transition-colors", cat === c.id ? "text-bg" : "bg-soft hover:bg-ink/10")}
          >
            {cat === c.id && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <span className="relative">{c.name}</span>
          </button>
        ))}
      </div>

      <div
        className="relative mt-8"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <AnimatePresence mode="wait">
          <motion.ul key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: EASE }}>
            {list.map((s, i) => (
              <li key={s.id} onPointerEnter={(e) => e.pointerType === "mouse" && setHover(s.id)}>
                <Link
                  href={`/book?service=${s.id}`}
                  data-cursor="Book"
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b hairline py-5 md:grid-cols-[60px_1fr_160px_140px_40px] md:py-7"
                >
                  <SafeImg src={s.image} alt="" className="h-16 w-16 rounded-2xl object-cover md:hidden" />
                  <span className="eyebrow hidden text-soft md:block">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="display block text-[26px] transition-all duration-500 group-hover:translate-x-2 md:text-[44px]">{s.name}</span>
                    <span className="mt-1 line-clamp-1 block text-[13px] text-soft md:hidden">
                      {s.duration} min · {formatPrice(s.price, currency)}
                    </span>
                  </span>
                  <span className="hidden items-center gap-2 text-sm text-soft md:flex">
                    <Clock size={14} /> {s.duration} min
                  </span>
                  <span className="hidden text-right text-lg md:block">{formatPrice(s.price, currency)}</span>
                  <span className="flex h-9 w-9 items-center justify-center justify-self-end rounded-full border hairline transition-all duration-500 group-hover:bg-accent group-hover:text-white md:h-10 md:w-10">
                    <ArrowUpRight size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>

        {/* floating preview */}
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[260px] w-[200px] overflow-hidden rounded-[22px] shadow-2xl md:block"
          style={{ x, y, translateX: "-50%", translateY: "-50%" }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6, rotate: hovered ? -4 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <AnimatePresence mode="popLayout">
            {hovered && (
              <motion.img
                key={hovered.id}
                src={hovered.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────── Signature rituals — horizontal pinned scroll ───────────── */
export function Rituals() {
  const featured = useStore((s) => s.services).filter((s) => s.featured && s.published);
  const currency = useStore((s) => s.settings.currency);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const m = () => track.current && setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, [featured.length]);
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="rituals" ref={ref} data-nav="dark" className="relative bg-night text-cream" style={{ height: `${100 + featured.length * 55}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 flex w-full max-w-[1400px] items-end justify-between px-5 md:mb-12 md:px-10">
          <div>
            <SectionLabel index="03" light>
              Signature rituals
            </SectionLabel>
            <h2 className="display mt-5 text-[12vw] md:text-[5.5vw]">
              Made to <em className="text-accent">linger</em>.
            </h2>
          </div>
          <div className="hidden w-56 md:block">
            <div className="eyebrow mb-2 text-cream/50">Scroll to explore</div>
            <div className="h-px w-full bg-cream/15">
              <motion.div className="h-px bg-accent" style={{ width: bar }} />
            </div>
          </div>
        </div>
        <motion.div ref={track} style={{ x }} className="flex w-max gap-4 pl-5 pr-5 md:gap-6 md:pl-10 md:pr-10">
          {featured.map((s, i) => (
            <Link
              key={s.id}
              href={`/book?service=${s.id}`}
              data-cursor="Reserve"
              className="group relative aspect-[3/4] w-[78vw] shrink-0 overflow-hidden rounded-[var(--radius)] md:aspect-[4/5] md:w-[34vw]"
            >
              <SafeImg src={s.image} alt={s.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="eyebrow absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">
                {String(i + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                <h3 className="display text-4xl text-white md:text-5xl">{s.name}</h3>
                <p className="mt-2 line-clamp-2 max-w-sm text-sm text-white/70">{s.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-white">
                  <span>
                    {s.duration} min · {formatPrice(s.price, currency)}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          <div className="flex w-[60vw] shrink-0 flex-col items-start justify-center pr-10 md:w-[26vw]">
            <p className="display text-4xl md:text-5xl">Can&apos;t decide?</p>
            <p className="mt-3 text-cream/60">Let our concierge design a ritual around you.</p>
            <Link href="/contact" className="mt-6 flex h-12 items-center gap-2 rounded-full bg-cream px-6 text-sm font-medium text-night">
              Talk to us <ArrowUpRight size={15} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────── Stats — bento ───────────── */
export function Stats() {
  const stats = useStore((s) => s.stats).filter((s) => s.published);
  const styles = ["bg-accent text-white md:row-span-2", "bg-ink text-bg", "bg-white text-ink border border-ink/10", "bg-[color-mix(in_oklab,var(--c-accent)_14%,var(--c-bg))] text-ink"];
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
      <div className="grid auto-rows-[minmax(170px,auto)] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.08} className={cn("flex flex-col justify-between rounded-[var(--radius)] p-5 md:p-7", styles[i % styles.length], i === 0 && "col-span-2 md:col-span-2")}>
            <div className="text-[13px] font-medium opacity-70">{s.label}</div>
            <div className={cn("display leading-none", i === 0 ? "text-[30vw] md:text-[13vw]" : "text-[15vw] md:text-[6vw]")}>
              <Counter value={s.value} decimals={s.decimals} />
              <span className={i === 0 ? "" : "text-accent"}>{s.suffix}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
