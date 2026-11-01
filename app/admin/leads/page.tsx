"use client";

import { useState } from "react";
import { Mail, MessageCircle, Phone, Trash2, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import type { LeadStatus } from "@/lib/types";
import { formatDate, todayISO, uid } from "@/lib/utils";
import { Badge, Btn, Card, Empty, PageTitle, Segmented } from "@/components/admin/ui";

const STATUSES: LeadStatus[] = ["new", "contacted", "converted", "closed"];

export default function Leads() {
  const { leads, clients, upsert, remove } = useStore();
  const [type, setType] = useState<"all" | "enquiry" | "callback" | "newsletter">("all");
  const list = leads.filter((l) => type === "all" || l.type === type);

  return (
    <>
      <PageTitle title="Leads & enquiries" subtitle="Every form on the website lands here — contact, callbacks and newsletter." />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATUSES.map((s) => (
          <Card key={s} className="p-4">
            <div className="text-[12px] capitalize text-[#F3EDE3]/45">{s}</div>
            <div className="mt-1 text-[26px] font-semibold tracking-tight">{leads.filter((l) => l.status === s).length}</div>
          </Card>
        ))}
      </div>
      <div className="mb-4">
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: `All (${leads.length})` },
            { value: "enquiry", label: "Enquiries" },
            { value: "callback", label: "Callbacks" },
            { value: "newsletter", label: "Newsletter" },
          ]}
        />
      </div>
      {!list.length ? (
        <Empty>Nothing here yet.</Empty>
      ) : (
        <div className="space-y-2">
          {list.map((l) => (
            <Card key={l.id} className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-medium">{l.name || l.email || l.phone}</span>
                    <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] capitalize">{l.type}</span>
                    <span className="text-[12px] text-[#F3EDE3]/40">{formatDate(l.createdAt)}</span>
                  </div>
                  {l.message && <p className="mt-1 text-[13.5px] text-[#F3EDE3]/60">{l.message}</p>}
                  <div className="mt-1 flex flex-wrap gap-3 text-[12.5px] text-[#F3EDE3]/50">
                    {l.phone && <span>{l.phone}</span>}
                    {l.email && <span>{l.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {l.phone && (
                    <>
                      <a href={`tel:${l.phone}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05]" title="Call">
                        <Phone size={14} />
                      </a>
                      <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]" title="WhatsApp">
                        <MessageCircle size={14} />
                      </a>
                    </>
                  )}
                  {l.email && (
                    <a href={`mailto:${l.email}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05]" title="Email">
                      <Mail size={14} />
                    </a>
                  )}
                  <label className="relative cursor-pointer">
                    <Badge status={l.status} />
                    <select value={l.status} onChange={(e) => upsert("leads", { ...l, status: e.target.value as LeadStatus })} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Status">
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  {l.type !== "newsletter" && l.status !== "converted" && (
                    <Btn
                      variant="ghost"
                      className="h-9 px-3"
                      title="Convert to client"
                      onClick={() => {
                        if (!clients.some((c) => c.phone === l.phone && l.phone)) {
                          upsert("clients", { id: uid("c"), name: l.name || l.email, phone: l.phone, email: l.email, tags: "Lead", notes: l.message, birthday: "", createdAt: todayISO() });
                        }
                        upsert("leads", { ...l, status: "converted" });
                      }}
                    >
                      <UserPlus size={14} /> Convert
                    </Btn>
                  )}
                  <button onClick={() => remove("leads", l.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#F3EDE3]/35 hover:bg-rose-500/10 hover:text-rose-300" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
