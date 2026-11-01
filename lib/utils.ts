import clsx, { type ClassValue } from "clsx";
import type { Hours } from "./types";

export const cn = (...c: ClassValue[]) => clsx(c);

export const uid = (p = "") =>
  p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export function formatPrice(n: number, currency = "₹") {
  const v = Number(n || 0);
  const locale = currency === "₹" ? "en-IN" : "en-US";
  return `${currency}${v.toLocaleString(locale)}`;
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-IN", opts);
}

export function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${pad(m)} ${ampm}`;
}

/** Monday-first index for a JS date */
export function weekdayIndex(d: Date) {
  return (d.getDay() + 6) % 7;
}

export function openStatus(hours: Hours[], now = new Date()) {
  const h = hours[weekdayIndex(now)];
  if (!h || h.closed) return { open: false, label: "Closed today" };
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = h.open.split(":").map(Number);
  const [ch, cm] = h.close.split(":").map(Number);
  const o = oh * 60 + om;
  const c = ch * 60 + cm;
  if (mins < o) return { open: false, label: `Opens ${formatTime(h.open)}` };
  if (mins >= c) return { open: false, label: "Closed now" };
  return { open: true, label: `Open · till ${formatTime(h.close)}` };
}

export function slotsFor(hours: Hours[], dateISO: string, step = 30, duration = 60) {
  const d = new Date(dateISO + "T00:00:00");
  const h = hours[weekdayIndex(d)];
  if (!h || h.closed) return [];
  const [oh, om] = h.open.split(":").map(Number);
  const [ch, cm] = h.close.split(":").map(Number);
  const out: string[] = [];
  for (let m = oh * 60 + om; m + duration <= ch * 60 + cm; m += step) {
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return out;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function bookingRef() {
  return "SL-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export function giftCode() {
  const r = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GIFT-${r()}-${r()}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
