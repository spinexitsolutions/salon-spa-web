"use client";

import { Reorder } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, GripVertical, Plus, Search, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { SCHEMAS, type FieldDef } from "@/lib/schemas";
import type { CollectionKey, Collections } from "@/lib/types";
import { cn, formatPrice, slugify, todayISO, uid } from "@/lib/utils";
import { Btn, Card, Drawer, Empty, ImageInput, Input, PageTitle, Select, Textarea, Toggle } from "@/components/admin/ui";

type Row = Record<string, unknown> & { id: string };

export default function CollectionPage() {
  const { collection } = useParams<{ collection: string }>();
  const key = collection as CollectionKey;
  const schema = SCHEMAS[key];
  const store = useStore();
  const items = (store[key] ?? []) as unknown as Row[];
  const [edit, setEdit] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [q, setQ] = useState("");

  if (!schema) return <Empty>Unknown collection. <Link href="/admin" className="text-accent">Back</Link></Empty>;

  const list = items.filter((i) => !q || JSON.stringify(i).toLowerCase().includes(q.toLowerCase()));
  const save = () => {
    if (!edit) return;
    const item = { ...edit };
    if (key === "posts") {
      if (!item.slug) item.slug = slugify(String(item.title));
      if (!item.date) item.date = todayISO();
    }
    if (key === "categories" && !item.id) item.id = slugify(String(item.name));
    if (!item.id) item.id = uid();
    store.upsert(key, item as unknown as Collections[typeof key][number]);
    setEdit(null);
  };

  const subtitle = (r: Row) => {
    if (!schema.subtitleKey) return "";
    const v = r[schema.subtitleKey];
    if (key === "services") return `${v} · ${formatPrice(Number(r.price), store.settings.currency)} · ${r.duration} min`;
    return String(v ?? "");
  };

  return (
    <>
      <PageTitle
        title={schema.title}
        subtitle={schema.description}
        actions={
          <Btn
            onClick={() => {
              setIsNew(true);
              setEdit({ ...(schema.defaults as Row), id: key === "categories" ? "" : uid() });
            }}
          >
            <Plus size={15} /> Add {schema.singular}
          </Btn>
        }
      />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F3EDE3]/35" />
          <input className="admin-input pl-9" placeholder={`Search ${schema.title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span className="hidden shrink-0 text-[12.5px] text-[#F3EDE3]/40 md:block">Drag to reorder · changes go live instantly</span>
      </div>

      {!list.length ? (
        <Empty>No {schema.title.toLowerCase()} yet.</Empty>
      ) : (
        <Reorder.Group
          axis="y"
          values={list}
          onReorder={(next) => !q && useStore.setState({ [key]: next } as never)}
          className="space-y-2"
        >
          {list.map((r, i) => (
            <Reorder.Item key={r.id} value={r} className="list-none">
              <div className={cn("flex items-center gap-3 rounded-[18px] bg-[#141310] p-3 shadow-[0_0_0_1px_rgba(201,169,110,0.14)]", r.published === false && "opacity-55")}>
                <GripVertical size={16} className="hidden shrink-0 cursor-grab text-[#F3EDE3]/25 active:cursor-grabbing md:block" />
                {schema.imageKey && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={String(r[schema.imageKey] || "")} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-white/5 object-cover" />
                )}
                <button onClick={() => { setIsNew(false); setEdit({ ...r }); }} className="min-w-0 flex-1 text-left">
                  <div className="truncate text-[14.5px] font-medium">{String(r[schema.titleKey] || "Untitled")}</div>
                  <div className="truncate text-[12.5px] capitalize text-[#F3EDE3]/45">{subtitle(r)}</div>
                </button>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconBtn title="Move up" onClick={() => store.move(key, r.id, -1)} disabled={i === 0 || !!q}>
                    <ChevronUp size={15} />
                  </IconBtn>
                  <IconBtn title="Move down" onClick={() => store.move(key, r.id, 1)} disabled={i === list.length - 1 || !!q}>
                    <ChevronDown size={15} />
                  </IconBtn>
                  <IconBtn title={r.published === false ? "Publish" : "Hide"} onClick={() => store.upsert(key, { ...r, published: r.published === false } as never)}>
                    {r.published === false ? <EyeOff size={15} /> : <Eye size={15} />}
                  </IconBtn>
                  <IconBtn title="Duplicate" onClick={() => store.upsert(key, { ...r, id: key === "categories" ? `${r.id}-copy` : uid(), ...(key === "posts" ? { slug: `${r.slug}-copy` } : {}) } as never)} className="hidden md:flex">
                    <Copy size={14} />
                  </IconBtn>
                  <IconBtn title="Delete" danger onClick={() => confirm("Delete this item?") && store.remove(key, r.id)}>
                    <Trash2 size={14} />
                  </IconBtn>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title={isNew ? `New ${schema.singular}` : `Edit ${schema.singular}`}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setEdit(null)}>
              Cancel
            </Btn>
            <Btn onClick={save}>Save & publish</Btn>
          </>
        }
      >
        {edit && (
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              {schema.fields.map((f) => (
                <div key={f.key} className={f.half ? "" : "sm:col-span-2"}>
                  <FieldInput field={f} value={edit[f.key]} onChange={(v) => setEdit({ ...edit, [f.key]: v })} disabled={key === "categories" && f.key === "id" && !isNew} />
                  {f.hint && <p className="mt-1 text-[11px] text-[#F3EDE3]/40">{f.hint}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </Drawer>
    </>
  );
}

function IconBtn({ children, danger, className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button {...rest} className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[#F3EDE3]/45 transition-colors disabled:opacity-25", danger ? "hover:bg-rose-500/10 hover:text-rose-300" : "hover:bg-white/5 hover:text-[#F3EDE3]", className)}>
      {children}
    </button>
  );
}

function FieldInput({ field, value, onChange, disabled }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; disabled?: boolean }) {
  const categories = useStore((s) => s.categories);
  switch (field.type) {
    case "textarea":
      return <Textarea label={field.label} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
    case "longtext":
      return <Textarea label={field.label} rows={12} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <Input label={field.label} type="number" step="any" value={Number(value ?? 0)} onChange={(e) => onChange(Number(e.target.value))} />;
    case "date":
      return <Input label={field.label} type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "image":
      return <ImageInput label={field.label} value={String(value ?? "")} onChange={onChange} />;
    case "toggle":
      return (
        <div className="rounded-xl bg-white/[0.03] px-3 py-2">
          <Toggle label={field.label} checked={!!value} onChange={onChange} />
        </div>
      );
    case "select": {
      const opts = field.options === "categories" ? categories.map((c) => ({ value: c.id, label: c.name })) : field.options ?? [];
      return <Select label={field.label} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} options={opts} />;
    }
    default:
      return <Input label={field.label} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} disabled={disabled} />;
  }
}
