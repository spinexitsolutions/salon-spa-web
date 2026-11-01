"use client";

import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { IntroStyle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Btn, Card, Input, PageTitle, Textarea, Toggle } from "@/components/admin/ui";
import Preview from "@/components/admin/Preview";

const STYLES: { id: IntroStyle; name: string; desc: string }[] = [
  { id: "bloom", name: "Bloom", desc: "Letters rise, images flicker in an oval, 000→100 counter, curtain lifts." },
  { id: "frame", name: "Frame", desc: "A small image window cycles, then expands to full screen." },
  { id: "minimal", name: "Minimal", desc: "Wordmark and a drawn hairline. Quiet and quick." },
];

export default function IntroAdmin() {
  const { intro, patch } = useStore();
  const [k, setK] = useState(0);
  return (
    <>
      <PageTitle
        title="Intro animation"
        subtitle="The first impression. Choose a style, set the words and timing."
        actions={
          <a href="/?intro=1" target="_blank">
            <Btn>
              <Play size={14} /> Play on website
            </Btn>
          </a>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <Toggle label="Enable intro animation" hint="Shown when visitors first open the website" checked={intro.enabled} onChange={(v) => patch("intro", { enabled: v })} />
            <div className="my-3 h-px bg-white/5" />
            <Toggle label="Show once per session" hint="Skip the intro on reloads within the same visit" checked={intro.oncePerSession} onChange={(v) => patch("intro", { oncePerSession: v })} />
          </Card>

          <Card title="Style">
            <div className="grid gap-3 sm:grid-cols-3">
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => { patch("intro", { style: s.id }); setK(k + 1); }} className={cn("relative overflow-hidden rounded-2xl border p-0 text-left transition-all", intro.style === s.id ? "border-accent ring-4 ring-accent/15" : "border-white/10 hover:border-white/25")}>
                  <MiniPreview style={s.id} word={intro.word} />
                  <div className="p-3">
                    <div className="flex items-center justify-between text-[14px] font-medium">
                      {s.name}
                      {intro.style === s.id && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[#0E0E0E]">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-[#F3EDE3]/50">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Content & timing">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Wordmark" value={intro.word} onChange={(e) => patch("intro", { word: e.target.value })} />
              <Input label="Caption" value={intro.caption} onChange={(e) => patch("intro", { caption: e.target.value })} />
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="mb-1.5 flex justify-between text-[12px] font-medium text-[#F3EDE3]/55">
                    Duration <span>{intro.duration.toFixed(1)}s</span>
                  </span>
                  <input type="range" min={1.2} max={6} step={0.1} value={intro.duration} onChange={(e) => patch("intro", { duration: Number(e.target.value) })} className="w-full accent-[var(--c-accent)]" />
                </label>
              </div>
              <div className="sm:col-span-2">
                <Textarea label="Images (one URL per line)" rows={5} value={intro.images} onChange={(e) => patch("intro", { images: e.target.value })} />
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {intro.images
                    .split("\n")
                    .filter(Boolean)
                    .map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" className="h-16 w-12 shrink-0 rounded-lg object-cover" />
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="xl:sticky xl:top-6 xl:self-start">
          <Preview path="/?intro=1" title="Preview (reload to replay)" key={k} />
        </div>
      </div>
    </>
  );
}

function MiniPreview({ style, word }: { style: IntroStyle; word: string }) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-night text-cream">
      {style === "bloom" && (
        <>
          <motion.div className="absolute h-16 w-11 rounded-full bg-accent/60" animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 0.9, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
          <span className="display relative text-3xl mix-blend-difference">{word}</span>
          <span className="eyebrow absolute bottom-2 right-3 text-[9px] opacity-60">100</span>
        </>
      )}
      {style === "frame" && (
        <>
          <motion.div className="absolute rounded-md bg-accent/70" animate={{ width: ["30%", "100%", "30%"], height: ["30%", "100%", "30%"] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} />
          <span className="display relative text-3xl">{word}</span>
        </>
      )}
      {style === "minimal" && (
        <div className="flex flex-col items-center gap-2">
          <span className="display text-3xl">{word}</span>
          <motion.span className="h-px bg-cream/50" animate={{ width: [0, 60, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} />
        </div>
      )}
    </div>
  );
}
