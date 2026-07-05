/* orchestration-art-v2.js — 「会呼吸的系统图」v2 深化
   A 大循环：记忆枢纽（卡片抽屉柜）/ token 的一生 / 归档脉冲
   B 内容装置：6 产品装置 · 3 档案装置 · 9 工具 · 6 观点载体 · 4 主干末端
   C HUD 与图面家具：尺寸标注 / 迷你蓝图 / 微动效
   与 orchestration-art.js 同色板同笔触；坐标基于 1400×1000 图板；
   所有装置锚点 = 本体中心（另注明除外）。不新增色值：UV 紫复用 pGd5j。 */
export * from "./orchestration-art.js";
import {
  C, txt, FONTS, sline, pipe, branchPipe, ctrlLine, via, flowArrow,
  drawToken, drawHubGlyph, drawCapsule, drawGauge, drawTrunk, drawNote,
  drawConsole, drawCompass, drawTitleBlock, drawLegend, handNote, leader,
  revCloud, coffeeStain, ringPoint,
} from "./orchestration-art.js";

const F_MONO = FONTS.mono, F_HAND = FONTS.hand, F_SANS = FONTS.sans;

/* ── 本地基础笔触（与 v1 同实现）── */
function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function fRR(g, x, y, w, h, r, c, alpha = 1) { g.save(); g.globalAlpha = alpha; rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); g.restore(); }
function sRR(g, x, y, w, h, r, c, lw = 1.5) { rr(g, x, y, w, h, r); g.strokeStyle = c; g.lineWidth = lw; g.stroke(); }
function poly(g, pts, c, lw, dash = null) {
  g.save(); if (dash) g.setLineDash(dash);
  g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "round"; g.lineCap = "round";
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.stroke(); g.restore();
}
function disc(g, x, y, r, c, alpha = 1) { g.save(); g.globalAlpha = alpha; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fillStyle = c; g.fill(); g.restore(); }
function circ(g, x, y, r, c, lw = 1.2, alpha = 1) { g.save(); g.globalAlpha = alpha; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.strokeStyle = c; g.lineWidth = lw; g.stroke(); g.restore(); }
function arrowHead(g, x, y, ang, c, s = 5) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-s, -s * 0.55); g.moveTo(0, 0); g.lineTo(-s, s * 0.55);
  g.strokeStyle = c; g.lineWidth = 1.2; g.lineCap = "round"; g.stroke(); g.restore();
}
function arc(g, x, y, r, a0, a1, c, lw = 1.2, alpha = 1) { g.save(); g.globalAlpha = alpha; g.beginPath(); g.arc(x, y, r, a0, a1); g.strokeStyle = c; g.lineWidth = lw; g.lineCap = "round"; g.stroke(); g.restore(); }
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, u) => a + (b - a) * u;

/* ── 统一接口三件套：引脚 / 铭牌 / 状态灯 ──
   凡挂在总线上的装置：左缘 3 根金引脚（间距 11）、本体下方白底墨字铭牌、
   本体上一枚呼吸状态灯（产品色）。本体形态自由。 */
export function devPins(g, x, y, n = 3) {
  for (let i = 0; i < n; i++) {
    const py = y - ((n - 1) * 11) / 2 + i * 11;
    g.fillStyle = C.gold; g.fillRect(x - 7, py - 1.8, 7, 3.6);
    g.strokeStyle = C.ink; g.lineWidth = 0.7; g.strokeRect(x - 7, py - 1.8, 7, 3.6);
  }
}
export function devPlate(g, cx, y, name, w = 80) {
  fRR(g, cx - w / 2, y, w, 17, 3, C.white); sRR(g, cx - w / 2, y, w, 17, 3, C.inkMid, 0.9);
  txt(g, name, cx, y + 9, { size: 11, w: 700 });
}
export function devLamp(g, x, y, hue, t, seed = 0) {
  const on = 0.55 + Math.sin(t * 2 + seed * 1.9) * 0.45;
  disc(g, x, y, 5, hue, 0.14 + on * 0.2); disc(g, x, y, 2.4, hue, 0.5 + on * 0.5); circ(g, x, y, 4, C.ink, 0.8);
}

/* ════════ A1 · 记忆枢纽（图书馆目录柜）════════
   170×112 面板躯干与其余枢纽一致；仪面 = 玻璃门卡片抽屉柜 136×66。
   抽屉 3 列 × 2 行（42×24），手写标签：口径 / 踩过的坑 / 客户的话；
   中下抽屉常年半开（外拉 8px），一张卡片探头（-9° 微倾）。
   侧挂小仪表「EVAL 复盘」——反思降级为记忆站的仪表。 */
const HUB2 = [
  { cn: "感知", en: "PERCEIVE" }, { cn: "规划", en: "PLAN" },
  { cn: "执行", en: "EXECUTE" }, { cn: "记忆", en: "MEMORY" },
];
export function drawHubV2(g, cx, cy, kind, t, amp = 0) {
  const d = HUB2[kind];
  const breath = 1 + Math.sin(t * 1.57 + kind * 1.2) * 0.015 * (1 + amp * 1.5) + amp * 0.025;
  g.save(); g.translate(cx, cy); g.scale(breath, breath);
  fRR(g, -81, -51, 170, 112, 10, C.shadow);
  fRR(g, -85, -56, 170, 112, 10, C.white);
  sRR(g, -85, -56, 170, 112, 10, C.ink, 1.8);
  sRR(g, -81, -52, 162, 104, 7, C.inkMid, 0.7);
  sline(g, -78, -30, 78, -30, C.ink, 1, kind);
  txt(g, d.cn, -70, -43, { size: 15, al: "left", w: 700 });
  txt(g, d.en, 70, -43, { size: 8.5, al: "right", c: C.amber, f: F_MONO });
  for (const [ex, ey] of [[-85, 0], [85, 0], [0, -56], [0, 56]]) {
    g.fillStyle = C.ink; g.fillRect(ex - 3, ey - 3, 6, 6);
    g.fillStyle = C.goldPale; g.fillRect(ex - 1.5, ey - 1.5, 3, 3);
  }
  if (kind < 3) drawHubGlyph(g, 0, 13, kind, t);
  else drawMemoryGlyph(g, 0, 12, t);
  g.restore();
  if (kind === 3) drawEvalGauge(g, cx + 112, cy - 40, t);
}
export function drawMemoryGlyph(g, x, y, t) {
  g.save(); g.translate(x, y);
  fRR(g, -70, -32, 140, 66, 3, C.white);
  sRR(g, -70, -32, 140, 66, 3, C.ink, 1.5);
  /* 玻璃视窗条：内里卡片剪影 + 斜向反光 */
  sRR(g, -66, -29, 132, 11, 1.5, C.inkMid, 0.8);
  for (let i = 0; i < 20; i++) {
    const h = 5 + ((i * 37) % 4);
    sline(g, -60 + i * 6.3, -19.5, -60 + i * 6.3, -19.5 - h, C.inkMid, 0.8, i);
  }
  sline(g, -40, -19, -28, -28.5, C.blue, 1, 3); sline(g, 24, -19, 36, -28.5, C.blue, 1, 5);
  /* 抽屉 3×2 */
  const labels = ["口径", "坑", "原话"]; /* [v2.1] 0.75× 下可读 */
  for (let r = 0; r < 2; r++) for (let c2 = 0; c2 < 3; c2++) {
    const dx = -66 + c2 * 45, dy = -15 + r * 25, open = r === 1 && c2 === 1;
    if (open) { /* 半开抽屉：暗槽 + 外拉面板 + 探头卡片 */
      fRR(g, dx + 2, dy + 2, 39, 20, 1.5, C.shadow, 0.55);
      sline(g, dx + 3, dy + 3, dx + 3, dy + 11, C.inkMid, 0.8, 1);
      sline(g, dx + 40, dy + 3, dx + 40, dy + 11, C.inkMid, 0.8, 2);
      g.save(); g.translate(dx + 21.5, dy + 4); g.rotate(-0.16);
      fRR(g, -8, -12, 16, 13, 1, C.white); sRR(g, -8, -12, 16, 13, 1, C.ink, 0.9);
      sline(g, -5, -7, 5, -7, C.pencil, 0.8, 4); sline(g, -5, -3.5, 3, -3.5, C.pencil, 0.8, 5);
      g.fillStyle = C.amber; g.fillRect(2, -12, 4, 2.5);
      g.restore();
      fRR(g, dx, dy + 8, 43, 16, 2, C.white); sRR(g, dx, dy + 8, 43, 16, 2, C.ink, 1.1);
      arc(g, dx + 21.5, dy + 20, 3.5, 3.4, 6, C.gold, 1.6);
      fRR(g, dx + 8, dy + 11, 27, 8, 1, C.white); sRR(g, dx + 8, dy + 11, 27, 8, 1, C.grid, 0.8);
      sline(g, dx + 11, dy + 15, dx + 32, dy + 15, C.pencil, 0.9, 6);
    } else {
      sRR(g, dx, dy, 43, 24, 2, C.inkMid, 0.9);
      arc(g, dx + 21.5, dy + 19.5, 3.5, 3.4, 6, C.gold, 1.6);
      fRR(g, dx + 7, dy + 4, 29, 10, 1, C.white); sRR(g, dx + 7, dy + 4, 29, 10, 1, C.grid, 0.8);
      if (r === 0) txt(g, labels[c2], dx + 21.5, dy + 9.3, { size: 7, f: F_HAND, w: 600 });
      else sline(g, dx + 11, dy + 9, dx + 32, dy + 9, C.grid, 0.9, c2);
    }
  }
  g.restore();
}
export function drawEvalGauge(g, x, y, t) {
  /* 挂钩 + 两节链环 + 表盘 r15 + 吊牌，val 在 0.68–0.82 间缓摆 */
  g.save(); g.translate(x, y);
  sline(g, 0, -26, 0, -21, C.ink, 1.4, 1);
  circ(g, 0, -18, 2.6, C.ink, 1.1); circ(g, 0, -13, 2.6, C.ink, 1.1);
  drawGauge(g, 0, 4, 0.75 + Math.sin(t * 0.6) * 0.07, t);
  fRR(g, -26, 22, 52, 13, 2, C.white); sRR(g, -26, 22, 52, 13, 2, C.inkMid, 0.9);
  txt(g, "EVAL 复盘", 0, 28.5, { size: 7.5, c: C.amber, f: F_MONO, w: 700 });
  g.restore();
}

