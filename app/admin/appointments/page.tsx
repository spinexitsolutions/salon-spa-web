"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Plus, Search, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { addDays, bookingRef, cn, formatDate, formatPrice, formatTime, toISODate, todayISO, uid, weekdayIndex } from "@/lib/utils";
import { Badge, Btn, Card, Drawer, Empty, Input, PageTitle, Segmented, Select, Textarea } from "@/components/admin/ui";

const STATUSES: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled", "no-show"];

function blank(): Appointment {
  return {
    id: "",
    ref: bookingRef(),
    clientId: "",
    clientName: "",
    phone: "",
    email: "",
    serviceId: "",
    serviceName: "",
    staffId: "",
    staffName: "",
    date: todayISO(),
    time: "11:00",
    duration: 60,
    price: 0,
    status: "confirmed",
    notes: "",
    source: "admin",
    createdAt: todayISO(),
  };
}

function Appointments() {
  const params = useSearchParams();
  const { appointments, services, team, clients, settings, upsert, remove } = useStore();
  const [view, setView] = useState<"list" | "week">("list");
  const [tab, setTab] = useState<"upcoming" | "today" | "past" | "all">("upcoming");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Appointment | null>(null);
  const [weekStart, setWeekStart] = useState(() => addDays(new Date(), -weekdayIndex(new Date())));

  useEffect(() => {
    if (params.get("new")) setEdit(blank());
  }, [params]);

  const today = todayISO();
  const list = useMemo(() => {
    return appointments
      .filter((a) => (tab === "upcoming" ? a.date >= today : tab === "today" ? a.date === today : tab === "past" ? a.date < today : true))
      .filter((a) => status === "all" || a.status === status)
      .filter((a) => !q || [a.clientName, a.phone, a.serviceName, a.ref, a.staffName].join(" ").toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (tab === "past" ? -1 : 1) * (a.date + a.time).localeCompare(b.date + b.time));
  }, [appointments, tab, status, q, today]);

  const save = () => {
    if (!edit) return;
    const svc = services.find((s) => s.id === edit.serviceId);
    const st = team.find((t) => t.id === edit.staffId);
    let clientId = edit.clientId;
    if (!clientId && edit.clientName) {
      const existing = clients.find((c) => c.phone && c.phone === edit.phone);
      clientId = existing?.id ?? uid("c");
      if (!existing) upsert("clients", { id: clientId, name: edit.clientName, phone: edit.phone, email: edit.email, tags: "", notes: "", birthday: "", createdAt: todayISO() });
    }
    upsert("appointments", {
      ...edit,
      id: edit.id || uid("a"),
      clientId,
      serviceName: svc?.name ?? edit.serviceName,
      staffName: st?.name ?? edit.staffName,
      duration: svc?.duration ?? edit.duration,
    });
    setEdit(null);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => toISODate(addDays(weekStart, i)));

  return (
    <>
      <PageTitle
        title="Appointments"
        subtitle={`${appointments.filter((a) => a.date >= today && a.status !== "cancelled").length} upcoming · ${appointments.filter((a) => a.status === "pending").length} awaiting confirmation`}
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[{ value: "list", label: "List" }, { value: "week", label: "Week" }]} />
            <Btn onClick={() => setEdit(blank())}>
              <Plus size={15} /> New
            </Btn>
          </>
        }
      />

      {view === "list" ? (
        <>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { value: "upcoming", label: "Upcoming" },
                { value: "today", label: "Today" },
                { value: "past", label: "Past" },
                { value: "all", label: "All" },
              ]}
            />
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F3EDE3]/35" />
                <input className="admin-input pl-9" placeholder="Search name, phone, ref…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <select className="admin-input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!list.length ? (
            <Empty>No appointments match.</Empty>
          ) : (
            <Card className="p-0 md:p-0">
              <div className="hidden grid-cols-[110px_1.3fr_1.3fr_1fr_100px_130px_40px] gap-3 border-b border-white/5 px-5 py-3 text-[11.5px] font-medium uppercase tracking-wider text-[#F3EDE3]/40 md:grid">
                <span>When</span>
                <span>Client</span>
                <span>Service</span>
                <span>Artist</span>
                <span>Price</span>
                <span>Status</span>
                <span />
              </div>
              <div className="divide-y divide-black/5">
                {list.map((a) => (
                  <div key={a.id} className="grid cursor-pointer grid-cols-[1fr_auto] gap-2 px-4 py-3.5 transition-colors hover:bg-white/[0.02] md:grid-cols-[110px_1.3fr_1.3fr_1fr_100px_130px_40px] md:items-center md:gap-3 md:px-5" onClick={() => setEdit(a)}>
                    <div className="hidden md:block">
                      <div className="text-[13px] font-medium">{formatDate(a.date, { weekday: "short", day: "numeric", month: "short" })}</div>
                      <div className="text-[12px] text-[#F3EDE3]/45">{formatTime(a.time)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-medium">{a.clientName}</div>
                      <div className="truncate text-[12px] text-[#F3EDE3]/45">
                        <span className="md:hidden">
                          {formatDate(a.date)} · {formatTime(a.time)} · {a.serviceName}
                        </span>
                        <span className="hidden md:inline">{a.phone}</span>
                      </div>
                    </div>
                    <div className="hidden min-w-0 md:block">
                      <div className="truncate text-[13.5px]">{a.serviceName}</div>
                      <div className="text-[12px] text-[#F3EDE3]/45">
                        {a.duration} min · <span className="font-mono">{a.ref}</span>
                      </div>
                    </div>
                    <div className="hidden truncate text-[13px] text-[#F3EDE3]/70 md:block">{a.staffName || "—"}</div>
                    <div className="hidden text-[13.5px] md:block">{formatPrice(a.price, settings.currency)}</div>
                    <div onClick={(e) => e.stopPropagation()} className="justify-self-end md:justify-self-start">
<label className="relative cursor-pointer">
                        <Badge status={a.status} />
                        <select
                          value={a.status}
                          onChange={(e) => upsert("appointments", { ...a, status: e.target.value as AppointmentStatus })}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          aria-label="Change status"
                        >
                          {STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <a
                      onClick={(e) => e.stopPropagation()}
                      href={`https://wa.me/${a.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${a.clientName.split(" ")[0]}, this is ${settings.brandName} confirming your ${a.serviceName} on ${formatDate(a.date)} at ${formatTime(a.time)}. Ref ${a.ref}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden h-8 w-8 items-center justify-center rounded-full text-[#25D366] hover:bg-[#25D366]/10 md:flex"
                      title="Send WhatsApp confirmation"
                    >
                      <MessageCircle size={16} />
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[15px] font-semibold">
              {formatDate(weekDays[0], { day: "numeric", month: "short" })} – {formatDate(weekDays[6], { day: "numeric", month: "short", year: "numeric" })}
            </div>
            <div className="flex gap-1">
              <Btn variant="ghost" className="h-9 w-9 p-0" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week">
                <ChevronLeft size={16} />
              </Btn>
              <Btn variant="ghost" className="h-9 px-3" onClick={() => setWeekStart(addDays(new Date(), -weekdayIndex(new Date())))}>
                Today
              </Btn>
              <Btn variant="ghost" className="h-9 w-9 p-0" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week">
                <ChevronRight size={16} />
              </Btn>
            </div>
          </div>
          <div className="no-scrollbar -mx-5 overflow-x-auto px-5">
            <div className="grid min-w-[840px] grid-cols-7 gap-2">
              {weekDays.map((d) => {
                const items = appointments.filter((a) => a.date === d && a.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
                return (
                  <div key={d} className={cn("min-h-[360px] rounded-2xl p-2", d === today ? "bg-accent/[0.07]" : "bg-white/[0.025]")}>
                    <div className="mb-2 flex items-baseline justify-between px-1">
                      <span className="text-[11.5px] uppercase text-[#F3EDE3]/45">{formatDate(d, { weekday: "short" })}</span>
                      <span className={cn("text-[15px] font-semibold", d === today && "text-accent")}>{new Date(d + "T00:00:00").getDate()}</span>
                    </div>
                    <div className="space-y-1.5">
                      {items.map((a) => (
                        <button key={a.id} onClick={() => setEdit(a)} className="block w-full rounded-xl bg-[#141310] p-2 text-left shadow-sm transition-transform hover:-translate-y-0.5">
                          <div className="text-[11px] text-[#F3EDE3]/45">{formatTime(a.time)}</div>
                          <div className="truncate text-[12.5px] font-medium">{a.clientName}</div>
                          <div className="truncate text-[11px] text-[#F3EDE3]/50">{a.serviceName}</div>
                          <div className="mt-1">
                            <span className={cn("block h-1 rounded-full", a.status === "pending" ? "bg-amber-400" : a.status === "completed" ? "bg-emerald-400" : a.status === "no-show" ? "bg-zinc-300" : "bg-sky-400")} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? `Appointment ${edit.ref}` : "New appointment"}
        footer={
          <>
            {edit?.id && (
              <Btn
                variant="danger"
                className="mr-auto"
                onClick={() => {
                  if (confirm("Delete this appointment?")) {
                    remove("appointments", edit.id);
                    setEdit(null);
                  }
                }}
              >
                <Trash2 size={14} /> Delete
              </Btn>
            )}
            <Btn variant="ghost" onClick={() => setEdit(null)}>
              Cancel
            </Btn>
            <Btn onClick={save} disabled={!edit?.clientName || !edit?.serviceId}>
              Save
            </Btn>
          </>
        }
      >
        {edit && (
          <div className="space-y-4">
            <Card>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Select
                    label="Existing client"
                    value={edit.clientId}
                    onChange={(e) => {
                      const c = clients.find((x) => x.id === e.target.value);
                      setEdit({ ...edit, clientId: e.target.value, clientName: c?.name ?? "", phone: c?.phone ?? "", email: c?.email ?? "" });
                    }}
                    options={[{ value: "", label: "— New / walk-in client —" }, ...clients.map((c) => ({ value: c.id, label: `${c.name} · ${c.phone}` }))]}
                  />
                </div>
                <Input label="Client name" value={edit.clientName} onChange={(e) => setEdit({ ...edit, clientName: e.target.value })} />
                <Input label="Phone" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
                <div className="sm:col-span-2">
                  <Input label="Email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
                </div>
              </div>
            </Card>
            <Card>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Select
                    label="Service"
                    value={edit.serviceId}
                    onChange={(e) => {
                      const s = services.find((x) => x.id === e.target.value);
                      setEdit({ ...edit, serviceId: e.target.value, price: s?.price ?? edit.price, duration: s?.duration ?? edit.duration, serviceName: s?.name ?? "" });
                    }}
                    options={[{ value: "", label: "Select a service" }, ...services.map((s) => ({ value: s.id, label: `${s.name} · ${formatPrice(s.price, settings.currency)}` }))]}
                  />
                </div>
                <Select label="Artist" value={edit.staffId} onChange={(e) => setEdit({ ...edit, staffId: e.target.value, staffName: e.target.value ? edit.staffName : "Any available" })} options={[{ value: "", label: "Any available" }, ...team.map((t) => ({ value: t.id, label: t.name }))]} />
                <Select label="Status" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as AppointmentStatus })} options={STATUSES.map((s) => ({ value: s, label: s }))} />
                <Input label="Date" type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} />
                <Input label="Time" type="time" value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} />
                <Input label={`Price (${settings.currency})`} type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} />
                <Select label="Source" value={edit.source} onChange={(e) => setEdit({ ...edit, source: e.target.value as Appointment["source"] })} options={["website", "admin", "phone", "walk-in"].map((s) => ({ value: s, label: s }))} />
                <div className="sm:col-span-2">
                  <Textarea label="Notes" value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} />
                </div>
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Appointments />
    </Suspense>
  );
}
