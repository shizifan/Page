"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { WORLD, districts, obstacles, pois } from "@/data/world";
import { input, readAxis } from "./controls";
import { carState, resetCar, useWorldStore } from "./store";

const WHEELBASE = 2.6;
const CAR_RADIUS = 1.6;
const ACCEL = 44;
const BRAKE = 75;
const MAX_FWD = 28;
const MAX_REV = 12;

/** 圆 vs AABB 推离 */
function collide(): void {
  for (const o of obstacles) {
    const dx = carState.x - o.x;
    const dz = carState.z - o.z;
    const cx = Math.max(-o.hx, Math.min(o.hx, dx));
    const cz = Math.max(-o.hz, Math.min(o.hz, dz));
    const px = dx - cx;
    const pz = dz - cz;
    const d2 = px * px + pz * pz;
    if (d2 > CAR_RADIUS * CAR_RADIUS) continue;
    if (d2 > 1e-6) {
      const d = Math.sqrt(d2);
      const push = CAR_RADIUS - d;
      carState.x += (px / d) * push;
      carState.z += (pz / d) * push;
    } else {
      // 圆心在盒内：沿最浅轴推出
      const ox = o.hx - Math.abs(dx) + CAR_RADIUS;
      const oz = o.hz - Math.abs(dz) + CAR_RADIUS;
      if (ox < oz) carState.x += Math.sign(dx || 1) * ox;
      else carState.z += Math.sign(dz || 1) * oz;
    }
    carState.speed *= 0.82;
  }
  // 地图边界
  const b = WORLD.bound;
  if (Math.abs(carState.x) > b) {
    carState.x = Math.sign(carState.x) * b;
    carState.speed *= 0.8;
  }
  if (Math.abs(carState.z) > b) {
    carState.z = Math.sign(carState.z) * b;
    carState.speed *= 0.8;
  }
}

/**
 * 车辆视觉 + 驾驶逻辑。刻意放在 <Physics> 之外：
 * 物理引擎只负责“撞箱子”，就算它没就绪，车照样能开。
 */
