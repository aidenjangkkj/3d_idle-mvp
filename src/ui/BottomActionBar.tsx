// src/ui/BottomActionBar.tsx

import { useMvpStore } from "../store/mvpStore";

type Action = "feed" | "play" | "sleep";
type Props = { onAction: (type: Action) => void };

export function BottomActionBar({ onAction }: Props) {
  const items = useMvpStore((s) => s.items);

  return (
    <div className="tossCard" style={{ padding: 10, marginBottom: "1rem" }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
      >
        <ActionButton
          label={`🍗 밥 (${items.food})`}
          disabled={items.food <= 0}
          onClick={() => onAction("feed")}
        />
        <ActionButton
          label={`🎾 놀기 (${items.toy})`}
          disabled={items.toy <= 0}
          onClick={() => onAction("play")}
        />
        <ActionButton
          label={`😴 잠 (${items.bed})`}
          disabled={items.bed <= 0}
          onClick={() => onAction("sleep")}
        />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={(e) => {
        // ✅ Canvas/OrbitControls 쪽으로 이벤트가 흘러가는 걸 차단
        e.stopPropagation();
      }}
      onClick={() => {
        // ✅ 클릭이 들어오는지 확인용(문제 해결되면 제거)
        console.log("[ActionButton]", label);
        onClick();
      }}
      style={{
        padding: "12px 10px",
        borderRadius: 14,
        border: "1px solid rgba(15,23,42,0.10)",
        background: disabled ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.95)",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}
