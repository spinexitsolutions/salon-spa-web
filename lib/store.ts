"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seed } from "./seed";
import type { CollectionKey, Collections, ObjectKey, Section, SiteData } from "./types";
import { uid } from "./utils";

type Item<K extends CollectionKey> = Collections[K][number];

type Actions = {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  patch: <K extends ObjectKey>(key: K, value: Partial<SiteData[K]>) => void;
  upsert: <K extends CollectionKey>(key: K, item: Item<K>) => void;
  remove: <K extends CollectionKey>(key: K, id: string) => void;
  move: (key: CollectionKey, id: string, dir: -1 | 1) => void;
  setSections: (s: Section[]) => void;
  importData: (d: Partial<SiteData>) => void;
  reset: () => void;
};

export type Store = SiteData & Actions;

export const STORE_KEY = "solene-site-v2";

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...seed(),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      patch: (key, value) =>
        set((s) => ({ [key]: { ...s[key], ...value } }) as Partial<Store>),
      upsert: (key, item) =>
        set((s) => {
          const list = s[key] as { id: string }[];
          const it = item as { id: string };
          if (!it.id) it.id = uid();
          const exists = list.some((x) => x.id === it.id);
          return {
            [key]: exists ? list.map((x) => (x.id === it.id ? it : x)) : [it, ...list],
          } as Partial<Store>;
        }),
      remove: (key, id) =>
        set((s) => ({ [key]: (s[key] as { id: string }[]).filter((x) => x.id !== id) }) as Partial<Store>),
      move: (key, id, dir) =>
        set((s) => {
          const list = [...(s[key] as { id: string }[])];
          const i = list.findIndex((x) => x.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= list.length) return {};
          [list[i], list[j]] = [list[j], list[i]];
          return { [key]: list } as Partial<Store>;
        }),
      setSections: (sections) => set({ sections }),
      importData: (d) => set({ ...seed(), ...d }),
      reset: () => set({ ...seed() }),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 1,
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hydrated, setHydrated, patch, upsert, remove, move, setSections, importData, reset, ...data } = s;
        return data;
      },
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<SiteData>;
        const fresh = seed();
        return {
          ...current,
          ...p,
          settings: { ...fresh.settings, ...p.settings },
          theme: { ...fresh.theme, ...p.theme },
          intro: { ...fresh.intro, ...p.intro },
          hero: { ...fresh.hero, ...p.hero },
          announcement: { ...fresh.announcement, ...p.announcement },
          sections: p.sections?.length ? p.sections : fresh.sections,
        };
      },
    }
  )
);

/** transient UI state — not persisted */
type UI = {
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  replayIntro: number;
  triggerIntro: () => void;
};

export const useUI = create<UI>()((set) => ({
  introDone: false,
  setIntroDone: (v) => set({ introDone: v }),
  menuOpen: false,
  setMenuOpen: (v) => set({ menuOpen: v }),
  replayIntro: 0,
  triggerIntro: () => set((s) => ({ replayIntro: s.replayIntro + 1, introDone: false })),
}));

export function getSiteData(): SiteData {
  const s = useStore.getState();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hydrated, setHydrated, patch, upsert, remove, move, setSections, importData, reset, ...data } = s;
  return data;
}