/* ════════ A2 · token 的一生 ════════
   0 毛线团（入口，一根线头飘着）→ 1 圆点（过感知）→
   2 带分支标记（过规划，琥珀小旗）→ 3 方块（过执行）→
   归档吸入（drawArchiveSuck）→ 旧卡片再出发（drawMemCard 跟随下一枚）。 */
export function drawTokenStage(g, x, y, stage, t, seed = 0) {
  if (stage === 1) return drawToken(g, x, y, 0, t, seed);
  g.save(); g.translate(x, y);
  if (stage === 0) { // 毛线团：还没被理顺的任务
    disc(g, 0, 0, 7.5, C.glow, 0.18);
    disc(g, 0, 0, 4.8, C.goldPale); circ(g, 0, 0, 4.8, C.amber, 1.1);
    arc(g, 0, 0, 3.2, 0.4, 2.6, C.amber, 0.8); arc(g, 0, 0, 3.2, 3.5, 5.8, C.amber, 0.8);
    arc(g, 0, 1, 1.8, 0.2, 3, C.amber, 0.8);
    g.strokeStyle = C.amber; g.lineWidth = 0.8; g.beginPath();
    g.moveTo(4.2, 2.3); g.quadraticCurveTo(9, 4.5, 11.5, 2 + Math.sin(t * 3 + seed) * 1);
    g.stroke();
  } else if (stage === 2) { // 圆点 + 分支小旗：带着被选中的路线
    disc(g, 0, 0, 6.5, C.glow, 0.22); disc(g, 0, 0, 2.6, C.glow); disc(g, -0.7, -0.8, 0.9, C.white);
    sline(g, 2, -2, 6.5, -7.5, C.amber, 1.5, seed); /* [v2.1] 流动中可见 */
    sline(g, 6.5, -7.5, 10.5, -10.5, C.amber, 1.5, seed + 1);
    sline(g, 6.5, -7.5, 10.5, -4.5, C.amber, 1.1, seed + 2);
    disc(g, 10.5, -10.5, 1.6, C.amber);
    disc(g, 10.5, -4.5, 1.6, C.white); circ(g, 10.5, -4.5, 1.6, C.amber, 0.8);
  } else if (stage === 3) { // 方块：被执行定形的结果
    disc(g, 0, 0, 7, C.glow, 0.18);
    fRR(g, -3.7, -3.7, 7.4, 7.4, 1.6, C.glow); sRR(g, -3.7, -3.7, 7.4, 7.4, 1.6, C.amber, 1);
    disc(g, -1.2, -1.3, 0.9, C.white);
  }
  g.restore();
}
/* 归档吸入：u∈[0,1]，from → to（抽屉口），缩小 + 两道吸入弧 + 末帧抽屉闪光 */
export function drawArchiveSuck(g, from, to, u) {
  const e = u * u * (3 - 2 * u);
  const x = lerp(from[0], to[0], e), y = lerp(from[1], to[1], e), s = 1 - e * 0.72;
  g.save(); g.translate(x, y); g.scale(s, s);
  drawTokenStage(g, 0, 0, 3, 0, 0);
  g.restore();
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  for (const k of [-1, 1])
    arc(g, x - Math.cos(ang) * 10, y - Math.sin(ang) * 10, 7, ang + k * 0.5 - 0.35, ang + k * 0.5 + 0.35, C.amber, 1, (1 - u) * 0.8);
  if (u > 0.82) circ(g, to[0], to[1], 4 + (u - 0.82) * 60, C.amber, 1.2, 1 - (u - 0.82) / 0.18);
}
/* 记忆卡片：旧经验，跟着下一枚 token 再出发 */
export function drawMemCard(g, x, y, rot = -0.12, alpha = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = alpha;
  fRR(g, -6.5, -4.5, 13, 9, 1, C.white); sRR(g, -6.5, -4.5, 13, 9, 1, C.ink, 0.9); /* [v2.1] 别抢 token 的戏 */
  g.fillStyle = C.amber; g.fillRect(2.4, -4.5, 3.4, 1.9);
  sline(g, -5, -1.5, 5, -1.5, C.pencil, 0.8, 1); sline(g, -5, 1.8, 3, 1.8, C.pencil, 0.8, 2);
  g.restore();
}

/* ════════ B4 · 六台产品装置 ════════
   统一接口：左缘引脚 ×3（x=-56）· 铭牌（y=+36）· 状态灯。本体自由。 */

/* 蒸馏塔 · 破题（C.glow）：论文纸页投进塔顶，分馏 4 层，
   底瓶金液，右侧滴管每 1.4s 落一滴进小量杯。 */
export function drawStillV2(g, cx, cy, t) {
  g.save(); g.translate(cx, cy);
  devPins(g, -56, 0);
  // 塔身 + 分馏层
  fRR(g, -28, -46, 22, 52, 3, C.white); sRR(g, -28, -46, 22, 52, 3, C.ink, 1.5);
  for (let i = 0; i < 4; i++) sline(g, -26, -38 + i * 11, -8, -38 + i * 11, C.inkMid, 0.9, i);
  // 底瓶 + 金液 + 气泡
  disc(g, -17, 16, 15, C.white); 
  g.save(); g.beginPath(); g.arc(-17, 16, 13.6, 0, 6.2832); g.clip();
  g.fillStyle = C.glow; g.globalAlpha = 0.4; g.fillRect(-32, 18, 30, 14); g.globalAlpha = 1;
  sline(g, -30, 18, -4, 18, C.gold, 1.2, 2);
  for (let i = 0; i < 2; i++) { const bu = (t * 0.5 + i * 0.5) % 1; disc(g, -21 + i * 8, 27 - bu * 9, 1.4, C.gold, 1 - bu); }
  g.restore();
  circ(g, -17, 16, 15, C.ink, 1.5);
  // 投纸口 + 下落的纸页（周期 2.2s，两页错相）
  poly(g, [[-32, -52], [-24, -46], [-10, -46], [-2, -52]], C.ink, 1.2);
  for (let i = 0; i < 2; i++) {
    const pu = (t * 0.45 + i * 0.5) % 1;
    if (pu < 0.62) {
      const px = lerp(-44, -19, pu / 0.62), py = lerp(-64, -50, pu / 0.62);
      g.save(); g.translate(px, py); g.rotate(pu * 2.6 - 0.5); g.globalAlpha = 1 - Math.max(0, pu - 0.5) * 5;
      fRR(g, -5, -3.5, 10, 7, 0.5, C.white); sRR(g, -5, -3.5, 10, 7, 0.5, C.inkMid, 0.8);
      sline(g, -3, -1, 3, -1, C.pencil, 0.6, i); sline(g, -3, 1.2, 2, 1.2, C.pencil, 0.6, i + 1);
      g.restore();
    }
  }
  // 侧臂 + 滴嘴 + 金滴 + 量杯
  poly(g, [[-6, -42], [14, -42], [14, -6], [22, -6]], C.gold, 3);
  poly(g, [[-6, -42], [14, -42], [14, -6], [22, -6]], C.goldPale, 1.2);
  sline(g, 24, -6, 24, 0, C.ink, 1.4, 3);
  const dp = (t * 0.72) % 1;
  if (dp < 0.42) { const dy = dp / 0.42; disc(g, 24, 2 + dy * 16, 2 - dy * 0.5, C.glow); }
  else if (dp < 0.5) circ(g, 24, 19, 2 + (dp - 0.42) * 40, C.gold, 0.9, 1 - (dp - 0.42) / 0.08);
  fRR(g, 17, 12, 14, 12, 1.5, C.white); sRR(g, 17, 12, 14, 12, 1.5, C.ink, 1.2);
  fRR(g, 18.5, 18, 11, 4.8, 1, C.glow, 0.5);
  txt(g, "每一滴都是方法", 3, -60, { size: 8, c: C.pencil, f: F_HAND });
  devLamp(g, 42, -34, C.glow, t, 0);
  devPlate(g, 0, 36, "破题");
  g.restore();
}

/* 检验台 · AI侦探社（C.pDet）：放大镜沿台面往复扫指纹卡，
   UV 灯每 3.2s 闪紫 0.35s——闪时指纹显影为紫。 */
export function drawInspectV2(g, cx, cy, t) {
  g.save(); g.translate(cx, cy);
  devPins(g, -56, 6);
  const uv = (t % 3.2) < 0.2; /* [v2.1] 一闪而非换色 */
  // 台面 + 台腿
  fRR(g, -46, 10, 92, 8, 2, C.white); sRR(g, -46, 10, 92, 8, 2, C.ink, 1.5);
  sline(g, -38, 18, -38, 30, C.ink, 1.6, 1); sline(g, 38, 18, 38, 30, C.ink, 1.6, 2);
  // 指纹卡
  g.save(); g.translate(-12, 2); g.rotate(-0.05);
  fRR(g, -17, -8, 34, 16, 1.5, C.white); sRR(g, -17, -8, 34, 16, 1.5, C.inkMid, 1);
  const fc = uv ? C.pGd5j : C.ink;
  arc(g, -5, 0, 2.2, 0.6, 5.6, fc, 0.9); arc(g, -5, 0, 4.4, 0.2, 5.2, fc, 0.9); arc(g, -5, 0.5, 6.4, 0.6, 4.4, fc, 0.9);
  sline(g, 6, -4, 13, -4, C.pencil, 0.7, 3); sline(g, 6, 0, 12, 0, C.pencil, 0.7, 4); sline(g, 6, 4, 13, 4, C.pencil, 0.7, 5);
  g.restore();
  // 龙门架 + UV 灯管
  sline(g, 40, 10, 40, -34, C.ink, 1.6, 6);
  sline(g, 40, -34, -34, -34, C.ink, 1.6, 7);
  fRR(g, -14, -38, 24, 7, 3, uv ? C.pGd5j : C.white, uv ? 0.9 : 1);
  sRR(g, -14, -38, 24, 7, 3, C.ink, 1.1);
  txt(g, "UV", -2, -34.5, { size: 6, c: uv ? C.white : C.inkMid, f: F_MONO, w: 700 });
  if (uv) { // 紫光锥
    g.save(); g.globalAlpha = 0.14; g.fillStyle = C.pGd5j;
    g.beginPath(); g.moveTo(-12, -31); g.lineTo(8, -31); g.lineTo(16, 8); g.lineTo(-24, 8); g.closePath(); g.fill();
    g.restore();
  }
  // 滑轨放大镜：sx = -22±16 正弦往复（周期 7s）
  const sx = -14 + Math.sin(t * 0.9) * 17;
  sline(g, sx, -34, sx, -18, C.inkMid, 1.1, 8);
  circ(g, sx, -8, 9.5, C.ink, 1.7); disc(g, sx, -8, 8, C.blue, 0.16);
  arc(g, sx - 3, -11, 3.5, 3.6, 5.2, C.white, 1.4, 0.9);
  sline(g, sx + 7, -1.5, sx + 12, 3, C.ink, 2.2, 9);
  txt(g, "指纹在放大镜下过一遍", 0, -50, { size: 8, c: C.pencil, f: F_HAND });
  devLamp(g, 47, -14, C.pDet, t, 1);
  devPlate(g, 0, 36, "AI侦探社");
  g.restore();
}

