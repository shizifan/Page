/* 「会呼吸的系统图」· 绘制引擎
   世界 = 一张运行中的智能体编排图纸：感知→规划→执行→反思 主环，
   访客是任务胶囊，沿管线滑行、可自由驶离（离轨留铅笔迹）。
   画风：米白制图纸 + 细墨线稿 + 描金管线 + 手写批注（1c 的温度）。
   所有坐标基于 1400×1000 图板。 */

export const PAL = [
  { id: "paper",   hex: "#f7f1e1", name: "图纸底", use: "全图底色" },
  { id: "grid",    hex: "#e8deca", name: "网格",   use: "方格纸网格 / 纸纹" },
  { id: "ink",     hex: "#2a3037", name: "主墨",   use: "主线稿 / 标题文字" },
  { id: "inkMid",  hex: "#5f6a76", name: "次墨",   use: "次级线 / 小字注记" },
  { id: "pencil",  hex: "#8d8474", name: "铅笔",   use: "手写批注 / 引出线 / 离轨轨迹" },
  { id: "gold",    hex: "#c99a56", name: "描金",   use: "管线外壁" },
  { id: "goldPale",hex: "#ecd9ae", name: "金浅",   use: "管线内壁 / 胶带" },
  { id: "amber",   hex: "#a3540a", name: "深琥珀", use: "数据流强调 / 图签 / 编号章" },
  { id: "glow",    hex: "#ffb224", name: "光点",   use: "token / 胶囊核心（兼「破题」主色）" },
  { id: "white",   hex: "#fffdf6", name: "卡面白", use: "节点面板 / 便签 / 名牌" },
  { id: "blue",    hex: "#7fa7c6", name: "图表蓝", use: "刻度 / 图表 / 舷窗" },
  { id: "green",   hex: "#12b76a", name: "在线绿", use: "状态灯 / PASS" },
  { id: "red",     hex: "#d94f3d", name: "接管红", use: "人工接管台——全图唯一的红" },
  { id: "washP",   hex: "#dfeaf2", name: "感知水彩", use: "感知区底纹" },
  { id: "washL",   hex: "#f5e8cd", name: "规划水彩", use: "规划区底纹" },
  { id: "washE",   hex: "#e3efdb", name: "执行水彩", use: "执行区底纹" },
  { id: "washR",   hex: "#ece5f2", name: "反思水彩", use: "反思区底纹" },
  { id: "shadow",  hex: "#ded2b6", name: "纸影",   use: "面板投影 / 压痕" },
  { id: "pDet",    hex: "#5ac8fa", name: "AI侦探社", use: "产品·天蓝" },
  { id: "pHwai",   hex: "#34d97b", name: "会问AI",  use: "产品·绿" },
  { id: "pHome",   hex: "#ff8a5c", name: "Home",    use: "产品·橘" },
  { id: "pPine",   hex: "#f472b6", name: "松果",    use: "产品·粉" },
  { id: "pGd5j",   hex: "#a78bfa", name: "港东五街", use: "产品·紫" },
];
export const C = Object.fromEntries(PAL.map((p) => [p.id, p.hex]));

const F_SANS = `'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`;
const F_MONO = `'JetBrains Mono',Menlo,Consolas,monospace`;
const F_HAND = `'Kaiti SC','STKaiti','KaiTi','SimKai',cursive`;

/* ── 基础 ── */
export function txt(g, s, x, y, o = {}) {
  const { size = 12, c = C.ink, f = F_SANS, al = "center", bl = "middle", w = 600, rot = 0, alpha = 1 } = o;
  g.save(); g.globalAlpha = alpha; g.translate(x, y);
  if (rot) g.rotate((rot * Math.PI) / 180);
  g.font = `${w} ${size}px ${f}`; g.fillStyle = c; g.textAlign = al; g.textBaseline = bl;
  g.fillText(s, 0, 0); g.restore();
}
export const FONTS = { sans: F_SANS, mono: F_MONO, hand: F_HAND };
function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
export function fRR(g, x, y, w, h, r, c, alpha = 1) { g.save(); g.globalAlpha = alpha; rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); g.restore(); }
export function sRR(g, x, y, w, h, r, c, lw = 1.5) { rr(g, x, y, w, h, r); g.strokeStyle = c; g.lineWidth = lw; g.stroke(); }
/* 手绘抖动线 */
function wob(x1, y1, x2, y2, seed = 0) {
  const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 16));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, e = i === 0 || i === n ? 0 : 1;
    out.push([x1 + (x2 - x1) * u + Math.sin(u * 7.3 + seed * 3.1) * 0.7 * e, y1 + (y2 - y1) * u + Math.cos(u * 9.1 + seed * 1.7) * 0.7 * e]);
  }
  return out;
}
/**
 * @param {CanvasRenderingContext2D} g
 * @param {Array<[number, number]>} pts
 * @param {string} c
 * @param {number} lw
 * @param {number[] | null} [dash]
 */
