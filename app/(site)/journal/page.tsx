"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import PageHeader from "@/components/site/PageHeader";
import { Reveal, SafeImg } from "@/components/motion";

export default function JournalPage() {
  const posts = useStore((s) => s.posts).filter((p) => p.published);
  const [first, ...rest] = posts;
  return (
    <>
      <PageHeader eyebrow="The journal" title="Notes on" italic="beauty." intro="Rituals, routines and quiet expertise from our artists." />
      <div className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
        {first && (
          <Reveal>
            <Link href={`/journal/${first.slug}`} className="group grid items-center gap-8 md:grid-cols-2" data-cursor="Read">
              <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
                <SafeImg src={first.image} alt="" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div>
                <div className="eyebrow flex gap-3 text-soft">
                  <span className="text-accent">{first.category}</span>
                  <span>{formatDate(first.date, { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <h2 className="display mt-4 text-5xl md:text-7xl">{first.title}</h2>
                <p className="mt-4 max-w-md text-soft">{first.excerpt}</p>
                <span className="link-underline mt-6 inline-block text-sm">Read story</span>
              </div>
            </Link>
          </Reveal>
        )}
        <div className="mt-20 grid gap-10 md:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <Link href={`/journal/${p.slug}`} className="group block" data-cursor="Read">
                <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
                  <SafeImg src={p.image} alt="" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
                <div className="eyebrow mt-4 text-accent">{p.category}</div>
                <h3 className="display mt-2 text-3xl">{p.title}</h3>
                <p className="mt-2 text-sm text-soft">{p.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
