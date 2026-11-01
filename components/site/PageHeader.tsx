"use client";

import { motion } from "framer-motion";
import { useUI } from "@/lib/store";
import { EASE } from "@/components/motion";

/** Centred luxury page opener */
export default function PageHeader({ eyebrow, title, italic, intro }: { eyebrow: string; title: string; italic?: string; intro?: string }) {
  const play = useUI((s) => s.introDone);
  const f = (d: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(10px)" },
    animate: play ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1.3, ease: EASE, delay: d },
  });
  return (
    <header className="mx-auto max-w-[1100px] px-5 pb-14 pt-36 text-center md:pb-20 md:pt-44">
      <motion.div {...f(0.05)} className="wide flex items-center justify-center gap-4 text-accent">
        <span className="h-px w-10 bg-accent/70" />
        {eyebrow}
        <span className="h-px w-10 bg-accent/70" />
      </motion.div>
      <motion.h1 {...f(0.15)} className="display mt-6 text-[10vw] md:text-[5.2vw]">
        {title} {italic && <span className="gold-text font-[300]">{italic}</span>}
      </motion.h1>
      {intro && (
        <motion.p {...f(0.3)} className="mx-auto mt-6 max-w-xl text-[16px] leading-[1.8] text-ink/65">
          {intro}
        </motion.p>
      )}
    </header>
  );
}