/* 问答收发机 · 会问AI（C.pHwai）：问号形天线；周期 4s——
   0–1.6s 发两道「?」波，2.0–3.6s 收一道「。」波，间隙静默。 */
export function drawQAV2(g, cx, cy, t) {
  g.save(); g.translate(cx, cy);
  devPins(g, -56, 12);
  // 机箱 + 格栅 + 调谐钮
  fRR(g, -32, -4, 64, 32, 4, C.white); sRR(g, -32, -4, 64, 32, 4, C.ink, 1.6);
  for (let i = 0; i < 4; i++) sline(g, -25 + i * 7, 2, -25 + i * 7, 21, C.inkMid, 1, i);
  circ(g, 18, 12, 6, C.ink, 1.3);
  const ph = t % 4;
  const na = ph < 1.6 ? ph * 4 : 0;
  sline(g, 18, 12, 18 + Math.cos(na - 1.2) * 4.5, 12 + Math.sin(na - 1.2) * 4.5, C.amber, 1.3, 5);
  txt(g, "TX", -25, 26.5, { size: 5.5, c: ph < 1.6 ? C.pHwai : C.inkMid, f: F_MONO, w: 700, al: "left" });
  txt(g, "RX", -12, 26.5, { size: 5.5, c: ph >= 2 ? C.blue : C.inkMid, f: F_MONO, w: 700, al: "left" });
  // 问号天线
  sline(g, 0, -4, 0, -20, C.ink, 1.6, 6);
  sline(g, -4, -12, 4, -12, C.ink, 1, 7);
  txt(g, "?", 0, -32, { size: 21, c: C.pHwai, w: 800 });
  // 发「?」收「。」
  if (ph < 1.6) for (const off of [0, 0.7]) {
    const wu = (ph - off) / 1.3;
    if (wu > 0 && wu < 1) {
      arc(g, 4, -32, 8 + wu * 30, -0.55, 0.55, C.pHwai, 1.3, 1 - wu);
      txt(g, "?", 4 + (10 + wu * 30), -32 + Math.sin(t * 4) * 1.5, { size: 9, c: C.pHwai, w: 700, alpha: 1 - wu });
    }
  }
  if (ph >= 2 && ph < 3.6) {
    const wu = (ph - 2) / 1.6;
    arc(g, -4, -32, 8 + (1 - wu) * 30, 2.59, 3.69, C.blue, 1.3, wu * 0.9 + 0.1);
    txt(g, "。", -4 - (10 + (1 - wu) * 30), -34, { size: 10, c: C.blue, w: 700 });
  }
  txt(g, "把问题发出去，等句点回来", 0, -54, { size: 8, c: C.pencil, f: F_HAND });
  devLamp(g, 40, 2, C.pHwai, t, 2);
  devPlate(g, 0, 36, "会问AI");
  g.restore();
}

/* 暖箱 · Home（C.pHome）：培养皿里一粒会长大的小灯（12s 长一轮再温柔重来），
   皿壁贴一枚小房子贴纸；顶部散热缝 + 侧温度计。 */
export function drawIncubatorV2(g, cx, cy, t) {
  g.save(); g.translate(cx, cy);
  devPins(g, -56, 0);
  fRR(g, -40, -32, 80, 60, 8, C.white); sRR(g, -40, -32, 80, 60, 8, C.ink, 1.7);
  for (let i = 0; i < 3; i++) sline(g, -12 + i * 9, -32, -8 + i * 9, -32, C.ink, 2, i);
  // 观察窗 + 暖色氛围
  rr(g, -32, -24, 64, 42, 6); g.save(); g.clip();
  g.fillStyle = C.pHome; g.globalAlpha = 0.07; g.fillRect(-32, -24, 64, 42); g.globalAlpha = 1;
  // 培养皿（俯视微椭圆）
  g.save(); g.translate(0, 2); g.scale(1, 0.5);
  circ(g, 0, 0, 24, C.inkMid, 1.3); circ(g, 0, 0, 20.5, C.grid, 0.9);
  g.restore();
  // 会长大的小灯
  const gu = (t % 24) / 24, r = 1.6 + Math.min(gu, 0.85) / 0.85 * 4.2 /* [v2.1] 成长要慢 */, fade = gu > 0.9 ? 1 - (gu - 0.9) * 10 : 1;
  disc(g, 0, 1, r * 3, C.pHome, 0.16 * fade + Math.sin(t * 2.5) * 0.04);
  disc(g, 0, 1, r, C.pHome, 0.92 * fade); disc(g, -r * 0.3, 1 - r * 0.3, r * 0.32, C.white, fade);
  // 皿壁小房子贴纸
  fRR(g, 12, 3, 10, 9, 1, C.white); sRR(g, 12, 3, 10, 9, 1, C.inkMid, 0.7);
  poly(g, [[13.5, 7], [17, 4.5], [20.5, 7]], C.pHome, 1);
  sRR(g, 15, 7.5, 4, 3.5, 0.5, C.pHome, 1);
  g.restore(); sRR(g, -32, -24, 64, 42, 6, C.inkMid, 0.9);
  // 侧温度计
  sline(g, 34, -18, 34, 6, C.inkMid, 1.1, 5); disc(g, 34, 8, 2.4, C.pHome);
  g.fillStyle = C.pHome; g.fillRect(33, -6 - Math.sin(t * 0.8) * 2, 2, 14 + Math.sin(t * 0.8) * 2);
  txt(g, "36.8°", 34, -25, { size: 5.5, c: C.pencil, f: F_MONO });
  txt(g, "灯养大了就搬新家", 0, -44, { size: 8, c: C.pencil, f: F_HAND });
  devLamp(g, -34, -38, C.pHome, t, 3);
  devPlate(g, 0, 36, "Home");
  g.restore();
}

/* 节律记录仪 · 松果（C.pPine）：松果摆锤（1.85s 半周期）驱动记录笔，
   粉色情绪波形随摆幅起伏，纸带自滚筒向右送出。 */
export function drawRhythmV2(g, cx, cy, t) {
  g.save(); g.translate(cx, cy);
  devPins(g, -56, 0);
  // 滚筒（纹路向下滚动）
  fRR(g, -46, -24, 18, 48, 4, C.white); sRR(g, -46, -24, 18, 48, 4, C.ink, 1.5);
  for (let i = 0; i < 6; i++) { const ly = -22 + ((t * 9 + i * 8) % 44); sline(g, -44, ly, -30, ly, C.grid, 1, i); }
  circ(g, -37, -24, 3, C.ink, 1.1);
  // 纸带 + 波形（振幅跟随摆角包络）
  const swing = Math.sin(t * 1.7);
  fRR(g, -28, -13, 74, 26, 0, C.white);
  sline(g, -28, -13, 46, -13, C.ink, 1.1, 7); sline(g, -28, 13, 46, 13, C.ink, 1.1, 8);
  g.beginPath();
  for (let px = -24; px <= 42; px += 2) {
    const env = 4 + 3.5 * Math.sin((px * 0.045) - t * 0.9);
    const py = Math.sin(px * 0.38 - t * 3.4) * Math.abs(env);
    px === -24 ? g.moveTo(px, py) : g.lineTo(px, py);
  }
  g.strokeStyle = C.pPine; g.lineWidth = 1.4; g.stroke();
  sline(g, 46, -13, 52, -10, C.inkMid, 0.9, 9); sline(g, 46, 13, 52, 10, C.inkMid, 0.9, 10);
  // 门架 + 松果摆锤
  sline(g, 10, -13, 10, -40, C.ink, 1.5, 11); sline(g, -2, -40, 22, -40, C.ink, 1.5, 12);
  g.save(); g.translate(10, -40); g.rotate(swing * 0.42);
  sline(g, 0, 0, 0, 20, C.inkMid, 1.1, 13);
  // 松果：鳞片交叉网纹
  g.translate(0, 25); g.scale(1, 1.25);
  disc(g, 0, 0, 5.5, C.pPine, 0.3); circ(g, 0, 0, 5.5, C.ink, 1.2);
  for (const a of [-0.9, -0.3, 0.3, 0.9]) { arc(g, 0, -6, 8.5, 1.06 + a * 0.32, 1.66 + a * 0.32, C.ink, 0.7); arc(g, 0, 6, 8.5, -1.9 + a * 0.32, -1.3 + a * 0.32, C.ink, 0.7); }
  sline(g, 0, -5.5, 0, -8, C.ink, 1, 14);
  g.restore();
  txt(g, "心情也值得被记录", 0, -52, { size: 8, c: C.pencil, f: F_HAND });
  devLamp(g, 46, -22, C.pPine, t, 4);
  devPlate(g, 0, 36, "松果");
  g.restore();
}

/* 显影盘 · 港东五街（C.pGd5j）：20s 一轮——
   0–14s 船影分三层显影（船体→桅帆→水纹），14–17s 定影，
   17–20s 换纸（新相纸自上滑入）。角落琥珀安全灯。 */
/**
 * @param {CanvasRenderingContext2D} g
 * @param {number} cx
 * @param {number} cy
 * @param {number} t
 * @param {number | null} [forcePh] 强制显影相位（胶囊靠近时快进到船浮现段）
 */
