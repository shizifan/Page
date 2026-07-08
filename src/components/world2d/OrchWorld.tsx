"use client";

import { useEffect, useRef } from "react";
import { attachKeyboard, input } from "@/components/world/controls";
import { carState, resetCar, setSpawn, useWorldStore } from "@/components/world/store";
import { Hud } from "@/components/world/Hud";
import {
  ARCHIVE_ITEMS,
  RACK,
  BOARD,
  BUS_X,
  CARRIERS,
  CONSOLE,
  DEV_SLOTS,
  HUBS,
  HUB_U,
  INBOX,
  RING,
  SPAWN,
  TITLE_BLOCK,
  TOOL_WALL,
  TRACKS,
  TRUNK_END_OFF,
  TRUNK_NAMES,
  TRUNK_VALS,
  TRUNK_XS,
  orchDistricts,
  orchPois,
} from "./orch-data";
import {
  C,
  FONTS,
  TRUNK_END_TAGS,
  branchPipe,
  circ,
  coffeeStain,
  disc,
  drawCapsule,
  drawCompass,
  drawConsole,
  drawDevTrayV2,
  drawDim,
  drawDraftSheet,
  drawEnamelSign,
  drawHubV2,
  drawIncubatorV2,
  drawInspectV2,
  drawLuggageTag,
  drawMemCard,
  drawMinimapV2,
  drawNote,
  drawArchiveRackBoard,
  drawArticleScroll,
  drawPipeStencil,
  drawQAV2,
  drawRhythmV2,
  drawShiverNote,
  drawStillV2,
  drawTitleBlock,
  drawTokenStage,
  drawTokenTiny,
  drawToolWallV2,
  drawTrail,
  drawTrunkEndV2,
  drawTrunkV2,
  drawArchiveSuck,
  fRR,
  flowArrow,
  handNote,
  leader,
  pipe,
  poly,
  ringPoint,
  sRR,
  txt,
  via,
  setTxtScale,
} from "./orchestration-art-v2";

/* ────────────────────────── 胶囊物理（全向直接移动） ────────────────────────── */

const MAX_RAIL = 235;
const MAX_FREE = 188; // 离轨 ×0.8
const SNAP_DIST = 14;
const ALIGN_COS = Math.cos((30 * Math.PI) / 180);

const railState = { on: false };
/** 速度向量（px/s），方向键直接驱动 */
const vel = { x: 0, z: 0 };
/** 鼠标目的地：单击设定，按住持续跟随；键盘输入随时覆盖 */
const mouse = { tx: 0, tz: 0, active: false, held: false, arriveAt: null as number | null };

/** 最近轨道投影（全部轴对齐线段） */
function nearestTrack(x: number, z: number) {
  let best: { d: number; px: number; pz: number; tx: number; tz: number } | null = null;
  for (const s of TRACKS) {
    let px: number;
    let pz: number;
    let tx: number;
    let tz: number;
    if (s.y1 === s.y2) {
      const x0 = Math.min(s.x1, s.x2);
      const x1 = Math.max(s.x1, s.x2);
      px = Math.max(x0, Math.min(x1, x));
      pz = s.y1;
      tx = 1;
      tz = 0;
    } else {
      const y0 = Math.min(s.y1, s.y2);
      const y1 = Math.max(s.y1, s.y2);
      px = s.x1;
      pz = Math.max(y0, Math.min(y1, z));
      tx = 0;
      tz = 1;
    }
    const d = Math.hypot(x - px, z - pz);
    if (!best || d < best.d) best = { d, px, pz, tx, tz };
  }
  return best!;
}

