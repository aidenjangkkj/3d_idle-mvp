import { useActivity, useFlow } from "@stackflow/react/future";

const TUTORIAL_SEEN_KEY = "cute-mvp:tutorial-seen";

type TopTarget =
  | "TodayMissionActivity"
  | "FarmerMissionActivity"
  | "InformationActivity"
  | "ProfileActivity"
  | "DexActivity"
  | "CustomizeActivity";

type TodaySubTarget =
  | "JackpotActivity"
  | "RoulletActivity"
  | "EventAroundActivity"
  | "ShowBenefitActivity"
  | "LiveWatchingActivity";

function ScreenShell({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const { pop } = useFlow();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        padding: "16px",
        display: "grid",
        gap: 12,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.96)",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 16,
          padding: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>{title}</strong>
        <button
          type="button"
          onClick={() => pop()}
          style={{
            borderRadius: 999,
            border: "1px solid rgba(15,23,42,0.12)",
            background: "rgba(255,255,255,0.95)",
            padding: "8px 12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>
      {children}
    </div>
  );
}

function NavGrid({
  items,
  mode = "push",
}: {
  items: Array<{ label: string; target: TopTarget | TodaySubTarget }>;
  mode?: "push" | "replace";
}) {
  const { push, replace } = useFlow();
  const activity = useActivity();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}
    >
      {items.map((item) => (
        <button
          key={item.target}
          type="button"
          onClick={() => {
            if (item.target === activity.name) return;
            if (mode === "replace") {
              replace(item.target, {});
              return;
            }
            push(item.target, {});
          }}
          style={{
            borderRadius: 14,
            border: "1px solid rgba(15,23,42,0.12)",
            background: "rgba(255,255,255,0.96)",
            padding: "14px 12px",
            textAlign: "left",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function PrimaryNav({ mode = "push" }: { mode?: "push" | "replace" }) {
  return (
    <NavGrid
      mode={mode}
      items={[
        { label: "TodayMission", target: "TodayMissionActivity" },
        { label: "FarmerMission", target: "FarmerMissionActivity" },
        { label: "Information", target: "InformationActivity" },
        { label: "Profile", target: "ProfileActivity" },
        { label: "Dex", target: "DexActivity" },
        { label: "Customize", target: "CustomizeActivity" },
      ]}
    />
  );
}

function TodayMissionSubNav() {
  return (
    <NavGrid
      items={[
        { label: "Jackpot", target: "JackpotActivity" },
        { label: "Roullet", target: "RoulletActivity" },
        { label: "EventAround", target: "EventAroundActivity" },
        { label: "ShowBenefit", target: "ShowBenefitActivity" },
        { label: "LiveWatching", target: "LiveWatchingActivity" },
      ]}
    />
  );
}

export function TutorialActivity() {
  const { replace } = useFlow();

  const handleStart = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
    replace("MainActivity", {});
  };

  return (
    <ScreenShell title="Tutorial">
      <button
        type="button"
        onClick={handleStart}
        style={{
          borderRadius: 14,
          border: "1px solid rgba(15,23,42,0.12)",
          background: "rgba(255,255,255,0.96)",
          padding: "14px 12px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Start → Main
      </button>
      <PrimaryNav mode="push" />
    </ScreenShell>
  );
}

export function MainActivity() {
  return (
    <ScreenShell title="Main">
      <div className="hero" data-character-anchor="true" style={{ height: "280px" }} />
      <PrimaryNav mode="push" />
    </ScreenShell>
  );
}

export function TodayMissionActivity() {
  return (
    <ScreenShell title="TodayMission">
      <TodayMissionSubNav />
      <PrimaryNav mode="replace" />
    </ScreenShell>
  );
}

export function FarmerMissionActivity() {
  return (
    <ScreenShell title="FarmerMission">
      <PrimaryNav mode="replace" />
    </ScreenShell>
  );
}

export function InformationActivity() {
  return (
    <ScreenShell title="Information">
      <PrimaryNav mode="replace" />
    </ScreenShell>
  );
}

export function ProfileActivity() {
  return (
    <ScreenShell title="Profile">
      <PrimaryNav mode="replace" />
    </ScreenShell>
  );
}

export function DexActivity() {
  return (
    <ScreenShell title="Dex">
      <div className="hero" data-character-anchor="true" style={{ height: "280px" }} />
      <PrimaryNav mode="replace" />
    </ScreenShell>
  );
}

export function CustomizeActivity() {
  return (
    <ScreenShell title="Customize">
      <PrimaryNav mode="replace" />
    </ScreenShell>
  );
}

export function JackpotActivity() {
  return (
    <ScreenShell title="TodayMission / Jackpot">
      <TodayMissionSubNav />
    </ScreenShell>
  );
}

export function RoulletActivity() {
  return (
    <ScreenShell title="TodayMission / Roullet">
      <TodayMissionSubNav />
    </ScreenShell>
  );
}

export function EventAroundActivity() {
  return (
    <ScreenShell title="TodayMission / EventAround">
      <TodayMissionSubNav />
    </ScreenShell>
  );
}

export function ShowBenefitActivity() {
  return (
    <ScreenShell title="TodayMission / ShowBenefit">
      <TodayMissionSubNav />
    </ScreenShell>
  );
}

export function LiveWatchingActivity() {
  return (
    <ScreenShell title="TodayMission / LiveWatching">
      <TodayMissionSubNav />
    </ScreenShell>
  );
}
