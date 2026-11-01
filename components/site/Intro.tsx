"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore, useUI } from "@/lib/store";
import { EASE } from "@/components/motion";

const SEEN_KEY = "solene-intro-seen";

export default function Intro() {
  const intro = useStore((s) => s.intro);
  const hydrated = useStore((s) => s.hydrated);
  const replay = useUI((s) => s.replayIntro);
  const setIntroDone = useUI((s) => s.setIntroDone);
  const [visible, setVisible] = useState(true);
  const [run, setRun] = useState(0);

  // decide once data is hydrated
  useEffect(() => {
    if (!hydrated) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const forced = new URLSearchParams(location.search).has("intro");
    if (!forced && (!intro.enabled || (intro.oncePerSession && seen))) {
      setVisible(false);
      setIntroDone(true);
      return;
    }
    setRun((r) => r + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // replay from admin preview
  useEffect(() => {
    if (replay > 0) {
      setVisible(true);
      setRun((r) => r + 1);
    }
  }, [replay]);

  useEffect(() => {
    if (!run) return;
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    }, intro.duration * 1000);
    return () => clearTimeout(t);
  }, [run, intro.duration]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = "";
        setIntroDone(true);
      }}
    >
      {visible && (
        <motion.div
          key={"intro" + run}
          className="fixed inset-0 z-[200] overflow-hidden bg-night text-cream"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          {run > 0 && intro.style === "bloom" && <Bloom key={run} />}
          {run > 0 && intro.style === "frame" && <Frame key={run} />}
          {run > 0 && intro.style === "minimal" && <Minimal key={run} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function useIntroData() {
  const intro = useStore((s) => s.intro);
  const images = intro.images.split("\n").map((s) => s.trim()).filter(Boolean);
  return { ...intro, images };
}

function Letters({ word, delay = 0.2, className }: { word: string; delay?: number; className?: string }) {
  return (
    <div className={className} aria-label={word}>
      {word.split("").map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.1em]">
          <motion.span
            className="inline-block"
            initial={{ y: "115%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * 0.07 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

function Count({ duration }: { duration: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000 * 0.85));
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);
  return <span className="tabular-nums">{String(n).padStart(3, "0")}</span>;
}

function Bloom() {
  const { word, caption, duration, images } = useIntroData();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!images.length) return;
    const each = (duration * 1000 * 0.75) / images.length;
    const t = setInterval(() => setIdx((i) => Math.min(i + 1, images.length - 1)), each);
    return () => clearInterval(t);
  }, [images.length, duration]);
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      {/* flickering image frame */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[38vh] w-[28vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[999px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.85, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + i}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
            style={{ opacity: i === idx ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-night/30" />
      </motion.div>

      <Letters word={word} className="display relative z-10 text-[13.2vw] leading-none text-cream mix-blend-difference md:text-[7.8vw]" />

      <motion.p
        className="eyebrow relative z-10 mt-6 text-cream/70"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 1, ease: EASE }}
      >
        {caption}
      </motion.p>

      <div className="eyebrow absolute bottom-8 left-6 right-6 flex items-end justify-between text-cream/60 md:left-10 md:right-10">
        <span>Loading the calm</span>
        <span className="display text-6xl text-cream md:text-8xl">
          <Count duration={duration} />
        </span>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-accent"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: duration * 0.9, ease: "easeInOut" }}
      />
    </div>
  );
}

function Frame() {
  const { word, caption, duration, images } = useIntroData();
  const last = images[images.length - 1];
  return (
    <div className="relative h-full w-full">
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ clipPath: "inset(38% 36% 38% 36% round 24px)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
        transition={{ duration: duration * 0.55, ease: EASE, delay: duration * 0.35 }}
      >
        {images.map((src, i) => (
          <motion.img
            key={src + i}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i * duration * 0.35) / images.length, duration: 0.6, ease: EASE }}
          />
        ))}
        {last && <div className="absolute inset-0 bg-night/35" />}
      </motion.div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <Letters word={word} delay={duration * 0.45} className="display text-[12vw] text-cream md:text-[7.2vw]" />
        <motion.p
          className="eyebrow mt-4 text-cream/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: duration * 0.6, duration: 0.8 }}
        >
          {caption}
        </motion.p>
      </div>
    </div>
  );
}

function Minimal() {
  const { word, caption, duration } = useIntroData();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <Letters word={word} className="display text-[10.8vw] text-cream md:text-[5.4vw]" />
      <motion.div
        className="h-px bg-cream/40"
        initial={{ width: 0 }}
        animate={{ width: 160 }}
        transition={{ duration: duration * 0.6, ease: EASE, delay: 0.4 }}
      />
      <motion.p className="eyebrow text-cream/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        {caption}
      </motion.p>
    </div>
  );
}
