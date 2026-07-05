"use client";

import { RigidBody } from "@react-three/rapier";
import { toys } from "@/data/world";

/** 可以被车撞飞的物理道具 —— bruno-simon 的灵魂 */
export function Toys() {
  return (
    <group>
      {toys.map((t, i) => {
        if (t.kind === "crate") {
          return (
            <RigidBody
              key={i}
              colliders="cuboid"
              position={[t.x, t.y, t.z]}
              friction={0.8}
              restitution={0.15}
            >
              <mesh castShadow receiveShadow>
                <boxGeometry args={[t.s, t.s, t.s]} />
                <meshStandardMaterial color="#c89b5f" roughness={0.85} />
              </mesh>
              {/* 箱面警示条 */}
              <mesh position={[0, 0, t.s / 2 + 0.005]}>
                <planeGeometry args={[t.s * 0.85, t.s * 0.22]} />
                <meshStandardMaterial color="#8a6534" roughness={0.8} />
              </mesh>
            </RigidBody>
          );
        }
        if (t.kind === "cone") {
          return (
            <RigidBody
              key={i}
              colliders="hull"
              position={[t.x, 0.9, t.z]}
              friction={0.7}
              restitution={0.2}
            >
              <mesh castShadow>
                <coneGeometry args={[0.72, 1.7, 14]} />
                <meshStandardMaterial color="#ff7a2e" roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.55, 0.6, 0.28, 14]} />
                <meshStandardMaterial color="#e8edf2" roughness={0.5} />
              </mesh>
            </RigidBody>
          );
        }
        return (
          <RigidBody
            key={i}
            colliders="ball"
            position={[t.x, t.r + 0.5, t.z]}
            friction={0.5}
            restitution={0.65}
          >
            <mesh castShadow>
              <sphereGeometry args={[t.r, 24, 24]} />
              <meshStandardMaterial color="#e89b18" roughness={0.35} metalness={0.15} />
            </mesh>
          </RigidBody>
        );
      })}
    </group>
  );
}
