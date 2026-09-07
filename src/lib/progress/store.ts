import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { del, get, set } from "idb-keyval";
import {
  applyAttempt,
  applySeen,
  dayKey,
  emptyProgress,
  type ItemProgress,
  type ItemType,
} from "@/lib/rules/mastery";

/* ---------- IndexedDB-backed storage (offline, large capacity) ---------- */
const idbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => {
    await set(name, value);
  },
  removeItem: async (name) => {
    await del(name);
  },
};

export type Character = "hurufi" | "boy";
export type Difficulty = "easy" | "normal" | "hard";

export interface Profile {
  name: string;
  character: Character;
  avatarDataUrl?: string; // child's own photo (settings)
  difficulty: Difficulty;
  createdAt: number;
}

export interface DailyStat {
  minutes: number;
  items: number;
  stars: number;
}

export interface Settings {
  sound: boolean;
  darkMode: boolean;
  parentPinHash?: string;
}

interface ProgressState {
  hydrated: boolean;
  profile: Profile;
  settings: Settings;
  items: Record<string, ItemProgress>; // key: `${type}:${id}`
  stars: number;
  daily: Record<string, DailyStat>;
  streakDays: number;
  lastActiveDay?: string | undefined;

  // actions
  setHydrated: (v: boolean) => void;
  updateProfile: (p: Partial<Profile>) => void;
  updateSettings: (s: Partial<Settings>) => void;
  markSeen: (type: ItemType, id: string) => void;
  recordAttempt: (type: ItemType, id: string, correct: boolean) => { starsGained: number; mastery: number };
  addMinutes: (m: number) => void;
  getItem: (type: ItemType, id: string) => ItemProgress;
  resetProgress: () => void;
}

const key = (type: ItemType, id: string) => `${type}:${id}`;

const defaultProfile = (): Profile => ({
  name: "حروفي",
  character: "hurufi",
  difficulty: "normal",
  createdAt: Date.now(),
});

const touchDay = (s: ProgressState): Partial<ProgressState> => {
  const today = dayKey();
  if (s.lastActiveDay === today) return {};
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));
  const streakDays = s.lastActiveDay === yesterday ? s.streakDays + 1 : 1;
  return { lastActiveDay: today, streakDays };
};

const bumpDaily = (daily: Record<string, DailyStat>, patch: Partial<DailyStat>) => {
  const today = dayKey();
  const cur = daily[today] ?? { minutes: 0, items: 0, stars: 0 };
  return {
    ...daily,
    [today]: {
      minutes: cur.minutes + (patch.minutes ?? 0),
      items: cur.items + (patch.items ?? 0),
      stars: cur.stars + (patch.stars ?? 0),
    },
  };
};

export const useProgress = create<ProgressState>()(
  persist(
    (setState, getState) => ({
      hydrated: false,
      profile: defaultProfile(),
      settings: { sound: true, darkMode: false },
      items: {},
      stars: 0,
      daily: {},
      streakDays: 0,

      setHydrated: (v) => setState({ hydrated: v }),
      updateProfile: (p) => setState((s) => ({ profile: { ...s.profile, ...p } })),
      updateSettings: (patch) => setState((s) => ({ settings: { ...s.settings, ...patch } })),

      getItem: (type, id) => getState().items[key(type, id)] ?? emptyProgress(),

      markSeen: (type, id) =>
        setState((s) => {
          const k = key(type, id);
          const prev = s.items[k] ?? emptyProgress();
          if (prev.mastery >= 1) return { items: { ...s.items, [k]: { ...prev, lastSeen: Date.now() } }, ...touchDay(s) };
          return { items: { ...s.items, [k]: applySeen(prev) }, ...touchDay(s) };
        }),

      recordAttempt: (type, id, correct) => {
        const s = getState();
        const k = key(type, id);
        const prev = s.items[k] ?? emptyProgress();
        const next = applyAttempt(prev, correct);
        const starsGained = Math.max(0, next.mastery - prev.mastery) + (correct ? 1 : 0);
        setState({
          items: { ...s.items, [k]: next },
          stars: s.stars + starsGained,
          daily: bumpDaily(s.daily, { items: 1, stars: starsGained }),
          ...touchDay(s),
        });
        return { starsGained, mastery: next.mastery };
      },

      addMinutes: (m) => setState((s) => ({ daily: bumpDaily(s.daily, { minutes: m }), ...touchDay(s) })),

      resetProgress: () =>
        setState((s) => ({ ...s, items: {}, stars: 0, daily: {}, streakDays: 0, lastActiveDay: undefined })),
    }),
    {
      name: "hurufi-progress-v1",
      storage: createJSONStorage(() => idbStorage),
      skipHydration: true, // we rehydrate on the client after mount (SSR-safe)
      partialize: (s) => ({
        profile: s.profile,
        settings: s.settings,
        items: s.items,
        stars: s.stars,
        daily: s.daily,
        streakDays: s.streakDays,
        lastActiveDay: s.lastActiveDay,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

/** Progress summary helpers (used by home + parent dashboard) */
export function useSectionProgress(type: ItemType, ids: string[]) {
  const items = useProgress((s) => s.items);
  return useMemo(() => {
    let mastered = 0;
    let seen = 0;
    for (const id of ids) {
      const p = items[key(type, id)];
      if (!p) continue;
      if (p.mastery >= 1) seen++;
      if (p.mastery >= 2) mastered++;
    }
    return { mastered, seen, total: ids.length, ratio: ids.length ? mastered / ids.length : 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, type, ids.join(",")]);
}