export function poly(g, pts, c, lw, dash = null) {
  g.save(); if (dash) g.setLineDash(dash);
  g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "round"; g.lineCap = "round";
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.stroke(); g.restore();
}
export function sline(g, x1, y1, x2, y2, c, lw = 1.2, seed = 0, dash = null) { poly(g, wob(x1, y1, x2, y2, seed), c, lw, dash); }
export function disc(g, x, y, r, c, alpha = 1) { g.save(); g.globalAlpha = alpha; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fillStyle = c; g.fill(); g.restore(); }
export function circ(g, x, y, r, c, lw = 1.2) { g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.strokeStyle = c; g.lineWidth = lw; g.stroke(); }
function arrowHead(g, x, y, ang, c, s = 5) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-s, -s * 0.55); g.moveTo(0, 0); g.lineTo(-s, s * 0.55);
  g.strokeStyle = c; g.lineWidth = 1.2; g.lineCap = "round"; g.stroke(); g.restore();
}

/* ── 管线语法 ── */
export function pipe(g, pts, w = 6) { // 描金双壁总线
  poly(g, pts, C.gold, w);
  poly(g, pts, C.goldPale, w * 0.45);
}
export function branchPipe(g, pts) { pipe(g, pts, 4); }
export function ctrlLine(g, x1, y1, x2, y2, c = C.inkMid) { // 控制虚线
  poly(g, [[x1, y1], [x2, y2]], c, 0.9, [5, 4]);
}
export function via(g, x, y) { // 过孔节点
  disc(g, x, y, 5.5, C.white); circ(g, x, y, 5.5, C.ink, 1.4); disc(g, x, y, 2, C.gold);
}
export function flowArrow(g, x, y, ang) {
  disc(g, x, y, 4.5, C.paper); arrowHead(g, x + Math.cos(ang) * 3, y + Math.sin(ang) * 3, ang, C.amber, 6);
}
/* token 光点 · 三种性格：0 匀速者 1 急先锋 2 好奇者 */
export function drawToken(g, x, y, pers = 0, t = 0, seed = 0) {
  let dx = 0, dy = 0;
  if (pers === 2) { dx = Math.sin(t * 3 + seed * 2.1) * 3; dy = Math.cos(t * 2.3 + seed) * 3; }
  disc(g, x + dx, y + dy, 6.5, C.glow, 0.22);
  disc(g, x + dx, y + dy, 2.6, C.glow);
  disc(g, x + dx - 0.7, y + dy - 0.8, 0.9, C.white);
  if (pers === 1) { disc(g, x + dx - 5, y + dy, 1.3, C.glow, 0.5); disc(g, x + dx - 9, y + dy, 1, C.glow, 0.25); }
}

/* ── 四大枢纽站 ── */
const HUB_DEF = [
  { cn: "感知", en: "PERCEIVE", wash: "washP" },
  { cn: "规划", en: "PLAN", wash: "washL" },
  { cn: "执行", en: "EXECUTE", wash: "washE" },
  { cn: "反思", en: "REFLECT", wash: "washR" },
];
export const HUB_SIZE = [170, 112];
export function drawHub(g, cx, cy, kind, t) {
  const d = HUB_DEF[kind];
  const breath = 1 + Math.sin(t * 1.57 + kind * 1.2) * 0.015; // ≈4s 呼吸
  g.save(); g.translate(cx, cy); g.scale(breath, breath);
  fRR(g, -81, -51, 170, 112, 10, C.shadow); // 纸影
  fRR(g, -85, -56, 170, 112, 10, C.white);
  sRR(g, -85, -56, 170, 112, 10, C.ink, 1.8);
  sRR(g, -81, -52, 162, 104, 7, C.inkMid, 0.7);
  // 标题行
  sline(g, -78, -30, 78, -30, C.ink, 1, kind);
  txt(g, d.cn, -70, -43, { size: 15, al: "left", w: 700 });
  txt(g, d.en, 70, -43, { size: 8.5, al: "right", c: C.amber, f: F_MONO });
  // 角端子
  for (const [ex, ey] of [[-85, 0], [85, 0], [0, -56], [0, 56]]) {
    g.fillStyle = C.ink; g.fillRect(ex - 3, ey - 3, 6, 6);
    g.fillStyle = C.goldPale; g.fillRect(ex - 1.5, ey - 1.5, 3, 3);
  }
  drawHubGlyph(g, 0, 13, kind, t);
  g.restore();
}
export function drawHubGlyph(g, x, y, kind, t) {
  g.save(); g.translate(x, y);
  if (kind === 0) { // 感知：雷达盘 6s 一圈
    circ(g, 0, 0, 26, C.inkMid, 0.9); circ(g, 0, 0, 17, C.grid, 0.9); circ(g, 0, 0, 8, C.grid, 0.9);
    const a = (t / 6) * 6.2832;
    poly(g, [[0, 0], [Math.cos(a) * 26, Math.sin(a) * 26]], C.amber, 1.4);
    disc(g, Math.cos(a) * 26, Math.sin(a) * 26, 2.2, C.glow);
    for (const [ba, br] of [[1.1, 20], [3.9, 12], [5.2, 23]]) {
      const lit = Math.abs(((a - ba + 9.42) % 6.2832) - 3.1416) > 2.6;
      disc(g, Math.cos(ba) * br, Math.sin(ba) * br, lit ? 2.6 : 1.6, lit ? C.blue : C.inkMid, lit ? 1 : 0.6);
    }
  } else if (kind === 1) { // 规划：决策树，琥珀高亮逐支轮转
    const hot = Math.floor(t / 1.2) % 3;
    via(g, 0, -16);
    const kids = [[-28, 14], [0, 18], [28, 14]];
    kids.forEach(([kx, ky], i) => {
      poly(g, [[0, -12], [kx * 0.5, 2], [kx, ky - 5]], i === hot ? C.amber : C.inkMid, i === hot ? 1.8 : 1);
      disc(g, kx, ky, i === hot ? 4 : 3, i === hot ? C.glow : C.white);
      circ(g, kx, ky, i === hot ? 4 : 3, C.ink, 1.1);
    });
  } else if (kind === 2) { // 执行：三条进度条循环推进
    for (let i = 0; i < 3; i++) {
      const w = 56, p = ((t * 0.35 + i * 0.33) % 1);
      sRR(g, -w / 2, -18 + i * 14, w, 8, 3, C.inkMid, 0.9);
      fRR(g, -w / 2 + 1.5, -16.5 + i * 14, (w - 3) * p, 5, 2, i === 1 ? C.glow : C.green, 0.9);
    }
  } else { // 反思：回环箭头 + 中心慢脉
    const a0 = t * 0.8;
    g.beginPath(); g.arc(0, 0, 20, a0, a0 + 4.9); g.strokeStyle = C.inkMid; g.lineWidth = 1.6; g.stroke();
    arrowHead(g, Math.cos(a0 + 4.9) * 20, Math.sin(a0 + 4.9) * 20, a0 + 4.9 + 1.57, C.inkMid, 6);
    const pu = (t % 8) / 8;
    disc(g, 0, 0, 4 + Math.sin(pu * 3.1416) * 2, C.amber, 0.85);
    if (pu < 0.12) circ(g, 0, 0, 8 + pu * 90, C.amber, 1 - pu * 7);
  }
  g.restore();
}

