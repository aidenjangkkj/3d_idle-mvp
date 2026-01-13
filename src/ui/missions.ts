import type { SelectedAction } from "../store/mvpStore";

export type MissionTab = "daily" | "weekly";

export type Mission = {
  id: string;
  text: string;
  reward: number;
  done: boolean;
  tab: MissionTab;
};

type MissionInputs = {
  actionCounts: Record<SelectedAction, number>;
  level: number;
  intimacy: number;
  purchaseCount: number;
};

export function getMissions({
  actionCounts,
  level,
  intimacy,
  purchaseCount,
}: MissionInputs): Mission[] {
  const totalBond = Math.max(0, (level - 1) * 100 + intimacy);

  return [
    {
      id: "daily-feed",
      text: "밥 주기 1회",
      reward: 20,
      done: actionCounts.feed >= 1,
      tab: "daily",
    },
    {
      id: "daily-play",
      text: "같이 놀기 1회",
      reward: 30,
      done: actionCounts.play >= 1,
      tab: "daily",
    },
    {
      id: "daily-sleep",
      text: "잠 재우기 1회",
      reward: 20,
      done: actionCounts.sleep >= 1,
      tab: "daily",
    },
    {
      id: "weekly-level-2",
      text: "레벨 2 달성",
      reward: 100,
      done: level >= 2,
      tab: "weekly",
    },
    {
      id: "weekly-bond-200",
      text: "친밀도 200 누적",
      reward: 150,
      done: totalBond >= 200,
      tab: "weekly",
    },
    {
      id: "weekly-purchase",
      text: "상점에서 아이템 1회 구매",
      reward: 80,
      done: purchaseCount >= 1,
      tab: "weekly",
    },
  ];
}
