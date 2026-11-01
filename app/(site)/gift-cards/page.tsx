"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";
import { Check, Gift } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, formatPrice, giftCode, todayISO, uid } from "@/lib/utils";
import PageHeader from "@/components/site/PageHeader";
import Field from "@/components/site/Field";
import { EASE } from "@/components/motion";

const DESIGNS = {
  noir: { label: "Noir", cls: "bg-[radial-gradient(120%_120%_at_0%_0%,#3a302a_0%,#0f0e0d_60%)] text-[#ECE3D7]" },
  blush: { label: "Blush", cls: "bg-[radial-gradient(120%_120%_at_100%_0%,#f6d5c8_0%,#d79c86_55%,#b0694c_100%)] text-white" },
  sage: { label: "Sage", cls: "bg-[radial-gradient(120%_120%_at_0%_100%,#dfe6d6_0%,#a9b89a_55%,#6f8466_100%)] text-white" },
  pearl: { label: "Pearl", cls: "bg-[linear-gradient(135deg,#fdfbf7_0%,#ece3d7_50%,#d9cbb8_100%)] text-[#151210]" },
} as const;

type DesignKey = keyof typeof DESIGNS;

export default function GiftCardsPage() {
  const { settings, upsert } = useStore();
  const [amount, setAmount] = useState(5000);
  const [design, setDesign] = useState<DesignKey>("noir");
  const [f, setF] = useState({ from: "", to: "", email: "", phone: "", message: "" });
  const [done, setDone] = useState<string | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 200, damping: 20 });
  const shineX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);

  const submit = () => {
    const code = giftCode();
    upsert("giftCards", {
      id: uid("g"),
      code,
      amount,
      design,
      from: f.from,
      to: f.to,
      recipientEmail: f.email,
      buyerPhone: f.phone,
      message: f.message,
      status: "active",
      createdAt: todayISO(),
    });
    setDone(code);
  };

  return (
    <>
      <PageHeader eyebrow="Gift cards" title="Give the gift of" italic="calm." intro="Digital gift cards delivered instantly — redeemable on every service, membership and product." />
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-28 md:grid-cols-2 md:px-10">
        {/* live preview */}
        <div className="md:sticky md:top-32 md:self-start" style={{ perspective: 1200 }}>
          <motion.div
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set((e.clientX - r.left) / r.width - 0.5);
              my.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onPointerLeave={() => {
              mx.set(0);
              my.set(0);
            }}
            style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            className={cn("relative aspect-[1.6/1] w-full overflow-hidden rounded-[var(--radius)] p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)] md:p-8", DESIGNS[design].cls)}
          >
            <motion.div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" style={{ background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,.8) 50%,transparent 70%)", backgroundSize: "250% 100%", backgroundPositionX: shineX }} />
            <div className="relative flex h-full flex-col justify-between" style={{ transform: "translateZ(40px)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="display text-3xl md:text-4xl">{settings.brandName}</div>
                  <div className="eyebrow mt-1 opacity-60">Gift card</div>
                </div>
                <Gift size={26} className="opacity-70" />
              </div>
              <div>
                <div className="text-sm opacity-70">{f.to ? `For ${f.to}` : "For someone special"}</div>
                <div className="display text-5xl md:text-7xl">{formatPrice(amount, settings.currency)}</div>
                <div className="mt-1 line-clamp-1 text-sm opacity-70">{f.message || "With love"}{f.from ? ` — ${f.from}` : ""}</div>
              </div>
            </div>
          </motion.div>
          <div className="mt-5 flex gap-2">
            {(Object.keys(DESIGNS) as DesignKey[]).map((d) => (
              <button key={d} onClick={() => setDesign(d)} className={cn("flex items-center gap-2 rounded-[var(--radius)] border px-3 py-1.5 text-sm", design === d ? "border-ink" : "hairline")}>
                <span className={cn("h-4 w-4 rounded-[var(--radius)]", DESIGNS[d].cls)} /> {DESIGNS[d].label}
              </button>
            ))}
          </div>
        </div>

        {/* form */}
        <div>
          {done ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE, duration: 0.8 }} className="rounded-[var(--radius)] bg-night p-8 text-cream">
              <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-accent">
                <Check />
              </span>
              <h2 className="display mt-6 text-5xl">Gift sent ✨</h2>
              <p className="mt-2 text-cream/60">Share this code with {f.to || "your recipient"}. Our team will call to complete payment.</p>
              <div className="mt-6 rounded-[var(--radius)] border border-dashed border-white/25 p-5 text-center font-mono text-2xl tracking-widest">{done}</div>
              <button
                onClick={() => {
                  setDone(null);
                  setF({ from: "", to: "", email: "", phone: "", message: "" });
                }}
                className="mt-6 text-sm text-cream/60 underline"
              >
                Send another
              </button>
            </motion.div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-6"
            >
              <div>
                <div className="eyebrow mb-3 text-soft">Amount</div>
                <div className="grid grid-cols-3 gap-2">
                  {[2500, 5000, 7500, 10000, 15000, 25000].map((a) => (
                    <button type="button" key={a} onClick={() => setAmount(a)} className={cn("rounded-[var(--radius)] border py-4 text-lg transition-all", amount === a ? "border-ink bg-ink text-bg" : "hairline hover:border-ink/40")}>
                      {formatPrice(a, settings.currency)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="From" value={f.from} onChange={(v) => setF({ ...f, from: v })} />
                <Field label="To" value={f.to} onChange={(v) => setF({ ...f, to: v })} />
                <Field label="Recipient email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
                <Field label="Your phone *" type="tel" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
                <div className="sm:col-span-2">
                  <Field label="Personal message" textarea value={f.message} onChange={(v) => setF({ ...f, message: v })} />
                </div>
              </div>
              <button disabled={f.phone.length < 8} className="flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-accent text-[15px] font-medium text-white disabled:opacity-40">
                <Gift size={17} /> Send gift card · {formatPrice(amount, settings.currency)}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
