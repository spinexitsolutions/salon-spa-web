"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { cn, formatTime, openStatus } from "@/lib/utils";
import { EASE } from "@/components/motion";

const LEFT = [
  { href: "/services", label: "Services" },
  { href: "/#rituals", label: "Rituals" },
  { href: "/gift-cards", label: "Gift cards" },
];
const RIGHT = [{ href: "/journal", label: "Journal" }, { href: "/contact", label: "Contact" }];
const ALL = [{ href: "/", label: "Home" }, ...LEFT, { href: "/book", label: "Book appointment" }, ...RIGHT];

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
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [status, setStatus] = useState({ open: true, label: "" });
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 300 && y > prev + 2);
    if (y < prev - 2) setHidden(false);
  });

  useEffect(() => {
    setStatus(openStatus(settings.hours));
  }, [settings.hours]);
  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const heroImg = useStore((s) => s.hero.image);
  const bg = heroImg || gallery.find((g) => g.published)?.image;
  const linkCls = (href: string) =>
    cn("wide relative py-2 transition-colors duration-500 hover:text-accent", pathname === href || (href !== "/" && !href.includes("#") && pathname.startsWith(href)) ? "text-accent" : "text-[#F3EDE3]/85");

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[99]"
        initial={{ y: -120, opacity: 0 }}
        animate={introDone ? { y: hidden && !open ? -120 : 0, opacity: 1 } : { y: -120, opacity: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <AnimatePresence initial={false}>
          {announcement.enabled && !scrolled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 34, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="wide flex items-center justify-center gap-3 overflow-hidden border-b border-white/10 px-4 text-[10px] text-accent"
            >
              <span className="truncate">{announcement.text}</span>
              {announcement.link && (
                <Link href={announcement.link} className="hidden shrink-0 text-[#F3EDE3] underline decoration-accent underline-offset-4 sm:inline">
                  {announcement.linkLabel || "View"}
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn("transition-all duration-700", scrolled ? "border-b border-white/[0.06] bg-[#0B0B0B]/80 backdrop-blur-xl" : "bg-transparent")}>
          <div className={cn("mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-5 transition-all duration-700 md:px-10", scrolled ? "h-[68px]" : "h-[88px]")}>
            {/* left */}
            <div className="flex items-center gap-8">
              <button onClick={() => setOpen(true)} className="group flex items-center gap-3 text-[#F3EDE3]" aria-label="Open menu">
                <span className="flex w-7 flex-col gap-[6px]">
                  <span className="h-px w-full bg-current transition-all duration-500 group-hover:w-1/2" />
                  <span className="h-px w-2/3 bg-accent transition-all duration-500 group-hover:w-full" />
                </span>
                <span className="wide hidden md:inline">Menu</span>
              </button>
              <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
                {LEFT.map((l) => (
                  <Link key={l.href} href={l.href} className={linkCls(l.href)}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* centre logo */}
            <Link href="/" className="flex flex-col items-center text-center text-[#F3EDE3]" aria-label="Home">
              <span className={cn("font-serif leading-none tracking-[0.42em] transition-all duration-700", scrolled ? "text-[20px]" : "text-[24px] md:text-[28px]")} style={{ marginRight: "-0.42em" }}>
                {settings.brandName}
              </span>
              <span className={cn("wide mt-1.5 text-[8.5px] tracking-[0.5em] text-accent transition-all duration-700", scrolled && "h-0 opacity-0")}>Salon · Spa</span>
            </Link>

            {/* right */}
            <div className="flex items-center justify-end gap-7">
              <nav className="hidden items-center gap-7 lg:flex" aria-label="Secondary">
                {RIGHT.map((l) => (
                  <Link key={l.href} href={l.href} className={linkCls(l.href)}>
                    {l.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/book"
                className="wide group relative overflow-hidden border border-accent px-4 py-2.5 text-[10px] text-accent transition-colors duration-500 hover:text-[#0E0E0E] md:px-6 md:py-3"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
                <span className="relative">Book</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[150] overflow-y-auto bg-[#0A0A0A] text-[#F3EDE3]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={{ duration: 0.6 }}
            data-lenis-prevent
          >
            {bg && (
              <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "easeOut" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bg} alt="" className="h-full w-full object-cover opacity-[0.12]" />
              </motion.div>
            )}
            <div className="relative flex min-h-full flex-col">
              <div className="mx-auto flex h-[88px] w-full max-w-[1440px] items-center justify-between px-5 md:px-10">
                <span className="wide text-accent">Menu</span>
                <span className="font-serif text-[24px] tracking-[0.42em]" style={{ marginRight: "-0.42em" }}>
                  {settings.brandName}
                </span>
                <button onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center border border-white/15 transition-colors hover:border-accent hover:text-accent" aria-label="Close menu">
                  <X size={18} strokeWidth={1.2} />
                </button>
              </div>

              <nav className="flex flex-1 flex-col items-center justify-center gap-1 py-10 md:gap-2">
                {ALL.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.06 }}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="group flex items-center gap-4 py-1.5">
                      <span className="wide w-6 text-right text-[10px] text-accent/70">0{i + 1}</span>
                      <span className="display text-[34px] text-[#F3EDE3] transition-all duration-500 group-hover:tracking-[0.12em] group-hover:text-accent md:text-[54px]">{l.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                className="mx-auto grid w-full max-w-[1100px] gap-6 border-t border-white/10 px-5 py-8 text-center text-[13px] text-[#F3EDE3]/65 md:grid-cols-3 md:px-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <div>
                  <div className="wide mb-2 text-accent">Visit</div>
                  {settings.address}, {settings.city}
                </div>
                <div>
                  <div className="wide mb-2 text-accent">Reserve</div>
                  <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-2 hover:text-accent">
                    <Phone size={13} strokeWidth={1.4} /> {settings.phone}
                  </a>
                </div>
                <div>
                  <div className="wide mb-2 text-accent">Today</div>
                  {status.label || `${formatTime(settings.hours[0]?.open)} – ${formatTime(settings.hours[0]?.close)}`}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
