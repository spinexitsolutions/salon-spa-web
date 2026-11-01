"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, Copy, Minus, Plus, Quote, Star, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, formatDate, formatPrice, todayISO, uid } from "@/lib/utils";
import { EASE, Magnetic, Reveal, SafeImg, SectionLabel, SplitText } from "@/components/motion";

/* ───────────── Team ───────────── */
export function Team() {
  const team = useStore((s) => s.team).filter((t) => t.published);
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionLabel index="04">The artists</SectionLabel>
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SplitText as="h2" text="Hands you'll trust." className="display text-[12vw] md:text-[6vw]" />
          <p className="max-w-sm text-soft">A small studio of specialists — each trained across continents, each obsessed with one craft.</p>
        </div>
      </div>
      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:grid md:snap-none md:grid-cols-5 md:gap-5 md:overflow-visible md:px-10 mx-auto max-w-[1400px]">
        {team.map((m, i) => (
          <Reveal key={m.id} delay={i * 0.07} className="w-[70vw] shrink-0 snap-start md:w-auto">
            <div className="group" data-cursor="Hello">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-soft">
                <SafeImg src={m.image} alt={m.name} className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                <div className="absolute inset-x-3 bottom-3 translate-y-3 rounded-[var(--radius)] bg-white/85 p-3 text-[12.5px] opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {m.bio}
                </div>
                <span className="eyebrow absolute right-3 top-3 rounded-[var(--radius)] bg-black/40 px-2.5 py-1 text-white backdrop-blur">{m.experience}</span>
              </div>
              <div className="mt-4">
                <div className="display text-3xl">{m.name}</div>
                <div className="text-sm text-soft">{m.role}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.specialties.split(",").map((t) => (
                    <span key={t} className="rounded-[var(--radius)] bg-soft px-2.5 py-1 text-[11px]">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Gallery + shared-layout lightbox ───────────── */
export function Gallery() {
  const items = useStore((s) => s.gallery).filter((g) => g.published);
  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const [cat, setCat] = useState("All");
  const [active, setActive] = useState<string | null>(null);
  const list = cat === "All" ? items : items.filter((i) => i.category === cat);
  const current = items.find((i) => i.id === active);

  useEffect(() => {
    if (active) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [active]);

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionLabel index="05">Gallery</SectionLabel>
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SplitText as="h2" text="Moments from the atelier." className="display mt-6 text-[12vw] md:text-[6vw]" />
          </div>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cn("shrink-0 rounded-[var(--radius)] border px-4 py-2 text-sm transition-all", cat === c ? "border-ink bg-ink text-bg" : "hairline hover:border-ink/40")}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="mt-12 columns-2 gap-3 md:columns-4 md:gap-5">
          <AnimatePresence>
            {list.map((g, i) => (
              <motion.button
                layout
                key={g.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7, ease: EASE, delay: (i % 4) * 0.05 }}
                onClick={() => setActive(g.id)}
                data-cursor="View"
                className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-[var(--radius)] md:mb-5"
              >
                <motion.div layoutId={`img-${g.id}`} className={cn("overflow-hidden", i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]")}>
                  <SafeImg src={g.image} alt={g.caption} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                </motion.div>
                <span className="absolute bottom-3 left-3 rounded-[var(--radius)] bg-white/80 px-3 py-1 text-[12px] opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">{g.caption}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {current && (
          <motion.div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-night/90 backdrop-blur-md" onClick={() => setActive(null)} />
            <motion.div layoutId={`img-${current.id}`} className="relative max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-[var(--radius)]">
              <SafeImg src={current.image.replace(/w=\d+/, "w=2000")} alt={current.caption} className="max-h-[85vh] w-full object-contain" />
            </motion.div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-cream">
              <div className="display text-3xl">{current.caption}</div>
              <div className="eyebrow mt-1 text-cream/50">{current.category}</div>
            </div>
            <button onClick={() => setActive(null)} className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-cream text-night" aria-label="Close">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ───────────── Memberships ───────────── */
export function Packages() {
  const packages = useStore((s) => s.packages).filter((p) => p.published);
  const currency = useStore((s) => s.settings.currency);
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-32">
      <div className="text-center">
        <div className="flex justify-center">
          <SectionLabel index="06">Memberships</SectionLabel>
        </div>
        <SplitText as="h2" text="Care, on a rhythm." className="display mx-auto mt-6 text-[12vw] md:text-[6vw]" />
        <p className="mx-auto mt-4 max-w-md text-soft">Monthly memberships that make self-care a habit — pause or cancel anytime.</p>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
        {packages.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "relative flex h-full flex-col rounded-[var(--radius)] p-7 md:p-9",
                p.highlighted ? "bg-night text-cream" : "border hairline bg-white/40"
              )}
            >
              {p.highlighted && <span className="eyebrow absolute right-6 top-6 rounded-[var(--radius)] bg-accent px-3 py-1.5 text-white">Most loved</span>}
              <div className="display text-4xl">{p.name}</div>
              <p className={cn("mt-1 text-sm", p.highlighted ? "text-cream/60" : "text-soft")}>{p.description}</p>
              <div className="mt-8 flex items-baseline gap-1">
                <span className="display text-6xl">{formatPrice(p.price, currency)}</span>
                <span className={cn("text-sm", p.highlighted ? "text-cream/50" : "text-soft")}>/{p.period}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-[14px]">
                {p.features.split("\n").filter(Boolean).map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius)]", p.highlighted ? "bg-accent text-white" : "bg-ink text-bg")}>
                      <Check size={11} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/contact?plan=${encodeURIComponent(p.name)}`}
                className={cn("mt-10 flex h-12 items-center justify-center gap-2 rounded-[var(--radius)] text-sm font-medium transition-transform active:scale-95", p.highlighted ? "bg-cream text-night" : "bg-ink text-bg")}
              >
                Join {p.name} <ArrowUpRight size={15} />
              </Link>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Testimonials ───────────── */
export function Testimonials() {
  const list = useStore((s) => s.testimonials).filter((t) => t.published);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (list.length < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % list.length), 7000);
    return () => clearTimeout(t);
  }, [i, list.length]);
  const t = list[i];
  if (!t) return null;
  return (
    <section data-nav="dark" className="relative overflow-hidden bg-night py-24 text-cream md:py-36">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <SectionLabel index="07" light>
          Kind words
        </SectionLabel>
        <Quote className="mt-10 text-accent" size={44} />
        <div className="relative mt-6 min-h-[280px] md:min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: EASE }}
              className="display text-[8.5vw] leading-[1.05] md:text-[3.6vw]"
            >
              “{t.quote}”
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <SafeImg src={t.image} alt={t.name} className="h-14 w-14 rounded-[var(--radius)] object-cover" />
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-cream/50">{t.role}</div>
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star key={k} size={12} className="fill-accent text-accent" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {list.map((x, k) => (
              <button key={x.id} onClick={() => setI(k)} className="relative h-1 w-12 overflow-hidden rounded-[var(--radius)] bg-cream/15" aria-label={`Testimonial ${k + 1}`}>
                {k === i && <motion.span className="absolute inset-y-0 left-0 bg-accent" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 7, ease: "linear" }} />}
                {k < i && <span className="absolute inset-0 bg-cream/50" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Offers ───────────── */
export function Offers() {
  const offers = useStore((s) => s.offers).filter((o) => o.published);
  const [copied, setCopied] = useState("");
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-32">
      <SectionLabel index="08">Offers</SectionLabel>
      <SplitText as="h2" text="Little reasons to visit." className="display mt-6 text-[12vw] md:text-[6vw]" />
      <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
        {offers.map((o, i) => (
          <Reveal key={o.id} delay={i * 0.08}>
            <div className="group relative overflow-hidden rounded-[var(--radius)] bg-ink text-cream">
              <div className="relative aspect-[4/3] overflow-hidden">
                <SafeImg src={o.image} alt="" className="h-full w-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute left-4 top-4 flex h-20 w-20 rotate-[-8deg] items-center justify-center rounded-[var(--radius)] bg-accent text-center font-serif text-2xl leading-none text-white">
                  {o.discount}
                  <br />
                  {o.discount.includes("%") || o.discount.includes("k") ? <span className="text-xs">off</span> : null}
                </div>
              </div>
              <div className="p-6">
                <div className="display text-3xl">{o.title}</div>
                <p className="mt-2 text-sm text-cream/60">{o.description}</p>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(o.code);
                      setCopied(o.code);
                      setTimeout(() => setCopied(""), 1600);
                    }}
                    className="flex items-center gap-2 rounded-[var(--radius)] border border-dashed border-cream/30 px-4 py-2 font-mono text-sm"
                  >
                    {copied === o.code ? <Check size={14} /> : <Copy size={14} />} {o.code}
                  </button>
                  <span className="text-xs text-cream/40">till {formatDate(o.validTill)}</span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Journal ───────────── */
export function Journal() {
  const posts = useStore((s) => s.posts).filter((p) => p.published).slice(0, 3);
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
      <SectionLabel index="09">Journal</SectionLabel>
      <div className="flex items-end justify-between gap-6">
        <div>
          <SplitText as="h2" text="Notes on beauty." className="display mt-6 text-[12vw] md:text-[6vw]" />
        </div>
        <Link href="/journal" className="wide hidden border-b border-ink pb-1 hover:text-accent md:block">
          All stories
        </Link>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <Link href={`/journal/${p.slug}`} className="group block" data-cursor="Read">
              <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
                <SafeImg src={p.image} alt="" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="eyebrow mt-5 flex gap-3 text-soft">
                <span className="text-accent">{p.category}</span>
                <span>{formatDate(p.date, { day: "numeric", month: "short", year: "numeric" })}</span>
                <span>{p.readTime}</span>
              </div>
              <h3 className="display mt-3 text-3xl transition-colors group-hover:text-accent md:text-4xl">{p.title}</h3>
              <p className="mt-2 text-sm text-soft">{p.excerpt}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── FAQ ───────────── */
export function Faq() {
  const faqs = useStore((s) => s.faqs).filter((f) => f.published);
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <section className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
      <div className="md:col-span-4">
        <SectionLabel index="10">FAQ</SectionLabel>
        <h2 className="display mt-6 text-[12vw] md:text-[4.5vw]">
          Good to <em className="text-accent">know</em>.
        </h2>
      </div>
      <div className="md:col-span-8">
        {faqs.map((f) => {
          const isOpen = open === f.id;
          return (
            <div key={f.id} className="border-b hairline">
              <button onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                <span className="display text-2xl md:text-3xl">{f.question}</span>
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] border hairline transition-all duration-500", isOpen && "rotate-180 bg-ink text-bg")}>
                  {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                    <p className="max-w-2xl pb-6 text-soft">{f.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────── Final CTA ───────────── */
export function Cta() {
  const settings = useStore((s) => s.settings);
  const upsert = useStore((s) => s.upsert);
  const gallery = useStore((s) => s.gallery);
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section className="px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative overflow-hidden rounded-[var(--radius)] bg-accent px-6 py-20 text-white md:px-16 md:py-32">
        <div className="absolute -right-20 -top-20 hidden h-[420px] w-[320px] rotate-6 overflow-hidden rounded-[999px] opacity-90 md:block">
          <SafeImg src={gallery[1]?.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative max-w-3xl">
          <div className="eyebrow text-white/70">Your ritual awaits</div>
          <SplitText as="h2" text="Take an hour. Leave luminous." className="display mt-6 text-[14vw] md:text-[7vw]" />
          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center">
            <Magnetic>
              <Link href="/book" className="flex h-14 items-center gap-2 rounded-[var(--radius)] bg-white px-8 text-[15px] font-medium text-ink">
                Book online <ArrowUpRight size={17} />
              </Link>
            </Magnetic>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!phone) return;
                upsert("leads", { id: uid("l"), type: "callback", name: "", email: "", phone, message: "Requested a callback from homepage", status: "new", createdAt: todayISO() });
                setSent(true);
                setPhone("");
              }}
              className="flex h-14 items-center rounded-[var(--radius)] border border-white/40 pl-5 pr-1.5"
            >
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={sent ? "We'll call you shortly ✓" : "Or request a callback"}
                className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/70"
              />
              <button className="h-11 rounded-[var(--radius)] bg-night px-5 text-sm">Call me</button>
            </form>
          </div>
          <p className="mt-6 text-sm text-white/70">
            Or call {settings.phone} · {settings.address}
          </p>
        </div>
      </div>
    </section>
  );
}
