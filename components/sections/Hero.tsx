"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Star } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { EASE, Magnetic, SafeImg } from "@/components/motion";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function Line({ children, delay, play, className }: { children: React.ReactNode; delay: number; play: boolean; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className={"block " + (className ?? "")}
        initial={{ y: "105%", rotate: 3 }}
        animate={play ? { y: "0%", rotate: 0 } : {}}
        transition={{ duration: 1.3, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const hero = useStore((s) => s.hero);
  const settings = useStore((s) => s.settings);
  const testimonials = useStore((s) => s.testimonials);
  const play = useUI((s) => s.introDone);
  const ref = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const f = () => setMobile(window.innerWidth < 768);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const t = useTransform(scrollYProgress, [0, 0.75], [0, 1], { clamp: true });
  const top = mobile ? 56 : 44;
  const side = mobile ? 4 : 22;
  const clipPath = useTransform(
    t,
    (v) => `inset(${lerp(top, 0, v)}% ${lerp(side, 0, v)}% ${lerp(mobile ? 3 : 5, 0, v)}% ${lerp(side, 0, v)}% round ${lerp(mobile ? 22 : 34, 0, v)}px)`
  );
  const scale = useTransform(t, [0, 1], [1.25, 1]);
  const headY = useTransform(scrollYProgress, [0, 0.4], ["0%", "-40%"]);
  const headO = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const revealO = useTransform(scrollYProgress, [0.6, 0.85], [0, 1]);
  const revealY = useTransform(scrollYProgress, [0.6, 0.85], [40, 0]);
  const ctaO = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section ref={ref} className="relative h-[250vh]" aria-label="Hero">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Headline */}
        <motion.div style={{ y: headY, opacity: headO }} className="relative z-10 mx-auto max-w-[1400px] px-5 pt-[150px] md:px-10 md:pt-[120px]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <motion.div
                className="eyebrow mb-4 text-soft md:mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={play ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, delay: 0.1 }}
              >
                {hero.eyebrow}
              </motion.div>
              <h1 className="display text-[15.5vw] md:text-[8.6vw] lg:text-[124px]">
                <Line play={play} delay={0.15}>
                  {hero.line1} <em className="text-accent">{hero.italic}</em>
                </Line>
                <Line play={play} delay={0.28}>
                  {hero.line2}
                </Line>
              </h1>
              <motion.p
                className="mt-4 max-w-[330px] text-[14px] leading-relaxed text-soft lg:hidden"
                initial={{ opacity: 0 }}
                animate={play ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.6 }}
              >
                {hero.subtitle}
              </motion.p>
            </div>
            <motion.div
              className="hidden max-w-[300px] pt-14 lg:block"
              initial={{ opacity: 0, y: 20 }}
              animate={play ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, ease: EASE, delay: 0.6 }}
            >
              <p className="text-[15px] leading-relaxed text-soft">{hero.subtitle}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {testimonials.slice(0, 3).map((t) => (
                    <SafeImg key={t.id} src={t.image} alt="" className="h-8 w-8 rounded-full border-2 border-bg object-cover" />
                  ))}
                </div>
                <div className="text-[12.5px] leading-tight">
                  <div className="flex items-center gap-1 font-medium">
                    <Star size={12} className="fill-accent text-accent" /> {settings.rating} rating
                  </div>
                  <div className="text-soft">{settings.reviewsCount} reviews</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Expanding image */}
        <motion.div
          className="absolute inset-0"
          style={{ clipPath }}
          initial={{ opacity: 0 }}
          animate={play ? { opacity: 1 } : {}}
          transition={{ duration: 1.4, ease: EASE, delay: 0.35 }}
          data-cursor="Scroll"
        >
          <motion.div className="absolute inset-0" style={{ scale }}>
            <SafeImg src={hero.image} alt="Salon interior" className="h-full w-full object-cover" loading="eager" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
          <motion.div style={{ opacity: revealO, y: revealY }} className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12" data-nav="dark">
            <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 className="display text-[13vw] md:text-[7vw]">{hero.revealTitle}</h2>
              <Link href="/book" className="flex h-14 w-fit items-center gap-2 rounded-full bg-white px-7 text-[15px] font-medium text-ink">
                {hero.ctaPrimary} <ArrowUpRight size={18} />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* CTAs over image (initial state) */}
        <motion.div
          style={{ opacity: ctaO }}
          className="absolute inset-x-0 bottom-[7%] z-20 flex flex-wrap items-center justify-center gap-3 px-5 md:bottom-[9%]"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={play ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.9, duration: 1, ease: EASE }}>
            <Magnetic>
              <Link href="/book" className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-medium text-ink shadow-xl md:h-14 md:px-7">
                {hero.ctaPrimary} <ArrowUpRight size={16} />
              </Link>
            </Magnetic>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={play ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1, duration: 1, ease: EASE }}>
            <Link href="/services" className="flex h-12 items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 text-[14px] font-medium text-white backdrop-blur-md md:h-14 md:px-7">
              {hero.ctaSecondary}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: ctaO }}
          className="eyebrow absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-white/80 md:flex"
        >
          <motion.span animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ArrowDown size={12} />
          </motion.span>
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