export function drawDevTrayV2(g, cx, cy, t, forcePh = null) {
  g.save(); g.translate(cx, cy);
  devPins(g, -56, 0);
  const ph = forcePh != null ? forcePh : (t % 12) / 12; /* [v2.1] 巡游者停留时长匹配 */
  fRR(g, -46, -32, 92, 62, 6, C.white); sRR(g, -46, -32, 92, 62, 6, C.ink, 1.7);
  sRR(g, -41, -27, 82, 52, 4, C.inkMid, 0.8);
  fRR(g, -41, -27, 82, 52, 4, C.washP, 0.55);
  // 液面涟漪
  for (let i = 0; i < 2; i++) { const ru = (t * 0.3 + i * 0.5) % 1; arc(g, -20 + i * 40, -2 + i * 6, 4 + ru * 10, 0, 6.2832, C.blue, 0.8, (1 - ru) * 0.35); }
  // 相纸
  g.save(); g.translate(0, -1);
  fRR(g, -31, -21, 62, 42, 1.5, C.white); sRR(g, -31, -21, 62, 42, 1.5, C.inkMid, 0.9);
  const a = ph < 0.7 ? ph / 0.7 : ph < 0.85 ? 1 : 1 - (ph - 0.85) / 0.15;
  const aHull = clamp01(a * 1.8), aMast = clamp01(a * 1.8 - 0.45), aDet = clamp01(a * 1.8 - 0.9);
  g.save(); g.beginPath(); g.rect(-29, -19, 58, 38); g.clip();
  // 船体
  g.globalAlpha = aHull;
  g.beginPath(); g.moveTo(-18, 8); g.quadraticCurveTo(0, 13, 18, 8); g.lineTo(14, 2); g.lineTo(-15, 2); g.closePath();
  g.fillStyle = C.pGd5j; g.globalAlpha = aHull * 0.55; g.fill();
  g.globalAlpha = aHull; g.strokeStyle = C.ink; g.lineWidth = 1.1; g.stroke();
  // 桅与帆
  g.globalAlpha = aMast;
  sline(g, 0, 2, 0, -14, C.ink, 1.1, 1); sline(g, -9, 2, -9, -7, C.ink, 0.9, 2);
  g.beginPath(); g.moveTo(0, -14); g.lineTo(10, -4); g.lineTo(0, -4); g.closePath();
  g.fillStyle = C.white; g.fill(); g.strokeStyle = C.pGd5j; g.stroke();
  // 水纹与飞鸟
  g.globalAlpha = aDet;
  arc(g, -12, 12, 5, 3.3, 6.1, C.blue, 0.9); arc(g, 8, 13, 5, 3.3, 6.1, C.blue, 0.9);
  arc(g, -16, -12, 2.5, 3.4, 6, C.ink, 0.8); arc(g, -11.5, -12, 2.5, 3.4, 6, C.ink, 0.8);
  g.globalAlpha = 1;
  g.restore();
  if (ph > 0.85) { // 新相纸滑入
    const su = (ph - 0.85) / 0.15;
    fRR(g, -31, -21 - 42 * (1 - su), 62, 42, 1.5, C.white);
    sRR(g, -31, -21 - 42 * (1 - su), 62, 42, 1.5, C.inkMid, 0.9);
  }
  g.restore();
  // 竹夹 + 安全灯 + 计秒
  poly(g, [[38, -38], [30, -26]], C.ink, 1.8); poly(g, [[42, -36], [33, -25]], C.ink, 1.8);
  disc(g, -40, -38, 3.4, C.amber, 0.9); disc(g, -40, -38, 6.5, C.amber, 0.18); circ(g, -40, -38, 4.8, C.ink, 0.8);
  txt(g, Math.floor(ph * 20) + "s", 41, 24, { size: 6.5, c: C.amber, f: F_MONO });
  txt(g, "等一艘船慢慢显影", 0, -50, { size: 8, c: C.pencil, f: F_HAND });
  devLamp(g, 47, -8, C.pGd5j, t, 5);
  devPlate(g, 0, 38, "港东五街");
  g.restore();
}

/* ════════ B5 · 三台档案装置（记忆区）════════ */

/* 机械龙虾踩在合上的书上：钳子每 4.5s 开合一次，触须常摆 */
export function drawLobsterV2(g, cx, cy, t) {
  g.save(); g.translate(cx, cy);
  // 合上的书
  fRR(g, -36, -2, 72, 17, 3, C.white); sRR(g, -36, -2, 72, 17, 3, C.ink, 1.6);
  sline(g, -36, 3, 36, 3, C.inkMid, 0.8, 1);
  sline(g, 30, 5, 30, 13, C.grid, 0.9, 2); sline(g, 33, 4, 33, 14, C.grid, 0.9, 3);
  fRR(g, -30, 5, 26, 7, 1, C.goldPale, 0.8); sline(g, -27, 8.5, -8, 8.5, C.inkMid, 0.9, 4);
  // 尾节 ×3（向左收小）+ 尾扇
  const segs = [[-8, -12, 7], [-17, -10, 5.5], [-24, -8.5, 4.2]];
  segs.forEach(([sx, sy, sr], i) => { disc(g, sx, sy, sr, C.goldPale, 0.7); circ(g, sx, sy, sr, C.ink, 1.2); disc(g, sx, sy - 1, 0.8, C.inkMid); });
  for (const a of [-0.5, 0, 0.5]) sline(g, -27, -8, -33 - Math.cos(a) * 3, -8 + Math.sin(a) * 6, C.ink, 1, a * 7);
  // 头胸甲 + 铆钉 + 关节齿轮
  g.save(); g.translate(4, -14); g.scale(1.25, 1);
  disc(g, 0, 0, 8.5, C.goldPale, 0.85); circ(g, 0, 0, 8.5, C.ink, 1.4);
  g.restore();
  for (const [rx, ry] of [[0, -14], [6, -11], [8, -17]]) disc(g, rx, ry, 0.9, C.inkMid);
  circ(g, 13, -12, 3, C.ink, 1); for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28 + t * 0.5; sline(g, 13 + Math.cos(a) * 3, -12 + Math.sin(a) * 3, 13 + Math.cos(a) * 4.4, -12 + Math.sin(a) * 4.4, C.ink, 0.9, i); }
  // 眼柄 + 触须
  sline(g, 8, -20, 10, -24, C.ink, 1, 8); disc(g, 10.4, -24.6, 1.3, C.ink);
  sline(g, 5, -20, 6, -25, C.ink, 1, 9); disc(g, 6.2, -25.8, 1.3, C.ink);
  g.beginPath(); g.moveTo(9, -22);
  g.quadraticCurveTo(-6, -30 + Math.sin(t * 1.4) * 2, -22, -26 + Math.sin(t * 1.1) * 3);
  g.moveTo(7, -23); g.quadraticCurveTo(-8, -34 + Math.sin(t * 1.2 + 1) * 2, -26, -32 + Math.sin(t * 0.9) * 3);
  g.strokeStyle = C.inkMid; g.lineWidth = 0.9; g.stroke();
  // 步足
  for (let i = 0; i < 3; i++) { sline(g, 0 + i * 5, -8, -2 + i * 5.5, -2, C.ink, 1, i + 10); }
  // 双钳：4.5s 一次「咔哒」
  const s = t % 4.5, open = s < 0.5 ? Math.sin((s / 0.5) * 3.1416) * 0.5 : 0;
  for (const [ax, ay, base, sc] of [[14, -8, -0.15, 1], [12, -17, -0.45, 0.8]]) {
    g.save(); g.translate(ax, ay); g.rotate(base); g.scale(sc, sc);
    sline(g, 0, 0, 8, 0, C.ink, 1.5, ax);
    g.translate(8, 0);
    for (const k of [-1, 1]) {
      g.save(); g.rotate(k * (0.28 + open));
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(8, k * 2.5, 11, 0); g.quadraticCurveTo(6, k * -0.5, 0, 0);
      g.fillStyle = C.white; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.2; g.stroke();
      g.restore();
    }
    disc(g, 0, 0, 1.6, C.inkMid);
    g.restore();
  }
  devPlate(g, 0, 24, "观察日志 01", 84);
  txt(g, "ARCHIVE · 龙虾与书", 0, 48, { size: 6.5, c: C.pencil, f: F_MONO });
  g.restore();
}

/* 行情纸带机：玻璃罩打字轮慢转，纸带吐出、堆成小山 */
export function drawTickerV2(g, cx, cy, t) {
  g.save(); g.translate(cx, cy);
  // 底座 + 玻璃罩
  fRR(g, -16, -4, 32, 12, 2, C.white); sRR(g, -16, -4, 32, 12, 2, C.ink, 1.5);
  fRR(g, -11, 8, 22, 5, 1.5, C.white); sRR(g, -11, 8, 22, 5, 1.5, C.ink, 1.2);
  circ(g, 0, -18, 14, C.ink, 1.5);
  arc(g, -4, -22, 8, 3.5, 5, C.white, 1.6, 0.9);
  // 罩内打字轮
  circ(g, 0, -18, 5, C.inkMid, 1.1);
  for (let i = 0; i < 4; i++) { const a = t * 1.3 + (i / 4) * 6.28; sline(g, Math.cos(a) * 5, -18 + Math.sin(a) * 5, Math.cos(a) * 7, -18 + Math.sin(a) * 7, C.inkMid, 0.9, i); }
  sline(g, 0, -10, 0, -4, C.inkMid, 1, 5);
  // 纸带：出口 → 垂落 → 小山
  g.beginPath(); g.moveTo(16, 0);
  g.quadraticCurveTo(26, 2 + Math.sin(t * 1.6) * 1.5, 28, 10);
  g.quadraticCurveTo(29, 15, 26, 18);
  g.strokeStyle = C.white; g.lineWidth = 5; g.stroke();
  g.strokeStyle = C.ink; g.lineWidth = 1; 
  g.beginPath(); g.moveTo(16, -2.5); g.quadraticCurveTo(26.5, 0 + Math.sin(t * 1.6) * 1.5, 30.5, 10); g.stroke();
  g.beginPath(); g.moveTo(16, 2.5); g.quadraticCurveTo(24.5, 4 + Math.sin(t * 1.6) * 1.5, 25.5, 10); g.stroke();
  for (let i = 0; i < 3; i++) { const tu = (t * 0.5 + i / 3) % 1; sline(g, 19 + tu * 7, -1 + tu * 6, 21 + tu * 7, 0 + tu * 6, C.amber, 1, i); }
  // 纸山：叠圈涂鸦
  const loops = [[30, 20, 6, 4], [24, 22, 5, 3.4], [35, 23, 4.5, 3], [29, 24, 7, 3.6]];
  loops.forEach(([lx, ly, lrx, lry], i) => {
    g.save(); g.translate(lx, ly); g.scale(1, lry / lrx); circ(g, 0, 0, lrx, C.inkMid, 0.9, 0.8); g.restore();
  });
  arc(g, 29, 26, 12, 3.34, 6.1, C.ink, 1.1);
  devPlate(g, -4, 30, "行情手记 01", 84); /* [v2.1] 龙虾下线后顺号 */
  txt(g, "ARCHIVE · 纸带小山", -4, 54, { size: 6.5, c: C.pencil, f: F_MONO });
  g.restore();
}

