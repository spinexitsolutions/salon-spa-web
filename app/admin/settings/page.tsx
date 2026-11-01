"use client";

import { useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { getSiteData, useStore } from "@/lib/store";
import { Btn, Card, Input, PageTitle, Textarea, Toast } from "@/components/admin/ui";

export default function SettingsPage() {
  const { settings, patch, reset, importData } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState("");
  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2000);
  };
  const set = (k: keyof typeof settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => patch("settings", { [k]: e.target.value });

  return (
    <>
      <PageTitle title="Business settings" subtitle="Contact details, hours, SEO, access and data." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Contact">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Phone" value={settings.phone} onChange={set("phone")} />
            <Input label="WhatsApp (country code, digits only)" value={settings.whatsapp} onChange={set("whatsapp")} />
            <div className="sm:col-span-2">
              <Input label="Email" value={settings.email} onChange={set("email")} />
            </div>
            <Input label="Address" value={settings.address} onChange={set("address")} />
            <Input label="City / PIN" value={settings.city} onChange={set("city")} />
            <div className="sm:col-span-2">
              <Input label="Google Maps search query" value={settings.mapQuery} onChange={set("mapQuery")} />
            </div>
          </div>
        </Card>

        <Card title="Opening hours">
          <div className="space-y-2">
            {settings.hours.map((h, i) => (
              <div key={h.day} className="grid grid-cols-[90px_1fr_1fr_auto] items-center gap-2">
                <span className="text-[13.5px]">{h.day}</span>
                <input type="time" className="admin-input py-2" disabled={h.closed} value={h.open} onChange={(e) => patch("settings", { hours: settings.hours.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)) })} />
                <input type="time" className="admin-input py-2" disabled={h.closed} value={h.close} onChange={(e) => patch("settings", { hours: settings.hours.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)) })} />
                <label className="flex items-center gap-1.5 text-[12px] text-black/55">
                  <input type="checkbox" checked={h.closed} onChange={(e) => patch("settings", { hours: settings.hours.map((x, j) => (j === i ? { ...x, closed: e.target.checked } : x)) })} /> Closed
                </label>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Social & reputation">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Instagram URL" value={settings.instagram} onChange={set("instagram")} />
            <Input label="Facebook URL" value={settings.facebook} onChange={set("facebook")} />
            <Input label="YouTube URL" value={settings.youtube} onChange={set("youtube")} />
            <Input label="Currency symbol" value={settings.currency} onChange={set("currency")} />
            <Input label="Rating" value={settings.rating} onChange={set("rating")} />
            <Input label="Review count" value={settings.reviewsCount} onChange={set("reviewsCount")} />
          </div>
        </Card>

        <Card title="SEO">
          <div className="space-y-3">
            <Input label="Page title" value={settings.seoTitle} onChange={set("seoTitle")} />
            <Textarea label="Meta description" rows={3} value={settings.seoDescription} onChange={set("seoDescription")} />
          </div>
        </Card>

        <Card title="Admin access">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Admin email" value={settings.adminEmail} onChange={set("adminEmail")} />
            <Input label="Admin password" type="text" value={settings.adminPassword} onChange={set("adminPassword")} />
          </div>
          <p className="mt-2 text-[12px] text-black/45">Demo-grade auth stored in the browser. Connect a real auth provider before going live.</p>
        </Card>

        <Card title="Data & backup">
          <p className="text-[13px] text-black/55">Export the entire website, CRM and content as JSON — or restore from a backup.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn
              variant="dark"
              onClick={() => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([JSON.stringify(getSiteData(), null, 2)], { type: "application/json" }));
                a.download = `${settings.brandName.toLowerCase()}-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
            >
              <Download size={14} /> Export JSON
            </Btn>
            <Btn variant="ghost" onClick={() => file.current?.click()}>
              <Upload size={14} /> Import
            </Btn>
            <Btn
              variant="danger"
              onClick={() => {
                if (confirm("Reset all content and CRM data to the demo defaults?")) {
                  reset();
                  flash("Demo data restored");
                }
              }}
            >
              <RotateCcw size={14} /> Reset demo
            </Btn>
            <input
              ref={file}
              type="file"
              accept="application/json"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  importData(JSON.parse(await f.text()));
                  flash("Backup imported");
                } catch {
                  flash("Invalid file");
                }
              }}
            />
          </div>
        </Card>
      </div>
      <Toast show={!!toast}>{toast}</Toast>
      <p className="mt-6 text-center text-[12px] text-black/35">All changes save automatically.</p>
    </>
  );
}
