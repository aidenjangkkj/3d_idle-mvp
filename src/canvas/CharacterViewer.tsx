// src/canvas/CharacterViewer.tsx
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Group, Object3D } from "three";
import { Vector3 } from "three";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useMvpStore } from "../store/mvpStore";
import type { SelectedAction } from "../store/mvpStore";
import * as THREE from "three";

type GLTFResult = {
  scene: Group;
  animations: THREE.AnimationClip[];
};

type AnimKey = SelectedAction; // "idle" | "play" | "feed" | "sleep | "hit"

export function CharacterViewer() {
  const modelUrl = useMvpStore((s) => s.modelUrl);
  const selectedAction = useMvpStore((s) => s.selectedAction);
  const actionTrigger = useMvpStore((s) => s.actionTrigger);
  const setSelectedAction = useMvpStore((s) => s.setSelectedAction);
  const triggerAction = useMvpStore((s) => s.triggerAction);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    triggerAction("hit");
  };
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(modelUrl) as unknown as GLTFResult;

  const { actions, names } = useAnimations(animations, groupRef);

  // glTF 클립명 기반 자동 매핑 (없으면 null)
  const animNames = useMemo(() => {
    const find = (re: RegExp) =>
      names.find((n) => re.test(n.toLowerCase())) ?? null;

    return {
      idle: find(/idle/),
      play: find(/dance|play/), // Dance
      feed: find(/bite_front|feed/), // 없으면 fallback
      hit: find(/hitrecieve|feed/),
      sleep: find(/death|nap/), // 없으면 fallback
    } satisfies Record<AnimKey, string | null>;
  }, [names]);

  const playIdle = useCallback(() => {
    const idle = animNames.idle ? actions[animNames.idle] : undefined;
    idle?.reset().fadeIn(0.15).setLoop(THREE.LoopRepeat, Infinity).play();
  }, [actions, animNames.idle]);

  // 클립 1회 재생 + 끝나면 idle
  const playOnce = useCallback(
    (key: AnimKey) => {
      const clipName = animNames[key];
      if (!clipName) return false;

      const act = actions[clipName];
      if (!act) return false;

      const idle = animNames.idle ? actions[animNames.idle] : undefined;

      idle?.fadeOut(0.08);
      act.reset().fadeIn(0.1).setLoop(THREE.LoopOnce, 1);
      act.clampWhenFinished = true;
      act.play();

      const mixer = act.getMixer();
      const handler: (e: THREE.AnimationMixerEventMap["finished"]) => void = (
        e
      ) => {
        if (e.action !== act) return;
        mixer.removeEventListener("finished", handler);
        act.fadeOut(0.1);
        playIdle();
        setSelectedAction("idle");
      };
      mixer.addEventListener("finished", handler);

      return true;
    },
    [actions, animNames, playIdle, setSelectedAction]
  );

  // ✅ 애니 없을 때 대체 모션
  const fallbackMotion = useCallback(
    (key: AnimKey) => {
      const g = groupRef.current;
      if (!g) return;

      if (key === "feed") {
        quickBounce(g, () => {
          playIdle();
          setSelectedAction("idle");
        });
        return;
      }

      if (key === "sleep") {
        softSleep(g, () => {
          playIdle();
          setSelectedAction("idle");
        });
        return;
      }

      if (key === "play") {
        quickBounce(g, () => {
          playIdle();
          setSelectedAction("idle");
        });
      }
    },
    [playIdle, setSelectedAction]
  );

  // 초기 Idle
  useEffect(() => {
    playIdle();
  }, [playIdle]);

  // ✅ 버튼/터치 모두: actionTrigger가 증가할 때마다 실행
  useEffect(() => {
    if (selectedAction === "idle") return;

    const ok = playOnce(selectedAction);
    if (!ok) fallbackMotion(selectedAction);
  }, [actionTrigger, selectedAction, playOnce, fallbackMotion]);

  // 모델 터치 = play 트리거

  return (
    <>
      <group ref={groupRef} onClick={onClick} scale={1} position={[0, -0.9, 0]}>
        <primitive object={scene as unknown as Object3D} />
      </group>

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        minDistance={2.2}
        maxDistance={3.2}
        minPolarAngle={Math.PI / 2} // 최소 (45°)
        maxPolarAngle={Math.PI / 2} // 최대 (90°)
        target={new Vector3(0, 0.2, 0)}
      />
    </>
  );
}

function quickBounce(target: Group, done: () => void) {
  const startY = target.position.y;
  const start = performance.now();
  const durationMs = 350;

  const tick = (t: number) => {
    const p = Math.min(1, (t - start) / durationMs);
    const eased = 1 - (1 - p) * (1 - p);
    target.position.y = startY + Math.sin(eased * Math.PI) * 0.1;

    if (p < 1) requestAnimationFrame(tick);
    else {
      target.position.y = startY;
      done();
    }
  };
  requestAnimationFrame(tick);
}

function softSleep(target: Group, done: () => void) {
  const startY = target.position.y;
  const startS = target.scale.x;
  const start = performance.now();
  const durationMs = 600;

  const tick = (t: number) => {
    const p = Math.min(1, (t - start) / durationMs);
    const eased = p * p;
    target.position.y = startY - eased * 0.06;

    const s = startS * (1 - eased * 0.03);
    target.scale.setScalar(s);

    if (p < 1) requestAnimationFrame(tick);
    else {
      target.position.y = startY;
      target.scale.setScalar(startS);
      done();
    }
  };
  requestAnimationFrame(tick);
}

useGLTF.preload("/models/monster.gltf");
