"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { cn, openStatus } from "@/lib/utils";
import { EASE } from "@/components/motion";

const LINKS = [
  { href: "/", label: "Home", imgKey: 0 },
  { href: "/services", label: "Services", imgKey: 1 },
  { href: "/#rituals", label: "Rituals", imgKey: 2 },
  { href: "/book", label: "Book", imgKey: 3 },
  { href: "/gift-cards", label: "Gift cards", imgKey: 4 },
  { href: "/journal", label: "Journal", imgKey: 5 },
  { href: "/contact", label: "Contact", imgKey: 6 },
];

declare global {
  interface Window {
    __lenis?: { stop: () => void; start: () => void; scrollTo: (t: number | string | HTMLElement, o?: object) => void };
  }
}

export default function Navbar() {
  const settings = useStore((s) => s.settings);
  const gallery = useStore((s) => s.gallery);
  const announcement = useStore((s) => s.announcement);
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const introDone = useUI((s) => s.introDone);
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hover, setHover] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState({ open: true, label: "" });

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    setStatus(openStatus(settings.hours));
    const t = setInterval(() => setStatus(openStatus(settings.hours)), 60000);
    return () => clearInterval(t);
  }, [settings.hours]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setAtTop(y < 40);
    setCompact(y > 160 && y > prev);
    // detect dark sections under the island
    const els = document.elementsFromPoint(window.innerWidth / 2, 36);
    setDark(els.some((el) => (el as HTMLElement).closest?.("[data-nav='dark']")));
  });

  useEffect(() => setOpen(false), [pathname, setOpen]);

  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const images = useMemo(() => gallery.filter((g) => g.published).map((g) => g.image), [gallery]);
  const tone = dark && !open ? "dark" : "light";
  const mark = settings.brandName.charAt(0);

  return (
    <>
      {/* scrim */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[98] bg-night/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-[99] flex flex-col items-center px-3 pt-[max(12px,env(safe-area-inset-top))] md:pt-4"
        initial={{ y: -120, opacity: 0 }}
        animate={introDone ? { y: 0, opacity: 1 } : { y: -120, opacity: 0 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.25 }}
      >
        <motion.nav
          layout
          transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.9 }}
          style={{ borderRadius: open ? 30 : 999 }}
          className={cn(
            "pointer-events-auto relative overflow-hidden border shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)]",
            open ? "border-black/[0.06] bg-bg text-ink" : tone === "dark" ? "glass-dark border-white/10 text-cream" : "glass border-black/[0.06] text-ink",
            open ? "w-full max-w-[1040px]" : "w-auto"
          )}
          aria-label="Main"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!open ? (
              <motion.div
                key="pill"
                layout="position"
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.35 }}
                className="flex h-[54px] items-center gap-1 pl-[7px] pr-[7px]"
              >
                <Link href="/" className="flex items-center gap-2.5 pr-2" aria-label="Home">
                  <Mark letter={mark} progress={progress} tone={tone} />
                  <AnimatePresence initial={false}>
                    {!compact && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="overflow-hidden whitespace-nowrap font-serif text-[22px] leading-none"
                      >
                        {settings.brandName}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                <span className={cn("mx-1 hidden h-5 w-px md:block", tone === "dark" ? "bg-white/15" : "bg-black/10")} />

                <div className="hidden items-center gap-2 px-2 text-[12.5px] md:flex">
                  <span className="relative flex h-2 w-2">
                    {status.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
                    <span className={cn("relative inline-flex h-2 w-2 rounded-full", status.open ? "bg-emerald-500" : "bg-rose-400")} />
                  </span>
                  <span className="opacity-70">{status.label}</span>
                </div>

                <button
                  onClick={() => setOpen(true)}
                  className={cn(
                    "group flex h-10 items-center gap-2.5 rounded-full px-4 text-[13px] font-medium transition-colors",
                    tone === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"
                  )}
                  aria-expanded={open}
                >
                  <span className="flex w-4 flex-col gap-[4px]">
                    <span className="h-[1.5px] w-full rounded bg-current transition-transform duration-500 group-hover:translate-x-0.5" />
                    <span className="h-[1.5px] w-2/3 rounded bg-current transition-all duration-500 group-hover:w-full" />
                  </span>
                  Menu
                </button>
                <Link
                  href="/book"
                  className="flex h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-[13px] font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Book <ArrowUpRight size={14} />
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.4 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="flex max-h-[calc(100dvh-24px)] flex-col overflow-y-auto p-4 md:p-6"
                data-lenis-prevent
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mark letter={mark} progress={progress} tone="light" />
                    <div>
                      <div className="font-serif text-2xl leading-none">{settings.brandName}</div>
                      <div className="eyebrow mt-1 text-soft">{settings.brandSuffix}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bg transition-transform hover:rotate-90"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-[1.25fr_1fr] md:gap-10">
                  <ul className="flex flex-col">
                    {LINKS.map((l, i) => (
                      <motion.li
                        key={l.href}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05, duration: 0.7, ease: EASE }}
                        onMouseEnter={() => setHover(i)}
                        className="border-b hairline last:border-b-0"
                      >
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-baseline gap-4 py-2.5 md:py-3"
                        >
                          <span className="eyebrow w-6 text-accent">{String(i + 1).padStart(2, "0")}</span>
                          <span
                            className={cn(
                              "display text-[44px] transition-all duration-500 md:text-[58px]",
                              (pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href))) && "text-accent",
                              "group-hover:translate-x-2"
                            )}
                          >
                            {l.label}
                          </span>
                          <ArrowUpRight className="ml-auto self-center opacity-0 transition-all duration-500 group-hover:opacity-100" size={22} />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="relative hidden overflow-hidden rounded-[22px] bg-soft md:block">
                    <AnimatePresence mode="popLayout">
                      <motion.img
                        key={hover}
                        src={images[LINKS[hover].imgKey % Math.max(images.length, 1)]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        initial={{ opacity: 0, scale: 1.12, clipPath: "inset(100% 0 0 0)" }}
                        animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0 0 0)" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: EASE }}
                      />
                    </AnimatePresence>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 text-white">
                      <div className="eyebrow opacity-70">Now viewing</div>
                      <div className="display text-4xl">{LINKS[hover].label}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 border-t hairline pt-5 text-sm md:grid-cols-3">
                  <div>
                    <div className="eyebrow text-soft">Visit</div>
                    <div className="mt-1">{settings.address}</div>
                    <div className="text-soft">{settings.city}</div>
                  </div>
                  <div>
                    <div className="eyebrow text-soft">Talk</div>
                    <a href={`tel:${settings.phone}`} className="link-underline mt-1 block">{settings.phone}</a>
                    <a href={`mailto:${settings.email}`} className="link-underline text-soft">{settings.email}</a>
                  </div>
                  <div className="flex items-end md:justify-end">
                    <Link
                      href="/book"
                      onClick={() => setOpen(false)}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-bg md:w-auto"
                    >
                      Reserve your ritual <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Dynamic-island style notification */}
        <AnimatePresence>
          {announcement.enabled && !dismissed && atTop && !open && introDone && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.92 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
              className="pointer-events-auto mt-2 flex max-w-[92vw] items-center gap-2 rounded-full bg-ink py-1.5 pl-3 pr-1.5 text-[12px] text-bg shadow-lg"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="truncate">{announcement.text}</span>
              {announcement.link && (
                <Link href={announcement.link} className="shrink-0 rounded-full bg-bg/15 px-2.5 py-1 font-medium hover:bg-bg/25">
                  {announcement.linkLabel || "View"}
                </Link>
              )}
              <button onClick={() => setDismissed(true)} className="shrink-0 rounded-full p-1 opacity-60 hover:opacity-100" aria-label="Dismiss">
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

function Mark({ letter, progress, tone }: { letter: string; progress: ReturnType<typeof useSpring>; tone: string }) {
  return (
    <span className="relative flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle cx="20" cy="20" r="18.5" fill="none" strokeWidth="1.5" className={tone === "dark" ? "stroke-white/15" : "stroke-black/10"} />
        <motion.circle
          cx="20"
          cy="20"
          r="18.5"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="stroke-accent"
          style={{ pathLength: progress }}
        />
      </svg>
      <span className={cn("flex h-[30px] w-[30px] items-center justify-center rounded-full font-serif text-[19px] leading-none", tone === "dark" ? "bg-cream text-night" : "bg-ink text-bg")}>
        {letter}
      </span>
    </span>
  );
}
