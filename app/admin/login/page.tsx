"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { AUTH_KEY } from "@/lib/auth";
import { SafeImg } from "@/components/motion";

export default function Login() {
  const router = useRouter();
  const settings = useStore((s) => s.settings);
  const hero = useStore((s) => s.hero);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = useStore.getState().settings;
    if (email.trim().toLowerCase() === s.adminEmail.toLowerCase() && pass === s.adminPassword) {
      try {
        sessionStorage.setItem(AUTH_KEY, "1");
        if (remember) localStorage.setItem(AUTH_KEY, "1");
      } catch {}
      router.replace("/admin");
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 600);
    }
  };

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <SafeImg src={hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <div className="display text-7xl">{settings.brandName}</div>
          <p className="mt-2 text-white/70">Studio OS — appointments, clients and your entire website in one calm place.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <motion.form
          onSubmit={submit}
          animate={err ? { x: [0, -10, 10, -6, 6, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[380px]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-[#0E0E0E]">
            <Lock size={20} />
          </span>
          <h1 className="mt-6 text-[32px] font-semibold tracking-[-0.03em]">Sign in to Studio</h1>
          <p className="mt-1 text-[14px] text-[#F3EDE3]/50">Manage {settings.brandName}&apos;s bookings, CRM and content.</p>
          <div className="mt-8 space-y-3">
            <input className="admin-input h-12" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            <input className="admin-input h-12" type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
          <label className="mt-3 flex items-center gap-2 text-[13px] text-[#F3EDE3]/60">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me signed in
          </label>
          {err && <p className="mt-3 text-[13px] text-rose-400">Incorrect email or password.</p>}
          <button className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-medium text-[#0E0E0E]">
            Continue <ArrowRight size={16} />
          </button>
          <div className="mt-6 rounded-2xl bg-[#141310] p-4 text-[12.5px] text-[#F3EDE3]/55 shadow-sm">
            <div className="font-medium text-[#F3EDE3]/75">Demo credentials</div>
            <div className="mt-1 font-mono">admin@solene.studio</div>
            <div className="font-mono">solene123</div>
            <button
              type="button"
              onClick={() => {
                setEmail(useStore.getState().settings.adminEmail);
                setPass(useStore.getState().settings.adminPassword);
              }}
              className="mt-2 text-accent"
            >
              Autofill →
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
