"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { WORLD } from "@/data/world";
import { attachKeyboard } from "./controls";
import { Car, CarBody } from "./Car";
import { CameraRig } from "./CameraRig";
import { Ground } from "./Ground";
import { Structures } from "./Structures";
import { Toys } from "./Toys";

export default function Scene() {
  useEffect(() => attachKeyboard(), []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 40, near: 2, far: 460, position: [22, 58, 42] }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        // 保留绘制缓冲：截图 / 分享能拍到画面
        preserveDrawingBuffer: true,
      }}
    >
      <color attach="background" args={["#efe8d8"]} />
      <fog attach="fog" args={["#efe8d8", 110, 320]} />
      <ambientLight intensity={0.9} color="#fffaf0" />
      <hemisphereLight args={["#fdf3dc", "#cfc4a8", 0.55]} />

      {/* 世界与车不依赖物理引擎——就算 wasm 没就绪也能开 */}
      <Ground />
      <Structures />
      <Car />
      <CameraRig />

      {/* 物理引擎只管“可撞道具”，挂起或失败都不影响主体验 */}
      <Suspense fallback={null}>
        <Physics gravity={[0, -22, 0]}>
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider
              args={[WORLD.ground / 2, 1, WORLD.ground / 2]}
              position={[0, -1, 0]}
            />
          </RigidBody>
          <CarBody />
          <Toys />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