/* ── 部署坞（6 产品）── */
export function drawDock(g, x, y, hue, name, t, seed = 0) {
  // 模组
  fRR(g, x + 3, y + 3, 96, 46, 8, C.shadow);
  fRR(g, x, y, 96, 46, 8, C.white);
  sRR(g, x, y, 96, 46, 8, C.ink, 1.6);
  fRR(g, x + 6, y + 6, 84, 12, 3, hue, 0.9); // 产品色顶带
  sRR(g, x + 6, y + 6, 84, 12, 3, C.ink, 0.8);
  // 引脚（左侧 3 根，接支线）
  for (let i = 0; i < 3; i++) { g.fillStyle = C.gold; g.fillRect(x - 7, y + 12 + i * 11, 7, 3.5); g.strokeStyle = C.ink; g.lineWidth = 0.7; g.strokeRect(x - 7, y + 12 + i * 11, 7, 3.5); }
  // 状态灯（呼吸）+ 吞吐 blip
  const on = 0.55 + Math.sin(t * 2 + seed * 1.9) * 0.45;
  disc(g, x + 84, y + 32, 5, hue, 0.18 + on * 0.2); disc(g, x + 84, y + 32, 2.6, hue, 0.5 + on * 0.5); circ(g, x + 84, y + 32, 4.2, C.ink, 0.8);
  const bp = (t * 0.4 + seed * 0.37) % 1;
  if (bp < 0.28) { const u = bp / 0.28; drawTokenTiny(g, x - 7 - u * 30, y + 25, hue); }
  // 名牌（白底墨字，正面朝观众）
  fRR(g, x + 4, y + 24, 76, 16, 3, C.white); sRR(g, x + 4, y + 24, 76, 16, 3, C.inkMid, 0.8);
  txt(g, name, x + 42, y + 32.5, { size: 11, w: 700 });
  txt(g, "LIVE", x + 8, y + 52, { size: 7, c: C.green, f: F_MONO, al: "left" });
  txt(g, "uptime 99.9", x + 92, y + 52, { size: 7, c: C.pencil, f: F_MONO, al: "right" });
}
export function drawTokenTiny(g, x, y, hue) { disc(g, x, y, 4, hue, 0.25); disc(g, x, y, 1.8, hue); }
export const DOCK_SIZE = [110, 60];

/* ── 工具架（9 能力）── */
export function drawToolSlot(g, x, y, tier, no, t, seed = 0) {
  const h = 46 + tier * 12; // 深度→更高
  fRR(g, x + 2.5, y - h + 2.5, 42, h, 5, C.shadow);
  fRR(g, x, y - h, 42, h, 5, C.white);
  sRR(g, x, y - h, 42, h, 5, C.ink, 1.4);
  // 磨损高光：调用越深，把手越亮
  if (tier >= 2) sline(g, x + 6, y - h + 7, x + 36, y - h + 7, C.glow, tier, seed);
  fRR(g, x + 8, y - h + 11, 26, 7, 2, C.goldPale); sRR(g, x + 8, y - h + 11, 26, 7, 2, C.inkMid, 0.7); // 把手
  // 工具刻痕（简符）
  const gy = y - h / 2 + 4;
  g.save(); g.translate(x + 21, gy);
  const glyph = seed % 3;
  if (glyph === 0) { circ(g, 0, 0, 7, C.inkMid, 1.2); for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28; sline(g, Math.cos(a) * 7, Math.sin(a) * 7, Math.cos(a) * 10, Math.sin(a) * 10, C.inkMid, 1.2, i); } }
  else if (glyph === 1) { for (let i = 0; i < 3; i++) g.fillStyle = C.blue, g.fillRect(-8 + i * 6, 6 - i * 5 - 3, 4, i * 5 + 3); circ(g, 0, 0, 0, C.ink, 0); }
  else { sRR(g, -8, -7, 16, 14, 2, C.inkMid, 1.2); for (let i = 0; i < 3; i++) { g.fillStyle = C.gold; g.fillRect(-10, -5 + i * 4, 2, 2); g.fillRect(8, -5 + i * 4, 2, 2); } }
  g.restore();
  // 编号 + 深度刻度
  txt(g, no, x + 21, y - 9, { size: 8, c: C.amber, f: F_MONO });
  for (let i = 0; i < tier; i++) { g.fillStyle = C.amber; g.fillRect(x + 5 + i * 6, y - 18, 4, 2.5); }
}

