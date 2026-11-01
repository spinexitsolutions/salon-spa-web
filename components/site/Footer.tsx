"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTime, uid, todayISO } from "@/lib/utils";

export function SocialIcon({ name, size = 18 }: { name: "instagram" | "facebook" | "youtube"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6 };
  if (name === "instagram")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    );
  if (name === "facebook")
    return (
      <svg {...common}>
        <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" />
    </svg>
  );
}

export default function Footer() {
  const s = useStore((st) => st.settings);
  const upsert = useStore((st) => st.upsert);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer ref={ref} data-nav="dark" className="relative overflow-hidden bg-night text-cream">
      <div className="mx-auto max-w-[1400px] px-5 pb-6 pt-20 md:px-10 md:pt-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="display text-4xl md:text-6xl">
              Stay in the <em className="text-accent">glow</em>.
            </p>
            <p className="mt-4 max-w-sm text-cream/60">Monthly rituals, early access to offers and journal notes. No noise — promise.</p>
            <form
              className="mt-6 flex max-w-md items-center gap-2 rounded-[var(--radius)] border border-white/15 p-1.5 pl-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                upsert("leads", { id: uid("l"), type: "newsletter", name: "", email, phone: "", message: "Footer signup", status: "new", createdAt: todayISO() });
                setDone(true);
                setEmail("");
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={done ? "You're on the list ✓" : "Your email"}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-cream/40"
              />
              <button className="flex h-10 items-center gap-1 rounded-[var(--radius)] bg-cream px-4 text-sm font-medium text-night">
                Join <ArrowUpRight size={14} />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm md:col-span-7 md:grid-cols-3">
            <div>
              <div className="eyebrow mb-4 text-cream/40">Explore</div>
              <ul className="space-y-2.5">
                {[
                  ["Services", "/services"],
                  ["Book online", "/book"],
                  ["Gift cards", "/gift-cards"],
                  ["Journal", "/journal"],
                  ["Contact", "/contact"],
                ].map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="link-underline text-cream/80 hover:text-cream">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-4 text-cream/40">Hours</div>
              <ul className="space-y-1.5 text-cream/80">
                {s.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-3">
                    <span className="text-cream/50">{h.day.slice(0, 3)}</span>
                    <span>{h.closed ? "Closed" : `${formatTime(h.open)} – ${formatTime(h.close)}`}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="eyebrow mb-4 text-cream/40">Visit</div>
              <p className="text-cream/80">
                {s.address}
                <br />
                {s.city}
              </p>
              <a href={`tel:${s.phone}`} className="mt-3 block text-cream/80 hover:text-cream">
                {s.phone}
              </a>
              <a href={`mailto:${s.email}`} className="block text-cream/80 hover:text-cream">
                {s.email}
              </a>
              <div className="mt-4 flex gap-2">
                {(["instagram", "facebook", "youtube"] as const).map((n) =>
                  s[n] ? (
                    <a key={n} href={s[n]} target="_blank" rel="noreferrer" aria-label={n} className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-white/15 transition-colors hover:bg-cream hover:text-night">
                      <SocialIcon name={n} />
                    </a>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <motion.div style={{ y, paddingTop: "0.18em" }} className="display select-none whitespace-nowrap text-center text-[27vw] leading-[0.8] text-cream/[0.95]">
          {s.brandName}
        </motion.div>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 border-t border-white/10 px-5 py-5 text-xs text-cream/45 md:flex-row md:items-center md:px-10">
        <span>
          © {new Date().getFullYear()} {s.brandName} {s.brandSuffix}. All rights reserved.
        </span>
        <div className="flex items-center gap-5">
          <Link href="/admin" className="hover:text-cream">Admin</Link>
          <button onClick={() => (window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))} className="flex items-center gap-1 hover:text-cream">
            Back to top <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
