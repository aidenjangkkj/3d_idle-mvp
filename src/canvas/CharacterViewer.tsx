// src/canvas/CharacterViewer.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Group, Object3D } from "three";
import { Vector3 } from "three";
import { Html, OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
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
  const [bubble, setBubble] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
    key: number;
  }>({
    visible: false,
    text: "",
    x: 50,
    y: 50,
    key: 0,
  });
  const bubbleTimerRef = useRef<number | null>(null);
  const controlsRef = useRef<any>(null);
  const cameraFxFrameRef = useRef<number | null>(null);
  const cameraRestPositionRef = useRef<Vector3 | null>(null);
  const cameraRestTargetRef = useRef<Vector3 | null>(null);
  const isCameraFxRunningRef = useRef(false);

  const showBubble = useCallback((text: string) => {
    if (bubbleTimerRef.current) {
      window.clearTimeout(bubbleTimerRef.current);
    }

    const x = Math.random() * 90 + 5;
    const y = Math.random() * 75 + 10;

    setBubble((prev) => ({
      visible: true,
      text,
      x,
      y,
      key: prev.key + 1,
    }));

    bubbleTimerRef.current = window.setTimeout(() => {
      setBubble((prev) => ({ ...prev, visible: false }));
      bubbleTimerRef.current = null;
    }, 1400);
  }, []);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    showBubble("앗! 건드렸어요");
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

  const playHitCameraFx = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // 복귀 기준점은 최초 1회만 캡처한다.
    if (!cameraRestPositionRef.current || !cameraRestTargetRef.current) {
      cameraRestPositionRef.current = controls.object.position.clone();
      cameraRestTargetRef.current = controls.target.clone();
    }

    if (cameraFxFrameRef.current) {
      window.cancelAnimationFrame(cameraFxFrameRef.current);
      cameraFxFrameRef.current = null;
    }

    const restPositionRef = cameraRestPositionRef.current;
    const restTargetRef = cameraRestTargetRef.current;
    if (!restPositionRef || !restTargetRef) return;

    const restPosition = restPositionRef.clone();
    const restTarget = restTargetRef.clone();
    const startPosition = controls.object.position.clone();
    const startTarget = controls.target.clone();
    const impactPosition = restPosition.clone().add(new Vector3(0, -0.12, -0.45));
    const impactTarget = restTarget.clone().add(new Vector3(0, 0.04, 0));
    const durationMs = 520;
    const attackRatio = 0.32;
    const startAt = performance.now();

    const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
    isCameraFxRunningRef.current = true;

    const tick = (now: number) => {
      const p = Math.min(1, (now - startAt) / durationMs);
      const movingToImpact = p < attackRatio;

      const phase = movingToImpact
        ? easeOut(p / attackRatio)
        : easeOut((p - attackRatio) / (1 - attackRatio));

      const nextPosition = movingToImpact
        ? startPosition.clone().lerp(impactPosition, phase)
        : impactPosition.clone().lerp(restPosition, phase);
      const nextTarget = movingToImpact
        ? startTarget.clone().lerp(impactTarget, phase)
        : impactTarget.clone().lerp(restTarget, phase);

      const shakePower = p < 0.45 ? (1 - p / 0.45) * 0.025 : 0;
      const shakeX = (Math.random() - 0.5) * shakePower;
      const shakeY = (Math.random() - 0.5) * shakePower * 0.6;

      controls.object.position.set(
        nextPosition.x + shakeX,
        nextPosition.y + shakeY,
        nextPosition.z
      );
      controls.target.set(nextTarget.x, nextTarget.y, nextTarget.z);
      controls.object.lookAt(nextTarget.x, nextTarget.y, nextTarget.z);
      controls.update();

      if (p < 1) {
        cameraFxFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      controls.object.position.copy(restPosition);
      controls.target.copy(restTarget);
      controls.object.lookAt(restTarget.x, restTarget.y, restTarget.z);
      controls.update();
      cameraFxFrameRef.current = null;
      isCameraFxRunningRef.current = false;
    };

    cameraFxFrameRef.current = window.requestAnimationFrame(tick);
  }, []);

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

  useEffect(() => {
    if (selectedAction !== "hit") return;
    playHitCameraFx();
  }, [actionTrigger, selectedAction, playHitCameraFx]);

  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) {
        window.clearTimeout(bubbleTimerRef.current);
      }
      if (cameraFxFrameRef.current) {
        window.cancelAnimationFrame(cameraFxFrameRef.current);
      }
      isCameraFxRunningRef.current = false;
    };
  }, []);

  // 모델 터치 = play 트리거
  const deg = (d: number) => (d * Math.PI) / 180;
  return (
    <>
      <group ref={groupRef} onClick={onClick} scale={1} position={[0, -0.9, 0]}>
        <primitive object={scene as unknown as Object3D} />
      </group>
      {bubble.visible && (
        <Html fullscreen>
          <div
            className="character-bubble"
            key={bubble.key}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
            }}
          >
            {bubble.text}
          </div>
        </Html>
      )}

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minDistance={2.2}
        maxDistance={3.2}
        minPolarAngle={deg(60)} // 60°
        maxPolarAngle={deg(90)} // 90°
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

useGLTF.preload(`${import.meta.env.BASE_URL}models/monster.gltf`);
