"use client";

import { useEffect, useRef } from "react";
import {
  CONTACT_POS,
  MONUMENT,
  POND,
  WORLD,
  decos,
  districts,
  enterpriseBlocks,
  flags,
  flowerBeds,
  lamps,
  obstacles,
  pois,
  postSlabs,
  productBuildings,
  roads,
  skillPillars,
  thesisBillboards,
  toys,
  groundLabels,
} from "@/data/world";
import { attachKeyboard, input, readAxis } from "@/components/world/controls";
import { carState, resetCar, setSpawn, useWorldStore } from "@/components/world/store";
import { Hud } from "@/components/world/Hud";
import {
  C,
  SHADOW_FILL,
  drawBall,
  drawBench,
  drawBillboard,
  drawBirch,
  drawBook,
  drawBush,
  drawCone,
  drawCottage,
  drawCrate,
  drawDustFrame,
  drawFactory,
  drawFlag,
  drawFlowerBed,
  drawFruitTree,
  drawLamp,
  drawMonument,
  drawOffice,
  drawPine,
  drawPond,
  drawRock,
  drawRound,
  drawSkillTree,
  drawSlab,
  drawTower,
  makeCarFrames,
} from "./pixel-art";

/* ────────────────────────── 常量 ────────────────────────── */

const PPU = 4; // 1 世界米 = 4 虚拟像素（视觉规范）
const ZOOMS = [1, 2, 3];

const WHEELBASE = 2.6;
const CAR_RADIUS = 1.6;
const ACCEL = 44;
const BRAKE = 75;
const MAX_FWD = 28;
const MAX_REV = 12;

const SANS = `"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif`;
const MONO = `"JetBrains Mono","SF Mono",Menlo,Consolas,monospace`;

/* ────────────────────────── 车辆物理（与 3D 版同款手感） ────────────────────────── */

function collideCar(): void {
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
      const ox = o.hx - Math.abs(dx) + CAR_RADIUS;
      const oz = o.hz - Math.abs(dz) + CAR_RADIUS;
      if (ox < oz) carState.x += Math.sign(dx || 1) * ox;
      else carState.z += Math.sign(dz || 1) * oz;
    }
    carState.speed *= 0.82;
  }
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

function stepCar(dt: number, driving: boolean): void {
  const { throttle, steer } = driving ? readAxis() : { throttle: 0, steer: 0 };
  if (input.resetRequested) {
    input.resetRequested = false;
    if (driving) resetCar();
  }
  const maxFwd = input.boost ? MAX_FWD * 1.35 : MAX_FWD;
  let v = carState.speed;
  if (throttle > 0) v += (v < 0 ? BRAKE : ACCEL) * throttle * dt;
  else if (throttle < 0) v += (v > 0 ? -BRAKE : ACCEL * throttle) * dt;
  else v -= Math.sign(v) * Math.min(Math.abs(v), 10 * dt + Math.abs(v) * 0.6 * dt);
  v = Math.max(-MAX_REV, Math.min(maxFwd, v));

  const speedK = Math.min(1, Math.abs(v) / MAX_FWD);
  const maxSteer = 0.62 - 0.34 * speedK;
  carState.steer += (steer * maxSteer - carState.steer) * Math.min(1, 16 * dt);
  carState.heading -= (v / WHEELBASE) * Math.tan(carState.steer) * dt;

  carState.speed = v;
  carState.x += Math.sin(carState.heading) * v * dt;
  carState.z += Math.cos(carState.heading) * v * dt;
  collideCar();
}

/* ────────────────────────── 可撞道具（2D 轻量物理） ────────────────────────── */

type Prop = {
  kind: "crate" | "cone" | "ball";
  x: number;
  z: number;
  vx: number;
  vz: number;
  r: number;
  size: number;
};

