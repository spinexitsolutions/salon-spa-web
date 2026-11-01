"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarPlus, Home, LayoutGrid, Scissors, X } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { cn, formatTime, openStatus, weekdayIndex } from "@/lib/utils";
import { EASE } from "@/components/motion";

const LINKS = [
  { href: "/", label: "Home", page: "01" },
  { href: "/services", label: "Services", page: "02" },
  { href: "/#rituals", label: "Rituals", page: "03" },
  { href: "/book", label: "Book", page: "04" },
  { href: "/gift-cards", label: "Gift cards", page: "05" },
  { href: "/journal", label: "Journal", page: "06" },
  { href: "/contact", label: "Contact", page: "07" },
];

declare global {
  interface Window {
    __lenis?: { stop: () => void; start: () => void; scrollTo: (t: number | string | HTMLElement, o?: object) => void };
  }
}

function useClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => {
      const d = new Date();
      setT(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    f();
    const i = setInterval(f, 15000);
    return () => clearInterval(i);
  }, []);
  return t;
}

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));

export default function Navbar() {
  const settings = useStore((s) => s.settings);
  const gallery = useStore((s) => s.gallery);
  const announcement = useStore((s) => s.announcement);
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const introDone = useUI((s) => s.introDone);
  const pathname = usePathname();
  const clock = useClock();
  const [status, setStatus] = useState({ open: true, label: "" });
  const [dismissed, setDismissed] = useState(false);
  const [hover, setHover] = useState(0);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    setStatus(openStatus(settings.hours));
    const t = setInterval(() => setStatus(openStatus(settings.hours)), 60000);
    return () => clearInterval(t);
  }, [settings.hours]);
  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const images = useMemo(() => gallery.filter((g) => g.published).map((g) => g.image), [gallery]);
  const [today, setToday] = useState<(typeof settings.hours)[number] | undefined>();
  useEffect(() => setToday(settings.hours[weekdayIndex(new Date())]), [settings.hours]);

  return (
    <>
      {/* ───────── desktop: vertical rail ───────── */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-[99] hidden w-[76px] flex-col items-center justify-between border-r border-ink/15 bg-bg py-5 md:flex"
        initial={{ x: -80 }}
        animate={introDone ? { x: 0 } : { x: -80 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <Link href="/" aria-label="Home" className="flex flex-col items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center bg-ink font-serif text-[22px] text-bg">{settings.brandName.charAt(0)}</span>
        </Link>

        <nav className="flex flex-col items-center gap-6" aria-label="Main">
          {LINKS.slice(1, 6).map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link key={l.href} href={l.href} className={cn("group relative flex items-center", active ? "text-accent" : "text-ink/60 hover:text-ink")}>
                <span className="wide rotate-180 py-1 text-[10px] [writing-mode:vertical-rl]">{l.label}</span>
                {active && <motion.span layoutId="rail-dot" className="absolute -right-[19px] h-full w-[3px] bg-accent" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-[3px] overflow-hidden bg-ink/10" aria-hidden>
            <motion.div className="absolute inset-0 origin-top bg-accent" style={{ scaleY: progress }} />
          </div>
          <div className="text-center">
            <div className="font-serif text-[20px] leading-none tabular-nums">{clock || "--:--"}</div>
            <div className="mt-1.5 flex items-center justify-center gap-1">
              <span className={cn("h-1.5 w-1.5", status.open ? "bg-emerald-500" : "bg-rose-500")} />
              <span className="wide text-[8.5px] text-ink/60">{status.open ? "Open" : "Closed"}</span>
            </div>
          </div>
          <button onClick={() => setOpen(true)} aria-label="Open index" className="flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:bg-ink hover:text-bg">
            <LayoutGrid size={17} />
          </button>
          <Link href="/book" className="flex h-24 w-11 items-center justify-center bg-accent text-white transition-[height] duration-500 hover:h-28">
            <span className="wide rotate-180 text-[10px] [writing-mode:vertical-rl]">Book now</span>
          </Link>
        </div>
      </motion.aside>

      {/* ───────── top strip (in document flow) ───────── */}
      <div className="md:pl-[76px]">
        <AnimatePresence initial={false}>
          {announcement.enabled && !dismissed && (
            <motion.div exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-accent text-white">
              <div className="wide flex h-9 items-center justify-between gap-3 px-4 md:px-8">
                <span className="truncate">✦ {announcement.text}</span>
                <span className="flex shrink-0 items-center gap-3">
                  {announcement.link && (
                    <Link href={announcement.link} className="underline underline-offset-4">
                      {announcement.linkLabel || "View"}
                    </Link>
                  )}
                  <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
                    <X size={13} />
                  </button>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between border-b border-ink/15 px-4 py-3 md:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center bg-ink font-serif text-[18px] text-bg">{settings.brandName.charAt(0)}</span>
            <span className="font-serif text-[22px] leading-none">{settings.brandName}</span>
          </Link>
          <div className="text-right">
            <div className="font-serif text-[18px] leading-none tabular-nums">{clock}</div>
            <div className="wide mt-1 flex items-center justify-end gap-1 text-[8.5px] text-ink/60">
              <span className={cn("h-1.5 w-1.5", status.open ? "bg-emerald-500" : "bg-rose-500")} />
              {status.label}
            </div>
          </div>
        </div>
      </div>

      {/* ───────── mobile: bottom tab bar ───────── */}
      <motion.nav
        className="fixed inset-x-0 bottom-0 z-[99] border-t border-ink/15 bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        initial={{ y: 100 }}
        animate={introDone ? { y: 0 } : { y: 100 }}
        transition={{ duration: 0.8, ease: EASE }}
        aria-label="Tabs"
      >
        <div className="grid h-[62px] grid-cols-5">
          {[
            { href: "/", label: "Home", icon: Home },
            { href: "/services", label: "Menu", icon: Scissors },
            { href: "/book", label: "Book", icon: CalendarPlus, primary: true },
            { href: "/journal", label: "Journal", icon: BookOpen },
          ].map((t) =>
            t.primary ? (
              <Link key={t.href} href={t.href} className="relative flex items-center justify-center">
                <span className="-mt-7 flex h-[58px] w-[58px] flex-col items-center justify-center gap-0.5 bg-accent text-white shadow-[0_10px_24px_-10px_var(--c-accent)]">
                  <t.icon size={19} />
                  <span className="wide text-[8px]">{t.label}</span>
                </span>
              </Link>
            ) : (
              <Link key={t.href} href={t.href} className={cn("flex flex-col items-center justify-center gap-1", isActive(pathname, t.href) ? "text-accent" : "text-ink/55")}>
                <t.icon size={19} strokeWidth={1.8} />
                <span className="wide text-[8px]">{t.label}</span>
              </Link>
            )
          )}
          <button onClick={() => setOpen(true)} className="flex flex-col items-center justify-center gap-1 text-ink/55">
            <LayoutGrid size={19} strokeWidth={1.8} />
            <span className="wide text-[8px]">Index</span>
          </button>
        </div>
      </motion.nav>

      {/* ───────── Index (table of contents) ───────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[150] overflow-y-auto bg-night text-cream"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={{ clipPath: "inset(0 0 0 100%)" }}
            transition={{ duration: 0.8, ease: EASE }}
            data-lenis-prevent
          >
            <div className="mx-auto flex min-h-full max-w-[1400px] flex-col px-4 pb-24 pt-4 md:px-10 md:pb-10 md:pl-[116px]">
              <div className="wide flex items-center justify-between border-b border-cream/20 pb-3 text-cream/60">
                <span>{settings.brandName} — Index</span>
                <span className="hidden md:block">{today ? (today.closed ? "Closed today" : `Today ${formatTime(today.open)} – ${formatTime(today.close)}`) : ""}</span>
                <button onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center border border-cream/25 text-cream hover:bg-cream hover:text-night" aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <div className="grid flex-1 gap-10 pt-6 md:grid-cols-[1.5fr_1fr] md:gap-14">
                <ul>
                  {LINKS.map((l, i) => (
                    <motion.li
                      key={l.href}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.05, duration: 0.7, ease: EASE }}
                      onMouseEnter={() => setHover(i)}
                    >
                      <Link href={l.href} onClick={() => setOpen(false)} className="group flex items-baseline gap-3 border-b border-cream/10 py-1.5">
                        <span
                          className={cn("display text-[15vw] transition-all duration-500 md:text-[6.2vw]", isActive(pathname, l.href) ? "text-accent" : "group-hover:text-accent")}
                          style={{ ["--wdth" as string]: hover === i ? 100 : 62 }}
                        >
                          {l.label}
                        </span>
                        <span className="leaders" />
                        <span className="wide text-cream/50">p. {l.page}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <div className="flex flex-col gap-6">
                  <div className="relative hidden aspect-[4/5] overflow-hidden md:block">
                    <AnimatePresence mode="popLayout">
                      <motion.img
                        key={hover}
                        src={images[hover % Math.max(images.length, 1)]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        initial={{ clipPath: "inset(0 0 100% 0)" }}
                        animate={{ clipPath: "inset(0 0 0% 0)" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: EASE }}
                      />
                    </AnimatePresence>
                    <span className="wide absolute bottom-3 left-3 bg-night px-2 py-1 text-cream">Fig. {hover + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[14px] text-cream/80">
                    <div>
                      <div className="wide mb-2 text-cream/45">Visit</div>
                      {settings.address}
                      <br />
                      {settings.city}
                    </div>
                    <div>
                      <div className="wide mb-2 text-cream/45">Call</div>
                      <a href={`tel:${settings.phone}`} className="block hover:text-cream">
                        {settings.phone}
                      </a>
                      <a href={`mailto:${settings.email}`} className="block break-all hover:text-cream">
                        {settings.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
