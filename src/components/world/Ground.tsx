"use client";

import { useMemo } from "react";
import { WORLD, groundLabels, roads } from "@/data/world";
import { makeLabelTexture, makePcbTexture } from "./textures";

export function Ground() {
  const pcb = useMemo(() => {
    const t = makePcbTexture();
    t.repeat.set(22, 22);
    return t;
  }, []);

  return (
    <group>
      {/* 主板地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD.ground, WORLD.ground]} />
        <meshStandardMaterial map={pcb} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* 道路 = 主板走线 */}
      {roads.map((r, i) => {
        const horizontal = Math.abs(r.x2 - r.x1) > Math.abs(r.z2 - r.z1);
        const len =
          Math.abs(r.x2 - r.x1) + Math.abs(r.z2 - r.z1) + r.w; // 端头补一点
        const cx = (r.x1 + r.x2) / 2;
        const cz = (r.z1 + r.z2) / 2;
        const rotZ = horizontal ? Math.PI / 2 : 0;
        return (
          <group key={i} position={[cx, 0, cz]}>
            <mesh rotation={[-Math.PI / 2, 0, rotZ]} position={[0, 0.02, 0]}>
              <planeGeometry args={[r.w, len]} />
              <meshBasicMaterial
                color="#c98a2b"
                transparent
                opacity={0.3}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, rotZ]} position={[0, 0.04, 0]}>
              <planeGeometry args={[r.w * 0.24, len]} />
              <meshBasicMaterial
                color="#a3540a"
                transparent
                opacity={0.65}
                depthWrite={false}
              />
            </mesh>
            {/* 端点过孔 */}
            {[
              [r.x1 - cx, r.z1 - cz],
              [r.x2 - cx, r.z2 - cz],
            ].map(([ox, oz], j) => (
              <mesh key={j} rotation={[-Math.PI / 2, 0, 0]} position={[ox, 0.05, oz]}>
                <ringGeometry args={[r.w * 0.28, r.w * 0.46, 24]} />
                <meshBasicMaterial
                  color="#a3540a"
                  transparent
                  opacity={0.6}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* 出生广场大环 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[12.6, 13.2, 64]} />
        <meshBasicMaterial
          color="#a3540a"
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>

      {/* 操作提示直接印在广场地面上 */}
      <GroundText
        x={0}
        z={16}
        w={26}
        h={7}
        lines={[
          { text: "WASD / 方向键 驾驶", size: 34, color: "#3a4452" },
          { text: "SHIFT BOOST · R RESET", size: 20, mono: true, color: "#a3540a", gap: 10 },
        ]}
      />

      {/* 分区地面大字 */}
      {groundLabels.map((l) => (
        <GroundText
          key={l.cn}
          x={l.x}
          z={l.z}
          rotY={l.rotY ?? 0}
          w={30}
          h={9}
          lines={[
            { text: l.cn, size: 52, weight: 700, color: "#2c3542" },
            { text: l.en, size: 22, mono: true, color: "#a3540a", gap: 12, letterSpacing: 4 },
          ]}
        />
      ))}

      {/* 边界围栏 */}
      <Fence />
    </group>
  );
}

function GroundText(props: {
  x: number;
  z: number;
  w: number;
  h: number;
  rotY?: number;
  lines: Parameters<typeof makeLabelTexture>[0]["lines"];
}) {
  const tex = useMemo(
    () =>
      makeLabelTexture({
        w: props.w * 14,
        h: props.h * 14,
        lines: props.lines,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, props.rotY ?? 0]}
      position={[props.x, 0.06, props.z]}
    >
      <planeGeometry args={[props.w, props.h]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.92}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Fence() {
  const f = WORLD.fence;
  const len = f * 2 + 2;
  const walls: Array<{ pos: [number, number, number]; rotY: number }> = [
    { pos: [0, 0, -f], rotY: 0 },
    { pos: [0, 0, f], rotY: 0 },
    { pos: [-f, 0, 0], rotY: Math.PI / 2 },
    { pos: [f, 0, 0], rotY: Math.PI / 2 },
  ];
  return (
    <group>
      {walls.map((w, i) => (
        <group key={i} position={w.pos} rotation={[0, w.rotY, 0]}>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[len, 2, 0.8]} />
            <meshStandardMaterial color="#ddd3bc" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[len, 0.12, 0.86]} />
            <meshBasicMaterial color="#d97706" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
