// src/app/App.tsx
import "./app.css";

import { CharacterScene } from "../canvas/CharacterScene";
import { BottomActionBar } from "../ui/BottomActionBar";
import { Header } from "../ui/Header";
import { EmotionBubble } from "../ui/EmotionBubble";
import { StatusCards } from "../ui/StatusCards";
import { ShopPage } from "../ui/ShopPage";
import { MissionCard } from "../ui/MissionCard";

import { useMvpStore } from "../store/mvpStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMissions } from "../ui/missions";

type Action = "feed" | "play" | "sleep";

export default function App() {
  const selectedAction = useMvpStore((s) => s.selectedAction);
  useEffect(() => {
    console.log("[store] selectedAction =", selectedAction);
  }, [selectedAction]);

  // src/app/App.tsx
  const triggerAction = useMvpStore((s) => s.triggerAction);
  const adjustNeeds = useMvpStore((s) => s.adjustNeeds);
  const adjustBond = useMvpStore((s) => s.adjustBond);
  const useItemForAction = useMvpStore((s) => s.useItemForAction);
  const view = useMvpStore((s) => s.view);
  const actionCounts = useMvpStore((s) => s.actionCounts);
  const level = useMvpStore((s) => s.level);
  const intimacy = useMvpStore((s) => s.intimacy);
  const purchaseCount = useMvpStore((s) => s.purchaseCount);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>(
    []
  );
  const prevDoneRef = useRef<Record<string, boolean>>({});
  const didInitRef = useRef(false);

  const missions = useMemo(
    () =>
      getMissions({
        actionCounts,
        level,
        intimacy,
        purchaseCount,
      }),
    [actionCounts, level, intimacy, purchaseCount]
  );

  useEffect(() => {
    const nextDone: Record<string, boolean> = {};
    const now = Date.now();
    let toastIndex = 0;

    missions.forEach((mission) => {
      const wasDone = prevDoneRef.current[mission.id];
      nextDone[mission.id] = mission.done;
      if (didInitRef.current && mission.done && !wasDone) {
        const id = now + toastIndex;
        toastIndex += 1;
        setToasts((current) => [
          ...current,
          {
            id,
            message: `미션 완료: ${mission.text} (+${mission.reward} 코인)`,
          },
        ]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 2500);
      }
    });

    prevDoneRef.current = nextDone;
    if (!didInitRef.current) {
      didInitRef.current = true;
    }
  }, [missions]);

  const handleAction = (type: Action) => {
    if (!useItemForAction(type)) return;
    if (type === "play") triggerAction("play");
    if (type === "feed") triggerAction("feed");
    if (type === "sleep") triggerAction("sleep");
    adjustNeeds(type);
    adjustBond(type);
  };

  return (
    <div className="app">
      <div className="top">
        <Header />
      </div>

      {/* ✅ 중앙형: 3D를 ‘히어로 영역’에만 배치 */}
      <div className="hero">
        <CharacterScene />
      </div>

      {view === "missions" ? (
        <div className="heroMission">
          <MissionCard />
        </div>
      ) : null}

      {/* ✅ 카드 영역(스크롤 가능) */}
      <div className="content">
        {view === "home" ? (
          <>
            <EmotionBubble />
            <StatusCards />
          </>
        ) : view === "shop" ? (
          <ShopPage />
        ) : null}
      </div>

      {/* ✅ 하단 고정 액션바 */}
      {view === "home" ? (
        <div className="bottom">
          <BottomActionBar onAction={handleAction} />
        </div>
      ) : null}

      {view === "home" && toasts.length > 0 ? (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 92,
            transform: "translateX(-50%)",
            display: "grid",
            gap: 8,
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.92)",
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 12px 24px rgba(15,23,42,0.2)",
                letterSpacing: "-0.2px",
              }}
            >
              {toast.message}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