function makeProps(): Prop[] {
  return toys.map((t) => {
    if (t.kind === "crate")
      return { kind: "crate" as const, x: t.x, z: t.z, vx: 0, vz: 0, r: t.s * 0.7, size: t.s };
    if (t.kind === "cone")
      return { kind: "cone" as const, x: t.x, z: t.z, vx: 0, vz: 0, r: 0.7, size: 1 };
    return { kind: "ball" as const, x: t.x, z: t.z, vx: 0, vz: 0, r: t.r, size: t.r };
  });
}

function stepProps(props: Prop[], dt: number): void {
  for (const p of props) {
    const dx = p.x - carState.x;
    const dz = p.z - carState.z;
    const d = Math.hypot(dx, dz);
    const rr = p.r + 1.9;
    if (d < rr && d > 1e-4) {
      const nx = dx / d;
      const nz = dz / d;
      const k = Math.abs(carState.speed) * 0.65 + 2.5;
      p.vx += nx * k;
      p.vz += nz * k;
      p.x = carState.x + nx * rr;
      p.z = carState.z + nz * rr;
    }
    p.x += p.vx * dt;
    p.z += p.vz * dt;
    const fr = Math.exp((p.kind === "ball" ? -0.9 : -2.4) * dt);
    p.vx *= fr;
    p.vz *= fr;
    for (const o of obstacles) {
      const ox = p.x - o.x;
      const oz = p.z - o.z;
      const cx = Math.max(-o.hx, Math.min(o.hx, ox));
      const cz = Math.max(-o.hz, Math.min(o.hz, oz));
      const px = ox - cx;
      const pz = oz - cz;
      const dd = Math.hypot(px, pz);
      if (dd < p.r && dd > 1e-4) {
        p.x = o.x + cx + (px / dd) * p.r;
        p.z = o.z + cz + (pz / dd) * p.r;
        const dot = p.vx * (px / dd) + p.vz * (pz / dd);
        if (dot < 0) {
          p.vx -= 1.5 * dot * (px / dd);
          p.vz -= 1.5 * dot * (pz / dd);
          p.vx *= 0.6;
          p.vz *= 0.6;
        }
      }
    }
    const b = WORLD.bound;
    if (Math.abs(p.x) > b) {
      p.x = Math.sign(p.x) * b;
      p.vx *= -0.5;
    }
    if (Math.abs(p.z) > b) {
      p.z = Math.sign(p.z) * b;
      p.vz *= -0.5;
    }
  }
  for (let i = 0; i < props.length; i++) {
    for (let j = i + 1; j < props.length; j++) {
      const a = props[i];
      const c = props[j];
      const dx = c.x - a.x;
      const dz = c.z - a.z;
      const d = Math.hypot(dx, dz);
      const rr = a.r + c.r;
      if (d < rr && d > 1e-4) {
        const push = (rr - d) / 2;
        const nx = dx / d;
        const nz = dz / d;
        a.x -= nx * push;
        a.z -= nz * push;
        c.x += nx * push;
        c.z += nz * push;
      }
    }
  }
}

/* ────────────────────────── 静态点缀（固定种子） ────────────────────────── */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tufts: Array<[number, number]> = (() => {
  const rand = mulberry32(998244353);
  const out: Array<[number, number]> = [];
  for (let i = 0; i < 720; i++) out.push([(rand() - 0.5) * 296, (rand() - 0.5) * 296]);
  return out;
})();

const lawnDots: Array<[number, number]> = (() => {
  const rand = mulberry32(7);
  const out: Array<[number, number]> = [];
  for (let i = 0; i < 120; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 29;
    out.push([88 + Math.cos(a) * r, Math.sin(a) * r]);
  }
  return out;
})();

/* ────────────────────────── 主组件 ────────────────────────── */

