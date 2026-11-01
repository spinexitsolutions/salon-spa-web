"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { EASE } from "@/components/motion";

const SLIDE_MS = 6500;

export default function Hero() {
  const hero = useStore((s) => s.hero);
  const settings = useStore((s) => s.settings);
  const categories = useStore((s) => s.categories);
  const play = useUI((s) => s.introDone);

  const slides = useMemo(() => {
    const imgs = [hero.image, ...categories.filter((c) => c.published).map((c) => c.image.replace(/w=\d+/, "w=2400"))];
    return Array.from(new Set(imgs.filter(Boolean))).slice(0, 5);
  }, [hero.image, categories]);
  const words = useMemo(() => hero.words.split(",").map((w) => w.trim()).filter(Boolean), [hero.words]);

  const [i, setI] = useState(0);
  useEffect(() => {
    if (!play) return;
    const t = setTimeout(() => setI((x) => x + 1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, play]);
  const idx = i % Math.max(slides.length, 1);
  const word = words[i % Math.max(words.length, 1)] ?? "";

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const contentO = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  const fade = (d: number) => ({
    initial: { opacity: 0, y: 26, filter: "blur(10px)" },
    animate: play ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1.4, ease: EASE, delay: d },
  });

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-black" aria-label="Hero">
      {/* slideshow with slow zoom */}
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          >
            <motion.img
              src={slides[idx]}
              alt=""
              className="h-full w-full object-cover"
              initial={{ scale: 1.18 }}
              animate={{ scale: 1.02 }}
              transition={{ duration: SLIDE_MS / 1000 + 2, ease: "linear" }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.7)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-[#0E0E0E]" />

      {/* centred content */}
      <motion.div style={{ y: contentY, opacity: contentO }} className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-[#F3EDE3]">
        <motion.div {...fade(0.1)} className="wide flex items-center gap-4 text-[10px] text-accent md:text-[11px]">
          <span className="hidden h-px w-14 bg-accent/70 md:block" />
          {hero.eyebrow}
          <span className="hidden h-px w-14 bg-accent/70 md:block" />
        </motion.div>

        <h1 className="display mt-7 text-[11.5vw] leading-[1.05] md:text-[6.4vw] lg:text-[92px]">
          <motion.span {...fade(0.25)} className="block">
            {hero.line1}
          </motion.span>
          <span className="relative block h-[1.1em] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={word}
                className="gold-text absolute inset-x-0 block font-[300]"
                initial={{ opacity: 0, y: "40%", filter: "blur(12px)", letterSpacing: "0.3em" }}
                animate={play ? { opacity: 1, y: "0%", filter: "blur(0px)", letterSpacing: "0.08em" } : {}}
                exit={{ opacity: 0, y: "-30%", filter: "blur(12px)" }}
                transition={{ duration: 1.3, ease: EASE, delay: i === 0 ? 0.4 : 0 }}
              >
                {word}
              </motion.span>
            </AnimatePresence>
          </span>
          {hero.line2 && (
            <motion.span {...fade(0.45)} className="block">
              {hero.line2}
            </motion.span>
          )}
        </h1>

        <motion.p {...fade(0.6)} className="mt-6 max-w-[460px] text-[15px] leading-[1.8] text-[#F3EDE3]/70 md:text-[16px]">
          {hero.subtitle}
        </motion.p>

        <motion.div {...fade(0.75)} className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/book" className="wide group relative flex h-14 w-64 items-center justify-center overflow-hidden bg-accent text-[#0E0E0E] sm:w-auto sm:px-10">
            <span className="absolute inset-0 -translate-x-full bg-[#F3EDE3] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0" />
            <span className="relative">{hero.ctaPrimary}</span>
          </Link>
          <Link href="/services" className="wide flex h-14 w-64 items-center justify-center border border-[#F3EDE3]/30 text-[#F3EDE3] transition-colors duration-500 hover:border-accent hover:text-accent sm:w-auto sm:px-10">
            {hero.ctaSecondary}
          </Link>
        </motion.div>
      </motion.div>

      {/* bottom bar */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1440px] items-end justify-between px-5 pb-7 text-[#F3EDE3] md:px-10 md:pb-9"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 1 }}
      >
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex gap-0.5 text-accent">
            {Array.from({ length: 5 }).map((_, k) => (
              <Star key={k} size={12} className="fill-current" />
            ))}
          </div>
          <span className="wide text-[10px] text-[#F3EDE3]/70">
            {settings.rating} · {settings.reviewsCount} reviews
          </span>
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
          <span className="wide text-[9px] text-[#F3EDE3]/55">Scroll</span>
          <span className="relative h-12 w-px overflow-hidden bg-white/15">
            <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-accent" animate={{ y: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
          </span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="wide text-[10px] tabular-nums">
            <span className="text-accent">{String(idx + 1).padStart(2, "0")}</span> / {String(slides.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, k) => (
              <button key={k} onClick={() => setI(i + ((k - idx + slides.length) % slides.length))} className="relative h-px w-7 overflow-hidden bg-white/25 py-0" aria-label={`Slide ${k + 1}`}>
                {k === idx && play && <motion.span key={i} className="absolute inset-y-0 left-0 bg-accent" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: SLIDE_MS / 1000, ease: "linear" }} />}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
