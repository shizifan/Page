"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { carState, useWorldStore } from "./store";

/** 固定视向的追踪相机（bruno-simon 式高角度俯视），滚轮缩放 */
const DIR = new THREE.Vector3(0.34, 1.18, 0.92).normalize();

export function CameraRig() {
  const dist = useRef(38);
  const distTarget = useRef(38);
  const focus = useRef(new THREE.Vector3(0, 0, 10));
  const introAngle = useRef(0);
  const light = useRef<THREE.DirectionalLight>(null);
  const lightTarget = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      distTarget.current = THREE.MathUtils.clamp(
        distTarget.current + e.deltaY * 0.05,
        24,
        70
      );
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useFrame(({ camera }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const intro = useWorldStore.getState().phase === "intro";

    dist.current += (distTarget.current - dist.current) * Math.min(1, 6 * dt);

    if (intro) {
      // 开场：绕出生广场缓慢环视
      introAngle.current += dt * 0.12;
      const a = introAngle.current;
      tmp.set(Math.sin(a) * 0.55, 1.0, Math.cos(a) * 0.55).normalize();
      focus.current.lerp(new THREE.Vector3(0, 0, -6), Math.min(1, 2 * dt));
      camera.position.copy(focus.current).addScaledVector(tmp, 64);
      camera.lookAt(focus.current.x, 2, focus.current.z);
    } else {
      // 行驶：目标点带一点速度前瞻
      const lead = 0.42 * carState.speed;
      tmp.set(
        carState.x + Math.sin(carState.heading) * lead,
        0,
        carState.z + Math.cos(carState.heading) * lead
      );
      focus.current.lerp(tmp, Math.min(1, 5 * dt));
      camera.position
        .copy(focus.current)
        .addScaledVector(DIR, dist.current);
      camera.lookAt(focus.current.x, 1.2, focus.current.z);
    }

    // 阴影灯跟车，保证近景始终有影子
    if (light.current) {
      light.current.position.set(carState.x + 42, 66, carState.z - 30);
      lightTarget.position.set(carState.x, 0, carState.z);
      lightTarget.updateMatrixWorld();
    }
  });

  return (
    <>
      <primitive object={lightTarget} />
      <directionalLight
        ref={light}
        castShadow
        target={lightTarget}
        color="#fff3da"
        intensity={1.75}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={10}
        shadow-camera-far={200}
        shadow-bias={-0.0004}
      />
    </>
  );
}
