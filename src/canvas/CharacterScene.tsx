// src/canvas/CharacterScene.tsx
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { CharacterViewer } from "./CharacterViewer";
import { useMvpStore } from "../store/mvpStore";

export function CharacterScene() {
  const quality = useMvpStore((s) => s.quality);
  const desiredFps = useMvpStore((s) => s.desiredFps);

  // 모바일 WebView: 과한 DPR 금지
  const dpr: [number, number] = quality === "high" ? [1, 2] : [1, 1.25];

  // MVP: 프레임 제한은 r3f의 frameloop을 “demand”로 바꾸는 것보다,
  // 우선은 DPR/그림자/후처리 끄는 게 효과 큼.
  // (원하면 다음 단계에서 “interaction 중에만 invalidate()” 구조로 바꿀 수 있음)
  void desiredFps;

  return (
    <Canvas
      dpr={dpr}
      shadows={false}
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 1.2, 2.6], fov: 70, near: 0.5, far: 50 }}
      gl={{
        antialias: quality === "high",
        powerPreference: "high-performance",
        alpha: true,
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 4, 2]} intensity={1.1} />
      <Environment preset="city" />

      <CharacterViewer />
    </Canvas>
  );
}
