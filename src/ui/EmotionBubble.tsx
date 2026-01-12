import { getMoodTier, useMvpStore } from "../store/mvpStore";

type Mood = { title: string; icon: string; label: string };

const MOOD_COPY: Record<ReturnType<typeof getMoodTier>, Mood> = {
  good: { title: "오늘도 기분 좋아요", icon: "😊", label: "행복함" },
  ok: { title: "살짝 예민해요", icon: "😐", label: "보통" },
  bad: { title: "컨디션이 떨어져요", icon: "😵", label: "지침" },
};

export function EmotionBubble() {
  const hunger = useMvpStore((s) => s.hunger);
  const fatigue = useMvpStore((s) => s.fatigue);
  const boredom = useMvpStore((s) => s.boredom);
  const moodTier = getMoodTier(hunger, fatigue, boredom);
  const mood = MOOD_COPY[moodTier];

  return (
    <div className="tossCard" style={{ padding: "0px 14px" }}>
      <div className="tossTitle">{mood.title}</div>
      <div className="tossSub" style={{ marginTop: 6 }}>
        {mood.icon} {mood.label}
      </div>
    </div>
  );
}