/* ── 生产主干线 + SLA 仪表（4 工程）── */
export function drawGauge(g, cx, cy, val, t) {
  disc(g, cx, cy, 15, C.white); circ(g, cx, cy, 15, C.ink, 1.5); circ(g, cx, cy, 12, C.grid, 0.8);
  for (let i = 0; i <= 6; i++) { const a = 2.4 + (i / 6) * 1.65 * 2; sline(g, cx + Math.cos(a) * 10, cy + Math.sin(a) * 10, cx + Math.cos(a) * 13, cy + Math.sin(a) * 13, C.inkMid, 0.9, i); }
  const a = 2.4 + val * 3.3 + Math.sin(t * 12) * 0.035; // 微颤
  poly(g, [[cx, cy], [cx + Math.cos(a) * 11, cy + Math.sin(a) * 11]], C.amber, 1.6);
  disc(g, cx, cy, 2, C.ink);
}
export function drawTrunk(g, x, yTop, yBot, name, val, t, seed = 0) {
  pipe(g, [[x, yTop], [x, yBot - 24]], 9);
  // token 大颗粒（生产流量）
  const u = (t * 0.25 + seed * 0.31) % 1;
  drawToken(g, x, yTop + (yBot - 44 - yTop) * u, 0, t, seed);
  drawGauge(g, x, yTop + 34, val, t + seed);
  // 端口（斜纹接地块）
  g.save(); g.beginPath(); g.rect(x - 16, yBot - 24, 32, 18); g.clip();
  g.fillStyle = C.white; g.fillRect(x - 16, yBot - 24, 32, 18);
  for (let i = -3; i < 8; i++) sline(g, x - 16 + i * 6, yBot - 24, x - 26 + i * 6, yBot - 6, C.inkMid, 1, i);
  g.restore(); g.strokeStyle = C.ink; g.lineWidth = 1.4; g.strokeRect(x - 16, yBot - 24, 32, 18);
  // 名牌
  fRR(g, x - 44, yBot + 2, 88, 17, 3, C.white); sRR(g, x - 44, yBot + 2, 88, 17, 3, C.inkMid, 0.9);
  txt(g, name, x, yBot + 11, { size: 10.5, w: 700 });
  txt(g, "SLA " + Math.round(val * 100) + "%", x, yTop + 55, { size: 7.5, c: C.amber, f: F_MONO });
}

/* ── 观点批注框（6）── */
export function drawNote(g, x, y, no, rot, t, style = 0) {
  const fl = Math.sin(t * 2.1 + no * 1.3) * 2; // 飘浮
  g.save(); g.translate(x, y + fl); g.rotate((rot * Math.PI) / 180);
  fRR(g, -56, -30, 118, 66, 3, C.shadow, 0.7);
  fRR(g, -59, -33, 118, 66, 3, C.white);
  sRR(g, -59, -33, 118, 66, 3, C.ink, 1.3);
  if (style === 0) { // 胶带
    g.save(); g.translate(0, -33); g.rotate(-0.06 + Math.sin(t * 1.1 + no) * 0.02);
    fRR(g, -16, -5, 32, 10, 1, C.goldPale, 0.85); g.restore();
  } else { // 图钉
    disc(g, 0, -27, 4, C.amber); disc(g, -1, -28, 1.3, C.white);
  }
  txt(g, "观点 0" + no, -51, -20, { size: 9, c: C.amber, f: F_MONO, al: "left" });
  txt(g, "system prompt", 51, -20, { size: 6.5, c: C.pencil, f: F_MONO, al: "right" });
  // 手写正文占位（实文走 DOM 层）
  for (let i = 0; i < 3; i++) sline(g, -49, -6 + i * 11, -49 + [92, 74, 84][i], -6 + i * 11, C.pencil, 1.1, no * 3 + i);
  txt(g, "”", 46, 16, { size: 22, c: C.grid, f: F_HAND });
  g.restore();
}

