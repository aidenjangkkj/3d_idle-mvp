import { useEffect, useMemo, useState } from "react";
import { CharacterScene } from "./CharacterScene";

type DockRect = { top: number; left: number; width: number; height: number };

function getLatestAnchor(): HTMLElement | null {
  const activities = Array.from(
    document.querySelectorAll<HTMLElement>(".stackflow-activity")
  );
  if (!activities.length) return null;

  const topActivity = activities
    .map((activity) => {
      const zIndex = Number(window.getComputedStyle(activity).zIndex);
      return {
        activity,
        zIndex: Number.isFinite(zIndex) ? zIndex : 0,
      };
    })
    .sort((a, b) => b.zIndex - a.zIndex)[0]?.activity;
  if (!topActivity) return null;

  // 전환 중에는 도크를 숨겨서 slide 애니메이션 영향을 받지 않게 한다.
  if (topActivity.dataset.transition !== "enter-done") return null;

  return (
    topActivity.querySelector<HTMLElement>("[data-character-anchor='true']") ?? null
  );
}

export function GlobalCharacterDock() {
  const [rect, setRect] = useState<DockRect | null>(null);

  useEffect(() => {
    let intervalId: number | null = null;

    const sync = () => {
      const anchor = getLatestAnchor();
      if (!anchor) {
        setRect(null);
        return;
      }

      const box = anchor.getBoundingClientRect();
      setRect((prev) => {
        if (
          prev &&
          prev.top === box.top &&
          prev.left === box.left &&
          prev.width === box.width &&
          prev.height === box.height
        ) {
          return prev;
        }
        return {
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
        };
      });
    };

    sync();
    intervalId = window.setInterval(sync, 120);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, []);

  const style = useMemo(() => {
    if (!rect) {
      return {
        opacity: 0,
        pointerEvents: "none" as const,
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      };
    }

    return {
      opacity: 1,
      pointerEvents: "auto" as const,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }, [rect]);

  return (
    <div className="global-character-dock" style={style}>
      <CharacterScene />
    </div>
  );
}
