"use client";

import { motion } from "framer-motion";
import { useUI } from "@/lib/store";
import { EASE } from "@/components/motion";

export default function PageHeader({ eyebrow, title, italic, intro }: { eyebrow: string; title: string; italic?: string; intro?: string }) {
  const play = useUI((s) => s.introDone);
  return (
    <header className="mx-auto max-w-[1400px] px-5 pb-10 pt-32 md:px-10 md:pb-16 md:pt-44">
      <motion.div className="eyebrow text-soft" initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}>
        {eyebrow}
      </motion.div>
      <h1 className="display mt-5 text-[15vw] md:text-[8vw]">
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block" initial={{ y: "105%" }} animate={play ? { y: 0 } : {}} transition={{ duration: 1.2, ease: EASE, delay: 0.1 }}>
            {title} {italic && <em className="text-accent">{italic}</em>}
          </motion.span>
        </span>
      </h1>
      {intro && (
        <motion.p
          className="mt-6 max-w-xl text-lg text-soft"
          initial={{ opacity: 0, y: 16 }}
          animate={play ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.35 }}
        >
          {intro}
        </motion.p>
      )}
    </header>
  );
}
