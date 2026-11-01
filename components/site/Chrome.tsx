"use client";

import Lenis from "lenis";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { EASE } from "@/components/motion";

export function SmoothScroll() {
  const enabled = useStore((s) => s.theme.smoothScroll);
  const pathname = usePathname();
  useEffect(() => {
    if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: { offset: -80 } });
    window.__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [enabled]);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => (window.__lenis ? window.__lenis.scrollTo(el as HTMLElement) : el.scrollIntoView()), 300);
      return;
    }
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Custom blend cursor (desktop only) */
export function Cursor() {
  const enabled = useStore((s) => s.theme.cursor);
  const [fine, setFine] = useState(false);
  const [label, setLabel] = useState("");
  const [hover, setHover] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches && enabled);
  }, [enabled]);

  useEffect(() => {
    if (!fine) return;
    document.body.classList.add("cursor-none-fine");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement;
      const c = t.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(c?.dataset.cursor ?? "");
      setHover(!!t.closest?.("a,button,[role=button],input,select,textarea,label"));
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      document.body.classList.remove("cursor-none-fine");
    };
  }, [fine, x, y]);

  if (!fine) return null;
  const size = label ? 88 : hover ? 44 : 12;
  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[300] flex items-center justify-center rounded-[var(--radius)] text-[10px] font-medium uppercase tracking-[0.18em] text-white border-solid border-white"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%", mixBlendMode: label ? "normal" : "difference" }}
      animate={{
        width: size,
        height: size,
        backgroundColor: label ? "var(--c-accent)" : hover ? "rgba(255,255,255,0)" : "rgba(255,255,255,1)",
        borderWidth: hover && !label ? 1 : 0,
      }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {label}
    </motion.div>
  );
}

export function WhatsAppFab() {
  const wa = useStore((s) => s.settings.whatsapp);
  const introDone = useUI((s) => s.introDone);
  const [tip, setTip] = useState(false);
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 700);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    if (!introDone) return;
    const a = setTimeout(() => setTip(false), 4000);
    const b = setTimeout(() => setTip(false), 11000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [introDone]);
  if (!wa || path === "/book") return null;
  const visible = introDone && (path !== "/" || scrolled);
  return (
    <div className="fixed bottom-5 right-4 z-[95] flex items-center gap-2 md:bottom-6 md:right-6">
      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10 }}
            className="glass hidden rounded-[var(--radius)] border border-black/5 px-3.5 py-2 text-[13px] shadow-lg md:block"
          >
            Questions? Chat with us ✨
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi! I'd like to book an appointment.")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ scale: 0 }}
        animate={visible ? { scale: 1 } : { scale: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)]"
      >
        <MessageCircle size={24} fill="currentColor" strokeWidth={1.5} />
      </motion.a>
    </div>
  );
}
