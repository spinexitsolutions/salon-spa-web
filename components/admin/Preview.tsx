"use client";

import { useState } from "react";
import { ExternalLink, Monitor, RotateCw, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

/** Live website preview — same origin, so it reads the same store */
export default function Preview({ path = "/", title = "Live preview" }: { path?: string; title?: string }) {
  const [k, setK] = useState(0);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  return (
    <div className="rounded-[20px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold">{title}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setDevice("mobile")} className={cn("flex h-8 w-8 items-center justify-center rounded-full", device === "mobile" ? "bg-black/10" : "hover:bg-black/5")} aria-label="Mobile">
            <Smartphone size={14} />
          </button>
          <button onClick={() => setDevice("desktop")} className={cn("flex h-8 w-8 items-center justify-center rounded-full", device === "desktop" ? "bg-black/10" : "hover:bg-black/5")} aria-label="Desktop">
            <Monitor size={14} />
          </button>
          <button onClick={() => setK(k + 1)} className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] hover:bg-black/5">
            <RotateCw size={13} /> Reload
          </button>
          <a href={path} target="_blank" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5" aria-label="Open">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <div className={cn("relative mx-auto overflow-hidden rounded-[18px] border border-black/10 bg-[#111]", device === "mobile" ? "h-[640px] w-[320px]" : "aspect-[16/10] w-full")}>
        {device === "desktop" ? (
          <div className="absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[0.4]">
            <iframe key={k} src={path} className="h-full w-full border-0" title="Preview" />
          </div>
        ) : (
          <iframe key={k} src={path} className="h-full w-full border-0" title="Preview" />
        )}
      </div>
    </div>
  );
}
