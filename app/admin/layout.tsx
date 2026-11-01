"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ExternalLink,
  FileText,
  Gift,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Palette,
  Percent,
  Play,
  Scissors,
  Settings,
  Sparkles,
  Star,
  Tags,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AUTH_KEY } from "@/lib/auth";


const NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "CRM",
    items: [
      { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
      { href: "/admin/clients", label: "Clients", icon: Users },
      { href: "/admin/leads", label: "Leads & Enquiries", icon: Inbox },
      { href: "/admin/gift-cards", label: "Gift cards", icon: Gift },
    ],
  },
  {
    group: "CMS",
    items: [
      { href: "/admin/site", label: "Homepage builder", icon: LayoutTemplate },
      { href: "/admin/cms/services", label: "Services", icon: Scissors },
      { href: "/admin/cms/categories", label: "Categories", icon: Tags },
      { href: "/admin/cms/team", label: "Team", icon: UserRound },
      { href: "/admin/cms/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/cms/testimonials", label: "Testimonials", icon: Star },
      { href: "/admin/cms/packages", label: "Memberships", icon: Sparkles },
      { href: "/admin/cms/offers", label: "Offers", icon: Percent },
      { href: "/admin/cms/posts", label: "Journal", icon: FileText },
      { href: "/admin/cms/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/cms/stats", label: "Numbers", icon: BarChart3 },
    ],
  },
  {
    group: "Design",
    items: [
      { href: "/admin/intro", label: "Intro animation", icon: Play },
      { href: "/admin/branding", label: "Brand & theme", icon: Palette },
    ],
  },
  { group: "System", items: [{ href: "/admin/settings", label: "Business settings", icon: Settings }] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const brand = useStore((s) => s.settings.brandName);
  const newLeads = useStore((s) => s.leads.filter((l) => l.status === "new").length);
  const pending = useStore((s) => s.appointments.filter((a) => a.status === "pending").length);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    let ok = false;
    try {
      ok = sessionStorage.getItem(AUTH_KEY) === "1" || localStorage.getItem(AUTH_KEY) === "1";
    } catch {}
    setAuthed(ok);
    if (!ok && !isLogin) router.replace("/admin/login");
  }, [isLogin, router, pathname]);

  useEffect(() => setMobileNav(false), [pathname]);

  if (isLogin) return <div className="min-h-[100dvh] bg-[#f5f5f7] text-[#1d1d1f]">{children}</div>;
  if (!authed || !hydrated)
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f5f5f7]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </div>
    );

  const logout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_KEY);
    } catch {}
    router.replace("/admin/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-3 pb-5 pt-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1d1d1f] font-serif text-lg italic text-white">{brand.charAt(0)}</span>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold">{brand}</div>
          <div className="text-[11.5px] text-black/45">Studio OS</div>
        </div>
      </div>
      <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto pb-4">
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-black/35">{g.group}</div>
            {g.items.map((it) => {
              const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
              const count = it.href === "/admin/leads" ? newLeads : it.href === "/admin/appointments" ? pending : 0;
              return (
                <Link key={it.href} href={it.href} className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors", active ? "text-black" : "text-black/60 hover:bg-black/[0.04] hover:text-black")}>
                  {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <it.icon size={16} className={cn("relative", active && "text-accent")} />
                  <span className="relative flex-1">{it.label}</span>
                  {count > 0 && <span className="relative rounded-full bg-accent px-1.5 text-[11px] font-medium text-white">{count}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-black/5 pt-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] text-black/60 hover:bg-black/[0.04]">
          <ExternalLink size={16} /> View website
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] text-black/60 hover:bg-black/[0.04]">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#f5f5f7] font-sans text-[#1d1d1f]">
      <aside className="fixed inset-y-0 left-0 hidden w-[256px] border-r border-black/5 bg-[#f5f5f7]/80 p-3 backdrop-blur-xl lg:block">{sidebar}</aside>

      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black/5 bg-white/75 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button onClick={() => setMobileNav(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5" aria-label="Open navigation">
          <Menu size={17} />
        </button>
        <span className="text-[15px] font-semibold">{brand} Studio</span>
        <a href="/" target="_blank" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5" aria-label="View site">
          <BookOpen size={16} />
        </a>
      </div>
      <AnimatePresence>
        {mobileNav && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="absolute inset-y-0 left-0 w-[280px] bg-[#f5f5f7] p-3">
              <button onClick={() => setMobileNav(false)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/5" aria-label="Close">
                <X size={15} />
              </button>
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="px-4 py-6 md:px-8 md:py-8 lg:ml-[256px]">
        <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto max-w-[1200px]">
          {children}
        </motion.div>
      </main>
    </div>
  );
}
