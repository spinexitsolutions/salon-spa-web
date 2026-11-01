"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Parallax, Reveal } from "@/components/motion";
import PageHeader from "@/components/site/PageHeader";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const posts = useStore((s) => s.posts);
  const hydrated = useStore((s) => s.hydrated);
  const post = posts.find((p) => p.slug === slug);
  const { scrollYProgress } = useScroll();
  const w = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  if (!post)
    return (
      <div className="pb-32">
        <PageHeader eyebrow="Journal" title={hydrated ? "Story not" : "Loading"} italic={hydrated ? "found." : "…"} />
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Link href="/journal" className="link-underline text-sm">Back to journal</Link>
        </div>
      </div>
    );

  return (
    <article className="pb-28">
      <motion.div className="fixed left-0 top-0 z-[101] h-[3px] origin-left bg-accent" style={{ scaleX: w, width: "100%" }} />
      <div className="mx-auto max-w-3xl px-5 pt-32 md:pt-40">
        <Link href="/journal" className="eyebrow flex items-center gap-2 text-soft hover:text-ink">
          <ArrowLeft size={12} /> Journal
        </Link>
        <div className="eyebrow mt-8 flex gap-3 text-soft">
          <span className="text-accent">{post.category}</span>
          <span>{formatDate(post.date, { day: "numeric", month: "long", year: "numeric" })}</span>
          <span>{post.readTime}</span>
        </div>
        <h1 className="display mt-4 text-[7.8vw] md:text-7xl">{post.title}</h1>
        <p className="mt-5 text-xl text-soft">{post.excerpt}</p>
        <div className="mt-4 text-sm">By {post.author}</div>
      </div>
      <Parallax src={post.image} className="mx-auto mt-12 aspect-[16/9] w-[calc(100%-24px)] max-w-[1300px] rounded-[var(--radius)]" />
      <div className="mx-auto mt-14 max-w-2xl space-y-6 px-5 text-[18px] leading-[1.75]">
        {post.body.split("\n").filter(Boolean).map((para, i) => (
          <Reveal key={i} y={20}>
            <p className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-accent" : ""}>{para}</p>
          </Reveal>
        ))}
      </div>
    </article>
  );
}
