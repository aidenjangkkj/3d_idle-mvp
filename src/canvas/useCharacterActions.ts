// src/canvas/useCharacterActions.ts
import * as THREE from "three";
import { useCallback, useMemo, useRef } from "react";
import type { AnimationAction, AnimationClip, AnimationMixer } from "three";

type MixerRef = React.MutableRefObject<AnimationMixer | null>;

type ActiveActionRef = React.MutableRefObject<AnimationAction | null>;

export function useCharacterActions(
  animations: AnimationClip[],
  mixerRef: MixerRef
) {
  const activeRef = useRef<AnimationAction | null>(null) as ActiveActionRef;

  const { idleClip, danceClip } = useMemo(() => {
    const findByName = (name: string) =>
      animations.find(
        (c) => c.name.trim().toLowerCase() === name.toLowerCase()
      ) ?? null;

    const idle =
      findByName("Idle") ??
      animations.find((c) => c.name.toLowerCase().includes("idle")) ??
      null;
    const dance =
      findByName("Dance") ??
      animations.find((c) => c.name.toLowerCase().includes("dance")) ??
      null;

    return { idleClip: idle, danceClip: dance };
  }, [animations]);

  const hasDanceClip = danceClip !== null;

  const fadeTo = useCallback(
    (next: AnimationAction, fadeSec: number) => {
      const prev = activeRef.current;
      if (prev === next) return;

      if (prev) prev.fadeOut(fadeSec);
      next.reset().fadeIn(fadeSec).play();
      activeRef.current = next;
    },
    [activeRef]
  );

  const playIdle = useCallback(() => {
    const mixer = mixerRef.current;
    if (!mixer || !idleClip) return;

    const idleAction = mixer.clipAction(idleClip);
    idleAction.setLoop(THREE.LoopRepeat, Infinity);
    fadeTo(idleAction, 0.15);
  }, [fadeTo, idleClip, mixerRef]);

  // loopDance=true면 계속 춤, false면 1회 후 idle 복귀
  const playDance = useCallback(
    (opts?: { loopDance?: boolean; onFinished?: () => void }) => {
      const mixer = mixerRef.current;
      if (!mixer || !danceClip) return;

      const loopDance = opts?.loopDance ?? false;

      const danceAction = mixer.clipAction(danceClip);
      danceAction.clampWhenFinished = true;
      danceAction.setLoop(
        loopDance ? THREE.LoopRepeat : THREE.LoopOnce,
        loopDance ? Infinity : 1
      );

      fadeTo(danceAction, 0.12);

      if (loopDance) return;

      const handler: (
        event: THREE.AnimationMixerEventMap["finished"]
      ) => void = (event) => {
        // 다른 액션 종료 이벤트는 무시
        if (event.action !== danceAction) return;
        mixer.removeEventListener("finished", handler);
        opts?.onFinished?.();
      };

      mixer.addEventListener("finished", handler);
    },
    [danceClip, fadeTo, mixerRef]
  );

  return { playIdle, playDance, hasDanceClip, hasIdleClip: idleClip !== null };
}