/* ── Trace 档案塔（3 长文）── */
export function drawTraceTower(g, x, y, h, no, t) {
  const lean = no === 2 ? 0.02 : no === 1 ? -0.015 : 0;
  g.save(); g.translate(x, y); g.rotate(lean);
  fRR(g, -14 + 3, -h + 3, 30, h, 6, C.shadow);
  fRR(g, -15, -h, 30, h, 6, C.white); sRR(g, -15, -h, 30, h, 6, C.ink, 1.5);
  // 卷轴横纹 + 顶端螺旋
  for (let i = 1; i < h / 9; i++) sline(g, -12, -h + i * 9, 12, -h + i * 9, C.grid, 1, no * 5 + i);
  circ(g, 0, -h, 8, C.ink, 1.4); circ(g, 0, -h, 4.5, C.inkMid, 1); disc(g, 0, -h, 1.6, C.amber);
  // 琥珀腰封
  fRR(g, -15, -h * 0.55, 30, 13, 2, C.amber); txt(g, "TRACE 0" + (no + 1), 0, -h * 0.55 + 6.5, { size: 7.5, c: C.white, f: F_MONO });
  g.restore();
  // 展开的纸舌（带淡出的字迹）
  g.beginPath(); g.moveTo(x + 15, y - 8);
  g.quadraticCurveTo(x + 34, y - 2, x + 44 + no * 6, y);
  g.quadraticCurveTo(x + 34, y + 2, x + 15, y - 2);
  g.fillStyle = C.white; g.fill(); g.strokeStyle = C.inkMid; g.lineWidth = 0.9; g.stroke();
  for (let i = 0; i < 3; i++) sline(g, x + 20 + i * 8, y - 4 + i * 1.2, x + 26 + i * 8, y - 3.6 + i * 1.2, C.pencil, 0.8, i);
}

/* ── 人工接管台（联系 · 全图唯一红）── */
export function drawConsole(g, x, y, t) {
  fRR(g, x - 52, y - 42, 110, 92, 8, C.shadow);
  fRR(g, x - 55, y - 46, 110, 92, 8, C.white); sRR(g, x - 55, y - 46, 110, 92, 8, C.ink, 1.8);
  sRR(g, x - 51, y - 42, 102, 84, 6, C.red, 0.9);
  txt(g, "人工接管", x, y - 32, { size: 13, w: 700 });
  txt(g, "HUMAN-IN-THE-LOOP", x, y - 19, { size: 6.5, c: C.red, f: F_MONO });
  // 待命红灯 1.2s 慢闪
  const on = (t % 1.2) < 0.6;
  disc(g, x - 32, y + 2, 8, C.red, on ? 0.25 : 0.1); disc(g, x - 32, y + 2, 4, C.red, on ? 1 : 0.35); circ(g, x - 32, y + 2, 6.5, C.ink, 1);
  // 话筒 + 卷线（靠近时摆动）
  const sw = Math.sin(t * 3) * 0.06;
  g.save(); g.translate(x + 18, y + 6); g.rotate(sw);
  fRR(g, -8, -14, 16, 26, 7, C.ink); fRR(g, -5, -11, 10, 8, 4, C.inkMid);
  g.restore();
  g.beginPath(); g.moveTo(x + 14, y + 18);
  for (let i = 0; i <= 12; i++) { const u = i / 12; g.lineTo(x + 14 - u * 34, y + 18 + Math.sin(u * 12.5 + t * 2) * 3 + u * 10); }
  g.strokeStyle = C.ink; g.lineWidth = 1.1; g.stroke();
  txt(g, "呼叫图纸主人", x, y + 38, { size: 9, c: C.pencil, f: F_HAND });
}

/* ── 任务胶囊（载具）── */
export function drawCapsule(g, x, y, ang, t, o = {}) {
  const { moving = false, near = false } = o;
  g.save(); g.translate(x, y); g.rotate(ang);
  if (near) circ(g, 0, 0, 22 + Math.sin(t * 4) * 3, C.amber, 1); // 靠近目标提示环
  disc(g, 0, 0, 17, C.glow, 0.2); // 常亮光晕
  fRR(g, -15, -9, 30, 18, 9, C.white); sRR(g, -15, -9, 30, 18, 9, C.ink, 1.7);
  fRR(g, -7, -4.5, 13, 9, 4.5, C.glow); sRR(g, -7, -4.5, 13, 9, 4.5, C.amber, 1); // 核心
  // 前窗之「眼」：3s 眨一次
  const blink = (t % 3) > 2.86;
  if (blink) sline(g, 8, -1.5, 11.5, -1.5, C.ink, 1.6);
  else { disc(g, 9.7, -1.5, 2.6, C.white); circ(g, 9.7, -1.5, 2.6, C.ink, 1.1); disc(g, 10.3, -1.8, 1.1, C.ink); }
  // 尾部天线（停车时摆动）
  const swy = moving ? -0.35 : Math.sin(t * 2.2) * 0.25;
  g.save(); g.translate(-13, -7); g.rotate(swy);
  sline(g, 0, 0, 0, -9, C.ink, 1.3); disc(g, 0, -10.5, 2.4, C.green); disc(g, -0.6, -11, 0.8, C.white);
  g.restore();
  // 轨道触点
  g.fillStyle = C.ink; g.fillRect(-9, 8, 5, 2.5); g.fillRect(4, 8, 5, 2.5);
  g.restore();
}
/* 尾迹（在轨） / 铅笔迹（离轨） */
export function drawTrail(g, pts, t, mode = "rail") {
  if (mode === "rail") {
    pts.forEach(([px, py], i) => { const a = 1 - i / pts.length; disc(g, px, py, 2.2 * a + 0.8, C.glow, 0.5 * a); });
  } else {
    poly(g, pts, C.pencil, 1.1, [6, 5]);
  }
}

