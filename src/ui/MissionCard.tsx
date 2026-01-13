import { useState } from "react";
import { useMvpStore } from "../store/mvpStore";
import { getMissions } from "./missions";
import type { MissionTab } from "./missions";

export function MissionCard() {
  const [tab, setTab] = useState<MissionTab>("daily");
  const actionCounts = useMvpStore((s) => s.actionCounts);
  const level = useMvpStore((s) => s.level);
  const intimacy = useMvpStore((s) => s.intimacy);
  const purchaseCount = useMvpStore((s) => s.purchaseCount);
  const missionsClaimed = useMvpStore((s) => s.missionsClaimed);
  const claimMission = useMvpStore((s) => s.claimMission);
  const missions = getMissions({
    actionCounts,
    level,
    intimacy,
    purchaseCount,
  }).filter((mission) => mission.tab === tab);

  return (
    <div className="tossCard" style={{ padding: 14 }}>
      <div
        className="tossRow"
        style={{
          marginTop: 10,
          gap: 8,
          width: "100%",
          display: "flex",
        }}
      >
        <TabButton active={tab === "daily"} onClick={() => setTab("daily")}>
          일일
        </TabButton>

        <TabButton active={tab === "weekly"} onClick={() => setTab("weekly")}>
          주간
        </TabButton>
      </div>
      {missions.map((mission) => (
        <MissionItem
          key={mission.id}
          done={mission.done}
          text={mission.text}
          reward={mission.reward}
          claimed={Boolean(missionsClaimed[mission.id])}
          onClaim={() => claimMission(mission.id, mission.reward)}
        />
      ))}
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 10px",
        flex: 1,
        borderRadius: 999,
        border: "1px solid rgba(15,23,42,0.10)",
        background: active ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.95)",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function MissionItem({
  text,
  reward,
  done = false,
  claimed = false,
  onClaim,
}: {
  text: string;
  reward: number;
  done?: boolean;
  claimed?: boolean;
  onClaim: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
      }}
    >
      <input type="checkbox" checked={done} readOnly />
      <div style={{ flex: 1, display: "grid", gap: 4 }}>
        <span style={{ opacity: done ? 0.5 : 0.9 }}>{text}</span>
        <span style={{ fontSize: 12, opacity: 0.7 }}>보상 {reward} 코인</span>
      </div>
      {done ? (
        claimed ? (
          <span style={{ fontSize: 12, opacity: 0.6 }}>수령 완료</span>
        ) : (
          <button
            type="button"
            onClick={onClaim}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(15,23,42,0.08)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            보상 받기
          </button>
        )
      ) : null}
    </div>
  );
}
