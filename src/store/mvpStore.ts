// src/store/mvpStore.ts
import { create } from "zustand";

type Quality = "low" | "high";
export type SelectedAction = "idle" | "play" | "feed" | "hit" | "sleep";
export type ItemKey = "food" | "toy" | "bed";
type View = "home" | "missions" | "shop";
export type MoodTier = "good" | "ok" | "bad";

type MvpState = {
  modelUrl: string;
  quality: Quality;
  desiredFps: 30 | 60;
  hunger: number;
  fatigue: number;
  boredom: number;
  intimacy: number;
  level: number;
  coins: number;
  items: Record<ItemKey, number>;
  view: View;
  actionCounts: Record<SelectedAction, number>;
  purchaseCount: number;
  missionsClaimed: Record<string, boolean>;

  selectedAction: SelectedAction;
  actionTrigger: number;

  setSelectedAction: (a: SelectedAction) => void;
  triggerAction: (a: SelectedAction) => void;
  adjustNeeds: (a: SelectedAction) => void;
  adjustBond: (a: SelectedAction) => void;
  useItemForAction: (a: SelectedAction) => boolean;
  buyItem: (item: ItemKey, quantity?: number) => boolean;
  claimMission: (id: string, reward: number) => void;
  setView: (view: View) => void;

  setQuality: (q: Quality) => void;
  setDesiredFps: (fps: 30 | 60) => void;
  setModelUrl: (url: string) => void;
  hydrate: () => void;
};

const LS_KEY = "cute-mvp";

type Persisted = Pick<
  MvpState,
  "modelUrl" | "quality" | "desiredFps" | "selectedAction"
>;

const INITIAL_ITEMS: Record<ItemKey, number> = {
  food: 20,
  toy: 20,
  bed: 20,
};

const INITIAL_ACTION_COUNTS: Record<SelectedAction, number> = {
  idle: 0,
  play: 0,
  feed: 0,
  hit: 0,
  sleep: 0,
};

const NEED_DELTAS: Partial<
  Record<
    SelectedAction,
    { hunger?: number; fatigue?: number; boredom?: number }
  >
> = {
  feed: { hunger: -30, fatigue: 5, boredom: 5 },
  play: { hunger: 15, fatigue: 20, boredom: -30 },
  sleep: { hunger: 5, fatigue: -35, boredom: 10 },
};

const ACTION_ITEM: Partial<Record<SelectedAction, ItemKey>> = {
  feed: "food",
  play: "toy",
  sleep: "bed",
};

export const ITEM_CATALOG: Record<ItemKey, { label: string; price: number }> = {
  food: { label: "밥", price: 120 },
  toy: { label: "장난감", price: 200 },
  bed: { label: "침대", price: 150 },
};

const BOND_DELTAS: Partial<Record<SelectedAction, number>> = {
  feed: 6,
  play: 12,
  sleep: 4,
};

const MOOD_BOND_MULTIPLIER: Record<MoodTier, number> = {
  good: 1.25,
  ok: 1.1,
  bad: 1.0,
};