/* ── 纸面家具 ── */
export function drawCompass(g, x, y, t) {
  circ(g, x, y, 20, C.ink, 1.3); circ(g, x, y, 16, C.grid, 0.8);
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * 0.5) * 0.03);
  g.beginPath(); g.moveTo(0, -14); g.lineTo(4, 4); g.lineTo(0, 1); g.lineTo(-4, 4); g.closePath();
  g.fillStyle = C.amber; g.fill(); g.restore();
  txt(g, "N", x, y - 27, { size: 10, f: F_MONO, c: C.ink, w: 700 });
  txt(g, "数据上游", x, y + 32, { size: 9, c: C.pencil, f: F_HAND });
}
export function drawTitleBlock(g, x, y) { // 图签（右下角）
  fRR(g, x + 3, y + 3, 244, 96, 2, C.shadow);
  g.fillStyle = C.white; g.fillRect(x, y, 244, 96);
  g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(x, y, 244, 96);
  g.lineWidth = 0.7; g.strokeRect(x + 3, y + 3, 238, 90);
  const rows = [["项目", "石子凡 · 智能体系统图", 700], ["信条", "让 AI 为人创造价值", 600], ["审定", "相信未来 · 笃行当下", 500], ["版次", "REV 2026.07 · 1:1 运行中", 500]];
  rows.forEach(([k, v, w], i) => {
    const ry = y + 12 + i * 21;
    if (i) sline(g, x + 6, ry - 10, x + 238, ry - 10, C.grid, 0.8, i);
    txt(g, k, x + 20, ry, { size: 8, c: C.amber, f: F_MONO });
    txt(g, v, x + 38, ry, { size: 10.5, al: "left", w });
  });
  sline(g, x + 33, y + 6, x + 33, y + 90, C.grid, 0.8, 9);
  // 琥珀印章
  circ(g, x + 214, y + 74, 13, C.amber, 1.6); txt(g, "石", x + 214, y + 74, { size: 12, c: C.amber, f: F_HAND, w: 700 });
}
export function drawLegend(g, x, y) {
  fRR(g, x, y, 168, 108, 4, C.white, 0.9); sRR(g, x, y, 168, 108, 4, C.inkMid, 1);
  txt(g, "图例 LEGEND", x + 10, y + 14, { size: 9, al: "left", f: F_MONO, c: C.amber });
  pipe(g, [[x + 12, y + 32], [x + 44, y + 32]], 6); txt(g, "主干总线", x + 54, y + 32, { size: 9.5, al: "left" });
  ctrlLine(g, x + 12, y + 50, x + 44, y + 50); txt(g, "控制信道", x + 54, y + 50, { size: 9.5, al: "left" });
  drawToken(g, x + 28, y + 68, 0, 1, 0); txt(g, "数据 token", x + 54, y + 68, { size: 9.5, al: "left" });
  drawCapsule(g, x + 28, y + 90, 0, 1.2, {}); txt(g, "你（任务胶囊）", x + 54, y + 90, { size: 9.5, al: "left" });
}
export function handNote(g, x, y, s, rot = -2, size = 12) {
  txt(g, s, x, y, { size, c: C.pencil, f: F_HAND, rot, w: 500 });
}
export function leader(g, x1, y1, x2, y2, seed = 0) {
  sline(g, x1, y1, x2, y2, C.pencil, 0.9, seed, [4, 3]);
  arrowHead(g, x2, y2, Math.atan2(y2 - y1, x2 - x1), C.pencil, 5);
}
export function revCloud(g, cx, cy, rx, ry) { // 修订云线
  const n = Math.round((rx + ry) / 7);
  g.strokeStyle = C.pencil; g.lineWidth = 0.9; g.beginPath();
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * 6.2832, a2 = ((i + 1) / n) * 6.2832;
    const x1 = cx + Math.cos(a1) * rx, y1 = cy + Math.sin(a1) * ry;
    const x2 = cx + Math.cos(a2) * rx, y2 = cy + Math.sin(a2) * ry;
    const mx = (x1 + x2) / 2 + Math.cos((a1 + a2) / 2) * 5, my = (y1 + y2) / 2 + Math.sin((a1 + a2) / 2) * 5;
    g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2);
  }
  g.stroke();
}
export function coffeeStain(g, x, y) {
  circ(g, x, y, 17, C.gold, 2.2); g.save(); g.globalAlpha = 0.16; circ(g, x, y, 17, C.gold, 5); circ(g, x + 6, y + 4, 12, C.gold, 2); g.restore();
}

