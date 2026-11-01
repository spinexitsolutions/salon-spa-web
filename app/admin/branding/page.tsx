"use client";

import { useStore } from "@/lib/store";
import type { Theme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, Input, PageTitle, Toggle } from "@/components/admin/ui";
import Preview from "@/components/admin/Preview";

const PRESETS: { name: string; t: Partial<Theme> }[] = [
  { name: "Copper Ivory", t: { bg: "#F4EFE8", ink: "#151210", accent: "#B0694C", night: "#0F0E0D", cream: "#ECE3D7" } },
  { name: "Sage Spa", t: { bg: "#F1F2EC", ink: "#18201A", accent: "#6F8466", night: "#121712", cream: "#E3E7DA" } },
  { name: "Rose Noir", t: { bg: "#F7F0EF", ink: "#1A1214", accent: "#B4566A", night: "#140D0F", cream: "#F0DFE0" } },
  { name: "Ocean Pearl", t: { bg: "#EFF2F3", ink: "#0F1A1F", accent: "#3D7A8C", night: "#0B1316", cream: "#DCE6E8" } },
  { name: "Champagne", t: { bg: "#F6F1E7", ink: "#1C170F", accent: "#A88A4E", night: "#14110B", cream: "#EDE3CC" } },
];

const FONTS: { id: Theme["displayFont"]; name: string; v: string }[] = [
  { id: "instrument", name: "Instrument Serif", v: "var(--font-instrument)" },
  { id: "playfair", name: "Playfair Display", v: "var(--font-playfair)" },
  { id: "cormorant", name: "Cormorant", v: "var(--font-cormorant)" },
];

export default function Branding() {
  const { theme, settings, patch } = useStore();
  const colors: { k: keyof Theme; label: string }[] = [
    { k: "bg", label: "Background" },
    { k: "ink", label: "Text" },
    { k: "accent", label: "Accent" },
    { k: "night", label: "Dark sections" },
    { k: "cream", label: "Light on dark" },
  ];
  return (
    <>
      <PageTitle title="Brand & theme" subtitle="Name, palette, typography and motion — applied across the whole website." />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card title="Identity">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Brand name" value={settings.brandName} onChange={(e) => patch("settings", { brandName: e.target.value })} />
              <Input label="Descriptor" value={settings.brandSuffix} onChange={(e) => patch("settings", { brandSuffix: e.target.value })} />
              <div className="sm:col-span-2">
                <Input label="Tagline" value={settings.tagline} onChange={(e) => patch("settings", { tagline: e.target.value })} />
              </div>
            </div>
          </Card>

          <Card title="Palette">
            <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => patch("theme", p.t)} className={cn("shrink-0 rounded-2xl border p-2 text-left", theme.accent === p.t.accent ? "border-accent" : "border-black/10")}>
                  <div className="flex h-10 w-28 overflow-hidden rounded-xl">
                    {[p.t.bg, p.t.accent, p.t.night].map((c, i) => (
                      <span key={i} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="mt-1.5 text-[12px] font-medium">{p.name}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {colors.map((c) => (
                <label key={c.k} className="block">
                  <span className="mb-1.5 block text-[12px] font-medium text-black/55">{c.label}</span>
                  <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white p-1.5">
                    <input type="color" value={String(theme[c.k])} onChange={(e) => patch("theme", { [c.k]: e.target.value } as Partial<Theme>)} className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
                    <span className="font-mono text-[11.5px] uppercase text-black/60">{String(theme[c.k])}</span>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card title="Display typeface">
            <div className="grid gap-3 sm:grid-cols-3">
              {FONTS.map((f) => (
                <button key={f.id} onClick={() => patch("theme", { displayFont: f.id })} className={cn("rounded-2xl border p-4 text-left transition-all", theme.displayFont === f.id ? "border-accent ring-4 ring-accent/15" : "border-black/10")}>
                  <div className="text-[40px] leading-none tracking-tight" style={{ fontFamily: f.v }}>
                    Aa <em>Glow</em>
                  </div>
                  <div className="mt-2 text-[12.5px] text-black/55">{f.name}</div>
                </button>
              ))}
            </div>
            <label className="mt-5 block">
              <span className="mb-1.5 flex justify-between text-[12px] font-medium text-black/55">
                Corner radius <span>{theme.radius}px</span>
              </span>
              <input type="range" min={0} max={48} value={theme.radius} onChange={(e) => patch("theme", { radius: Number(e.target.value) })} className="w-full accent-[var(--c-accent)]" />
            </label>
          </Card>

          <Card title="Motion & texture">
            <Toggle label="Smooth scrolling" hint="Buttery inertia scrolling (Lenis)" checked={theme.smoothScroll} onChange={(v) => patch("theme", { smoothScroll: v })} />
            <div className="my-2 h-px bg-black/5" />
            <Toggle label="Custom cursor" hint="Blend-mode cursor with contextual labels on desktop" checked={theme.cursor} onChange={(v) => patch("theme", { cursor: v })} />
            <div className="my-2 h-px bg-black/5" />
            <Toggle label="Film grain" hint="Subtle analog texture overlay" checked={theme.grain} onChange={(v) => patch("theme", { grain: v })} />
          </Card>
        </div>
        <div className="xl:sticky xl:top-6 xl:self-start">
          <Preview />
        </div>
      </div>
    </>
  );
}
