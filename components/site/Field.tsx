"use client";

export default function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  hint?: string;
}) {
  const cls = "peer w-full rounded-[var(--radius)] border hairline bg-white/50 px-4 pb-3 pt-7 text-[15px] outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15";
  return (
    <label className="relative block">
      {textarea ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder=" " />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder=" " />
      )}
      <span className="pointer-events-none absolute left-4 top-2.5 text-[11px] uppercase tracking-wider text-soft">{label}</span>
      {hint && <span className="mt-1.5 block pl-1 text-xs text-soft">{hint}</span>}
    </label>
  );
}

