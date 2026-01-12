import { ITEM_CATALOG, useMvpStore } from "../store/mvpStore";

const ITEM_ICONS = {
  food: "🍗",
  toy: "🎾",
  bed: "🛏️",
} as const;

export function ShopPage() {
  const coins = useMvpStore((s) => s.coins);
  const items = useMvpStore((s) => s.items);
  const buyItem = useMvpStore((s) => s.buyItem);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="tossCard" style={{ padding: 12 }}>
        <div className="tossTitle">상점</div>
        <div className="tossSub" style={{ marginTop: 6 }}>
          보유 코인 {coins}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {Object.entries(ITEM_CATALOG).map(([key, item]) => {
          const itemKey = key as keyof typeof ITEM_CATALOG;
          return (
            <div key={itemKey} className="tossCard" style={{ padding: 12 }}>
              <div className="tossRow" style={{ marginBottom: 10 }}>
                <div className="tossTitle">
                  {ITEM_ICONS[itemKey]} {item.label}
                </div>
                <div className="tossSub">{item.price} 코인</div>
              </div>
              <div className="tossSub" style={{ marginBottom: 10 }}>
                보유 {items[itemKey]}
              </div>
              <button
                type="button"
                onClick={() => buyItem(itemKey)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.95)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                구매
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
