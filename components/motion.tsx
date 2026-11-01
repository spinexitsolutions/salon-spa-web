"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-8% 0px" }}
      transition={{ duration: 1.4, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Elegant heading: words drift up out of a soft blur, one after another */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.08,
  as = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  play?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const Tag = motion[as];
  const words = text.split(" ");
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px" }} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: EASE, delay: delay + i * stagger } },
          }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </Tag>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const blur = useTransform(progress, range, [4, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.span style={{ opacity, filter }} className="inline-block mr-[0.25em]">
      {children}
    </motion.span>
  );
}

/** Words light up as you scroll */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

/** Soft veil that lifts as the image enters (pairs with the slow zoom in Parallax) */
export function Shutter({ delay = 0, play }: { slats?: number; delay?: number; play?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const show = play === undefined ? inView : play && inView;
  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2] bg-[var(--c-bg)]"
      initial={{ opacity: 1 }}
      animate={show ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1.6, ease: EASE, delay }}
    />
  );
}

export function Parallax({
  src,
  alt = "",
  className,
  speed = 8,
  scale = 1.12,
}: {
  src?: string;
  alt?: string;
  className?: string;
  speed?: number;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed}%`, `${speed}%`]);
  const z = useTransform(scrollYProgress, [0, 0.5], [scale + 0.12, scale]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y, scale: z }} className="absolute inset-0">
        <SafeImg src={src} alt={alt} className="h-full w-full object-cover" />
      </motion.div>
      <Shutter />
    </div>
  );
}

/** <img> with graceful gradient fallback */
export function SafeImg({ src, alt = "", className, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [err, setErr] = useState(false);
  if (err || !src)
    return (
      <div
        className={cn(className, "bg-gradient-to-br from-cream via-[#d9c6b4] to-accent/40")}
        role="img"
        aria-label={alt}
      />
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src as string} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setErr(true)} {...rest} />;
}

export function Counter({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 2.2, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      {v.toFixed(decimals)}
    </span>
  );
}

export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Luxury section label: thin gold rule + tracked caps */
export function SectionLabel({ index, children, light }: { index: string; children: ReactNode; light?: boolean }) {
  return (
    <div className={cn("wide flex items-center gap-4", light ? "text-cream/70" : "text-accent")}>
      <span className="h-px w-10 bg-accent/70" />
      <span>
        {index} — {children}
      </span>
    </div>
  );
}
