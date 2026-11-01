"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, CalendarCheck, IndianRupee, Inbox, TrendingUp, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { addDays, formatDate, formatPrice, formatTime, toISODate, todayISO } from "@/lib/utils";
import { Badge, Btn, Card, PageTitle } from "@/components/admin/ui";

export default function Dashboard() {
  const { appointments, clients, leads, services, giftCards, settings } = useStore();
  const today = todayISO();
  const c = settings.currency;

  const data = useMemo(() => {
    const since = toISODate(addDays(new Date(), -30));
    const done = appointments.filter((a) => a.status === "completed");
    const revenueMonth = done.filter((a) => a.date >= since).reduce((s, a) => s + a.price, 0);
    const todays = appointments.filter((a) => a.date === today && a.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
    const upcoming = appointments
      .filter((a) => a.date >= today && (a.status === "confirmed" || a.status === "pending"))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 6);
    const days = Array.from({ length: 14 }, (_, i) => toISODate(addDays(new Date(), i - 13)));
    const series = days.map((d) => ({ d, v: done.filter((a) => a.date === d).reduce((s, a) => s + a.price, 0) }));
    const byService = services
      .map((s) => ({ name: s.name, count: appointments.filter((a) => a.serviceId === s.id && a.status !== "cancelled").length }))
      .filter((x) => x.count)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const total = appointments.length || 1;
    const cancelRate = Math.round((appointments.filter((a) => a.status === "cancelled" || a.status === "no-show").length / total) * 100);
    const sources = ["website", "phone", "walk-in", "admin"].map((s) => ({ s, n: appointments.filter((a) => a.source === s).length }));
    return { revenueMonth, todays, upcoming, series, byService, cancelRate, sources };
  }, [appointments, services, today]);

  const max = Math.max(...data.series.map((x) => x.v), 1);
  const pts = data.series.map((p, i) => [(i / (data.series.length - 1)) * 100, 100 - (p.v / max) * 85 - 5]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  const area = line + " L100 100 L0 100 Z";

  const kpis = [
    { label: "Revenue · 30 days", value: formatPrice(data.revenueMonth, c), icon: IndianRupee, sub: "Completed appointments" },
    { label: "Today's bookings", value: data.todays.length, icon: CalendarCheck, sub: `${appointments.filter((a) => a.status === "pending").length} pending confirmation` },
    { label: "Clients", value: clients.length, icon: Users, sub: `${clients.filter((x) => x.createdAt >= toISODate(addDays(new Date(), -30))).length} new in 30 days` },
    { label: "New leads", value: leads.filter((l) => l.status === "new").length, icon: Inbox, sub: `${giftCards.filter((g) => g.status === "active").length} active gift cards` },
  ];

  return (
    <>
      <PageTitle
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}`}
        subtitle={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        actions={
          <>
            <Link href="/admin/appointments?new=1">
              <Btn>New appointment</Btn>
            </Link>
            <a href="/" target="_blank">
              <Btn variant="ghost">
                View site <ArrowUpRight size={14} />
              </Btn>
            </a>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4 md:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-black/50">{k.label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                <k.icon size={15} />
              </span>
            </div>
            <div className="mt-3 text-[26px] font-semibold tracking-[-0.03em] md:text-[30px]">{k.value}</div>
            <div className="mt-0.5 text-[12px] text-black/40">{k.sub}</div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Revenue · last 14 days"
          action={
            <span className="flex items-center gap-1 text-[12px] text-emerald-600">
              <TrendingUp size={13} /> {formatPrice(data.series.reduce((s, x) => s + x.v, 0), c)}
            </span>
          }
        >
          <div className="relative h-[200px]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={area} fill="url(#g)" />
              <path d={line} fill="none" stroke="var(--c-accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-0 flex">
              {data.series.map((p) => (
                <div key={p.d} className="group relative flex-1">
                  <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1d1d1f] px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100">
                    {formatDate(p.d)} · {formatPrice(p.v, c)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-black/40">
            <span>{formatDate(data.series[0].d)}</span>
            <span>Today</span>
          </div>
        </Card>

        <Card title="Top services">
          <div className="space-y-3">
            {data.byService.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-[13px]">
                  <span className="truncate pr-2">{s.name}</span>
                  <span className="text-black/45">{s.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/5">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / data.byService[0].count) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-black/5 pt-4 text-[12px]">
            <div>
              <div className="text-black/45">Cancel / no-show</div>
              <div className="text-lg font-semibold">{data.cancelRate}%</div>
            </div>
            <div>
              <div className="text-black/45">Online share</div>
              <div className="text-lg font-semibold">{Math.round(((data.sources[0].n || 0) / (appointments.length || 1)) * 100)}%</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Upcoming appointments" action={<Link href="/admin/appointments" className="text-[13px] text-accent">See all</Link>}>
          <div className="divide-y divide-black/5">
            {data.upcoming.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <div className="w-14 shrink-0 text-center">
                  <div className="text-[11px] uppercase text-black/40">{formatDate(a.date, { weekday: "short" })}</div>
                  <div className="text-[13px] font-semibold">{formatTime(a.time)}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium">{a.clientName}</div>
                  <div className="truncate text-[12.5px] text-black/45">
                    {a.serviceName} · {a.staffName}
                  </div>
                </div>
                <Badge status={a.status} />
              </div>
            ))}
            {!data.upcoming.length && <p className="py-6 text-center text-sm text-black/40">No upcoming appointments.</p>}
          </div>
        </Card>
        <Card title="Latest leads" action={<Link href="/admin/leads" className="text-[13px] text-accent">Inbox</Link>}>
          <div className="space-y-3">
            {leads.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: l.status === "new" ? "var(--c-accent)" : "rgba(0,0,0,0.15)" }} />
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-medium">{l.name || l.email || l.phone}</div>
                  <div className="truncate text-[12px] text-black/45">
                    <span className="capitalize">{l.type}</span> · {l.message || "Newsletter signup"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