/* ══════════ 世界布局（1400×1000）══════════ */
const RING = { x0: 330, y0: 330, x1: 1010, y1: 690 };
export function ringPoint(u) {
  const w = RING.x1 - RING.x0, h = RING.y1 - RING.y0, P = 2 * (w + h);
  let d = ((u % 1) + 1) % 1 * P;
  if (d < w) return [RING.x0 + d, RING.y0, 0];
  d -= w; if (d < h) return [RING.x1, RING.y0 + d, 1];
  d -= h; if (d < w) return [RING.x1 - d, RING.y1, 2];
  d -= w; return [RING.x0, RING.y1 - d, 3];
}
const HUBS = [[330, 330, 0], [1010, 330, 1], [1010, 690, 2], [330, 690, 3]];
const DOCKS = [
  { y: 150, hue: C.glow, name: "破题" },
  { y: 265, hue: C.pDet, name: "AI侦探社" },
  { y: 380, hue: C.pHwai, name: "会问AI" },
  { y: 495, hue: C.pHome, name: "Home" },
  { y: 610, hue: C.pPine, name: "松果" },
  { y: 725, hue: C.pGd5j, name: "港东五街" },
];
const DOCK_X = 1232, BUS_X = 1180;
const TOOL_TIERS = [3, 2, 2, 2, 1, 1, 1, 1, 3];
const TRUNKS = [
  { x: 600, name: "商务智能Agent", val: 0.92 },
  { x: 720, name: "数据问答", val: 0.88 },
  { x: 840, name: "调度优化", val: 0.95 },
  { x: 960, name: "智能化战略", val: 0.9 },
];
const NOTES = [
  { x: 515, y: 258, rot: -2, style: 0 },
  { x: 1105, y: 172, rot: 1.5, style: 1 },
  { x: 935, y: 512, rot: 2, style: 0 },
  { x: 700, y: 760, rot: -1, style: 1 },
  { x: 415, y: 528, rot: 1, style: 0 },
  { x: 548, y: 420, rot: -1.5, style: 1 },
];
const TOWERS = [[150, 866, 78], [228, 890, 100], [305, 872, 64]];
const CONSOLE = [128, 470];
const INBOX = [670, 510];

