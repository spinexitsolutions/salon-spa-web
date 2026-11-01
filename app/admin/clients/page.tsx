"use client";

import { useMemo, useState } from "react";
import { Download, Mail, MessageCircle, Phone, Plus, Search, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Client } from "@/lib/types";
import { formatDate, formatPrice, formatTime, initials, todayISO, uid } from "@/lib/utils";
import { Badge, Btn, Card, Drawer, Empty, Input, PageTitle, Segmented, Textarea } from "@/components/admin/ui";

export default function Clients() {
  const { clients, appointments, settings, upsert, remove } = useStore();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"recent" | "spend" | "visits">("recent");
  const [edit, setEdit] = useState<Client | null>(null);

  const stats = useMemo(() => {
    const m: Record<string, { spend: number; visits: number; last: string }> = {};
    appointments.forEach((a) => {
      const k = a.clientId;
      m[k] ??= { spend: 0, visits: 0, last: "" };
      if (a.status === "completed") {
        m[k].spend += a.price;
        m[k].visits += 1;
        if (a.date > m[k].last) m[k].last = a.date;
      }
    });
    return m;
  }, [appointments]);

  const list = clients
    .filter((c) => !q || [c.name, c.phone, c.email, c.tags].join(" ").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (sort === "spend") return (stats[b.id]?.spend ?? 0) - (stats[a.id]?.spend ?? 0);
      if (sort === "visits") return (stats[b.id]?.visits ?? 0) - (stats[a.id]?.visits ?? 0);
      return b.createdAt.localeCompare(a.createdAt);
    });

  const exportCsv = () => {
    const rows = [["Name", "Phone", "Email", "Tags", "Visits", "Total spend", "Last visit", "Joined"]];
    clients.forEach((c) => rows.push([c.name, c.phone, c.email, c.tags, String(stats[c.id]?.visits ?? 0), String(stats[c.id]?.spend ?? 0), stats[c.id]?.last ?? "", c.createdAt]));
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "clients.csv";
    a.click();
  };

  const history = edit ? appointments.filter((a) => a.clientId === edit.id).sort((a, b) => b.date.localeCompare(a.date)) : [];

  return (
    <>
      <PageTitle
        title="Clients"
        subtitle={`${clients.length} people · lifetime value ${formatPrice(Object.values(stats).reduce((s, x) => s + x.spend, 0), settings.currency)}`}
        actions={
          <>
            <Btn variant="ghost" onClick={exportCsv}>
              <Download size={14} /> Export CSV
            </Btn>
            <Btn onClick={() => setEdit({ id: "", name: "", phone: "", email: "", tags: "", notes: "", birthday: "", createdAt: todayISO() })}>
              <Plus size={15} /> Add client
            </Btn>
          </>
        }
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
          <input className="admin-input pl-9" placeholder="Search clients or tags…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Segmented value={sort} onChange={setSort} options={[{ value: "recent", label: "Newest" }, { value: "spend", label: "Top spend" }, { value: "visits", label: "Most visits" }]} />
      </div>

      {!list.length ? (
        <Empty>No clients found.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const st = stats[c.id];
            return (
              <button key={c.id} onClick={() => setEdit(c)} className="rounded-[20px] bg-white p-4 text-left shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-[14px] font-semibold text-accent">{initials(c.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-medium">{c.name}</div>
                    <div className="truncate text-[12.5px] text-black/45">{c.phone}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
                  <div>
                    <div className="text-black/40">Visits</div>
                    <div className="text-[15px] font-semibold">{st?.visits ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-black/40">Spend</div>
                    <div className="text-[15px] font-semibold">{formatPrice(st?.spend ?? 0, settings.currency)}</div>
                  </div>
                  <div>
                    <div className="text-black/40">Last</div>
                    <div className="text-[13px] font-medium">{st?.last ? formatDate(st.last) : "—"}</div>
                  </div>
                </div>
                {c.tags && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.tags.split(",").map((t) => (
                      <span key={t} className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px]">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? edit.name : "New client"}
        footer={
          <>
            {edit?.id && (
              <Btn
                variant="danger"
                className="mr-auto"
                onClick={() => {
                  if (confirm("Delete client? Appointments stay in history.")) {
                    remove("clients", edit.id);
                    setEdit(null);
                  }
                }}
              >
                <Trash2 size={14} />
              </Btn>
            )}
            <Btn variant="ghost" onClick={() => setEdit(null)}>
              Close
            </Btn>
            <Btn
              disabled={!edit?.name}
              onClick={() => {
                if (!edit) return;
                upsert("clients", { ...edit, id: edit.id || uid("c") });
                setEdit(null);
              }}
            >
              Save
            </Btn>
          </>
        }
      >
        {edit && (
          <div className="space-y-4">
            {edit.id && (
              <div className="grid grid-cols-3 gap-2">
                <a href={`tel:${edit.phone}`} className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-[12px] shadow-sm">
                  <Phone size={16} className="text-accent" /> Call
                </a>
                <a href={`https://wa.me/${edit.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-[12px] shadow-sm">
                  <MessageCircle size={16} className="text-[#25D366]" /> WhatsApp
                </a>
                <a href={`mailto:${edit.email}`} className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-[12px] shadow-sm">
                  <Mail size={16} className="text-sky-600" /> Email
                </a>
              </div>
            )}
            <Card>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
                <Input label="Phone" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
                <Input label="Email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
                <Input label="Birthday" type="date" value={edit.birthday} onChange={(e) => setEdit({ ...edit, birthday: e.target.value })} />
                <div className="sm:col-span-2">
                  <Input label="Tags (comma separated)" value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} placeholder="VIP, Bride, Sensitive skin" />
                </div>
                <div className="sm:col-span-2">
                  <Textarea label="Private notes" value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} placeholder="Allergies, preferences, formulas…" />
                </div>
              </div>
            </Card>
            {edit.id && (
              <Card title={`Visit history (${history.length})`}>
                <div className="divide-y divide-black/5">
                  {history.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] font-medium">{a.serviceName}</div>
                        <div className="text-[12px] text-black/45">
                          {formatDate(a.date, { day: "numeric", month: "short", year: "numeric" })} · {formatTime(a.time)} · {a.staffName}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-[13px]">{formatPrice(a.price, settings.currency)}</span>
                        <Badge status={a.status} />
                      </div>
                    </div>
                  ))}
                  {!history.length && <p className="py-4 text-center text-[13px] text-black/40">No visits yet.</p>}
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