/* 三球轨道仪：内外两道轨 + 一枚小月，互绕不休 */
export function drawOrreryV2(g, cx, cy, t) {
  g.save(); g.translate(cx, cy);
  // 底座 + 立柱
  poly(g, [[-14, 26], [14, 26], [9, 20], [-9, 20]], C.ink, 1.3);
  fRR(g, -9, 20, 18, 6, 1, C.white, 0.9);
  sline(g, 0, 20, 0, -2, C.ink, 1.6, 1); disc(g, 0, -2, 2.2, C.ink);
  // 轨道
  circ(g, 0, -2, 10, C.grid, 0.9); circ(g, 0, -2, 19, C.grid, 0.9);
  g.save(); g.setLineDash([2, 3]); circ(g, 0, -2, 25, C.grid, 0.8); g.restore();
  // 三球：内轨对置双球互绕，外轨第三球带小月
  const a1 = t * 1.1;
  for (const k of [0, 3.1416]) {
    const bx = Math.cos(a1 + k) * 10, by = -2 + Math.sin(a1 + k) * 10;
    sline(g, 0, -2, bx, by, C.inkMid, 0.9, k * 3);
    disc(g, bx, by, 3, k ? C.blue : C.gold); circ(g, bx, by, 3, C.ink, 0.9);
  }
  const a3 = -t * 0.55 + 1.2, tx = Math.cos(a3) * 19, ty = -2 + Math.sin(a3) * 19;
  sline(g, 0, -2, tx, ty, C.inkMid, 0.9, 7);
  disc(g, tx, ty, 3.4, C.gold); circ(g, tx, ty, 3.4, C.ink, 0.9); /* [v2.1] 粉只属于松果 */
  const am = t * 1.2; disc(g, tx + Math.cos(am) * 6, ty + Math.sin(am) * 6, 1.4, C.ink);
  circ(g, tx, ty, 6, C.grid, 0.7);
  devPlate(g, 0, 34, "三体讲义 02", 84); /* [v2.1] 龙虾下线后顺号 */
  txt(g, "ARCHIVE · 互绕不休", 0, 58, { size: 6.5, c: C.pencil, f: F_MONO });
  g.restore();
}

/* ════════ B6 · 九件工具（工具墙）════════
   洞洞板 + 挂钩；磨损三档：Ⅲ 金亮把手 + 星闪 / Ⅱ 金浅磨痕 / Ⅰ 素净。
   idx: 0齿轮组 1漏斗滤纸 2游标卡尺 3道岔扳手 4卡片抽屉
        5传送带 6水管阀门 7脚手架 8扩音喇叭 */
export const TOOL_NAMES = ["齿轮组", "漏斗滤纸", "游标卡尺", "道岔扳手", "卡片抽屉", "传送带", "水管阀门", "脚手架", "扩音喇叭"];
export const TOOL_WEAR = [3, 2, 2, 3, 2, 1, 2, 1, 1];
export function drawToolItemV2(g, x, y, idx, wear, t, ghost = false) {
  g.save(); g.translate(x, y);
  if (ghost) { g.globalAlpha = 0.38; g.setLineDash([3, 3]); }
  const I = ghost ? C.pencil : C.ink, M = ghost ? C.pencil : C.inkMid;
  const gear = (gx, gy, r, n, a0, hi) => {
    circ(g, gx, gy, r, I, 1.3); disc(g, gx, gy, 1.2, I);
    for (let i = 0; i < n; i++) { const a = a0 + (i / n) * 6.2832; sline(g, gx + Math.cos(a) * r, gy + Math.sin(a) * r, gx + Math.cos(a) * (r + 2.6), gy + Math.sin(a) * (r + 2.6), hi || I, 1.2, i); }
  };
  if (idx === 0) { // 齿轮组：互啮反转
    gear(-5, 3, 7, 8, t * 0.4, null);
    gear(7.5, -6, 4.6, 6, -t * 0.61 + 0.4, null);
  } else if (idx === 1) { // 漏斗滤纸 + 慢滴
    poly(g, [[-11, -11], [11, -11], [2.5, 2], [2.5, 10], [-2.5, 10], [-2.5, 2], [-11, -11]], I, 1.3);
    poly(g, [[-7, -9], [-2, -4], [0, -9], [2, -4], [7, -9]], M, 0.9);
    const du = (t * 0.5) % 1; if (du < 0.5 && !ghost) disc(g, 0, 12 + du * 8, 1.3, C.blue, 1 - du * 2);
  } else if (idx === 2) { // 游标卡尺：滑爪缓移
    const sx = 2 + Math.sin(t * 0.6) * 4;
    fRR(g, -14, -3, 28, 5, 1, C.white, ghost ? 0 : 1); sRR(g, -14, -3, 28, 5, 1, I, 1.2);
    for (let i = 0; i < 7; i++) sline(g, -11 + i * 4, -3, -11 + i * 4, -0.5, M, 0.7, i);
    poly(g, [[-14, 2], [-14, 11], [-11, 11], [-11, 2]], I, 1.2);
    poly(g, [[sx, 2], [sx, 11], [sx + 3, 11], [sx + 3, 2]], I, 1.2);
    sRR(g, sx - 1.5, -6, 7, 3.5, 0.5, M, 0.9);
  } else if (idx === 3) { // 道岔扳手：5s 换一次位
    const s = t % 5, u = s < 0.5 ? s / 0.5 : 1, flip = Math.floor(t / 5) % 2;
    const a0 = flip ? lerp(-0.65, 0.65, u) : lerp(0.65, -0.65, u);
    arc(g, 0, 8, 12, 3.66, 5.76, M, 1.1);
    disc(g, -Math.sin(-0.65) * 12, 8 + Math.cos(-0.65) * -12, 1.2, M); disc(g, -Math.sin(0.65) * 12, 8 + Math.cos(0.65) * -12, 1.2, M);
    sline(g, 0, 8, Math.sin(a0) * 16, 8 - Math.cos(a0) * 16, I, 1.7, 1);
    disc(g, Math.sin(a0) * 16, 8 - Math.cos(a0) * 16, 2.6, ghost ? C.pencil : C.amber);
    disc(g, 0, 8, 1.8, I);
  } else if (idx === 4) { // 卡片抽屉（单格）
    fRR(g, -10, -6, 20, 15, 2, C.white, ghost ? 0 : 1); sRR(g, -10, -6, 20, 15, 2, I, 1.3);
    arc(g, 0, 5, 3, 3.4, 6, ghost ? C.pencil : C.gold, 1.4);
    fRR(g, -6, -3.5, 12, 5, 0.5, C.white, ghost ? 0 : 1); sRR(g, -6, -3.5, 12, 5, 0.5, M, 0.8);
    g.save(); g.translate(2, -8); g.rotate(-0.18); sRR(g, -4, -4, 8, 6, 0.5, I, 1); g.restore();
  } else if (idx === 5) { // 传送带：小箱缓行
    circ(g, -8, 4, 4, I, 1.3); circ(g, 8, 4, 4, I, 1.3); disc(g, -8, 4, 1, I); disc(g, 8, 4, 1, I);
    sline(g, -8, 0, 8, 0, I, 1.2, 1); sline(g, -8, 8, 8, 8, I, 1.2, 2);
    const bu = ((t * 0.25) % 1) * 20 - 10;
    sRR(g, bu - 3, -6, 6, 5.5, 0.5, I, 1.1);
    if (!ghost) for (let i = 0; i < 3; i++) { const du = (t * 0.5 + i / 3) % 1; disc(g, -8 + du * 16, 0, 0.8, C.amber); }
  } else if (idx === 6) { // 水管阀门：手轮微转
    fRR(g, -3.5, -12, 7, 9, 1, C.white, ghost ? 0 : 1); sRR(g, -3.5, -12, 7, 9, 1, I, 1.2);
    sline(g, -6, -12, 6, -12, I, 1.3, 1);
    const wa = Math.sin(t * 0.7) * 0.5;
    circ(g, 0, 2, 7.5, I, 1.4);
    for (let i = 0; i < 4; i++) { const a = wa + (i / 4) * 6.2832; sline(g, 0, 2, Math.cos(a) * 7.5, 2 + Math.sin(a) * 7.5, I, 1.1, i); }
    disc(g, 0, 2, 1.6, I);
  } else if (idx === 7) { // 脚手架
    for (const vx of [-9, 0, 9]) sline(g, vx, -11, vx, 11, I, 1.2, vx);
    for (const hy of [-11, 0, 11]) sline(g, -9, hy, 9, hy, I, 1.2, hy);
    sline(g, -9, 0, 0, -11, M, 0.9, 5); sline(g, 0, 11, 9, 0, M, 0.9, 6);
    for (const vx of [-9, 0, 9]) for (const hy of [-11, 0, 11]) disc(g, vx, hy, 1, I);
  } else { // 扩音喇叭
    g.save(); g.rotate(-0.35);
    poly(g, [[-9, -3], [-9, 3], [4, 8], [4, -8], [-9, -3]], I, 1.3);
    arc(g, 4, 0, 8, -1.05, 1.05, I, 1.3);
    fRR(g, -13, -2.5, 4, 5, 1, C.white, ghost ? 0 : 1); sRR(g, -13, -2.5, 4, 5, 1, I, 1.1);
    sline(g, -6, 5, -6, 12, I, 1.2, 1);
    if (!ghost) { const su = (t * 0.9) % 1; arc(g, 13, 0, 4 + su * 6, -0.7, 0.7, C.amber, 1.1, 1 - su); }
    g.restore();
  }
  g.restore();
  if (ghost) return;
  /* 磨损三档 */
  if (wear >= 2) arc(g, x, y + 14, 10, 3.6, 5.8, C.goldPale, wear, 0.9);
  if (wear === 3) {
    arc(g, x, y + 14, 10, 3.9, 5.5, C.glow, 1.6, 0.9);
    const tw = 0.5 + Math.sin(t * 3 + idx) * 0.5;
    sline(g, x + 10, y - 12, x + 14, y - 12, C.glow, 1.1, 1); sline(g, x + 12, y - 14, x + 12, y - 10, C.glow, 1.1, 2);
    disc(g, x + 12, y - 12, 1.2, C.glow, tw);
  }
}
export function drawToolWallV2(g, cx, cy, t, opts = {}) {
  const { borrowed = 3 } = opts; // 第 4 件（道岔扳手）被今天的任务借走
  g.save(); g.translate(cx, cy);
  fRR(g, -257, -56, 522, 122, 4, C.shadow, 0.8);
  fRR(g, -260, -59, 522, 122, 4, C.white);
  sRR(g, -260, -59, 522, 122, 4, C.ink, 1.8);
  // 洞洞板
  for (let px = -248; px <= 250; px += 13) for (let py = -48; py <= 50; py += 13)
    disc(g, px, py, 0.9, C.grid, 0.9);
  txt(g, "工具墙 TOOLBOARD ×9 · 磨损度 = 被调用的深度", 0, -48, { size: 8, c: C.amber, f: F_MONO });
  for (let i = 0; i < 9; i++) {
    const x = -216 + i * 54, wear = TOOL_WEAR[i];
    arc(g, x, -32, 3.4, 3.34, 6.2, C.ink, 1.4); // 挂钩
    if (i === borrowed) {
      drawToolItemV2(g, x, -6, i, 0, t, true); // 只剩铅笔剪影
      txt(g, "借去修调度线了", x, 20, { size: 8, c: C.pencil, f: F_HAND, rot: -3 }); /* [v2.1] 与主干呼应 */
    } else {
      sline(g, x, -29, x, -22, C.inkMid, 0.9, i);
      drawToolItemV2(g, x, -6, i, wear, t);
    }
    txt(g, "0" + (i + 1) + " " + TOOL_NAMES[i], x, 34, { size: 7, c: C.inkMid });
    for (let k = 0; k < wear; k++) { g.fillStyle = C.amber; g.fillRect(x - 8 + k * 6, 42, 4, 2.5); }
  }
  g.restore();
}