export function drawMap(g, t, opts = {}) {
  const { tokens = 7, pencil = true } = opts;
  const W = 1400, H = 1000;
  g.save();
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  // 四区水彩
  fRR(g, 110, 200, 430, 340, 40, C.washP, 0.75);
  fRR(g, 560, 100, 530, 320, 40, C.washL, 0.75);
  fRR(g, 550, 560, 620, 350, 40, C.washE, 0.75);
  fRR(g, 90, 560, 430, 350, 40, C.washR, 0.75);
  // 方格纸
  g.globalAlpha = 0.5; g.fillStyle = C.grid;
  for (let x = 40; x <= W - 40; x += 20) g.fillRect(x, 40, x % 100 === 0 ? 1.4 : 0.6, H - 80);
  for (let y = 40; y <= H - 40; y += 20) g.fillRect(40, y, W - 80, y % 100 === 0 ? 1.4 : 0.6);
  g.globalAlpha = 1;
  // 图板边框 + 裁切标记
  g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(30, 30, W - 60, H - 60);
  g.lineWidth = 0.7; g.strokeRect(40, 40, W - 80, H - 80);
  for (const [mx, my] of [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]]) circ(g, mx, my, 5, C.inkMid, 0.8);
  coffeeStain(g, 1258, 84);
  // 区名（铅笔小签）
  handNote(g, 168, 232, "① 感知区", -2, 13); handNote(g, 620, 132, "② 规划区", 1, 13);
  handNote(g, 1120, 590, "③ 执行区", -1, 13); handNote(g, 140, 592, "④ 反思区", 2, 13);

  /* 管线层 */
  pipe(g, [[RING.x0, RING.y0], [RING.x1, RING.y0], [RING.x1, RING.y1], [RING.x0, RING.y1], [RING.x0, RING.y0 - 4]], 7);
  // 主环流向箭头
  for (const u of [0.12, 0.38, 0.62, 0.88]) { const [ax, ay, side] = ringPoint(u); flowArrow(g, ax, ay, [0, 1.5708, 3.1416, -1.5708][side]); }
  // 部署总线（执行 → 右缘 → 六坞）
  pipe(g, [[1095, 690], [BUS_X, 690], [BUS_X, 150]], 5);
  for (const d of DOCKS) { branchPipe(g, [[BUS_X, d.y + 25], [DOCK_X - 7, d.y + 25]]); via(g, BUS_X, d.y + 25); }
  // 生产集流管（执行 → 下缘四主干）
  pipe(g, [[1010, 746], [1010, 800], [560, 800]], 7);
  for (const tr of TRUNKS) via(g, tr.x, 800);
  // 工具架支线（规划 ↑）
  branchPipe(g, [[970, 274], [970, 240]]); branchPipe(g, [[1050, 274], [1050, 252], [1000, 252], [1000, 240]]);
  // 控制信道（入口 → 四枢纽）
  for (const [hx, hy] of HUBS) ctrlLine(g, INBOX[0] + 30, INBOX[1], hx + (hx > 700 ? -60 : 60), hy + (hy > 510 ? -30 : 30));
  // 接管台红色专线
  poly(g, [[CONSOLE[0] + 55, CONSOLE[1]], [RING.x0, CONSOLE[1] + 10]], C.red, 1, [4, 4]);

  /* token 流 */
  for (let i = 0; i < tokens; i++) {
    let u = (t * 0.028 + i / tokens) % 1;
    const pers = i % 3;
    if (pers === 1) u = (u + Math.sin(t * 1.8 + i) * 0.012 + 1) % 1;
    const [tx2, ty2] = ringPoint(u);
    drawToken(g, tx2, ty2, pers, t, i);
  }
  // 部署总线上行 token
  for (let i = 0; i < 3; i++) { const u = (t * 0.09 + i / 3) % 1; drawToken(g, BUS_X, 690 - u * 540, 0, t, i + 9); }
  // 反思回脉（每 8s 逆流一圈，2.4s 走完）
  const tR = t % 8;
  if (tR < 2.4) {
    const u0 = 0.827, u = (u0 - (tR / 2.4) + 2) % 1;
    const [px, py] = ringPoint(u);
    disc(g, px, py, 6, C.amber); circ(g, px, py, 10 + (tR % 0.4) * 25, C.amber, 1);
    for (let k = 1; k <= 3; k++) { const [qx, qy] = ringPoint((u + k * 0.012) % 1); disc(g, qx, qy, 4 - k, C.amber, 0.5 - k * 0.13); }
  }

  /* 任务入口 + 出生胶囊 */
  fRR(g, INBOX[0] - 62, INBOX[1] - 39, 130, 82, 10, C.shadow);
  fRR(g, INBOX[0] - 65, INBOX[1] - 42, 130, 82, 10, C.white);
  sRR(g, INBOX[0] - 65, INBOX[1] - 42, 130, 82, 10, C.ink, 1.8);
  txt(g, "任务入口", INBOX[0], INBOX[1] - 24, { size: 13, w: 700 });
  txt(g, "INBOX · SPAWN", INBOX[0], INBOX[1] - 10, { size: 7, c: C.amber, f: F_MONO });
  g.fillStyle = C.ink; g.fillRect(INBOX[0] - 40, INBOX[1] + 6, 80, 9);
  g.fillStyle = C.goldPale; g.fillRect(INBOX[0] - 36, INBOX[1] + 9, 72, 3);
  const drop = (t * 0.5) % 1; if (drop < 0.3) drawTokenTiny(g, INBOX[0], INBOX[1] + 10 + drop * 40, C.glow);
  // 离轨铅笔迹演示：胶囊从主环下沿驶到入口旁
  if (pencil) {
    poly(g, [[700, 690], [712, 660], [716, 622], [706, 594]], C.pencil, 1.1, [6, 5]);
  }
  drawCapsule(g, 704, 580, -1.35, t, {});
  if (pencil) { handNote(g, 782, 470, "你从这里出发", -3, 13); leader(g, 762, 482, 722, 528, 1); }

  /* 枢纽 */
  for (const [hx, hy, k] of HUBS) drawHub(g, hx, hy, k, t);

  /* 工具架（规划区上方）*/
  sline(g, 566, 240, 1034, 240, C.ink, 2, 40); // 架板
  for (let i = 0; i < 9; i++) drawToolSlot(g, 578 + i * 50, 236, TOOL_TIERS[i], "0" + (i + 1), t, i);
  txt(g, "工具架 · 9 项可调用能力（高度 = 调用深度）", 800, 258, { size: 9, c: C.inkMid });
  if (pencil) { handNote(g, 508, 168, "常用的都磨亮了", -4, 12); leader(g, 540, 180, 585, 200, 2); }

  /* 部署坞 */
  txt(g, "已部署端点", DOCK_X + 48, 118, { size: 11, w: 700 });
  txt(g, "SHIPPED ×6", DOCK_X + 48, 132, { size: 7, c: C.amber, f: F_MONO });
  DOCKS.forEach((d, i) => drawDock(g, DOCK_X, d.y, d.hue, d.name, t, i));
  if (pencil) { handNote(g, 1130, 108, "从这里上线 →", -2, 12); }

  /* 主干线 */
  for (let i = 0; i < TRUNKS.length; i++) drawTrunk(g, TRUNKS[i].x, 800, 930, TRUNKS[i].name, TRUNKS[i].val, t, i);
  txt(g, "生产级主干 · 企业工程 ×4", 780, 958, { size: 9, c: C.inkMid });

  /* 观点批注 */
  NOTES.forEach((n, i) => drawNote(g, n.x, n.y, i + 1, n.rot, t, n.style));
  revCloud(g, NOTES[5].x, NOTES[5].y, 78, 48);
  if (pencil) handNote(g, 548, 356, "还在想清楚的，就圈起来", -2, 11);

  /* 档案塔 + 接管台 */
  TOWERS.forEach(([tx2, ty2, th], i) => drawTraceTower(g, tx2, ty2, th, i, t));
  txt(g, "Trace 档案 · 长文 ×3", 228, 912, { size: 9, c: C.inkMid });
  drawConsole(g, CONSOLE[0], CONSOLE[1], t);
  if (pencil) { handNote(g, 154, 380, "有事按这个", -3, 12); leader(g, 150, 392, 134, 416, 3); }
  if (pencil) { handNote(g, 404, 630, "回脉，每 8 秒一次", 2, 11); leader(g, 398, 618, 344, 600, 4); }

  /* 纸面家具 */
  drawCompass(g, 96, 108, t);
  drawLegend(g, 56, 700 - 160); // (56, 540)…放左侧空档
  drawTitleBlock(g, 1108, 866);
  g.restore();
}
