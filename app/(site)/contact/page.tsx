"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Check, Mail, MapPin, Phone, Send } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTime, todayISO, uid, weekdayIndex } from "@/lib/utils";
import PageHeader from "@/components/site/PageHeader";
import Field from "@/components/site/Field";
import { EASE, Reveal } from "@/components/motion";

function ContactForm() {
  const params = useSearchParams();
  const upsert = useStore((s) => s.upsert);
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const plan = params.get("plan");
    if (plan) setF((x) => ({ ...x, message: `I'd like to join the ${plan} membership.` }));
  }, [params]);

  if (sent)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: EASE, duration: 0.7 }} className="flex flex-col items-start rounded-[var(--radius)] bg-night p-8 text-cream">
        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-accent">
          <Check />
        </span>
        <h3 className="display mt-6 text-5xl">Thank you.</h3>
        <p className="mt-2 text-cream/60">Our concierge will reach out within a few hours.</p>
      </motion.div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        upsert("leads", { id: uid("l"), type: "enquiry", ...f, status: "new", createdAt: todayISO() });
        setSent(true);
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Name *" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
      <Field label="Phone *" type="tel" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
      <div className="sm:col-span-2">
        <Field label="Email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
      </div>
      <div className="sm:col-span-2">
        <Field label="How can we help?" textarea value={f.message} onChange={(v) => setF({ ...f, message: v })} />
      </div>
      <button disabled={!f.name || f.phone.length < 8} className="flex h-14 items-center justify-center gap-2 rounded-[var(--radius)] bg-accent text-[#0E0E0E] disabled:opacity-40 sm:col-span-2">
        Send message <Send size={15} />
      </button>
    </form>
  );
}

export default function ContactPage() {
  const s = useStore((st) => st.settings);
  const [today, setToday] = useState(-1);
  useEffect(() => setToday(weekdayIndex(new Date())), []);
  return (
    <>
      <PageHeader eyebrow="Contact & visit" title="Come say" italic="hello." intro="Walk-ins welcome when we can — but a reservation guarantees your artist." />
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-16 md:grid-cols-12 md:px-10">
        <div className="space-y-4 md:col-span-5">
          {[
            { icon: MapPin, label: "Studio", value: `${s.address}, ${s.city}`, href: `https://maps.google.com/?q=${encodeURIComponent(s.mapQuery)}` },
            { icon: Phone, label: "Call", value: s.phone, href: `tel:${s.phone}` },
            { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
          ].map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <a href={c.href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-[var(--radius)] border hairline p-5 transition-colors hover:bg-white/[0.03]">
                <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-accent text-[#0E0E0E] transition-transform group-hover:rotate-12">
                  <c.icon size={18} />
                </span>
                <div>
                  <div className="eyebrow text-soft">{c.label}</div>
                  <div className="mt-0.5">{c.value}</div>
                </div>
              </a>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <div className="rounded-[var(--radius)] border hairline p-5">
              <div className="eyebrow mb-3 text-soft">Opening hours</div>
              {s.hours.map((h, i) => (
                <div key={h.day} className={`flex justify-between py-1.5 text-sm ${i === today ? "font-medium text-accent" : ""}`}>
                  <span>{h.day}</span>
                  <span>{h.closed ? "Closed" : `${formatTime(h.open)} – ${formatTime(h.close)}`}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="md:col-span-7">
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-3 pb-24 md:px-10">
        <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius)] grayscale-[0.6] md:aspect-[21/8]">
          <iframe title="Map" src={`https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&z=15&output=embed`} className="h-full w-full border-0" loading="lazy" />
        </div>
      </div>
    </>
  );
}
