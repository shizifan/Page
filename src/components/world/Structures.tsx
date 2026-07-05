"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  CONTACT_POS,
  MONUMENT,
  decos,
  enterpriseBlocks,
  postSlabs,
  productBuildings,
  skillPillars,
  thesisBillboards,
} from "@/data/world";
import { makeFacadeTexture, makeLabelTexture, type LabelLine } from "./textures";

/** 浅色主题公共色 */
const INK = "#232b36";
const INK_DIM = "#4c5665";
const INK_FAINT = "#8b93a0";
const AMBER = "#a3540a";
const PAPER = "rgba(255,253,246,0.96)";
const WALL = "#f6f1e4";
const TRUNK = "#8a6440";
const LEAF_A = "#6aa348";
const LEAF_B = "#4c8a3f";
const LEAF_C = "#87b95e";

/** 贴在几何体上的文字面板 */
function SignPlane(props: {
  w: number;
  h: number;
  position: [number, number, number];
  rotY?: number;
  rotX?: number;
  lines: LabelLine[];
  bg?: string;
  border?: string;
  px?: number;
}) {
  const tex = useMemo(
    () =>
      makeLabelTexture({
        w: (props.px ?? 42) * props.w,
        h: (props.px ?? 42) * props.h,
        bg: props.bg,
        border: props.border,
        lines: props.lines,
        padding: 16,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <mesh
      position={props.position}
      rotation={[props.rotX ?? 0, props.rotY ?? 0, 0]}
    >
      <planeGeometry args={[props.w, props.h]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

/** 低多边形树 */
export function Tree({
  x,
  z,
  s = 1,
  kind = "tree",
}: {
  x: number;
  z: number;
  s?: number;
  kind?: "tree" | "pine";
}) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 2.2, 8]} />
        <meshStandardMaterial color={TRUNK} roughness={0.85} />
      </mesh>
      {kind === "pine" ? (
        <>
          <mesh castShadow position={[0, 3.0, 0]}>
            <coneGeometry args={[1.9, 2.6, 8]} />
            <meshStandardMaterial color={LEAF_B} roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 4.6, 0]}>
            <coneGeometry args={[1.4, 2.2, 8]} />
            <meshStandardMaterial color={LEAF_A} roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 5.9, 0]}>
            <coneGeometry args={[0.9, 1.7, 8]} />
            <meshStandardMaterial color={LEAF_C} roughness={0.8} />
          </mesh>
        </>
      ) : (
        <>
          <mesh castShadow position={[0, 3.2, 0]}>
            <icosahedronGeometry args={[1.8, 0]} />
            <meshStandardMaterial color={LEAF_A} roughness={0.8} flatShading />
          </mesh>
          <mesh castShadow position={[0.9, 2.5, 0.3]}>
            <icosahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial color={LEAF_C} roughness={0.8} flatShading />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ────────────────── 产品城区：六座小楼 ────────────────── */

function ProductBuilding({
  b,
}: {
  b: (typeof productBuildings)[number];
}) {
  const wall = useMemo(
    () => new THREE.Color(WALL).lerp(new THREE.Color(b.hue), 0.1),
    [b.hue]
  );
  const rows = Math.max(2, Math.floor(b.h / 4));
  const facade = useMemo(
    () => makeFacadeTexture({ cols: 4, rows, w: b.w - 2, h: b.h - 1, door: true }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const side = useMemo(
    () => makeFacadeTexture({ cols: 3, rows, w: b.d - 2, h: b.h - 1 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <group position={[b.x, 0, b.z]}>
      {/* 楼体 */}
      <mesh castShadow receiveShadow position={[0, b.h / 2, 0]}>
        <boxGeometry args={[b.w, b.h, b.d]} />
        <meshStandardMaterial color={wall} roughness={0.6} />
      </mesh>
      {/* 正面窗户 + 门 */}
      <mesh position={[0, b.h / 2 - 0.4, b.d / 2 + 0.06]}>
        <planeGeometry args={[b.w - 2, b.h - 1]} />
        <meshStandardMaterial map={facade} transparent roughness={0.4} />
      </mesh>
      {/* 侧面窗户 */}
      <mesh position={[-b.w / 2 - 0.06, b.h / 2 - 0.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[b.d - 2, b.h - 1]} />
        <meshStandardMaterial map={side} transparent roughness={0.4} />
      </mesh>
      <mesh position={[b.w / 2 + 0.06, b.h / 2 - 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[b.d - 2, b.h - 1]} />
        <meshStandardMaterial map={side} transparent roughness={0.4} />
      </mesh>
      {/* 屋檐与彩色屋顶 */}
      <mesh castShadow position={[0, b.h + 0.14, 0]}>
        <boxGeometry args={[b.w + 0.8, 0.28, b.d + 0.8]} />
        <meshStandardMaterial color={b.hue} roughness={0.4} />
      </mesh>
      {/* 屋顶设备 */}
      <mesh castShadow position={[b.w / 4, b.h + 0.75, -b.d / 5]}>
        <boxGeometry args={[2.2, 1.2, 1.6]} />
        <meshStandardMaterial color="#d8dde3" roughness={0.5} />
      </mesh>
      {/* 门口雨棚 */}
      <mesh castShadow position={[0, 2.6, b.d / 2 + 0.7]}>
        <boxGeometry args={[3.6, 0.18, 1.5]} />
        <meshStandardMaterial color={b.hue} roughness={0.45} />
      </mesh>
      {/* 檐口名牌：贴脸看也知道这是哪栋楼 */}
      <SignPlane
        w={b.w - 5}
        h={1.6}
        position={[0, b.h - 1.3, b.d / 2 + 0.09]}
        bg={PAPER}
        border={b.hue}
        px={64}
        lines={[{ text: b.short, size: 58, weight: 700, color: INK }]}
      />
      {/* 屋顶招牌 */}
      <group position={[0, b.h + 2.6, 0]}>
        <mesh castShadow position={[-(b.w / 2 - 2.4), -1.1, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 2.4, 8]} />
          <meshStandardMaterial color="#7c8694" />
        </mesh>
        <mesh castShadow position={[b.w / 2 - 2.4, -1.1, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 2.4, 8]} />
          <meshStandardMaterial color="#7c8694" />
        </mesh>
        <mesh castShadow position={[0, 0.3, -0.09]}>
          <boxGeometry args={[b.w - 2.6, 3.3, 0.16]} />
          <meshStandardMaterial color="#ede6d3" roughness={0.6} />
        </mesh>
        <SignPlane
          w={b.w - 3}
          h={3.0}
          position={[0, 0.3, 0.02]}
          bg={PAPER}
          border={b.hue}
          px={56}
          lines={[
            { text: b.short, size: 82, weight: 700, color: INK },
            { text: b.en.toUpperCase(), size: 30, mono: true, color: INK_DIM, gap: 12, letterSpacing: 6 },
          ]}
        />
      </group>
    </group>
  );
}

function Products() {
  return (
    <group>
      {productBuildings.map((b) => (
        <ProductBuilding key={b.poi.id} b={b} />
      ))}
    </group>
  );
}

/* ────────────────── 能力公园：九棵能力树 ────────────────── */

function Skills() {
  return (
    <group>
      {/* 草坪 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[88, 0.015, 0]}>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial color="#cdd9a3" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[88, 0.03, 0]}>
        <ringGeometry args={[29.2, 30, 48]} />
        <meshBasicMaterial color="#a3540a" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {skillPillars.map((p) => {
        const s = p.h / 10; // 树的大小编码能力深度
        return (
          <group key={p.name}>
            <Tree x={p.x} z={p.z} s={s} kind={p.h > 11 ? "pine" : "tree"} />
            {/* 树下名牌石 */}
            <group position={[p.x - 3.4, 0, p.z]} rotation={[0, -Math.PI / 2, 0]}>
              <mesh castShadow position={[0, 0.55, 0]} rotation={[-0.28, 0, 0]}>
                <boxGeometry args={[4.6, 1.9, 0.3]} />
                <meshStandardMaterial color="#ede6d3" roughness={0.6} />
              </mesh>
              <SignPlane
                w={4.4}
                h={1.7}
                position={[0, 0.62, 0.18]}
                rotX={-0.28}
                bg={PAPER}
                border="rgba(163,84,10,0.45)"
                px={60}
                lines={[{ text: p.name, size: 40, weight: 600, color: INK }]}
              />
            </group>
          </group>
        );
      })}
      {/* 公园长椅 */}
      {[[-14, 10], [14, -10]].map(([ox, oz], i) => (
        <group key={i} position={[88 + ox, 0, oz]} rotation={[0, i ? Math.PI : 0, 0]}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <boxGeometry args={[3.4, 0.18, 1.1]} />
            <meshStandardMaterial color="#b98a5a" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 0.95, -0.5]} rotation={[-0.25, 0, 0]}>
            <boxGeometry args={[3.4, 0.9, 0.14]} />
            <meshStandardMaterial color="#b98a5a" roughness={0.7} />
          </mesh>
          {[-1.4, 1.4].map((lx) => (
            <mesh key={lx} castShadow position={[lx, 0.25, 0]}>
              <boxGeometry args={[0.2, 0.5, 1.0]} />
              <meshStandardMaterial color="#5a6470" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ────────────────── 企业工程区：厂房 ────────────────── */

function EnterpriseBlockUnit({
  b,
}: {
  b: (typeof enterpriseBlocks)[number];
}) {
  const inner = b.x < 0 ? 1 : -1; // 面向中间纵街
  const facade = useMemo(
    () =>
      makeFacadeTexture({
        cols: 5,
        rows: 1,
        w: b.w - 3,
        h: b.h - 3,
        industrial: true,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <group position={[b.x, 0, b.z]}>
      <mesh castShadow receiveShadow position={[0, b.h / 2, 0]}>
        <boxGeometry args={[b.w, b.h, b.d]} />
        <meshStandardMaterial color="#efe9d8" roughness={0.65} />
      </mesh>
      {/* 高侧窗（朝南） */}
      <mesh position={[0, b.h / 2 + 1.2, b.d / 2 + 0.06]}>
        <planeGeometry args={[b.w - 3, b.h - 3]} />
        <meshStandardMaterial map={facade} transparent roughness={0.4} />
      </mesh>
      {/* 卷帘门（朝内街） */}
      <mesh position={[inner * (b.w / 2 + 0.06), 2.2, b.d / 4]} rotation={[0, inner * (Math.PI / 2), 0]}>
        <planeGeometry args={[4.2, 4.4]} />
        <meshStandardMaterial color="#aeb6c2" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* 锯齿厂房顶 */}
      {[-1, 0, 1].map((k) => (
        <mesh key={k} castShadow position={[k * (b.w / 3), b.h + 1.1, 0]}>
          <boxGeometry args={[b.w / 3 - 1.2, 2.2, b.d - 2]} />
          <meshStandardMaterial color="#e0d6bf" roughness={0.7} />
        </mesh>
      ))}
      {/* 烟囱 + 警示灯 */}
      <mesh castShadow position={[(b.w / 2 - 2) * -inner, b.h + 3.4, -b.d / 4]}>
        <cylinderGeometry args={[0.7, 0.9, 4.4, 12]} />
        <meshStandardMaterial color="#cfc6b0" roughness={0.6} />
      </mesh>
      <Blinker position={[(b.w / 2 - 2) * -inner, b.h + 5.9, -b.d / 4]} />
      {/* 侧面招牌 */}
      <SignPlane
        w={b.d - 2}
        h={3.6}
        position={[inner * (b.w / 2 + 0.1), b.h - 1.2, -b.d / 4]}
        rotY={inner * (Math.PI / 2)}
        bg={PAPER}
        border="rgba(35,43,54,0.3)"
        lines={[
          { text: b.short, size: 52, weight: 700, color: INK },
          { text: "ENTERPRISE AI", size: 26, mono: true, color: INK_FAINT, gap: 12, letterSpacing: 6 },
        ]}
      />
    </group>
  );
}

function Enterprise() {
  return (
    <group>
      {enterpriseBlocks.map((b) => (
        <EnterpriseBlockUnit key={b.poi.id} b={b} />
      ))}
    </group>
  );
}

function Blinker({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const on = Math.sin(clock.elapsedTime * 2.4 + position[0]) > 0;
    (m.material as THREE.MeshBasicMaterial).opacity = on ? 1 : 0.2;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.3, 10, 10]} />
      <meshBasicMaterial color="#e11d48" transparent />
    </mesh>
  );
}

/* ────────────────── 观点大道：广告牌 ────────────────── */

function Theses() {
  return (
    <group>
      {thesisBillboards.map((b) => (
        <group key={b.no} position={[b.x, 0, b.z]} rotation={[0, b.rotY, 0]}>
          {/* 立柱 */}
          <mesh castShadow position={[-2.4, 2.4, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 4.8, 10]} />
            <meshStandardMaterial color="#7c8694" metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh castShadow position={[2.4, 2.4, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 4.8, 10]} />
            <meshStandardMaterial color="#7c8694" metalness={0.4} roughness={0.4} />
          </mesh>
          {/* 牌面 */}
          <mesh castShadow position={[0, 6.4, -0.14]}>
            <boxGeometry args={[8.6, 4.6, 0.22]} />
            <meshStandardMaterial color="#e8e0cc" roughness={0.6} />
          </mesh>
          <SignPlane
            w={8.2}
            h={4.2}
            position={[0, 6.4, 0.02]}
            bg={PAPER}
            border="rgba(180,83,9,0.55)"
            px={56}
            lines={[
              { text: `THESIS ${b.no}`, size: 34, mono: true, color: AMBER, letterSpacing: 8 },
              { text: b.title, size: 46, weight: 700, color: INK, gap: 18 },
            ]}
          />
          {/* 背面同样可读 */}
          <SignPlane
            w={8.2}
            h={4.2}
            position={[0, 6.4, -0.3]}
            rotY={Math.PI}
            bg={PAPER}
            border="rgba(180,83,9,0.55)"
            px={56}
            lines={[
              { text: `THESIS ${b.no}`, size: 34, mono: true, color: AMBER, letterSpacing: 8 },
              { text: b.title, size: 46, weight: 700, color: INK, gap: 18 },
            ]}
          />
        </group>
      ))}
    </group>
  );
}

/* ────────────────── 长文档案：三座石碑 ────────────────── */

function Writing() {
  return (
    <group>
      {postSlabs.map((s) => (
        <group key={s.poi.id} position={[s.x, 0, s.z]} rotation={[0, s.rotY, 0]}>
          <mesh castShadow receiveShadow position={[0, 4.2, 0]}>
            <boxGeometry args={[10, 8.4, 2.2]} />
            <meshStandardMaterial color="#f4efe0" roughness={0.55} />
          </mesh>
          <mesh position={[0, 8.5, 0]}>
            <boxGeometry args={[10.3, 0.18, 2.4]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} />
          </mesh>
          <SignPlane
            w={8.8}
            h={6.6}
            position={[0, 4.4, 1.14]}
            bg={PAPER}
            border="rgba(2,132,199,0.45)"
            px={52}
            lines={[
              { text: s.date, size: 30, mono: true, color: "#0369a1", letterSpacing: 6 },
              { text: s.title, size: 42, weight: 700, color: INK, gap: 16 },
            ]}
          />
        </group>
      ))}
    </group>
  );
}

/* ────────────────── 联系信标塔 ────────────────── */

function Contact() {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const beacon = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ringA.current) {
      const k = (t * 0.5) % 1;
      ringA.current.position.y = 3 + k * 13;
      (ringA.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - k);
    }
    if (ringB.current) {
      const k = (t * 0.5 + 0.5) % 1;
      ringB.current.position.y = 3 + k * 13;
      (ringB.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - k);
    }
    if (beacon.current) {
      const s = 1 + Math.sin(t * 3) * 0.12;
      beacon.current.scale.setScalar(s);
    }
  });
  const { x, z } = CONTACT_POS;
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[3.4, 3.8, 1.4, 24]} />
        <meshStandardMaterial color="#d9d0bb" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 8.5, 0]}>
        <cylinderGeometry args={[0.5, 0.9, 15, 12]} />
        <meshStandardMaterial color="#98a2b0" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh ref={ringA} rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <ringGeometry args={[1.6, 2.0, 32]} />
        <meshBasicMaterial color="#0f9d5c" transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringB} rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <ringGeometry args={[1.6, 2.0, 32]} />
        <meshBasicMaterial color="#0f9d5c" transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={beacon} position={[0, 16.6, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color="#0f9d5c" />
      </mesh>
      <pointLight color="#2fd58a" intensity={30} distance={30} position={[0, 14, 0]} />
      <SignPlane
        w={11}
        h={3}
        position={[0, 2.8, 4.4]}
        bg={PAPER}
        border="rgba(15,138,77,0.5)"
        px={48}
        lines={[
          { text: "shizifan@gmail.com", size: 44, mono: true, color: "#0b7a44" },
          { text: "想聊聊？欢迎直接来信", size: 26, color: INK_DIM, gap: 12 },
        ]}
      />
    </group>
  );
}

/* ────────────────── 出生广场纪念碑 ────────────────── */

function Monument() {
  return (
    <group position={[MONUMENT.x, 0, MONUMENT.z]}>
      <mesh castShadow receiveShadow position={[0, MONUMENT.h / 2, 0]}>
        <boxGeometry args={[MONUMENT.w, MONUMENT.h, MONUMENT.d]} />
        <meshStandardMaterial color={WALL} roughness={0.5} />
      </mesh>
      <mesh position={[0, MONUMENT.h + 0.1, 0]}>
        <boxGeometry args={[MONUMENT.w + 0.3, 0.2, MONUMENT.d + 0.3]} />
        <meshStandardMaterial color="#d97706" roughness={0.35} />
      </mesh>
      {/* 正面（南）：名字 + 主张 */}
      <SignPlane
        w={MONUMENT.w - 1.2}
        h={MONUMENT.h - 1.6}
        position={[0, MONUMENT.h / 2 + 0.3, MONUMENT.d / 2 + 0.06]}
        px={64}
        lines={[
          { text: "石子凡", size: 120, weight: 700, color: INK, letterSpacing: 16 },
          { text: "让 AI 为人创造价值", size: 44, color: AMBER, gap: 24 },
          { text: "AI ARCHITECT · SINCE 2012", size: 26, mono: true, color: INK_FAINT, gap: 18, letterSpacing: 6 },
        ]}
      />
      {/* 背面（北） */}
      <SignPlane
        w={MONUMENT.w - 1.2}
        h={MONUMENT.h - 1.6}
        position={[0, MONUMENT.h / 2 + 0.3, -MONUMENT.d / 2 - 0.06]}
        rotY={Math.PI}
        px={64}
        lines={[
          { text: "相信未来 / 笃行当下", size: 64, weight: 700, color: INK },
          { text: "BELIEVE IN THE FUTURE, ACT ON TODAY", size: 24, mono: true, color: AMBER, gap: 20, letterSpacing: 4 },
        ]}
      />
      {/* 碑旁花坛 */}
      {[-MONUMENT.w / 2 - 2, MONUMENT.w / 2 + 2].map((ox) => (
        <group key={ox} position={[ox, 0, 0]}>
          <mesh castShadow position={[0, 0.3, 0]}>
            <cylinderGeometry args={[1.3, 1.5, 0.6, 12]} />
            <meshStandardMaterial color="#ded5c0" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 0.9, 0]}>
            <icosahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial color={LEAF_C} roughness={0.8} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ────────────────── 绿化：树木灌木石头 ────────────────── */

function Decos() {
  return (
    <group>
      {decos.map((d, i) => {
        if (d.kind === "bush") {
          return (
            <mesh key={i} castShadow position={[d.x, 0.7 * d.s, d.z]} scale={d.s}>
              <icosahedronGeometry args={[1.1, 0]} />
              <meshStandardMaterial color={LEAF_C} roughness={0.85} flatShading />
            </mesh>
          );
        }
        if (d.kind === "rock") {
          return (
            <mesh
              key={i}
              castShadow
              position={[d.x, 0.5 * d.s, d.z]}
              scale={d.s}
              rotation={[0, i * 1.7, 0]}
            >
              <dodecahedronGeometry args={[0.9, 0]} />
              <meshStandardMaterial color="#b9b2a2" roughness={0.9} flatShading />
            </mesh>
          );
        }
        // pine 保持松树，其余树种在 3D 里统一为圆冠树
        return (
          <Tree key={i} x={d.x} z={d.z} s={d.s} kind={d.kind === "pine" ? "pine" : "tree"} />
        );
      })}
    </group>
  );
}

export function Structures() {
  return (
    <group>
      <Monument />
      <Products />
      <Skills />
      <Enterprise />
      <Theses />
      <Writing />
      <Contact />
      <Decos />
    </group>
  );
}
