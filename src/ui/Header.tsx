import { useMvpStore } from "../store/mvpStore";

export type HeaderTab = "home" | "missions" | "shop";

export function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: HeaderTab;
  onTabChange: (tab: HeaderTab) => void;
}) {
  const level = useMvpStore((s) => s.level);
  const intimacy = useMvpStore((s) => s.intimacy);
  const coins = useMvpStore((s) => s.coins);

  return (
    <div className="tossCard" style={{ padding: 12, width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        <TabButton
          active={activeTab === "home"}
          onClick={() => onTabChange("home")}
        >
          🏠 홈
        </TabButton>
        <TabButton
          active={activeTab === "missions"}
          onClick={() => onTabChange("missions")}
        >
          🎯 미션
        </TabButton>
        <TabButton
          active={activeTab === "shop"}
          onClick={() => onTabChange("shop")}
        >
          🛒 상점
        </TabButton>
      </div>

      {activeTab === "home" ? (
        <>
          <div className="tossRow" style={{ marginTop: 12 }}>
            <div>
              <div className="tossTitle">키우기</div>
              <div className="tossSub">Lv. {level}</div>
              <div
                aria-label={`친밀도 ${intimacy}%`}
                style={{
                  marginTop: 6,
                  height: 8,
                  width: 120,
                  background: "rgba(15,23,42,0.08)",
                  borderRadius: 999,
                }}
              >
                <div
                  style={{
                    width: `${intimacy}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.65)",
                  }}
                />
              </div>
            </div>
            <div className="tossTitle">💰 {coins}</div>
          </div>
        </>
      ) : activeTab === "missions" ? (
        <div className="tossRow" style={{ marginTop: 12 }}>
          <div className="tossTitle">미션</div>
          <div className="tossTitle">💰 {coins}</div>
        </div>
      ) : (
        <div className="tossRow" style={{ marginTop: 12 }}>
          <div className="tossTitle">상점</div>
          <div className="tossTitle">💰 {coins}</div>
        </div>
      )}
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
        padding: "10px 12px",
        borderRadius: 14,
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