export default function PixelWorld() {
  const worldRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const worldCanvas = worldRef.current!;
    const textCanvas = textRef.current!;
    const g = worldCanvas.getContext("2d")!;
    const tg = textCanvas.getContext("2d")!;

    // 本世界的出生点 + 清理跨世界残留状态
    setSpawn(0, 10, Math.PI);
    resetCar();
    const st0 = useWorldStore.getState();
    st0.setPoi(null);
    st0.setDistrict(null);

    const detachKb = attachKeyboard();
    const props = makeProps();
    const dust: Array<{ x: number; z: number; life: number }> = [];
    const carFrames = makeCarFrames(16);

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      const r = worldCanvas.parentElement!.getBoundingClientRect();
      W = Math.max(320, r.width | 0);
      H = Math.max(240, r.height | 0);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      worldCanvas.width = W;
      worldCanvas.height = H;
      textCanvas.width = W * dpr;
      textCanvas.height = H * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    let zoomIdx = 1; // ZOOMS[1] = 2
    let zoom = ZOOMS[zoomIdx];
    const onWheel = (e: WheelEvent) => {
      zoomIdx = Math.min(ZOOMS.length - 1, Math.max(0, zoomIdx - Math.sign(e.deltaY)));
    };
    window.addEventListener("wheel", onWheel, { passive: true });

    const cam = { x: 0, z: 4 };
    let pollTimer = 0;
    let last = performance.now();
    let raf = 0;

    /* y-sort 渲染项（静态部分构建一次；坐标 = 虚拟像素） */
    type Item = { z: number; draw: (t: number) => void };
    const X = (wx: number) => wx * PPU;
    const Z = (wz: number) => wz * PPU;
    const staticItems: Item[] = [];
    staticItems.push({ z: MONUMENT.z, draw: () => drawMonument(g, X(MONUMENT.x), Z(MONUMENT.z) + 6) });
    for (const b of productBuildings) {
      staticItems.push({
        z: b.z,
        draw: (t) =>
          b.style === "cottage"
            ? drawCottage(g, X(b.x), Z(b.z) + 26, b.hue, t, b.v)
            : drawOffice(g, X(b.x), Z(b.z) + 26, b.hue, b.h * 3, b.v),
      });
    }
    enterpriseBlocks.forEach((b, i) => {
      staticItems.push({ z: b.z, draw: (t) => drawFactory(g, X(b.x), Z(b.z) + 30, t, i) });
    });
    for (const p of skillPillars) {
      staticItems.push({
        z: p.z,
        draw: (t) => {
          drawSkillTree(g, X(p.x), Z(p.z), p.tier, t, p.shape);
          drawSlab(g, X(p.x), Z(p.z) + 10);
        },
      });
    }
    for (const b of thesisBillboards) {
      staticItems.push({ z: b.z, draw: () => drawBillboard(g, X(b.x), Z(b.z), b.no) });
    }
    postSlabs.forEach((s, i) => {
      staticItems.push({ z: s.z, draw: () => drawBook(g, X(s.x), Z(s.z), i) });
    });
    staticItems.push({ z: CONTACT_POS.z, draw: (t) => drawTower(g, X(CONTACT_POS.x), Z(CONTACT_POS.z), t) });
    staticItems.push({ z: 10, draw: () => drawBench(g, X(74), Z(10)) });
    staticItems.push({ z: -10, draw: () => drawBench(g, X(102), Z(-10)) });
    for (const [lx, lz] of lamps) staticItems.push({ z: lz, draw: () => drawLamp(g, X(lx), Z(lz)) });
    for (const [fx, fz, hue] of flags) staticItems.push({ z: fz, draw: (t) => drawFlag(g, X(fx), Z(fz), hue, t) });
    for (const [bx, bz, hue] of flowerBeds) staticItems.push({ z: bz, draw: () => drawFlowerBed(g, X(bx), Z(bz), hue) });
    for (const d of decos) {
      const px = X(d.x);
      const pz = Z(d.z);
      if (d.kind === "pine") staticItems.push({ z: d.z, draw: (t) => drawPine(g, px, pz, d.s, t) });
      else if (d.kind === "tree") staticItems.push({ z: d.z, draw: (t) => drawRound(g, px, pz, d.s, t) });
      else if (d.kind === "birch") staticItems.push({ z: d.z, draw: (t) => drawBirch(g, px, pz, d.s, t) });
      else if (d.kind === "fruit") staticItems.push({ z: d.z, draw: (t) => drawFruitTree(g, px, pz, d.s, t) });
      else if (d.kind === "bush") staticItems.push({ z: d.z, draw: () => drawBush(g, px, pz, d.s) });
      else staticItems.push({ z: d.z, draw: () => drawRock(g, px, pz, d.s) });
    }

    /* 建筑级午后长影（向东南） */
    const longShadow = (x: number, z: number, w: number, d: number, h: number) => {
      g.fillStyle = SHADOW_FILL;
      const x1 = X(x + w / 2);
      const z0 = Z(z - d / 2);
      const z1 = Z(z + d / 2);
      const L = h * PPU * 0.9;
      g.beginPath();
      g.moveTo(x1, z0);
      g.lineTo(x1 + L, z0 + L * 0.35);
      g.lineTo(x1 + L, z1 + L * 0.35);
      g.lineTo(x1, z1);
      g.closePath();
      g.fill();
    };

    const pollPoi = () => {
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
      let bd: (typeof districts)[number] | null = null;
      let dd = Infinity;
      for (const d of districts) {
        const dist = Math.hypot(carState.x - d.x, carState.z - d.z);
        if (dist < d.r && dist < dd) {
          bd = d;
          dd = dist;
        }
      }
      if (st.district?.id !== bd?.id) st.setDistrict(bd);
    };

    const disc = (cx: number, cy: number, r: number, c: string) => {
      g.fillStyle = c;
      for (let yy = -r; yy <= r; yy++) {
        const ww = Math.floor(Math.sqrt(r * r - yy * yy + 0.3));
        g.fillRect(Math.round(cx - ww), Math.round(cy + yy), ww * 2 + 1, 1);
      }
    };
    const ringPx = (cx: number, cy: number, r: number, c: string) => {
      g.fillStyle = c;
      const n = Math.max(12, Math.floor(r * 7));
      for (let a = 0; a < n; a++) {
        const x = Math.round(cx + r * Math.cos((a / n) * 6.2832));
        const y = Math.round(cy + r * Math.sin((a / n) * 6.2832));
        g.fillRect(x, y, 1, 1);
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const t = now / 1000;
      const driving = useWorldStore.getState().phase === "drive";

      stepCar(dt, driving);
      stepProps(props, dt);
      pollTimer += dt;
      if (pollTimer > 0.12) {
        pollTimer = 0;
        pollPoi();
      }

      if (Math.abs(carState.speed) > 16) {
        dust.push({
          x: carState.x - Math.sin(carState.heading) * 2.4 + Math.sin(t * 91) * 0.8,
          z: carState.z - Math.cos(carState.heading) * 2.4 + Math.cos(t * 77) * 0.8,
          life: 1,
        });
      }
      for (let i = dust.length - 1; i >= 0; i--) {
        dust[i].life -= dt * 2.2;
        if (dust[i].life <= 0) dust.splice(i, 1);
      }

      /* 相机 */
      zoom += (ZOOMS[zoomIdx] - zoom) * Math.min(1, 8 * dt);
      if (Math.abs(zoom - ZOOMS[zoomIdx]) < 0.01) zoom = ZOOMS[zoomIdx];
      if (driving) {
        const lead = 0.4 * carState.speed;
        const tx = carState.x + Math.sin(carState.heading) * lead;
        const tz = carState.z + Math.cos(carState.heading) * lead;
        cam.x += (tx - cam.x) * Math.min(1, 5 * dt);
        cam.z += (tz - cam.z) * Math.min(1, 5 * dt);
      } else {
        cam.x += (Math.sin(t * 0.25) * 12 - cam.x) * Math.min(1, 1.2 * dt);
        cam.z += (-4 + Math.cos(t * 0.2) * 8 - cam.z) * Math.min(1, 1.2 * dt);
      }
      const offX = Math.round(W / 2 - cam.x * PPU * zoom);
      const offY = Math.round(H / 2 - cam.z * PPU * zoom);
      const S = PPU * zoom; // 屏幕像素 / 米

      /* ── 世界层 ── */
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.imageSmoothingEnabled = false;
      g.fillStyle = C.paper;
      g.fillRect(0, 0, W, H);
      g.setTransform(zoom, 0, 0, zoom, offX, offY);

      const viewHw = W / (2 * zoom);
      const viewHh = H / (2 * zoom);
      const vx0 = cam.x * PPU - viewHw;
      const vx1 = cam.x * PPU + viewHw;
      const vz0 = cam.z * PPU - viewHh;
      const vz1 = cam.z * PPU + viewHh;
      const inView = (px: number, pz: number, m: number) =>
        px > vx0 - m && px < vx1 + m && pz > vz0 - m && pz < vz1 + m;

      // 蓝图网格（24px = 6m）
      g.fillStyle = "rgba(35,43,54,0.05)";
      for (let x = Math.floor(vx0 / 24) * 24; x < vx1; x += 24) g.fillRect(x, vz0, 1, viewHh * 2);
      for (let z = Math.floor(vz0 / 24) * 24; z < vz1; z += 24) g.fillRect(vx0, z, viewHw * 2, 1);
      // 草丛
      g.fillStyle = C.paperSh;
      for (const [tx, tz] of tufts) {
        const px = X(tx);
        const pz = Z(tz);
        if (inView(px, pz, 4)) {
          g.fillRect(px, pz, 2, 1);
          g.fillRect(px + 1, pz - 1, 1, 1);
        }
      }
      // 能力公园草坪
      disc(X(88), 0, 30 * PPU, C.lawn);
      g.fillStyle = "#b8c98c";
      for (const [dx, dz] of lawnDots) g.fillRect(Math.round(X(dx)), Math.round(Z(dz)), 2, 1);
      ringPx(X(88), 0, 30 * PPU, C.amber);
      // 道路
      for (const r of roads) {
        const horiz = Math.abs(r.x2 - r.x1) > Math.abs(r.z2 - r.z1);
        const wp = r.w * PPU;
        if (horiz) {
          const x0 = X(Math.min(r.x1, r.x2)) - wp / 2;
          const len = Math.abs(r.x2 - r.x1) * PPU + wp;
          g.fillStyle = C.road;
          g.fillRect(x0, Z(r.z1) - wp / 2, len, wp);
          g.fillStyle = C.sandDk;
          g.fillRect(x0, Z(r.z1) - wp / 2, len, 1);
          g.fillRect(x0, Z(r.z1) + wp / 2 - 1, len, 1);
          g.fillStyle = C.amber;
          for (let x = x0 + 4; x < x0 + len - 6; x += 12) g.fillRect(x, Z(r.z1) - 1, 6, 2);
        } else {
          const z0 = Z(Math.min(r.z1, r.z2)) - wp / 2;
          const len = Math.abs(r.z2 - r.z1) * PPU + wp;
          g.fillStyle = C.road;
          g.fillRect(X(r.x1) - wp / 2, z0, wp, len);
          g.fillStyle = C.sandDk;
          g.fillRect(X(r.x1) - wp / 2, z0, 1, len);
          g.fillRect(X(r.x1) + wp / 2 - 1, z0, 1, len);
          g.fillStyle = C.amber;
          for (let z = z0 + 4; z < z0 + len - 6; z += 12) g.fillRect(X(r.x1) - 1, z, 2, 6);
        }
      }
      // 中心广场：铺装 + 环形标线
      disc(0, 0, 13.5 * PPU, C.road);
      disc(0, 0, 12.5 * PPU, C.paper);
      ringPx(0, 0, 13 * PPU, C.amber);
      ringPx(0, 0, 6 * PPU, C.paperSh);
      // 鸭子池塘
      drawPond(g, X(POND.x), Z(POND.z), t);
      // 场界围栏（虚线）
      {
        const F = WORLD.fence * PPU;
        g.fillStyle = C.sandDk;
        for (let i = -F; i < F; i += 10) {
          g.fillRect(i, -F, 6, 2);
          g.fillRect(i, F - 2, 6, 2);
          g.fillRect(-F, i, 2, 6);
          g.fillRect(F - 2, i, 2, 6);
        }
      }
      // 建筑长影
      for (const b of productBuildings) longShadow(b.x, b.z, b.w, b.d, b.h);
      for (const f of enterpriseBlocks) longShadow(f.x, f.z, f.w, f.d, f.h);
      longShadow(MONUMENT.x, MONUMENT.z, MONUMENT.w, MONUMENT.d, MONUMENT.h);
      longShadow(CONTACT_POS.x, CONTACT_POS.z, 3, 3, 14);

      // 尾尘
      for (const d of dust) {
        drawDustFrame(g, X(d.x), Z(d.z), Math.min(2, Math.floor((1 - d.life) * 3)));
      }

      // y-sort 精灵
      const items: Item[] = [];
      for (const it of staticItems) items.push(it);
      for (const p of props) {
        if (!inView(X(p.x), Z(p.z), 40)) continue;
        if (p.kind === "crate") {
          const s = Math.round(p.size * 5);
          items.push({ z: p.z, draw: () => drawCrate(g, X(p.x), Z(p.z) + 3, s) });
        } else if (p.kind === "cone") {
          items.push({ z: p.z, draw: () => drawCone(g, X(p.x), Z(p.z) + 2) });
        } else {
          items.push({ z: p.z, draw: () => drawBall(g, X(p.x), Z(p.z) + 4) });
        }
      }
      items.push({
        z: carState.z,
        draw: () => {
          const px = X(carState.x);
          const pz = Z(carState.z);
          g.fillStyle = SHADOW_FILL;
          g.fillRect(Math.round(px - 8), Math.round(pz + 6), 18, 4);
          const n = carFrames.length;
          const phi = Math.PI - carState.heading;
          const idx = ((Math.round(phi / ((Math.PI * 2) / n)) % n) + n) % n;
          g.drawImage(carFrames[idx], Math.round(px - 12), Math.round(pz - 12));
        },
      });
      items.sort((a, b) => a.z - b.z);
      for (const it of items) it.draw(t);

      /* ── 文字层（原生分辨率） ── */
      tg.setTransform(dpr, 0, 0, dpr, 0, 0);
      tg.clearRect(0, 0, W, H);
      const sx = (wx: number) => offX + wx * PPU * zoom;
      const sy = (wz: number) => offY + wz * PPU * zoom;
      const visible = (wx: number, wz: number, m: number) => {
        const x = sx(wx);
        const y = sy(wz);
        return x > -m && x < W + m && y > -m && y < H + m;
      };
      tg.textAlign = "center";
      tg.textBaseline = "middle";

      // 分区大字
      for (const l of groundLabels) {
        if (!visible(l.x, l.z, 220)) continue;
        const fs = Math.max(14, 2.6 * S);
        tg.font = `700 ${fs}px ${SANS}`;
        tg.fillStyle = "rgba(35,43,54,0.45)";
        tg.fillText(l.cn, sx(l.x), sy(l.z));
        tg.font = `600 ${Math.max(8, 1.15 * S)}px ${MONO}`;
        tg.fillStyle = "rgba(163,84,10,0.65)";
        tg.fillText(l.en, sx(l.x), sy(l.z) + fs * 0.75);
      }
      // 出生点操作提示
      if (visible(0, 17, 120)) {
        tg.font = `600 ${Math.max(11, 1.6 * S)}px ${SANS}`;
        tg.fillStyle = "rgba(42,49,64,0.5)";
        tg.fillText("WASD / 方向键 驾驶", sx(0), sy(16));
        tg.font = `600 ${Math.max(8, 1.1 * S)}px ${MONO}`;
        tg.fillStyle = "rgba(163,84,10,0.55)";
        tg.fillText("SHIFT BOOST · R RESET", sx(0), sy(19));
      }

      const chip = (
        wx: number,
        wz: number,
        text: string,
        border: string,
        size: number,
        mono = false
      ) => {
        if (!visible(wx, wz, 180)) return;
        tg.font = `${mono ? "600" : "700"} ${size}px ${mono ? MONO : SANS}`;
        const tw = tg.measureText(text).width;
        const x = sx(wx);
        const y = sy(wz);
        const padX = 5;
        const h = size + 9;
        tg.fillStyle = C.white;
        tg.fillRect(x - tw / 2 - padX, y - h / 2, tw + padX * 2, h);
        tg.strokeStyle = border;
        tg.lineWidth = 1.5;
        tg.strokeRect(x - tw / 2 - padX + 0.75, y - h / 2 + 0.75, tw + padX * 2 - 1.5, h - 1.5);
        tg.fillStyle = C.ink;
        tg.fillText(text, x, y + 0.5);
      };

      // 建筑名牌（DOM 文字层，白纸底墨字）
      for (const b of productBuildings) chip(b.x, b.z - 18, b.short, b.hue, Math.max(11, 1.7 * S));
      for (const b of enterpriseBlocks) chip(b.x, b.z - 16, b.short, "rgba(35,43,54,0.4)", Math.max(10, 1.5 * S));
      chip(CONTACT_POS.x, CONTACT_POS.z + 8, "shizifan@gmail.com", C.beacon, Math.max(9, 1.4 * S), true);
      // 石碑铭文
      if (visible(MONUMENT.x, MONUMENT.z, 160)) {
        tg.font = `700 ${Math.max(12, 1.7 * S)}px ${SANS}`;
        tg.fillStyle = C.ink;
        tg.fillText("石子凡", sx(MONUMENT.x), sy(MONUMENT.z) - 3.4 * S);
        tg.font = `600 ${Math.max(8, 1.05 * S)}px ${SANS}`;
        tg.fillStyle = C.amber;
        tg.fillText("让 AI 为人创造价值", sx(MONUMENT.x), sy(MONUMENT.z) - 1.1 * S);
      }
      // 能力树名牌：只标注离车最近的几棵
      const near = skillPillars
        .map((p) => ({ p, d: Math.hypot(carState.x - p.x, carState.z - p.z) }))
        .filter((o) => o.d < 34)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      for (const { p } of near) {
        chip(p.x, p.z + 4.5, p.name, "rgba(163,84,10,0.5)", Math.max(10, 1.4 * S));
      }

      // 场界外遮罩
      tg.fillStyle = "rgba(242,234,214,0.9)";
      const fx0 = sx(-WORLD.fence);
      const fx1 = sx(WORLD.fence);
      const fy0 = sy(-WORLD.fence);
      const fy1 = sy(WORLD.fence);
      if (fy0 > 0) tg.fillRect(0, 0, W, fy0);
      if (fy1 < H) tg.fillRect(0, fy1, W, H - fy1);
      if (fx0 > 0) tg.fillRect(0, 0, fx0, H);
      if (fx1 < W) tg.fillRect(fx1, 0, W - fx1, H);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", onWheel);
      detachKb();
    };
  }, []);

  return (
    <div className="theme-paper fixed inset-0 overflow-hidden bg-bg text-text select-none">
      <canvas
        ref={worldRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
      <canvas ref={textRef} className="absolute inset-0 w-full h-full" />
      <Hud
        alts={[
          { href: "/", label: "系统图" },
          { href: "/3d", label: "3D 版" },
        ]}
      />
    </div>
  );
}