/* ════════ B7 · 六条观点载体（位置即语义）════════
   0 行李牌·拴在部署总线（跟着上线的东西走）
   1 搪瓷警示牌·钉在生产主干旁（生产纪律）
   2 管线丝印白字·印在集流管上（流程本身的信条）
   3 胶带便签 / 4 图钉便签（工作中的想法，复用 v1 drawNote）
   5 草稿纸 + 修订云线（还没想透的）
   正文均为占位笔迹/示意文案，实文走 DOM 层。 */
export function drawLuggageTag(g, tieX, tieY, no, t) {
  const sway = Math.sin(t * 1.3) * 0.07;
  g.save(); g.translate(tieX, tieY);
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-14, 12, -22 + sway * 20, 26); g.strokeStyle = C.pencil; g.lineWidth = 1; g.stroke();
  g.translate(-22 + sway * 20, 26); g.rotate(-0.5 + sway);
  fRR(g, -1, -15, 4, 30, 2, C.shadow, 0.6);
  g.beginPath(); g.moveTo(0, -16); g.lineTo(44, -16); g.lineTo(44, 16); g.lineTo(0, 16); g.lineTo(-12, 0); g.closePath();
  g.fillStyle = C.white; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.3; g.stroke();
  circ(g, -4, 0, 3, C.ink, 1.1); circ(g, -4, 0, 4.6, C.goldPale, 1.6);
  txt(g, "观点 0" + no, 6, -8, { size: 7.5, c: C.amber, f: F_MONO, al: "left" });
  sline(g, 6, 0, 38, 0, C.pencil, 1, no); sline(g, 6, 7, 30, 7, C.pencil, 1, no + 1);
  g.restore();
}
export function drawEnamelSign(g, x, y, no, t) {
  g.save(); g.translate(x, y); g.rotate(-0.015);
  fRR(g, -45, -23, 96, 50, 4, C.shadow, 0.7);
  fRR(g, -48, -25, 96, 50, 4, C.white);
  sRR(g, -48, -25, 96, 50, 4, C.ink, 2);
  sRR(g, -44, -21, 88, 42, 2.5, C.blue, 1.6);
  // 掉瓷缺口 + 锈点
  disc(g, 46, -14, 3, C.paper); arc(g, 46, -14, 3, 1.6, 4.6, C.inkMid, 0.9);
  disc(g, -40, 22, 2.2, C.paper); circ(g, -40, 22, 2.2, C.inkMid, 0.7);
  // 钉子
  disc(g, -41, -18, 2, C.inkMid); disc(g, 40, 18, 2, C.inkMid);
  txt(g, "观点 0" + no, 0, -13, { size: 7.5, c: C.amber, f: F_MONO });
  // painted 正文占位：粗墨条
  fRR(g, -34, -4, 68, 7, 1, C.ink, 0.85); fRR(g, -26, 8, 52, 7, 1, C.ink, 0.85);
  g.restore();
}
export function drawPipeStencil(g, x, y, no, s) {
  // 丝印在管壁：白字直接印在描金管上，字脚做一点断墨
  txt(g, s, x, y + 0.5, { size: 7.5, c: C.white, f: F_MONO, w: 700 });
  txt(g, s, x + 0.4, y + 0.5, { size: 7.5, c: C.white, f: F_MONO, w: 400, alpha: 0.5 });
  txt(g, "观点 0" + no + " · 丝印", x, y - 12, { size: 6.5, c: C.amber, f: F_MONO });
  sline(g, x - 4, y - 8, x - 1, y - 5, C.amber, 0.7, no);
}
export function drawDraftSheet(g, x, y, no, t) {
  g.save(); g.translate(x, y); g.rotate(0.02);
  fRR(g, -61, -38, 126, 80, 1, C.shadow, 0.7);
  fRR(g, -64, -41, 126, 80, 1, C.white);
  sRR(g, -64, -41, 126, 80, 1, C.inkMid, 1);
  // 稿纸淡格
  for (let i = 1; i < 5; i++) sline(g, -58, -41 + i * 15, 56, -41 + i * 15, C.grid, 0.8, i);
  // 折角
  poly(g, [[46, -41], [62, -41], [62, -25]], C.paper, 1);
  g.beginPath(); g.moveTo(46, -41); g.lineTo(62, -25); g.lineTo(46, -25); g.closePath();
  g.fillStyle = C.grid; g.globalAlpha = 0.6; g.fill(); g.globalAlpha = 1;
  g.strokeStyle = C.inkMid; g.lineWidth = 0.9; g.stroke();
  txt(g, "观点 0" + no, -58, -30, { size: 7.5, c: C.amber, f: F_MONO, al: "left" });
  txt(g, "DRAFT", 40, 30, { size: 9, c: C.pencil, f: F_MONO, rot: -6, alpha: 0.7 });
  // 手写笔迹 + 划改
  sline(g, -56, -12, 40, -12, C.pencil, 1.1, no); sline(g, -56, 3, 24, 3, C.pencil, 1.1, no + 1);
  sline(g, -20, 3, 6, 3, C.pencil, 1.6, no + 2); // 划掉一段
  sline(g, -56, 18, 46, 18, C.pencil, 1.1, no + 3);
  revCloud(g, -14, 3, 50, 12);
  g.restore();
}

/* ════════ B8 · 四条生产主干末端装置 ════════
   0 报告打印机（BI Agent） 1 对讲听筒（数据问答）
   2 多轨道闸（调度优化）  3 蓝图卷筒（智能化战略） */
export function drawTrunkEndV2(g, cx, cy, kind, t) {
  g.save(); g.translate(cx, cy);
  if (kind === 0) { // 报告打印机：报告纸缓缓吐出，4s 一页
    fRR(g, -24, -16, 48, 20, 4, C.white); sRR(g, -24, -16, 48, 20, 4, C.ink, 1.5);
    sline(g, -16, -8, -16, 0, C.inkMid, 1, 1); disc(g, 16, -6, 2.6, C.green, 0.9);
    sline(g, -18, 4, 18, 4, C.ink, 1.6, 2);
    const pu = (t * 0.25) % 1, hpx = 6 + pu * 14;
    fRR(g, -14, 4, 28, hpx, 1, C.white); sRR(g, -14, 4, 28, hpx, 1, C.inkMid, 0.9);
    for (let i = 0; i < Math.floor(hpx / 6); i++) sline(g, -10, 9 + i * 6, 8 - (i % 2) * 4, 9 + i * 6, C.pencil, 0.8, i);
    txt(g, "REPORT", 0, -10, { size: 5.5, c: C.amber, f: F_MONO });
  } else if (kind === 1) { // 对讲听筒：6s 轻震一次
    fRR(g, -13, -18, 26, 36, 3, C.white); sRR(g, -13, -18, 26, 36, 3, C.ink, 1.5);
    arc(g, 0, -12, 4, 3.14, 6.28, C.inkMid, 1.2);
    const ring = (t % 6) < 0.5 ? Math.sin(t * 42) * 0.08 : 0;
    g.save(); g.translate(0, -2); g.rotate(ring);
    fRR(g, -6, -8, 12, 9, 4, C.ink); fRR(g, -6, 7, 12, 9, 4, C.ink);
    fRR(g, -3, -2, 6, 12, 2, C.inkMid);
    g.restore();
    g.beginPath(); g.moveTo(4, 16);
    for (let i = 0; i <= 8; i++) { const u = i / 8; g.lineTo(4 + u * 12, 16 + Math.sin(u * 9 + t * 2) * 2 + u * 6); }
    g.strokeStyle = C.ink; g.lineWidth = 1; g.stroke();
    if ((t % 6) < 0.5) arc(g, 0, -22, 5 + (t % 0.5) * 14, -2.2, -0.9, C.amber, 1, 1 - (t % 0.5) * 2);
  } else if (kind === 2) { // 多轨道闸：闸臂每 2.5s 换一股道
    const sel = Math.floor(t / 2.5) % 3, s = (t % 2.5), u = s < 0.4 ? s / 0.4 : 1;
    const prev = (sel + 2) % 3, ya = lerp((prev - 1) * 11, (sel - 1) * 11, u * u * (3 - 2 * u));
    for (let i = 0; i < 3; i++) {
      const ty = (i - 1) * 11;
      poly(g, [[-26, 0], [-8, ty], [26, ty]], i === sel ? C.gold : C.inkMid, i === sel ? 2.2 : 1);
      for (let k = 0; k < 4; k++) sline(g, 2 + k * 6, ty - 2, 2 + k * 6, ty + 2, C.inkMid, 0.8, k + i);
      disc(g, 28, ty, 1.8, i === sel ? C.green : C.white); circ(g, 28, ty, 1.8, C.ink, 0.8);
    }
    poly(g, [[-26, 0], [-8, ya]], C.amber, 2.4);
    disc(g, -26, 0, 3, C.white); circ(g, -26, 0, 3, C.ink, 1.2);
    txt(g, "JCT", -26, 10, { size: 5.5, c: C.amber, f: F_MONO });
  } else { // 蓝图卷筒：卷轴 + 摊开的一角蓝线图
    fRR(g, -34, -14, 52, 28, 1, C.white); sRR(g, -34, -14, 52, 28, 1, C.inkMid, 1);
    for (let i = 1; i < 4; i++) { sline(g, -34, -14 + i * 7, 18, -14 + i * 7, C.blue, 0.7, i, [3, 2]); }
    for (let i = 1; i < 6; i++) sline(g, -34 + i * 9, -14, -34 + i * 9, 14, C.blue, 0.7, i + 4, [3, 2]);
    sRR(g, -26, -8, 22, 14, 0, C.blue, 1.1);
    sline(g, -15, -8, -15, 6, C.blue, 0.9, 11);
    // 卷筒
    fRR(g, 16, -17, 16, 34, 7, C.white); sRR(g, 16, -17, 16, 34, 7, C.ink, 1.5);
    circ(g, 24, -10, 3.4, C.inkMid, 1); arc(g, 24, -10, 1.6, 0, 4.5, C.inkMid, 0.9);
    fRR(g, 14, -2, 20, 4, 1.5, C.goldPale, 0.9); sRR(g, 14, -2, 20, 4, 1.5, C.inkMid, 0.7);
    const wv = Math.sin(t * 1.2) * 1.2;
    g.beginPath(); g.moveTo(-34, 14); g.quadraticCurveTo(-40, 15 + wv, -43, 12); g.strokeStyle = C.inkMid; g.lineWidth = 0.9; g.stroke();
  }
  g.restore();
}
export const TRUNK_END_TAGS = ["报告打印机", "对讲听筒", "多轨道闸", "蓝图卷筒"];

