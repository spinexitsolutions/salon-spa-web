"use client";

import { Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { GiftCard } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge, Card, Empty, PageTitle } from "@/components/admin/ui";

export default function GiftCards() {
  const { giftCards, settings, upsert, remove } = useStore();
  const active = giftCards.filter((g) => g.status === "active");
  return (
    <>
      <PageTitle title="Gift cards" subtitle={`${active.length} active · ${formatPrice(active.reduce((s, g) => s + g.amount, 0), settings.currency)} outstanding balance`} />
      {!giftCards.length ? (
        <Empty>No gift cards sold yet.</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {giftCards.map((g) => (
            <Card key={g.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[15px] font-medium tracking-wider">{g.code}</div>
                  <div className="mt-0.5 text-[12.5px] text-[#F3EDE3]/45">
                    {g.from || "—"} → {g.to || "—"} · {formatDate(g.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[20px] font-semibold tracking-tight">{formatPrice(g.amount, settings.currency)}</div>
                  <span className="text-[11px] capitalize text-[#F3EDE3]/40">{g.design}</span>
                </div>
              </div>
              {g.message && <p className="mt-3 rounded-xl bg-white/[0.03] p-3 text-[13px] italic text-[#F3EDE3]/60">“{g.message}”</p>}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-[12px] text-[#F3EDE3]/45">
                  {g.buyerPhone} {g.recipientEmail && `· ${g.recipientEmail}`}
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <Badge status={g.status} />
                    <select value={g.status} onChange={(e) => upsert("giftCards", { ...g, status: e.target.value as GiftCard["status"] })} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Status">
                      {["active", "redeemed", "expired"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <button onClick={() => confirm("Delete gift card?") && remove("giftCards", g.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#F3EDE3]/35 hover:bg-rose-500/10 hover:text-rose-300">
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
