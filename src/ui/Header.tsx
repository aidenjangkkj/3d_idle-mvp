import { useMvpStore } from "../store/mvpStore";

export function Header() {
  const level = useMvpStore((s) => s.level);
  const intimacy = useMvpStore((s) => s.intimacy);
  const coins = useMvpStore((s) => s.coins);
  const view = useMvpStore((s) => s.view);
  const setView = useMvpStore((s) => s.setView);

  return (
    <div className="tossCard" style={{ padding: 12, width: "100%" }}>
      <div className="tossRow">
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
        <div className="tossRow" style={{ gap: 10 }}>
          <div className="tossTitle">💰 {coins}</div>
          <button
            type="button"
            onClick={() => setView(view === "home" ? "shop" : "home")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.95)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {view === "home" ? "상점" : "뒤로"}
          </button>
        </div>
      </div>
    </div>
  );
}