/* 生产主干 v2：更短的干管，SLA 读数移到表旁，末端直接接装置 */
export function drawTrunkV2(g, x, yTop, yBot, name, val, t, seed = 0) {
  pipe(g, [[x, yTop], [x, yBot - 24]], 9);
  const u = (t * 0.35 + seed * 0.31) % 1;
  drawTokenStage(g, x, yTop + (yBot - 42 - yTop) * u, 3, t, seed);
  drawGauge(g, x, yTop + 26, val, t + seed);
  txt(g, "SLA " + Math.round(val * 100) + "%", x + 20, yTop + 26, { size: 7, c: C.amber, f: F_MONO, al: "left" });
  g.save(); g.beginPath(); g.rect(x - 16, yBot - 24, 32, 18); g.clip();
  g.fillStyle = C.white; g.fillRect(x - 16, yBot - 24, 32, 18);
  for (let i = -3; i < 8; i++) sline(g, x - 16 + i * 6, yBot - 24, x - 26 + i * 6, yBot - 6, C.inkMid, 1, i);
  g.restore(); g.strokeStyle = C.ink; g.lineWidth = 1.4; g.strokeRect(x - 16, yBot - 24, 32, 18);
  fRR(g, x - 44, yBot + 2, 88, 17, 3, C.white); sRR(g, x - 44, yBot + 2, 88, 17, 3, C.inkMid, 0.9);
  txt(g, name, x, yBot + 11, { size: 10.5, w: 700 });
}

/* ════════ C10 · 迷你蓝图（小地图）════════
   132×96 白卡：主环矩形 + 部署总线 + 集流管一笔线稿，
   琥珀取景框缓移，你 = 光点。锚点 = 左上角。 */
/**
 * @param {CanvasRenderingContext2D} g
 * @param {number} x
 * @param {number} y
 * @param {number} t
 * @param {[number, number] | null} [view] 取景框左上角（小地图局部坐标）
 */
export function drawMinimapV2(g, x, y, t, view = null) {
  g.save(); g.translate(x, y);
  fRR(g, 2.5, 2.5, 132, 96, 3, C.shadow, 0.7);
  fRR(g, 0, 0, 132, 96, 3, C.white, 0.95); sRR(g, 0, 0, 132, 96, 3, C.ink, 1.5);
  txt(g, "图纸全貌", 10, 11, { size: 7, c: C.amber, f: F_MONO, al: "left" });
  sline(g, 46, 11, 124, 11, C.grid, 0.8, 1);
  // 一笔线稿：主环 + 总线 + 集流管 + 主干刻
  const sx = 12 + 0, sy = 20; // 内部绘图区 108×68，映射 1400×1000 → ×0.077
  const M = (px, py) => [sx + (px - 40) * 0.082, sy + (py - 40) * 0.068];
  const ringPts = [[330, 330], [1010, 330], [1010, 690], [330, 690], [330, 330]].map((p) => M(p[0], p[1]));
  poly(g, ringPts, C.ink, 1.4);
  poly(g, [M(1095, 690), M(1180, 690), M(1180, 160)], C.ink, 1);
  for (let i = 0; i < 6; i++) { const [bx, by] = M(1180, 175 + i * 115); sline(g, bx, by, bx + 5, by, C.inkMid, 0.9, i); }
  poly(g, [M(1010, 746), M(1010, 800), M(560, 800)], C.ink, 1);
  for (let i = 0; i < 4; i++) { const [tx2, ty2] = M(600 + i * 120, 800); sline(g, tx2, ty2, tx2, ty2 + 6, C.inkMid, 0.9, i); }
  // 记忆柜小刻 + 接管台红点（唯一的红，仅 1.5px）
  const [mx, my] = M(330, 690);
  for (let i = 0; i < 3; i++) sline(g, mx - 4, my - 2 + i * 2.4, mx + 4, my - 2 + i * 2.4, C.inkMid, 0.8, i);
  const [hx2, hy2] = M(128, 470); disc(g, hx2, hy2, 1.5, C.red);
  // 取景框（琥珀）缓移演示 + 你的光点
  const vu = view ? 0 : (Math.sin(t * 0.4) + 1) / 2;
  const vx = view ? view[0] : 26 + vu * 40, vy = view ? view[1] : 34 + vu * 16;
  g.save(); g.setLineDash([3, 2]); sRR(g, vx, vy, 34, 24, 1, C.amber, 1.2); g.restore();
  disc(g, vx + 17, vy + 12, 2.6, C.glow); disc(g, vx + 17, vy + 12, 5, C.glow, 0.25);
  g.restore();
}

/* ════════ C11 · 尺寸标注线 ════════
   细墨线 0.8 + 端点外向箭头 + 端头延伸短刻 + mono 小字（纸底垫白）。 */
export function drawDim(g, x1, y1, x2, y2, label, o = {}) {
  const { side = -1, gap = 9 } = o;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const nx = Math.sin(ang) * side, ny = -Math.cos(ang) * side;
  sline(g, x1, y1, x2, y2, C.ink, 0.8, 1);
  for (const [ex, ey] of [[x1, y1], [x2, y2]])
    sline(g, ex - nx * 4, ey - ny * 4, ex + nx * 4, ey + ny * 4, C.ink, 0.8, ex);
  arrowHead(g, x1, y1, ang + 3.1416, C.ink, 5.5);
  arrowHead(g, x2, y2, ang, C.ink, 5.5);
  const mx2 = (x1 + x2) / 2 + nx * gap, my2 = (y1 + y2) / 2 + ny * gap;
  const w = String(label).length * 5.2 + 8;
  fRR(g, mx2 - w / 2, my2 - 6, w, 12, 1, C.paper, 0.92);
  txt(g, label, mx2, my2, { size: 8.5, c: C.ink, f: F_MONO });
}

/* ════════ C12 · 微动效三则 ════════ */
/* ① 目的地铅笔叉：ph 0–0.55 铅笔叉常显 → 0.55–0.82 橡皮扫过、
   叉被自左向右擦掉 + 3 帧碎屑 → 0.82–1 留一点淡痕。 */
export function drawDestMark(g, x, y, ph, t = 0) {
  g.save(); g.translate(x, y);
  const erasing = ph > 0.55 && ph < 0.82;
  const done = ph >= 0.82;
  const eu = erasing ? (ph - 0.55) / 0.27 : done ? 1 : 0;
  if (!done || eu < 1) {
    g.save();
    if (eu > 0) { g.beginPath(); g.rect(-10 + eu * 24, -12, 24, 24); g.clip(); }
    sline(g, -7, -7, 7, 7, C.pencil, 1.6, 1); sline(g, -7, 7, 7, -7, C.pencil, 1.6, 2);
    circ(g, 0, 0, 10, C.pencil, 0.9, 0.7);
    g.restore();
  }
  if (erasing) {
    const ex = -14 + eu * 28;
    g.save(); g.translate(ex, -2 - Math.sin(eu * 9.42) * 2); g.rotate(-0.35);
    fRR(g, -8, -5, 16, 10, 2, C.white); sRR(g, -8, -5, 16, 10, 2, C.ink, 1.2);
    fRR(g, -8, 1, 16, 4, 2, C.blue, 0.5);
    g.restore();
    // 3 帧碎屑：橡皮走过处蹦出小屑，落下并消失
    const fr = Math.floor(eu * 3); // 0/1/2 帧
    for (let i = 0; i <= fr; i++) {
      const cu = clamp01(eu * 3 - i), sd = i * 2.7;
      const cx2 = -8 + i * 9 + Math.sin(sd) * 3, cy2 = 6 + cu * 5;
      sline(g, cx2, cy2, cx2 + 2.5, cy2 + 1, C.pencil, 1.4, i, null);
      g.save(); g.globalAlpha = 1 - cu; g.restore();
    }
  }
  if (done) circ(g, 0, 0, 3, C.pencil, 0.7, 0.25 * (1 - (ph - 0.82) / 0.18));
  g.restore();
}
/* ② 纸张抖动：胶囊贴近面板（dist<60）时，便签以 27Hz 轻颤，
   幅度随距离线性增强，最大 ±0.8°/±0.6px。 */
export function drawShiverNote(g, x, y, no, t, prox = 0) {
  const jr = Math.sin(t * 27) * 0.014 * prox, jy = Math.cos(t * 23) * 0.6 * prox;
  g.save(); g.translate(x, y + jy); g.rotate(jr);
  drawNote(g, 0, 0, no, -2, t, 0);
  g.restore();
}

/* ══════════ drawMapV2 · 世界总装（1400×1000）══════════ */
const RING = { x0: 330, y0: 330, x1: 1010, y1: 690 };
const HUBS = [[330, 330, 0], [1010, 330, 1], [1010, 690, 2], [330, 690, 3]];
const HUB_U = [0, 0.3269, 0.5, 0.8269]; // 各枢纽在环上的参数位
const DEV_X = 1268, BUS_X = 1180;
const DEVS = [drawStillV2, drawInspectV2, drawQAV2, drawIncubatorV2, drawRhythmV2, drawDevTrayV2];
const TRUNKS = [
  { x: 600, name: "商务智能Agent", val: 0.92 },
  { x: 720, name: "数据问答", val: 0.88 },
  { x: 840, name: "调度优化", val: 0.95 },
  { x: 960, name: "智能化战略", val: 0.9 },
];
const INBOX = [670, 510];
const CONSOLE = [128, 470];

