// src/app/App.tsx
import "./app.css";

import { CharacterScene } from "../canvas/CharacterScene";
import { BottomActionBar } from "../ui/BottomActionBar";
import { Header } from "../ui/Header";
import { EmotionBubble } from "../ui/EmotionBubble";
import { StatusCards } from "../ui/StatusCards";
import { MissionCard } from "../ui/MissionCard";
import { ShopPage } from "../ui/ShopPage";

import { useMvpStore } from "../store/mvpStore";
import { useEffect } from "react";

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

      {/* ✅ 카드 영역(스크롤 가능) */}
      <div className="content">
        {view === "home" ? (
          <>
            <EmotionBubble />
            <StatusCards />
            <MissionCard />
          </>
        ) : (
          <ShopPage />
        )}
      </div>

      {/* ✅ 하단 고정 액션바 */}
      {view === "home" ? (
        <div className="bottom">
          <BottomActionBar onAction={handleAction} />
        </div>
      ) : null}
    </div>
  );
}