export function Car() {
  const groupRef = useRef<THREE.Group>(null);
  const frontLeft = useRef<THREE.Group>(null);
  const frontRight = useRef<THREE.Group>(null);
  const wheelFL = useRef<THREE.Mesh>(null);
  const wheelFR = useRef<THREE.Mesh>(null);
  const wheelRL = useRef<THREE.Mesh>(null);
  const wheelRR = useRef<THREE.Mesh>(null);
  const spin = useRef(0);
  const pollTimer = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const driving = useWorldStore.getState().phase === "drive";
    const { throttle, steer } = driving ? readAxis() : { throttle: 0, steer: 0 };

    if (input.resetRequested) {
      input.resetRequested = false;
      if (driving) resetCar();
    }

    /* ── 纵向 ── */
    const maxFwd = input.boost ? MAX_FWD * 1.35 : MAX_FWD;
    let v = carState.speed;
    if (throttle > 0) {
      v += (v < 0 ? BRAKE : ACCEL) * throttle * dt;
    } else if (throttle < 0) {
      v += (v > 0 ? -BRAKE : ACCEL * throttle) * dt;
    } else {
      // 松油门滑行
      v -= Math.sign(v) * Math.min(Math.abs(v), 10 * dt + Math.abs(v) * 0.6 * dt);
    }
    v = Math.max(-MAX_REV, Math.min(maxFwd, v));

    /* ── 转向（速度越快舵角越小） ── */
    const speedK = Math.min(1, Math.abs(v) / MAX_FWD);
    const maxSteer = 0.62 - 0.34 * speedK;
    const targetSteer = steer * maxSteer;
    carState.steer += (targetSteer - carState.steer) * Math.min(1, 16 * dt);
    carState.heading -= (v / WHEELBASE) * Math.tan(carState.steer) * dt;

    /* ── 积分 + 碰撞 ── */
    carState.speed = v;
    carState.x += Math.sin(carState.heading) * v * dt;
    carState.z += Math.cos(carState.heading) * v * dt;
    collide();

    /* ── 同步视觉 ── */
    const g = groupRef.current;
    if (g) {
      g.position.set(carState.x, 0, carState.z);
      g.rotation.y = carState.heading;
      // 轻微俯仰/侧倾，给点“悬挂”感
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -v * 0.0022, 0.15);
      g.rotation.z = THREE.MathUtils.lerp(
        g.rotation.z,
        carState.steer * speedK * 0.35,
        0.12
      );
    }

    /* ── 轮子 ── */
    spin.current += (v / 0.55) * dt;
    for (const w of [wheelFL, wheelFR, wheelRL, wheelRR]) {
      if (w.current) w.current.rotation.x = spin.current;
    }
    if (frontLeft.current) frontLeft.current.rotation.y = -carState.steer * 0.9;
    if (frontRight.current) frontRight.current.rotation.y = -carState.steer * 0.9;

    /* ── 每 ~0.12s 探测最近 POI / 分区 ── */
    pollTimer.current += dt;
    if (pollTimer.current > 0.12) {
      pollTimer.current = 0;
      const st = useWorldStore.getState();
      let best: (typeof pois)[number] | null = null;
      let bestD = Infinity;
      for (const p of pois) {
        const d = Math.hypot(carState.x - p.x, carState.z - p.z);
        if (d < p.r && d < bestD) {
          best = p;
          bestD = d;
        }
      }
      if (st.poi?.id !== best?.id) st.setPoi(best);

      let bestDist: (typeof districts)[number] | null = null;
      let dd = Infinity;
      for (const d of districts) {
        const dist = Math.hypot(carState.x - d.x, carState.z - d.z);
        if (dist < d.r && dist < dd) {
          bestDist = d;
          dd = dist;
        }
      }
      if (st.district?.id !== bestDist?.id) st.setDistrict(bestDist);
    }
  });

  return (
    <group ref={groupRef} position={[carState.x, 0, carState.z]}>
      {/* 车身 —— 深色车漆在浅色地面上对比最清晰 */}
      <mesh castShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[2.25, 0.72, 4.35]} />
        <meshStandardMaterial color="#2b3a4d" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* 座舱 */}
      <mesh castShadow position={[0, 1.42, -0.25]}>
        <boxGeometry args={[1.85, 0.6, 2.1]} />
        <meshStandardMaterial color="#131b24" metalness={0.5} roughness={0.25} />
      </mesh>
      {/* 引擎盖琥珀条纹 */}
      <mesh position={[0, 1.225, 1.15]}>
        <boxGeometry args={[0.5, 0.02, 2.0]} />
        <meshBasicMaterial color="#ffb224" toneMapped={false} />
      </mesh>
      {/* 车头灯 */}
      <mesh position={[-0.7, 0.85, 2.18]}>
        <boxGeometry args={[0.42, 0.18, 0.06]} />
        <meshBasicMaterial color="#fff3d6" toneMapped={false} />
      </mesh>
      <mesh position={[0.7, 0.85, 2.18]}>
        <boxGeometry args={[0.42, 0.18, 0.06]} />
        <meshBasicMaterial color="#fff3d6" toneMapped={false} />
      </mesh>
      {/* 尾灯 */}
      <mesh position={[0, 0.92, -2.18]}>
        <boxGeometry args={[1.7, 0.12, 0.06]} />
        <meshBasicMaterial color="#ff4d4d" toneMapped={false} />
      </mesh>
      {/* 轮子（前轮包一层转向组） */}
      <group ref={frontLeft} position={[-1.08, 0.55, 1.5]}>
        <mesh ref={wheelFL} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.55, 0.42, 18]} />
          <meshStandardMaterial color="#0d1116" roughness={0.9} />
        </mesh>
      </group>
      <group ref={frontRight} position={[1.08, 0.55, 1.5]}>
        <mesh ref={wheelFR} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.55, 0.42, 18]} />
          <meshStandardMaterial color="#0d1116" roughness={0.9} />
        </mesh>
      </group>
      <mesh ref={wheelRL} castShadow position={[-1.08, 0.55, -1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.55, 0.55, 0.42, 18]} />
        <meshStandardMaterial color="#0d1116" roughness={0.9} />
      </mesh>
      <mesh ref={wheelRR} castShadow position={[1.08, 0.55, -1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.55, 0.55, 0.42, 18]} />
        <meshStandardMaterial color="#0d1116" roughness={0.9} />
      </mesh>
      {/* 车底阴影锚点：白天也能一眼锁定小车 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[2.6, 24]} />
        <meshBasicMaterial color="#3a3428" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** 车的运动学碰撞体：放在 <Physics> 内，负责把道具撞飞 */
export function CarBody() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.setNextKinematicTranslation({ x: carState.x, y: 1.0, z: carState.z });
    quat.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, carState.heading);
    body.setNextKinematicRotation(quat);
  });
  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[carState.x, 1.0, carState.z]}
    >
      <CuboidCollider args={[1.15, 0.7, 2.3]} />
    </RigidBody>
  );
}