function stepCapsule(dt: number, driving: boolean, tNow: number): void {
  if (input.resetRequested) {
    input.resetRequested = false;
    if (driving) {
      resetCar();
      vel.x = 0;
      vel.z = 0;
      railState.on = false;
      mouse.active = false;
      mouse.arriveAt = null;
    }
  }

  /* 方向键 / 摇杆 → 目标速度向量（按哪走哪，支持斜向） */
  let ix = 0;
  let iz = 0;
  if (driving) {
    if (input.joyActive) {
      ix = input.joyX;
      iz = input.joyY;
    } else {
      ix = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      iz = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    }
  }
  let mag = Math.hypot(ix, iz);
  if (mag > 1) {
    ix /= mag;
    iz /= mag;
  }
  /* 鼠标：键盘/摇杆一动就让位 */
  if (mag > 0.05) {
    mouse.active = false;
    mouse.arriveAt = null;
  } else if (driving && mouse.active && mouse.arriveAt === null) {
    const dx = mouse.tx - carState.x;
    const dz = mouse.tz - carState.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 8 && !mouse.held) {
      mouse.arriveAt = tNow; // 到达：触发橡皮擦除动画
    } else if (dist > 1e-3) {
      const k = Math.min(1, dist / 56); // 接近目的地时减速
      ix = (dx / dist) * k;
      iz = (dz / dist) * k;
      mag = k;
    }
  }
  const maxV = (railState.on ? MAX_RAIL : MAX_FREE) * (input.boost ? 1.3 : 1);
  const rate = mag > 0.05 ? 10 : 6;
  vel.x += (ix * maxV - vel.x) * Math.min(1, rate * dt);
  vel.z += (iz * maxV - vel.z) * Math.min(1, rate * dt);

  carState.x += vel.x * dt;
  carState.z += vel.z * dt;
  const speed = Math.hypot(vel.x, vel.z);
  carState.speed = speed;
  if (speed > 12) carState.heading = Math.atan2(vel.x, vel.z);

  /* 吸轨：距轨 <14px 且移动方向与轨道夹角 <30° 时磁吸 */
  const near = nearestTrack(carState.x, carState.z);
  if (speed > 30 && near.d < SNAP_DIST) {
    const dot = (vel.x * near.tx + vel.z * near.tz) / speed;
    if (Math.abs(dot) > ALIGN_COS) {
      railState.on = true;
      carState.x += (near.px - carState.x) * Math.min(1, 14 * dt);
      carState.z += (near.pz - carState.z) * Math.min(1, 14 * dt);
      const along = vel.x * near.tx + vel.z * near.tz;
      vel.x += (near.tx * along - vel.x) * Math.min(1, 10 * dt);
      vel.z += (near.tz * along - vel.z) * Math.min(1, 10 * dt);
    } else {
      railState.on = false;
    }
  } else {
    railState.on = false;
  }

  // 图板边界
  const m = BOARD.margin;
  if (carState.x < m || carState.x > BOARD.w - m) {
    carState.x = Math.max(m, Math.min(BOARD.w - m, carState.x));
    vel.x = 0;
  }
  if (carState.z < m || carState.z > BOARD.h - m) {
    carState.z = Math.max(m, Math.min(BOARD.h - m, carState.z));
    vel.z = 0;
  }
}

/* ────────────────────────── 主组件 ────────────────────────── */

const ZOOMS = [0.75, 1, 1.5, 2];
const MAX_ZOOM = 2.2; // 触屏双指缩放上限（够读清单个装置）
const DEV_FNS = [drawStillV2, drawInspectV2, drawQAV2, drawIncubatorV2, drawRhythmV2, drawDevTrayV2];

