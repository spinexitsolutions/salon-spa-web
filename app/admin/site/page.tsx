"use client";

import { Reorder } from "framer-motion";
import { GripVertical } from "lucide-react";
import { useStore } from "@/lib/store";
import { DEFAULT_SECTIONS } from "@/lib/seed";
import { Btn, Card, ImageInput, Input, PageTitle, Textarea, Toggle } from "@/components/admin/ui";
import Preview from "@/components/admin/Preview";

export default function SiteBuilder() {
  const { sections, setSections, hero, announcement, patch } = useStore();
  return (
    <>
      <PageTitle title="Homepage builder" subtitle="Reorder, hide or edit every section. Changes are saved and go live instantly." />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card title="Sections" action={<Btn variant="ghost" className="h-8 text-[12px]" onClick={() => setSections(DEFAULT_SECTIONS)}>Reset order</Btn>}>
            <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-1.5">
              {sections.map((s, i) => (
                <Reorder.Item key={s.id} value={s} className="list-none">
                  <div className="flex cursor-grab items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-1.5 active:cursor-grabbing">
                    <GripVertical size={15} className="text-[#F3EDE3]/30" />
                    <span className="w-5 text-[12px] text-[#F3EDE3]/35">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`flex-1 text-[14px] ${s.visible ? "" : "text-[#F3EDE3]/35 line-through"}`}>{s.label}</span>
                    <Toggle checked={s.visible} onChange={(v) => setSections(sections.map((x) => (x.id === s.id ? { ...x, visible: v } : x)))} />
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </Card>

          <Card title="Hero">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Input label="Eyebrow" value={hero.eyebrow} onChange={(e) => patch("hero", { eyebrow: e.target.value })} />
              </div>
              <Input label="Headline — first" value={hero.line1} onChange={(e) => patch("hero", { line1: e.target.value })} />
              <Input label="Rotating words (comma separated)" value={hero.words} onChange={(e) => patch("hero", { words: e.target.value })} />
              <Input label="Headline — second line" value={hero.line2} onChange={(e) => patch("hero", { line2: e.target.value })} />
              <div className="sm:col-span-3">
                <Textarea label="Subtitle" rows={2} value={hero.subtitle} onChange={(e) => patch("hero", { subtitle: e.target.value })} />
              </div>
              <Input label="Primary button" value={hero.ctaPrimary} onChange={(e) => patch("hero", { ctaPrimary: e.target.value })} />
              <Input label="Secondary button" value={hero.ctaSecondary} onChange={(e) => patch("hero", { ctaSecondary: e.target.value })} />
              <div className="sm:col-span-3">
                <ImageInput label="Hero background image (quick-book card)" value={hero.image} onChange={(v) => patch("hero", { image: v })} />
              </div>
            </div>
          </Card>

          <Card title="Announcement (drops from the navbar island)">
            <Toggle label="Show announcement" checked={announcement.enabled} onChange={(v) => patch("announcement", { enabled: v })} />
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Input label="Text" value={announcement.text} onChange={(e) => patch("announcement", { text: e.target.value })} />
              </div>
              <Input label="Link" value={announcement.link} onChange={(e) => patch("announcement", { link: e.target.value })} />
              <Input label="Link label" value={announcement.linkLabel} onChange={(e) => patch("announcement", { linkLabel: e.target.value })} />
            </div>
          </Card>
        </div>
        <div className="xl:sticky xl:top-6 xl:self-start">
          <Preview />
        </div>
      </div>
    </>
  );
}
