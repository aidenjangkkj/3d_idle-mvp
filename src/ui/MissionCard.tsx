export function MissionCard() {
  return (
    <div className="tossCard" style={{ padding: 14 }}>
      <div className="tossTitle" style={{ marginBottom: 10 }}>
        🎯 오늘의 미션
      </div>
      <MissionItem done text="밥 주기" />
      <MissionItem text="쓰다듬기" />
      <MissionItem text="같이 놀기" />
    </div>
  );
}

function MissionItem({ text, done = false }: { text: string; done?: boolean }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
      }}
    >
      <input type="checkbox" checked={done} readOnly />
      <span style={{ opacity: done ? 0.5 : 0.9 }}>{text}</span>
    </label>
  );
}