export function drawMapV2(g, t, opts = {}) {
  const { tokens = 7, pencil = true } = opts;
  const W = 1400, H = 1000;
  g.save();
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  fRR(g, 110, 200, 430, 340, 40, C.washP, 0.75);
  fRR(g, 560, 100, 530, 320, 40, C.washL, 0.75);
  fRR(g, 550, 560, 620, 350, 40, C.washE, 0.75);
  fRR(g, 90, 560, 430, 350, 40, C.washR, 0.75);
  g.globalAlpha = 0.5; g.fillStyle = C.grid;
  for (let x = 40; x <= W - 40; x += 20) g.fillRect(x, 40, x % 100 === 0 ? 1.4 : 0.6, H - 80);
  for (let y = 40; y <= H - 40; y += 20) g.fillRect(40, y, W - 80, y % 100 === 0 ? 1.4 : 0.6);
  g.globalAlpha = 1;
  g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(30, 30, W - 60, H - 60);
  g.lineWidth = 0.7; g.strokeRect(40, 40, W - 80, H - 80);
  for (const [mx, my] of [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]]) circ(g, mx, my, 5, C.inkMid, 0.8);
  coffeeStain(g, 1108, 78);
  handNote(g, 168, 232, "① 感知区", -2, 13); handNote(g, 620, 132, "② 规划区", 1, 13);
  handNote(g, 1120, 590, "③ 执行区", -1, 13); handNote(g, 150, 592, "④ 记忆区", 2, 13);

  /* 管线层 */
  pipe(g, [[RING.x0, RING.y0], [RING.x1, RING.y0], [RING.x1, RING.y1], [RING.x0, RING.y1], [RING.x0, RING.y0 - 4]], 7);
  for (const u of [0.12, 0.38, 0.62, 0.88]) { const [ax, ay, side] = ringPoint(u); flowArrow(g, ax, ay, [0, 1.5708, 3.1416, -1.5708][side]); }
  pipe(g, [[1095, 690], [BUS_X, 690], [BUS_X, 150]], 5);
  pipe(g, [[BUS_X, 690], [BUS_X, 750]], 5);
  for (let i = 0; i < 6; i++) { const ry = 175 + i * 115; branchPipe(g, [[BUS_X, ry], [DEV_X - 56 - 7, ry]]); via(g, BUS_X, ry); }
  pipe(g, [[1010, 746], [1010, 800], [560, 800]], 7);
  for (const tr of TRUNKS) via(g, tr.x, 800);
  for (const [hx, hy] of HUBS) ctrlLine(g, INBOX[0] + 30, INBOX[1], hx + (hx > 700 ? -60 : 60), hy + (hy > 510 ? -30 : 30));
  poly(g, [[CONSOLE[0] + 55, CONSOLE[1]], [RING.x0, CONSOLE[1] + 10]], C.red, 1, [4, 4]);

  /* A2 · token 的一生（形态随区段渐变）
     顶边=过感知·圆点 → 右边=过规划·带分支 → 底边=过执行·方块 →
     左边=带记忆再出发（旧卡片跟随） */
  const u3 = HUB_U[3], sucks = [];
  for (let i = 0; i < tokens; i++) {
    let u = (t * 0.028 + i / tokens) % 1;
    const [tx2, ty2, side] = ringPoint(u);
    // 归档吸入：进入记忆角前 0.02 段被吸进抽屉柜
    const du3 = (u3 - u + 1) % 1;
    if (du3 < 0.02 && side === 2) {
      sucks.push([[tx2, ty2], 1 - du3 / 0.02]);
      continue;
    }
    const stage = side === 0 ? 1 : side === 1 ? 2 : side === 2 ? 3 : 1;
    drawTokenStage(g, tx2, ty2, stage, t, i);
    // 再出发：左边前 0.1 段，旧卡片探出跟随（每 3 枚跟 1 张）
    if (side === 3 && (u - u3 + 1) % 1 < 0.1 && i % 3 === 0) {
      const [cx2, cy2] = ringPoint((u - 0.014 + 1) % 1);
      drawMemCard(g, cx2 + 3, cy2 + 2, -0.12 + Math.sin(t * 2 + i) * 0.06);
    }
  }
  // 入口毛线团：沿引导弧滚向感知（周期 3.3s ×2 错相）
  for (let i = 0; i < 2; i++) {
    const qu = (t * 0.3 + i * 0.5) % 1;
    const bx = lerp(lerp(605, 470, qu), lerp(470, 398, qu), qu);
    const by = lerp(lerp(505, 478, qu), lerp(478, 372, qu), qu);
    g.save(); g.globalAlpha = qu < 0.1 ? qu * 10 : qu > 0.9 ? (1 - qu) * 10 : 1;
    drawTokenStage(g, bx, by, 0, t, i * 3);
    g.restore();
  }
  ctrlLine(g, 605, 505, 398, 372, C.pencil);

  /* A3 · 归档脉冲：由记忆站发出（8s 一次，2.4s 逆行一圈），
     沿途枢纽呼吸幅度短暂放大（amp 传入 drawHubV2） */
  const tR = t % 8;
  const amps = [0, 0, 0, 0];
  if (tR < 2.4) {
    const pu = (u3 - tR / 2.4 + 2) % 1;
    const [px, py] = ringPoint(pu);
    disc(g, px, py, 6, C.amber); circ(g, px, py, 10 + (tR % 0.4) * 25, C.amber, 1);
    for (let k = 1; k <= 3; k++) { const [qx, qy] = ringPoint((pu + k * 0.012) % 1); disc(g, qx, qy, 4 - k, C.amber, 0.5 - k * 0.13); }
    for (let k = 0; k < 4; k++) {
      const d = Math.min(Math.abs(pu - HUB_U[k]), 1 - Math.abs(pu - HUB_U[k]));
      amps[k] = Math.max(0, 1 - d / 0.06);
    }
  }

  /* 任务入口 */
  fRR(g, INBOX[0] - 62, INBOX[1] - 39, 130, 82, 10, C.shadow);
  fRR(g, INBOX[0] - 65, INBOX[1] - 42, 130, 82, 10, C.white);
  sRR(g, INBOX[0] - 65, INBOX[1] - 42, 130, 82, 10, C.ink, 1.8);
  txt(g, "任务入口", INBOX[0], INBOX[1] - 24, { size: 13, w: 700 });
  txt(g, "INBOX · SPAWN", INBOX[0], INBOX[1] - 10, { size: 7, c: C.amber, f: F_MONO });
  g.fillStyle = C.ink; g.fillRect(INBOX[0] - 40, INBOX[1] + 6, 80, 9);
  g.fillStyle = C.goldPale; g.fillRect(INBOX[0] - 36, INBOX[1] + 9, 72, 3);
  if (pencil) {
    poly(g, [[700, 690], [712, 660], [716, 622], [706, 594]], C.pencil, 1.1, [6, 5]);
    handNote(g, 790, 470, "你从这里出发", -3, 13); leader(g, 768, 482, 726, 528, 1);
  }
  drawCapsule(g, 704, 580, -1.35, t, {});

  /* 枢纽（记忆柜在 kind=3） */
  for (const [hx, hy, k] of HUBS) drawHubV2(g, hx, hy, k, t, amps[k]);
  for (const [from, su] of sucks) drawArchiveSuck(g, from, [330, 700], su);
  if (tR < 0.25) circ(g, 330, 690, 10 + tR * 90, C.amber, 1.4, 1 - tR * 4); // 归档脉冲出发帧
  if (pencil) { handNote(g, 452, 750, "抽屉没关严，老卡片总想出来", 2, 11); }

  /* B6 · 工具墙 */
  drawToolWallV2(g, 800, 190, t);
  drawDim(g, 540, 116, 1060, 116, "520", { side: 1 });
  if (pencil) { handNote(g, 496, 106, "顺手的都磨亮了", -4, 12); leader(g, 520, 118, 560, 142, 2); }

  /* B4 · 六台产品装置（右缘总线） */
  txt(g, "已部署产品", DEV_X, 80, { size: 11, w: 700 });
  txt(g, "SHIPPED ×6 · 形态即功能", DEV_X, 94, { size: 7, c: C.amber, f: F_MONO });
  DEVS.forEach((fn, i) => fn(g, DEV_X, 175 + i * 115, t));

  /* B8 · 生产主干 + 末端装置 */
  for (let i = 0; i < TRUNKS.length; i++) {
    drawTrunkV2(g, TRUNKS[i].x, 800, 876, TRUNKS[i].name, TRUNKS[i].val, t, i);
    drawTrunkEndV2(g, TRUNKS[i].x, 920, i, t);
    txt(g, TRUNK_END_TAGS[i], TRUNKS[i].x, 946, { size: 6.5, c: C.pencil, f: F_MONO });
  }
  drawDim(g, 415, 764, 925, 764, "510", { side: 1 });

  /* B7 · 六条观点载体（位置即语义） */
  drawLuggageTag(g, BUS_X, 452, 1, t);
  drawEnamelSign(g, 498, 845, 2, t);
  drawPipeStencil(g, 668, 800, 3, "让每次执行都留痕");
  drawNote(g, 935, 512, 4, 2, t, 0);
  drawNote(g, 1105, 172, 5, 1.5, t, 1);
  drawDraftSheet(g, 455, 468, 6, t);
  if (pencil) handNote(g, 455, 528, "还没想透的，就圈起来", -2, 11);

  /* B5 · 三台档案装置（记忆区） */
  drawLobsterV2(g, 165, 858, t);
  drawTickerV2(g, 290, 852, t);
  drawOrreryV2(g, 402, 848, t);
  txt(g, "记忆档案 ×3 · 每一台都是一段长文", 282, 928, { size: 9, c: C.inkMid });

  /* 接管台 + 家具 */
  drawConsole(g, CONSOLE[0], CONSOLE[1], t);
  if (pencil) { handNote(g, 154, 380, "有事按这个", -3, 12); leader(g, 150, 392, 134, 416, 3); }
  if (pencil) { handNote(g, 420, 640, "归档脉冲，每 8 秒逆行一圈", 2, 11); leader(g, 400, 652, 352, 672, 4); }
  drawCompass(g, 96, 108, t);
  drawLegend(g, 56, 540);
  drawTitleBlock(g, 1108, 866);
  drawMinimapV2(g, 60, 690, t);
  g.restore();
}
