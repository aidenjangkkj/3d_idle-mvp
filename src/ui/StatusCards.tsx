import { useMvpStore } from "../store/mvpStore";

type StatProps = { title: string; icon: string; value: number };

export function StatusCards() {
  const hunger = useMvpStore((s) => s.hunger);
  const fatigue = useMvpStore((s) => s.fatigue);
  const boredom = useMvpStore((s) => s.boredom);

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}
    >
      <StatCard title="배고픔" icon="🍗" value={hunger} />
      <StatCard title="피로" icon="😴" value={fatigue} />
      <StatCard title="지루함" icon="😑" value={boredom} />
    </div>
  );
}

function StatCard({ title, icon, value }: StatProps) {
  return (
    <div className="tossCard" style={{ padding: "0px 14px" }}>
      <div className="tossRow" style={{ marginBottom: 10 }}>
        <div className="tossTitle">
          {icon} {title}
        </div>
        <div className="tossSub">{value}%</div>
      </div>
      <div
        style={{
          height: 8,
          background: "rgba(15,23,42,0.08)",
          borderRadius: 999,
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 999,
            background: "rgba(15,23,42,0.65)",
          }}
        />
      </div>
    </div>
  );
}