function clampNeed(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function getMoodTier(
  hunger: number,
  fatigue: number,
  boredom: number
): MoodTier {
  if (hunger >= 70 || fatigue >= 70 || boredom >= 70) return "bad";
  if (hunger >= 50 || fatigue >= 50 || boredom >= 50) return "ok";
  return "good";
}

function applyBondDelta(intimacy: number, level: number, delta: number) {
  let nextIntimacy = intimacy + delta;
  let nextLevel = level;
  while (nextIntimacy >= 100) {
    nextIntimacy -= 100;
    nextLevel += 1;
  }
  return {
    intimacy: clampNeed(nextIntimacy),
    level: nextLevel,
  };
}

export const useMvpStore = create<MvpState>((set, get) => ({
  modelUrl: `${import.meta.env.BASE_URL}models/monster.gltf`,
  quality: "high",
  desiredFps: 30,
  hunger: 60,
  fatigue: 30,
  boredom: 40,
  intimacy: 20,
  level: 1,
  coins: 1200,
  items: { ...INITIAL_ITEMS },
  view: "home",
  actionCounts: { ...INITIAL_ACTION_COUNTS },
  purchaseCount: 0,
  missionsClaimed: {},

  selectedAction: "idle",
  actionTrigger: 0,

  setQuality: (quality) => {
    set({ quality });
    persist(get());
  },

  setDesiredFps: (desiredFps) => {
    set({ desiredFps });
    persist(get());
  },

  setSelectedAction: (selectedAction) => {
    set({ selectedAction });
    persist(get());
  },

  // ✅ 같은 액션을 연타해도 항상 실행되도록 트리거 증가
  triggerAction: (selectedAction) => {
    set((s) => {
      const nextCounts = { ...s.actionCounts };
      if (selectedAction in nextCounts) {
        nextCounts[selectedAction] = nextCounts[selectedAction] + 1;
      }
      return {
        selectedAction,
        actionTrigger: s.actionTrigger + 1,
        actionCounts: nextCounts,
      };
    });
    // trigger는 굳이 저장할 필요 없음(선택)
    persist({ ...get(), selectedAction });
  },

  adjustNeeds: (selectedAction) => {
    const delta = NEED_DELTAS[selectedAction];
    if (!delta) return;
    set((s) => ({
      hunger: clampNeed(s.hunger + (delta.hunger ?? 0)),
      fatigue: clampNeed(s.fatigue + (delta.fatigue ?? 0)),
      boredom: clampNeed(s.boredom + (delta.boredom ?? 0)),
    }));
  },

  adjustBond: (selectedAction) => {
    const delta = BOND_DELTAS[selectedAction];
    if (!delta) return;
    set((s) => {
      const mood = getMoodTier(s.hunger, s.fatigue, s.boredom);
      const scaled = Math.round(delta * MOOD_BOND_MULTIPLIER[mood]);
      const next = applyBondDelta(s.intimacy, s.level, scaled);
      return { intimacy: next.intimacy, level: next.level };
    });
  },

  useItemForAction: (selectedAction) => {
    const item = ACTION_ITEM[selectedAction];
    if (!item) return true;
    const current = get().items[item];
    if (current <= 0) return false;
    set((s) => ({
      items: { ...s.items, [item]: s.items[item] - 1 },
    }));
    return true;
  },

  buyItem: (item, quantity = 1) => {
    const catalog = ITEM_CATALOG[item];
    const cost = catalog.price * quantity;
    if (get().coins < cost) return false;
    set((s) => ({
      coins: s.coins - cost,
      items: { ...s.items, [item]: s.items[item] + quantity },
      purchaseCount: s.purchaseCount + 1,
    }));
    return true;
  },

  claimMission: (id, reward) => {
    set((s) => {
      if (s.missionsClaimed[id]) return s;
      return {
        coins: s.coins + reward,
        missionsClaimed: { ...s.missionsClaimed, [id]: true },
      };
    });
  },

  setView: (view) => {
    set({ view });
  },

  setModelUrl: (modelUrl) => {
    set({ modelUrl });
    persist(get());
  },

  hydrate: () => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      set({
        modelUrl:
          parsed.modelUrl ?? `${import.meta.env.BASE_URL}models/monster.gltf`,
        quality: parsed.quality ?? "high",
        desiredFps: parsed.desiredFps ?? 30,
        selectedAction: parsed.selectedAction ?? "idle",
        hunger: 60,
        fatigue: 30,
        boredom: 40,
        intimacy: 20,
        level: 1,
        coins: 1200,
        items: { ...INITIAL_ITEMS },
        view: "home",
        actionCounts: { ...INITIAL_ACTION_COUNTS },
        purchaseCount: 0,
        missionsClaimed: {},
        // ✅ 트리거는 세션 값
        actionTrigger: 0,
      });
    } catch {
      // ignore
    }
  },
}));

function persist(state: MvpState) {
  const payload: Persisted = {
    modelUrl: state.modelUrl,
    quality: state.quality,
    desiredFps: state.desiredFps,
    selectedAction: state.selectedAction,
  };
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
}
