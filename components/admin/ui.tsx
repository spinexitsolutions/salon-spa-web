"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-end">
      <div>
        <h1 className="text-[26px] font-light uppercase tracking-[0.1em] md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-[#F3EDE3]/50">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <div className={cn("rounded-[20px] bg-[#141310] p-5 shadow-[0_0_0_1px_rgba(201,169,110,0.14)]", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-[12px] font-medium uppercase tracking-[0.2em] text-accent">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "dark" }) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition-all active:scale-[0.97] disabled:opacity-40",
        variant === "primary" && "bg-accent text-[#0E0E0E] hover:brightness-110",
        variant === "dark" && "bg-accent text-[#0E0E0E] hover:brightness-110",
        variant === "ghost" && "bg-white/[0.05] text-[#F3EDE3] hover:bg-white/[0.09]",
        variant === "danger" && "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-[12px] font-medium text-[#F3EDE3]/55">{children}</span>;
}

export function Input({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <input {...rest} className={cn("admin-input", rest.className)} />
    </label>
  );
}

export function Textarea({ label, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <textarea rows={4} {...rest} className={cn("admin-input resize-y", rest.className)} />
    </label>
  );
}

export function Select({ label, options, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <select {...rest} className={cn("admin-input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_12px_center] bg-no-repeat pr-8", rest.className)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label?: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-1">
      {(label || hint) && (
        <span>
          {label && <span className="block text-[14px]">{label}</span>}
          {hint && <span className="block text-[12px] text-[#F3EDE3]/45">{hint}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-[30px] w-[50px] shrink-0 rounded-full transition-colors", checked ? "bg-accent" : "bg-white/15")}
      >
        <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={cn("absolute top-[2px] h-[26px] w-[26px] rounded-full bg-[#141310] shadow", checked ? "right-[2px]" : "left-[2px]")} />
      </button>
    </label>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-400/10 text-amber-300",
  confirmed: "bg-sky-400/10 text-sky-300",
  completed: "bg-emerald-400/10 text-emerald-300",
  cancelled: "bg-rose-400/10 text-rose-300",
  "no-show": "bg-white/[0.06] text-zinc-400",
  new: "bg-sky-400/10 text-sky-300",
  contacted: "bg-amber-400/10 text-amber-300",
  converted: "bg-emerald-400/10 text-emerald-300",
  closed: "bg-white/[0.06] text-zinc-400",
  active: "bg-emerald-400/10 text-emerald-300",
  redeemed: "bg-white/[0.06] text-zinc-400",
  expired: "bg-rose-400/10 text-rose-300",
  published: "bg-emerald-400/10 text-emerald-300",
  draft: "bg-white/[0.06] text-zinc-400",
};

export function Badge({ status, children }: { status: string; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize", STATUS_COLORS[status] ?? "bg-white/[0.06] text-zinc-400")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children ?? status}
    </span>
  );
}

export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]">
          <motion.div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-[560px] flex-col bg-[#0B0B0B] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-[#0E0E0E]/85 px-5 py-4 backdrop-blur">
              <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-white/5 bg-[#141310] px-5 py-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ImageInput({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="group relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#0E0E0E]"
          title="Upload image"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-[#F3EDE3]/30" />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-white/40 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">Upload</span>
        </button>
        <div className="flex-1">
          <input className="admin-input" placeholder="Paste image URL (Unsplash etc.)" value={value} onChange={(e) => onChange(e.target.value)} />
          <p className="mt-1 text-[11px] text-[#F3EDE3]/40">Upload from device or paste a URL.</p>
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            compressImage(file).then(onChange);
          }}
        />
      </div>
    </div>
  );
}

/** Downscale uploads so they fit comfortably in browser storage */
function compressImage(file: File, max = 1400): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        const scale = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = im.width * scale;
        c.height = im.height * scale;
        c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      im.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-[14px] text-[#F3EDE3]/45">{children}</div>;
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="no-scrollbar inline-flex max-w-full overflow-x-auto rounded-full bg-white/[0.05] p-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cn("relative shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors", value === o.value ? "text-[#F3EDE3]" : "text-[#F3EDE3]/50 hover:text-[#F3EDE3]")}>
          {value === o.value && <motion.span layoutId={"seg-" + options.map((x) => x.value).join("")} className="absolute inset-0 rounded-full bg-[#2A261E] shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Toast({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-24 left-1/2 z-[300] -translate-x-1/2 rounded-full bg-accent px-5 py-2.5 text-[13px] text-[#0E0E0E] shadow-xl md:bottom-8">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
