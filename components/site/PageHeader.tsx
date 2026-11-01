"use client";

import { motion } from "framer-motion";
import { useUI } from "@/lib/store";
import { EASE } from "@/components/motion";

/** Editorial page opener: rule + meta, then a condensed headline that squeezes into place */
export default function PageHeader({ eyebrow, title, italic, intro }: { eyebrow: string; title: string; italic?: string; intro?: string }) {
  const play = useUI((s) => s.introDone);
  return (
    <header className="mx-auto max-w-[1400px] px-5 pb-10 pt-6 md:px-10 md:pb-14 md:pt-8">
      <motion.div className="wide flex justify-between border-b border-ink/25 pb-2 text-ink/65" initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}>
        <span>{eyebrow}</span>
        <span className="text-accent">§</span>
      </motion.div>
      <h1
        className="display mt-5 text-[17vw] transition-[font-variation-settings] duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] md:text-[9vw]"
        style={{ ["--wdth" as string]: play ? 62 : 125 }}
      >
        <span className="block overflow-hidden pb-[0.04em]">
          <motion.span className="block" initial={{ y: "100%" }} animate={play ? { y: 0 } : {}} transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}>
            {title} {italic && <span className="text-accent">{italic}</span>}
          </motion.span>
        </span>
      </h1>
      {intro && (
        <motion.p
          className="mt-6 max-w-xl border-l-2 border-accent pl-4 text-[17px] leading-relaxed text-ink/70"
          initial={{ opacity: 0 }}
          animate={play ? { opacity: 1 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.5 }}
        >
          {intro}
        </motion.p>
      )}
    </header>
  );
}