export default function OrchWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const g = canvas.getContext("2d")!;

    setSpawn(SPAWN.x, SPAWN.z, SPAWN.heading);
    resetCar();
    railState.on = false;
    const st0 = useWorldStore.getState();
    st0.setPoi(null);
    st0.setDistrict(null);

    const detachKb = attachKeyboard();

    const isTouch =
      typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).has("touch") || // 调试：?touch=1 强制触屏路径
        window.matchMedia?.("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0);

    if (isTouch) {
      setTxtScale(1.25); // 触屏文字放大，改善移动端可读性
    }

    let W = 0;
    let H = 0;
    let dpr = 1;
    let fitZoom = 0.3; // 让整张图板铺满屏幕的缩放（进场默认视图）

    // 方格纸离屏缓存：114 次 fillRect → 1 次 drawImage
    let gridCache: HTMLCanvasElement | null = null;
    const buildGridCache = () => {
      gridCache = document.createElement("canvas");
      gridCache.width = (BOARD.w - 80) * dpr;
      gridCache.height = (BOARD.h - 80) * dpr;
      const gc = gridCache.getContext("2d")!;
      gc.setTransform(dpr, 0, 0, dpr, 0, 0);
      gc.fillStyle = C.grid;
      for (let x = 0; x <= BOARD.w - 80; x += 20) gc.fillRect(x, 0, x % 100 === 0 ? 1.4 : 0.6, BOARD.h - 80);
      for (let y = 0; y <= BOARD.h - 80; y += 20) gc.fillRect(0, y, BOARD.w - 80, y % 100 === 0 ? 1.4 : 0.6);
    };

    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      W = Math.max(320, r.width | 0);
      H = Math.max(240, r.height | 0);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      fitZoom = Math.min(W / BOARD.w, H / BOARD.h) * 0.98;
      buildGridCache();
    };
    resize();
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", resize);
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);

    let zoomIdx = 1;
    let zoom = ZOOMS[zoomIdx];
    let zoomTarget = zoom; // 缩放缓动目标：桌面走离散档位，触屏走连续双指
    const clampTouchZoom = (z: number) => Math.max(fitZoom, Math.min(MAX_ZOOM, z));
    const onWheel = (e: WheelEvent) => {
      zoomIdx = Math.min(ZOOMS.length - 1, Math.max(0, zoomIdx - Math.sign(e.deltaY)));
      zoomTarget = ZOOMS[zoomIdx];
    };
    window.addEventListener("wheel", onWheel, { passive: true });

    // 触屏旋转/微信视口变化后：fitZoom 变了，别停在比整图更小的缩放（会露出图板外空白）
    const onResizeTouch = () => {
      if (!isTouch) return;
      if (zoomTarget < fitZoom) zoomTarget = fitZoom;
      if (zoom < fitZoom) zoom = fitZoom;
    };
    window.addEventListener("resize", onResizeTouch);
    window.addEventListener("orientationchange", onResizeTouch);

    /** 触屏相机：默认自由（拖动/双指控制），摇杆驾驶时改为跟随胶囊 */
    let camFree = isTouch;
    let prevPhase: string = useWorldStore.getState().phase;

    /* 鼠标 / 触点：单击设目的地，按住持续跟随 */
    const view = { offX: 0, offY: 0, zoom: 1 };
    mouse.active = false;
    mouse.held = false;
    mouse.arriveAt = null;
    const toBoard = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: Math.max(BOARD.margin, Math.min(BOARD.w - BOARD.margin, (e.clientX - r.left - view.offX) / view.zoom)),
        z: Math.max(BOARD.margin, Math.min(BOARD.h - BOARD.margin, (e.clientY - r.top - view.offY) / view.zoom)),
      };
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (useWorldStore.getState().phase !== "drive") return;
      const p = toBoard(e);
      mouse.tx = p.x;
      mouse.tz = p.z;
      mouse.active = true;
      mouse.held = true;
      mouse.arriveAt = null;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!mouse.held) return;
      const p = toBoard(e);
      mouse.tx = p.x;
      mouse.tz = p.z;
      mouse.arriveAt = null;
    };
    const onPointerUp = () => {
      mouse.held = false;
    };
    const cam = { x: INBOX[0], z: INBOX[1] };

    /* ── 触屏：单指拖动平移 · 双指缩放 · 轻点选装置 ── */
    const tps = new Map<number, { x: number; y: number }>();
    let tapCand: { id: number; x: number; y: number; t: number } | null = null;
    let panMoved = false;
    let pinchDist = 0;
    let pinchZoom0 = 1;
    const clampCam = () => {
      cam.x = Math.max(0, Math.min(BOARD.w, cam.x));
      cam.z = Math.max(0, Math.min(BOARD.h, cam.z));
    };
    const onTouchDown = (e: PointerEvent) => {
      if (useWorldStore.getState().phase !== "drive") return;
      const r = canvas.getBoundingClientRect();
      const pt = { x: e.clientX - r.left, y: e.clientY - r.top };
      // 左边缘 20px：放行微信返回手势
      if (pt.x < 20) return;
      tps.set(e.pointerId, pt);
      canvas.setPointerCapture?.(e.pointerId);
      if (tps.size === 1) {
        tapCand = { id: e.pointerId, x: pt.x, y: pt.y, t: performance.now() };
        panMoved = false;
      } else if (tps.size === 2) {
        const [a, b] = [...tps.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        pinchZoom0 = zoom;
        tapCand = null;
      }
    };
    const onTouchMove = (e: PointerEvent) => {
      if (!tps.has(e.pointerId)) return;
      const r = canvas.getBoundingClientRect();
      const prev = tps.get(e.pointerId)!;
      const nx = e.clientX - r.left;
      const ny = e.clientY - r.top;
      const dx = nx - prev.x;
      const dy = ny - prev.y;
      tps.set(e.pointerId, { x: nx, y: ny });
      if (tps.size >= 2) {
        const [a, b] = [...tps.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const bx = (mx - view.offX) / view.zoom; // 手指中点下的图板坐标（保持不动）
        const bz = (my - view.offY) / view.zoom;
        const z2 = clampTouchZoom((pinchZoom0 * dist) / pinchDist);
        camFree = true;
        zoom = z2;
        zoomTarget = z2;
        cam.x = bx - (mx - W / 2) / z2;
        cam.z = bz - (my - H / 2) / z2;
        clampCam();
      } else {
        if (tapCand && Math.hypot(nx - tapCand.x, ny - tapCand.y) > 8) panMoved = true;
        camFree = true;
        cam.x -= dx / view.zoom;
        cam.z -= dy / view.zoom;
        clampCam();
      }
    };
    const onTouchUp = (e: PointerEvent) => {
      const single = tps.size === 1 && tapCand?.id === e.pointerId;
      const isTap = single && !panMoved && performance.now() - (tapCand?.t ?? 0) < 300;
      const cand = tapCand;
      tps.delete(e.pointerId);
      if (tps.size < 2) pinchDist = 0;
      if (isTap && cand) {
        const bx = (cand.x - view.offX) / view.zoom;
        const bz = (cand.y - view.offY) / view.zoom;
        // 点击设胶囊目的地，镜头跟随
        mouse.tx = bx;
        mouse.tz = bz;
        mouse.active = true;
        mouse.held = false;
        mouse.arriveAt = null;
        camFree = false;
        // POI 命中判定
        let best: (typeof orchPois)[number] | null = null;
        let bestD = Infinity;
        for (const p of orchPois) {
          const d = Math.hypot(bx - p.x, bz - p.z);
          const rr = Math.max(p.r, 28); // 触屏放宽命中半径
          if (d < rr && d < bestD) {
            best = p;
            bestD = d;
          }
        }
        useWorldStore.getState().setPoi(best); // 点空白处则收起卡片
      }
      tapCand = null;
      panMoved = false;
    };

    if (isTouch) {
      canvas.addEventListener("pointerdown", onTouchDown);
      canvas.addEventListener("pointermove", onTouchMove);
      canvas.addEventListener("pointerup", onTouchUp);
      canvas.addEventListener("pointercancel", onTouchUp);
    } else {
      canvas.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    }
    // 触屏时全局阻止 touchmove（防止微信页面滚动/弹跳）
    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".poi-scrollable")) return;
      e.preventDefault();
    };
    if (isTouch) {
      document.addEventListener("touchmove", preventTouchMove, { passive: false });
    }

    const pencil: Array<{ x: number; z: number; at: number }> = [];
    const tail: Array<[number, number]> = [];
    let pencilTimer = 0;
    let pollTimer = 0;
    let focus: { id: string; since: number } | null = null;
    let last = performance.now();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        last = performance.now(); // 防 dt 积压导致胶囊瞬移
        input.up = input.down = input.left = input.right = input.boost = false;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    let raf = 0;

    const pollPoi = () => {
      const st = useWorldStore.getState();
      // 触屏：POI 由轻点/拖动平移探索设定
      if (!isTouch) {
        let best: (typeof orchPois)[number] | null = null;
        let bestD = Infinity;
        for (const p of orchPois) {
          const d = Math.hypot(carState.x - p.x, carState.z - p.z);
          if (d < p.r && d < bestD) {
            best = p;
            bestD = d;
          }
        }
        if (st.poi?.id !== best?.id) st.setPoi(best);
      }
      // 分区提示：桌面看胶囊所在，触屏看镜头中心所在
      const rx = isTouch ? cam.x : carState.x;
      const rz = isTouch ? cam.z : carState.z;
      let bd: (typeof orchDistricts)[number] | null = null;
      let dd = Infinity;
      for (const d of orchDistricts) {
        const dist = Math.hypot(rx - d.x, rz - d.z);
        if (dist < d.r && dist < dd) {
          bd = d;
          dd = dist;
        }
      }
      if (st.district?.id !== bd?.id) st.setDistrict(bd);
    };

    /** 控制信道：弧线绕行中央（评审 §一.3），透明度 0.5 */
    const arcCtrl = (x1: number, y1: number, x2: number, y2: number, bend: number) => {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const cx2 = mx - (dy / len) * bend;
      const cy2 = my + (dx / len) * bend;
      g.save();
      g.globalAlpha = 0.5;
      g.setLineDash([5, 4]);
      g.strokeStyle = C.inkMid;
      g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(x1, y1);
      g.quadraticCurveTo(cx2, cy2, x2, y2);
      g.stroke();
      g.restore();
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const t = now / 1000;
      const st = useWorldStore.getState();
      const driving = st.phase === "drive";

      // 触屏进场：默认放大到可读级别，竖屏只看局部，摇杆驾驶探索
      if (isTouch && driving && prevPhase !== "drive") {
        zoom = zoomTarget = Math.max(1.0, fitZoom);
        cam.x = BOARD.w / 2;
        cam.z = BOARD.h / 2;
        camFree = true;
      }
      prevPhase = st.phase;

      // 触屏缩放按钮（HUD → 世界）
      if (isTouch) {
        if (input.fitReq) {
          input.fitReq = false;
          zoomTarget = fitZoom;
          cam.x = BOARD.w / 2;
          cam.z = BOARD.h / 2;
          camFree = true;
        }
        if (input.zoomStep) {
          zoomTarget = clampTouchZoom(zoomTarget * (input.zoomStep > 0 ? 1.35 : 1 / 1.35));
          input.zoomStep = 0;
          camFree = true;
        }
        if (input.joyActive) camFree = false; // 一推摇杆，相机回到跟随胶囊
      }

      stepCapsule(dt, driving, t);
      pollTimer += dt;
      if (pollTimer > 0.12) {
        pollTimer = 0;
        pollPoi();
      }

      const poi = st.poi;
      if (poi && focus?.id !== poi.id) focus = { id: poi.id, since: t };
      if (!poi) focus = null;

      // 铅笔迹（离轨） / 金色尾迹（在轨）
      pencilTimer += dt;
      if (!railState.on && Math.abs(carState.speed) > 15 && pencilTimer > 0.05) {
        pencilTimer = 0;
        pencil.push({ x: carState.x, z: carState.z, at: t });
        if (pencil.length > 420) pencil.shift();
      }
      while (pencil.length && t - pencil[0].at > 8) pencil.shift();
      if (railState.on && Math.abs(carState.speed) > 60) {
        tail.unshift([carState.x, carState.z]);
        if (tail.length > 14) tail.pop();
      } else if (tail.length) {
        tail.pop();
        if (tail.length) tail.pop();
      }

      /* 相机 */
      zoom += (zoomTarget - zoom) * Math.min(1, 8 * dt);
      if (driving) {
        // zoom-aware 边界：高 zoom 时不露出图板外空白
        const halfW = W / (2 * zoom);
        const halfH = H / (2 * zoom);
        if (isTouch && camFree) {
          // 自由镜头：位置由拖动/双指/按钮设定
          cam.x = Math.max(halfW, Math.min(BOARD.w - halfW, cam.x));
          cam.z = Math.max(halfH, Math.min(BOARD.h - halfH, cam.z));
        } else {
          const tx = carState.x + Math.max(-70, Math.min(70, vel.x * 0.4));
          const tz = carState.z + Math.max(-70, Math.min(70, vel.z * 0.4));
          cam.x += (tx - cam.x) * Math.min(1, 5 * dt);
          cam.z += (tz - cam.z) * Math.min(1, 5 * dt);
          cam.x = Math.max(halfW, Math.min(BOARD.w - halfW, cam.x));
          cam.z = Math.max(halfH, Math.min(BOARD.h - halfH, cam.z));
        }
      } else {
        cam.x += (700 + Math.sin(t * 0.18) * 70 - cam.x) * Math.min(1, 1.2 * dt);
        cam.z += (500 + Math.cos(t * 0.14) * 45 - cam.z) * Math.min(1, 1.2 * dt);
      }
      const offX = W / 2 - cam.x * zoom;
      const offY = H / 2 - cam.z * zoom;
      view.offX = offX;
      view.offY = offY;
      view.zoom = zoom;

      /* ── 绘制 ── */
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#e3d7bc"; // 桌面
      g.fillRect(0, 0, W, H);
      g.setTransform(zoom * dpr, 0, 0, zoom * dpr, offX * dpr, offY * dpr);

      // 图板纸张 + 纸影
      g.fillStyle = "rgba(42,48,55,0.10)";
      g.fillRect(10, 12, BOARD.w, BOARD.h);
      g.fillStyle = C.paper;
      g.fillRect(0, 0, BOARD.w, BOARD.h);

      // 四区水彩 + 方格纸 + 图框
      fRR(g, 110, 200, 430, 340, 40, C.washP, 0.75);
      fRR(g, 560, 100, 530, 320, 40, C.washL, 0.75);
      fRR(g, 550, 560, 620, 350, 40, C.washE, 0.75);
      fRR(g, 90, 560, 430, 350, 40, C.washR, 0.75);
      g.save();
      g.globalAlpha = 0.5;
      if (gridCache) g.drawImage(gridCache, 40, 40);
      g.restore();
      g.strokeStyle = C.ink;
      g.lineWidth = 2;
      g.strokeRect(30, 30, BOARD.w - 60, BOARD.h - 60);
      g.lineWidth = 0.7;
      g.strokeRect(40, 40, BOARD.w - 80, BOARD.h - 80);
      for (const [mx, my] of [[30, 30], [BOARD.w - 30, 30], [30, BOARD.h - 30], [BOARD.w - 30, BOARD.h - 30]])
        circ(g, mx, my, 5, C.inkMid, 0.8);
      coffeeStain(g, 1108, 78);
      handNote(g, 168, 232, "① 感知区", -2, 13);
      handNote(g, 620, 132, "② 规划区", 1, 13);
      handNote(g, 1120, 590, "③ 执行区", -1, 13);
      handNote(g, 150, 592, "④ 记忆区", 2, 13);

      /* 管线层 */
      pipe(g, [[RING.x0, RING.y0], [RING.x1, RING.y0], [RING.x1, RING.y1], [RING.x0, RING.y1], [RING.x0, RING.y0 - 4]], 7);
      for (const u of [0.12, 0.38, 0.62, 0.88]) {
        const [ax, ay, side] = ringPoint(u);
        flowArrow(g, ax, ay, [0, 1.5708, 3.1416, -1.5708][side]);
      }
      pipe(g, [[1095, RING.y1], [BUS_X, RING.y1], [BUS_X, 150]], 5);
      pipe(g, [[BUS_X, RING.y1], [BUS_X, 750]], 5);
      for (const dslot of DEV_SLOTS) {
        branchPipe(g, [[BUS_X, dslot.y], [1268 - 63, dslot.y]]);
        via(g, BUS_X, dslot.y);
      }
      pipe(g, [[RING.x1, 746], [RING.x1, 800], [560, 800]], 7);
      for (const x of TRUNK_XS) via(g, x, 800);
      // 控制信道（弧线绕行）
      for (const [hx, hy] of HUBS) {
        arcCtrl(
          INBOX[0] + (hx > 700 ? 30 : -30),
          INBOX[1] - 10,
          hx + (hx > 700 ? -60 : 60),
          hy + (hy > 510 ? -34 : 34),
          hx > 700 === hy > 510 ? -46 : 46
        );
      }
      poly(g, [[CONSOLE[0] + 55, CONSOLE[1]], [RING.x0, CONSOLE[1] + 10]], C.red, 1, [4, 4]);

      /* A2 · token 的一生 */
      const u3 = HUB_U[3];
      const sucks: Array<[[number, number], number]> = [];
      for (let i = 0; i < 7; i++) {
        const u = (t * 0.028 + i / 7) % 1;
        const [tx2, ty2, side] = ringPoint(u);
        const du3 = (u3 - u + 1) % 1;
        if (du3 < 0.02 && side === 2) {
          sucks.push([[tx2, ty2], 1 - du3 / 0.02]);
          continue;
        }
        const stage = side === 0 ? 1 : side === 1 ? 2 : side === 2 ? 3 : 1;
        drawTokenStage(g, tx2, ty2, stage, t, i);
        if (side === 3 && (u - u3 + 1) % 1 < 0.1 && i % 3 === 0) {
          const [cx2, cy2] = ringPoint((u - 0.014 + 1) % 1);
          drawMemCard(g, cx2 + 3, cy2 + 2, -0.12 + Math.sin(t * 2 + i) * 0.06, 0.8);
        }
      }
      // 入口毛线团：滚向感知
      for (let i = 0; i < 2; i++) {
        const qu = (t * 0.3 + i * 0.5) % 1;
        const bx = (605 + (470 - 605) * qu) * (1 - qu) + (470 + (398 - 470) * qu) * qu;
        const by = (505 + (478 - 505) * qu) * (1 - qu) + (478 + (372 - 478) * qu) * qu;
        g.save();
        g.globalAlpha = qu < 0.1 ? qu * 10 : qu > 0.9 ? (1 - qu) * 10 : 1;
        drawTokenStage(g, bx, by, 0, t, i * 3);
        g.restore();
      }
      arcCtrl(605, 505, 398, 372, 30);

      /* A3 · 归档脉冲（评审：放大减半，描重为主） */
      const tR = t % 8;
      const amps = [0, 0, 0, 0];
      if (tR < 2.4) {
        const pu = (u3 - tR / 2.4 + 2) % 1;
        const [px, py] = ringPoint(pu);
        disc(g, px, py, 6, C.amber);
        circ(g, px, py, 10 + (tR % 0.4) * 25, C.amber, 1);
        for (let k = 1; k <= 3; k++) {
          const [qx, qy] = ringPoint((pu + k * 0.012) % 1);
          disc(g, qx, qy, 4 - k, C.amber, 0.5 - k * 0.13);
        }
        for (let k = 0; k < 4; k++) {
          const d = Math.min(Math.abs(pu - HUB_U[k]), 1 - Math.abs(pu - HUB_U[k]));
          amps[k] = Math.max(0, 1 - d / 0.06) * 0.5;
        }
      }

      /* 任务入口 */
      fRR(g, INBOX[0] - 62, INBOX[1] - 39, 130, 82, 10, C.shadow);
      fRR(g, INBOX[0] - 65, INBOX[1] - 42, 130, 82, 10, C.white);
      sRR(g, INBOX[0] - 65, INBOX[1] - 42, 130, 82, 10, C.ink, 1.8);
      txt(g, "任务入口", INBOX[0], INBOX[1] - 24, { size: 13, w: 700 });
      txt(g, "INBOX · SPAWN", INBOX[0], INBOX[1] - 10, { size: 7, c: C.amber, f: FONTS.mono });
      g.fillStyle = C.ink;
      g.fillRect(INBOX[0] - 40, INBOX[1] + 6, 80, 9);
      g.fillStyle = C.goldPale;
      g.fillRect(INBOX[0] - 36, INBOX[1] + 9, 72, 3);
      const drop = (t * 0.5) % 1;
      if (drop < 0.3) drawTokenTiny(g, INBOX[0], INBOX[1] + 10 + drop * 40, C.glow);
      handNote(g, 790, 470, "你从这里出发", -3, 13);
      leader(g, 768, 482, 726, 528, 1);

      /* 枢纽（kind=3 是记忆柜） + 归档吸入 */
      for (const [hx, hy, k] of HUBS) drawHubV2(g, hx, hy, k, t, amps[k]);
      for (const [from, su] of sucks) drawArchiveSuck(g, from, [330, 700], su);
      if (tR < 0.25) {
        g.save();
        g.globalAlpha = Math.max(0, 1 - tR * 4);
        circ(g, 330, 690, 10 + tR * 90, C.amber, 1.4);
        g.restore();
      }
      handNote(g, 452, 750, "抽屉没关严，老卡片总想出来", 2, 11);

      /* 工具墙 */
      drawToolWallV2(g, TOOL_WALL.x, TOOL_WALL.y, t);
      drawDim(g, 540, 116, 1060, 116, "520", { side: 1 });
      handNote(g, 496, 106, "顺手的都磨亮了", -4, 12);
      leader(g, 520, 118, 560, 142, 2);

      /* 六台产品装置（分簇：上 K12 / 下成人） */
      txt(g, "已部署产品", 1268, 80, { size: 11, w: 700 });
      txt(g, "SHIPPED ×6 · 形态即功能", 1268, 94, { size: 7, c: C.amber, f: FONTS.mono });
      handNote(g, 1268, 112, "给孩子们的三件", -2, 11);
      for (const dslot of DEV_SLOTS) {
        const isGd5j = dslot.workIdx === 5;
        const fastPh =
          isGd5j && poi?.id === "product-gd5j" ? 0.25 + ((t % 4) / 4) * 0.6 : null;
        if (isGd5j) drawDevTrayV2(g, 1268, dslot.y, t, fastPh);
        else DEV_FNS[dslot.workIdx](g, 1268, dslot.y, t);
      }

      /* 生产主干 + 末端装置（错落） */
      for (let i = 0; i < TRUNK_XS.length; i++) {
        const off = TRUNK_END_OFF[i];
        drawTrunkV2(g, TRUNK_XS[i], 800, 876 + off, TRUNK_NAMES[i], TRUNK_VALS[i], t, i);
        drawTrunkEndV2(g, TRUNK_XS[i], 920 + off, i, t);
        txt(g, TRUNK_END_TAGS[i], TRUNK_XS[i], 946 + off, { size: 6.5, c: C.pencil, f: FONTS.mono });
      }
      drawDim(g, 415, 764, 925, 764, "510", { side: 1 });

      /* 六条观点载体 + 摘要词 */
      drawLuggageTag(g, CARRIERS.luggage.x, CARRIERS.luggage.y, 1, t);
      handNote(g, CARRIERS.luggage.x - 34, CARRIERS.luggage.y + 26, "装好就能用", 2, 10);
      drawEnamelSign(g, CARRIERS.enamel.x, CARRIERS.enamel.y, 2, t);
      handNote(g, CARRIERS.enamel.x, CARRIERS.enamel.y + 34, "AI 是杠杆", -2, 10);
      drawPipeStencil(g, CARRIERS.stencil.x, CARRIERS.stencil.y, 3, CARRIERS.stencil.text);
      const prox4 = Math.max(0, 1 - Math.hypot(carState.x - CARRIERS.note4.x, carState.z - CARRIERS.note4.y) / 120);
      drawShiverNote(g, CARRIERS.note4.x, CARRIERS.note4.y, 4, t, prox4);
      handNote(g, CARRIERS.note4.x + 42, CARRIERS.note4.y + 40, "把链路接回来", 2, 10);
      drawNote(g, CARRIERS.note5.x, CARRIERS.note5.y, 5, 1.5, t, 1);
      handNote(g, CARRIERS.note5.x, CARRIERS.note5.y + 42, "贴着需求做", -2, 10);
      drawDraftSheet(g, CARRIERS.draft.x, CARRIERS.draft.y, 6, t);
      handNote(g, CARRIERS.draft.x, CARRIERS.draft.y + 60, "还没想透的，就圈起来", -2, 11);

      /* 记忆档案架（8 篇长文，各一枚图章卷轴） */
      drawArchiveRackBoard(g, RACK.cx, RACK.y, 7 * RACK.step);
      for (let i = 0; i < ARCHIVE_ITEMS.length; i++) {
        const it = ARCHIVE_ITEMS[i];
        drawArticleScroll(g, it.x, RACK.y, it.glyph, it.cap, it.date, t);
      }

      /* 接管台 + 图面家具 */
      drawConsole(g, CONSOLE[0], CONSOLE[1], t);
      handNote(g, 154, 380, "有事按这个", -3, 12);
      leader(g, 150, 392, 134, 416, 3);
      handNote(g, 420, 640, "归档脉冲，每 8 秒逆行一圈", 2, 11);
      leader(g, 400, 652, 352, 672, 4);
      drawCompass(g, 96, 108, t);
      drawTitleBlock(g, TITLE_BLOCK[0], TITLE_BLOCK[1]);

      /* 铅笔迹（离轨 8s 淡出） */
      for (let i = 1; i < pencil.length; i++) {
        const a = pencil[i - 1];
        const b = pencil[i];
        if (Math.hypot(b.x - a.x, b.z - a.z) > 40) continue;
        const alpha = Math.max(0, 1 - (t - b.at) / 8) * 0.75;
        g.save();
        g.globalAlpha = alpha;
        poly(g, [[a.x, a.z], [b.x, b.z]], C.pencil, 1.1, [6, 5]);
        g.restore();
      }
      if (tail.length > 2) drawTrail(g, tail, t, "rail");

      /* 鼠标点击目的地：不再画光标标记，到达后静默清除 */
      if (mouse.active && mouse.arriveAt !== null && t - mouse.arriveAt > 0.15) {
        mouse.active = false;
        mouse.arriveAt = null;
      }

      /* 靠近反馈：目标被「注视」 + 批注显影 */
      if (poi) {
        const pr = 24 + Math.sin(t * 4) * 4;
        circ(g, poi.x, poi.z, pr, C.amber, 1.4);
        circ(g, poi.x, poi.z, pr + 7, C.amber, 0.5);
        if (focus) {
          const prog = Math.min(1, (t - focus.since) / 0.4);
          g.save();
          g.font = `500 15px ${FONTS.hand}`;
          const label = poi.hand ?? poi.title;
          const tw = g.measureText(label).width;
          const bx = poi.x - tw / 2;
          const by = poi.z - poi.r - 14;
          g.beginPath();
          g.rect(bx - 4, by - 14, (tw + 8) * prog, 24);
          g.clip();
          g.fillStyle = C.pencil;
          g.textAlign = "left";
          g.textBaseline = "middle";
          g.fillText(label, bx, by);
          g.restore();
        }
      }

      /* 任务胶囊（你） */
      const ang = Math.atan2(Math.cos(carState.heading), Math.sin(carState.heading));
      drawCapsule(g, carState.x, carState.z, ang, t, {
        moving: Math.abs(carState.speed) > 20,
        near: !!poi,
      });

      /* ── 屏幕层：迷你蓝图（C10） ── */
      if (driving) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        const mmx = W - 158;
        const mmy = 54;
        // 触屏自由镜头：小地图光标跟镜头中心；否则跟胶囊
        const rx = isTouch && camFree ? cam.x : carState.x;
        const rz = isTouch && camFree ? cam.z : carState.z;
        const vx = 12 + (rx - 40) * 0.082 - 17;
        const vy = 20 + (rz - 40) * 0.068 - 12;
        drawMinimapV2(g, mmx, mmy, t, [Math.max(4, Math.min(94, vx)), Math.max(14, Math.min(70, vy))]);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      window.removeEventListener("resize", onResizeTouch);
      window.removeEventListener("orientationchange", onResizeTouch);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("visibilitychange", onVisibility);
      if (isTouch) {
        document.removeEventListener("touchmove", preventTouchMove);
      }
      if (isTouch) {
        canvas.removeEventListener("pointerdown", onTouchDown);
        canvas.removeEventListener("pointermove", onTouchMove);
        canvas.removeEventListener("pointerup", onTouchUp);
        canvas.removeEventListener("pointercancel", onTouchUp);
      } else {
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
      }
      detachKb();
    };
  }, []);

  return (
    <div
      className="theme-paper fixed inset-x-0 top-0 overflow-hidden bg-bg text-text select-none"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: "none" }}
      />
      <Hud
        desc={
          <>
            这是我的<span className="text-text">智能体能力地图</span>
            ，请控制任务胶囊，看看我能为你做些什么。
          </>
        }
        hint="WASD / 鼠标 驾驶 · SHIFT 加速 · R 复位 · 滚轮 缩放"
        minimap={false}
        mapCfg={{
          minX: 30,
          maxX: BOARD.w - 30,
          minZ: 30,
          maxZ: BOARD.h - 30,
          districts: orchDistricts,
        }}
      />
    </div>
  );
}
