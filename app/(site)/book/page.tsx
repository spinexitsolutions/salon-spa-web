"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Clock, MessageCircle, Sparkles, User } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Appointment, Client } from "@/lib/types";
import { addDays, bookingRef, cn, formatDate, formatPrice, formatTime, slotsFor, toISODate, todayISO, uid } from "@/lib/utils";
import { EASE, SafeImg } from "@/components/motion";
import PageHeader from "@/components/site/PageHeader";
import Field from "@/components/site/Field";

const STEPS = ["Service", "Artist", "Time", "Details"];

function BookingFlow() {
  const params = useSearchParams();
  const { services, team, categories, settings, appointments, clients, offers, upsert } = useStore();
  const pub = services.filter((s) => s.published);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [serviceId, setServiceId] = useState<string>("");
  const [staffId, setStaffId] = useState<string>("any");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [cat, setCat] = useState<string>("all");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "", code: "" });
  const [done, setDone] = useState<Appointment | null>(null);

  useEffect(() => {
    const s = params.get("service");
    const d = params.get("date");
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) setDate(d);
    if (s && services.some((x) => x.id === s)) {
      setServiceId(s);
      setStep(1);
    }
  }, [params, services]);

  const service = services.find((s) => s.id === serviceId);
  const staff = team.find((t) => t.id === staffId);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => toISODate(addDays(new Date(), i))), []);
  const slots = useMemo(() => {
    if (!date) return [];
    const all = slotsFor(settings.hours, date, 30, service?.duration && service.duration <= 120 ? service.duration : 60);
    const now = new Date();
    return all.map((t) => {
      const past = date === todayISO() && Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) <= now.getHours() * 60 + now.getMinutes() + 30;
      const taken =
        staffId !== "any" &&
        appointments.some((a) => a.staffId === staffId && a.date === date && a.time === t && a.status !== "cancelled");
      return { t, disabled: past || taken };
    });
  }, [date, settings.hours, service, appointments, staffId]);

  const offer = offers.find((o) => o.published && o.code.toLowerCase() === form.code.trim().toLowerCase());
  const discount = offer && service && offer.discount.includes("%") ? Math.round((service.price * parseFloat(offer.discount)) / 100) : 0;
  const total = (service?.price ?? 0) - discount;

  const canNext = [!!service, !!staffId, !!date && !!time, form.name.trim().length > 1 && form.phone.trim().length >= 8][step];

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    window.__lenis?.scrollTo(0);
  };

  const submit = () => {
    if (!service) return;
    let client: Client | undefined = clients.find((c) => c.phone.replace(/\D/g, "").endsWith(form.phone.replace(/\D/g, "").slice(-10)));
    if (!client) {
      client = { id: uid("c"), name: form.name, phone: form.phone, email: form.email, tags: "Website", notes: "", birthday: "", createdAt: todayISO() };
      upsert("clients", client);
    }
    const assigned = staff ?? team.filter((t) => t.published)[0];
    const appt: Appointment = {
      id: uid("a"),
      ref: bookingRef(),
      clientId: client.id,
      clientName: form.name,
      phone: form.phone,
      email: form.email,
      serviceId: service.id,
      serviceName: service.name,
      staffId: staffId === "any" ? "" : assigned?.id ?? "",
      staffName: staffId === "any" ? "Any available" : assigned?.name ?? "",
      date,
      time,
      duration: service.duration,
      price: total,
      status: "pending",
      notes: [form.notes, offer ? `Offer: ${offer.code}` : ""].filter(Boolean).join(" · "),
      source: "website",
      createdAt: todayISO(),
    };
    upsert("appointments", appt);
    setDone(appt);
    window.__lenis?.scrollTo(0);
  };

  if (done) return <Confirmation appt={done} />;

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-40 md:grid-cols-12 md:px-10 md:pb-24">
      <div className="md:col-span-8">
        {/* stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => i < step && go(i)} className="flex flex-1 flex-col gap-2 text-left" disabled={i > step}>
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-ink/10">
                <motion.div className="h-full bg-accent" animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease: EASE }} />
              </div>
              <span className={cn("eyebrow", i === step ? "text-ink" : "text-soft")}>
                {i + 1}. {s}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {step === 0 && (
              <div>
                <h2 className="display text-4xl md:text-5xl">Choose your ritual</h2>
                <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
                  {[{ id: "all", name: "All" }, ...categories.filter((c) => c.published)].map((c) => (
                    <button key={c.id} onClick={() => setCat(c.id)} className={cn("shrink-0 rounded-full px-4 py-2 text-sm", cat === c.id ? "bg-ink text-bg" : "bg-soft")}>
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {pub
                    .filter((s) => cat === "all" || s.category === cat)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setServiceId(s.id)}
                        className={cn(
                          "flex items-center gap-4 rounded-[22px] border p-3 text-left transition-all",
                          serviceId === s.id ? "border-accent bg-accent/5 ring-4 ring-accent/15" : "hairline hover:border-ink/30"
                        )}
                      >
                        <SafeImg src={s.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{s.name}</div>
                          <div className="mt-0.5 flex items-center gap-2 text-[13px] text-soft">
                            <Clock size={12} /> {s.duration} min · {formatPrice(s.price, settings.currency)}
                          </div>
                        </div>
                        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border", serviceId === s.id ? "border-accent bg-accent text-white" : "hairline")}>
                          {serviceId === s.id && <Check size={13} />}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="display text-4xl md:text-5xl">Who would you like?</h2>
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
                  <button
                    onClick={() => setStaffId("any")}
                    className={cn("flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-[22px] border p-4 text-center", staffId === "any" ? "border-accent bg-accent/5 ring-4 ring-accent/15" : "hairline")}
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-bg">
                      <Sparkles size={22} />
                    </span>
                    <span className="font-medium">Any available</span>
                    <span className="text-xs text-soft">Fastest confirmation</span>
                  </button>
                  {team
                    .filter((t) => t.published)
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setStaffId(t.id)}
                        className={cn("relative aspect-[3/4] overflow-hidden rounded-[22px] text-left ring-offset-2 transition-all", staffId === t.id && "ring-4 ring-accent")}
                      >
                        <SafeImg src={t.image} alt={t.name} className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-white/70">{t.role}</div>
                        </div>
                        {staffId === t.id && (
                          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white">
                            <Check size={14} />
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="display text-4xl md:text-5xl">Pick a moment</h2>
                <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0" data-lenis-prevent>
                  {days.map((d) => {
                    const dt = new Date(d + "T00:00:00");
                    const closed = slotsFor(settings.hours, d).length === 0;
                    return (
                      <button
                        key={d}
                        disabled={closed}
                        onClick={() => {
                          setDate(d);
                          setTime("");
                        }}
                        className={cn(
                          "flex w-[68px] shrink-0 flex-col items-center rounded-2xl border py-3 transition-all",
                          date === d ? "border-ink bg-ink text-bg" : "hairline hover:border-ink/30",
                          closed && "opacity-30"
                        )}
                      >
                        <span className="eyebrow opacity-60">{dt.toLocaleDateString("en", { weekday: "short" })}</span>
                        <span className="display mt-1 text-3xl">{dt.getDate()}</span>
                        <span className="text-[11px] opacity-60">{dt.toLocaleDateString("en", { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>
                {date ? (
                  <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {slots.map(({ t, disabled }) => (
                      <button
                        key={t}
                        disabled={disabled}
                        onClick={() => setTime(t)}
                        className={cn(
                          "rounded-xl border py-3 text-sm transition-all",
                          time === t ? "border-accent bg-accent text-white" : "hairline hover:border-ink/40",
                          disabled && "cursor-not-allowed line-through opacity-30"
                        )}
                      >
                        {formatTime(t)}
                      </button>
                    ))}
                    {!slots.length && <p className="col-span-full text-soft">We&apos;re closed on this day.</p>}
                  </div>
                ) : (
                  <p className="mt-6 text-soft">Select a date to see available times.</p>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="display text-4xl md:text-5xl">Almost there</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Field label="Phone *" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                  <Field label="Offer code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} hint={offer ? `✓ ${offer.title} applied` : form.code ? "Code not recognised" : "Try GLOW20"} />
                  <div className="sm:col-span-2">
                    <Field label="Anything we should know?" textarea value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
                  </div>
                </div>
                <p className="mt-4 text-xs text-soft">Free rescheduling up to 12 hours before. You&apos;ll receive a confirmation on WhatsApp.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* summary */}
      <aside className="md:col-span-4">
        <div className="sticky top-28 hidden rounded-[var(--radius)] bg-night p-6 text-cream md:block">
          <Summary service={service} staffName={staffId === "any" ? "Any available" : staff?.name} date={date} time={time} total={total} discount={discount} currency={settings.currency} />
          <div className="mt-6 flex gap-2">
            {step > 0 && (
              <button onClick={() => go(step - 1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20">
                <ArrowLeft size={16} />
              </button>
            )}
            <button
              disabled={!canNext}
              onClick={() => (step < 3 ? go(step + 1) : submit())}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white transition-opacity disabled:opacity-40"
            >
              {step < 3 ? "Continue" : "Confirm booking"} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* mobile bottom bar */}
      <div className="glass fixed inset-x-3 bottom-3 z-[96] flex items-center gap-3 rounded-[24px] border border-black/5 p-2.5 pl-4 shadow-2xl md:hidden">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] text-soft">{service ? service.name : "No service yet"}</div>
          <div className="font-medium">{formatPrice(total, settings.currency)}</div>
        </div>
        {step > 0 && (
          <button onClick={() => go(step - 1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-soft">
            <ArrowLeft size={16} />
          </button>
        )}
        <button
          disabled={!canNext}
          onClick={() => (step < 3 ? go(step + 1) : submit())}
          className="flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg disabled:opacity-40"
        >
          {step < 3 ? "Next" : "Confirm"} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Summary({ service, staffName, date, time, total, discount, currency }: { service?: { name: string; duration: number; price: number; image: string }; staffName?: string; date: string; time: string; total: number; discount: number; currency: string }) {
  return (
    <div>
      <div className="eyebrow text-cream/50">Your ritual</div>
      {service ? (
        <div className="mt-4 flex items-center gap-3">
          <SafeImg src={service.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
          <div>
            <div className="display text-2xl">{service.name}</div>
            <div className="text-[13px] text-cream/50">{service.duration} min</div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-cream/50">Choose a service to begin.</p>
      )}
      <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
        <Row k="Artist" v={staffName || "—"} />
        <Row k="Date" v={date ? formatDate(date, { weekday: "short", day: "numeric", month: "short" }) : "—"} />
        <Row k="Time" v={time ? formatTime(time) : "—"} />
        {discount > 0 && <Row k="Discount" v={`− ${formatPrice(discount, currency)}`} />}
      </dl>
      <div className="mt-5 flex items-baseline justify-between border-t border-white/10 pt-5">
        <span className="text-cream/50">Total</span>
        <span className="display text-4xl">{formatPrice(total, currency)}</span>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-cream/50">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Confirmation({ appt }: { appt: Appointment }) {
  const settings = useStore((s) => s.settings);
  const ics = () => {
    const start = appt.date.replace(/-/g, "") + "T" + appt.time.replace(":", "") + "00";
    const endD = new Date(`${appt.date}T${appt.time}:00`);
    endD.setMinutes(endD.getMinutes() + appt.duration);
    const end = toISODate(endD).replace(/-/g, "") + "T" + String(endD.getHours()).padStart(2, "0") + String(endD.getMinutes()).padStart(2, "0") + "00";
    const body = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${appt.serviceName} at ${settings.brandName}\nLOCATION:${settings.address}, ${settings.city}\nDESCRIPTION:Booking ref ${appt.ref}\nEND:VEVENT\nEND:VCALENDAR`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    a.download = `${appt.ref}.ics`;
    a.click();
  };
  const msg = `Hi ${settings.brandName}! My booking ${appt.ref}: ${appt.serviceName} on ${formatDate(appt.date)} at ${formatTime(appt.time)}.`;
  return (
    <div className="mx-auto max-w-xl px-5 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="relative overflow-hidden rounded-[var(--radius)] bg-night p-7 text-cream shadow-2xl"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 15 }} className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
          <Check size={26} />
        </motion.div>
        <h2 className="display mt-6 text-5xl">You&apos;re booked, {appt.clientName.split(" ")[0]}.</h2>
        <p className="mt-2 text-cream/60">We&apos;ll confirm on WhatsApp shortly.</p>
        <div className="my-6 border-t border-dashed border-white/20" />
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="eyebrow text-cream/40">Reference</dt>
            <dd className="mt-1 font-mono">{appt.ref}</dd>
          </div>
          <div>
            <dt className="eyebrow text-cream/40">Service</dt>
            <dd className="mt-1">{appt.serviceName}</dd>
          </div>
          <div>
            <dt className="eyebrow text-cream/40">When</dt>
            <dd className="mt-1">
              {formatDate(appt.date, { weekday: "short", day: "numeric", month: "short" })} · {formatTime(appt.time)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-cream/40">Artist</dt>
            <dd className="mt-1 flex items-center gap-1">
              <User size={12} /> {appt.staffName}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-5">
          <span className="text-cream/50">Pay at studio</span>
          <span className="display text-4xl">{formatPrice(appt.price, settings.currency)}</span>
        </div>
      </motion.div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={ics} className="flex h-12 items-center justify-center gap-2 rounded-full border hairline text-sm">
          <CalendarPlus size={15} /> Add to calendar
        </button>
        <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm text-white">
          <MessageCircle size={15} /> WhatsApp
        </a>
      </div>
      <Link href="/" className="mt-6 block text-center text-sm text-soft underline-offset-4 hover:underline">
        Back to home
      </Link>
    </div>
  );
}

export default function BookPage() {
  return (
    <>
      <PageHeader eyebrow="Online booking · 60 seconds" title="Reserve your" italic="ritual." />
      <Suspense fallback={null}>
        <BookingFlow />
      </Suspense>
    </>
  );
}
