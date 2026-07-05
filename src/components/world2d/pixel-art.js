/* 像素小镇 · 视觉方案绘制引擎
   规范：24px 网格 · 1 世界米 = 4px · 深色描边 · 午后长影（光来自西，影向东偏南）
   所有绘制函数锚点 = 底边中心 (0,0)，向上为负 y。 */

export const PAL = [
  { id: "paper",     hex: "#f2ead6", name: "纸面",   use: "地面底色 / 空地" },
  { id: "paperSh",   hex: "#ddd3ba", name: "纸暗",   use: "草丛点 / 地纹 / 烟(淡)" },
  { id: "lawn",      hex: "#cbd8a0", name: "草坪",   use: "能力公园草坪 / 树冠高光" },
  { id: "road",      hex: "#e6c17b", name: "沙金路", use: "路面" },
  { id: "sandDk",    hex: "#c99a56", name: "深沙",   use: "路缘 / 板条箱 / 木高光" },
  { id: "amber",     hex: "#a3540a", name: "深琥珀", use: "道路中线 / 铭文 / 强调框线" },
  { id: "ink",       hex: "#232b36", name: "墨",     use: "全部描边 / 文字" },
  { id: "white",     hex: "#fffdf6", name: "纸白",   use: "招牌底 / 窗框 / 高光" },
  { id: "wall",      hex: "#f9f4e6", name: "墙亮",   use: "建筑墙面(受光)" },
  { id: "wallSh",    hex: "#cfc5ac", name: "墙暗",   use: "墙面背光 / 石头 / 台基" },
  { id: "wood",      hex: "#8a6440", name: "木",     use: "树干 / 门 / 长椅" },
  { id: "leafDk",    hex: "#4c8a3f", name: "叶暗",   use: "树冠背光面" },
  { id: "leafMd",    hex: "#6aa348", name: "叶中",   use: "树冠主色 / 灌木" },
  { id: "steel",     hex: "#7c8694", name: "钢",     use: "烟囱 / 天线 / 锯齿顶" },
  { id: "steelLt",   hex: "#b3bcc7", name: "钢亮",   use: "卷帘门 / 屋顶设备" },
  { id: "glass",     hex: "#7fa7c6", name: "玻璃",   use: "窗 / 厂房天窗 / 书脊" },
  { id: "carBody",   hex: "#2b3a4d", name: "车身",   use: "小车主体（不与地面同调）" },
  { id: "beacon",    hex: "#12b76a", name: "信标绿", use: "信标灯 / 联系区强调" },
  { id: "pPoti",     hex: "#ffb224", name: "破题",   use: "产品·琥珀（兼小车引擎盖条纹/大球）" },
  { id: "pDet",      hex: "#5ac8fa", name: "AI侦探社", use: "产品·天蓝" },
  { id: "pHwai",     hex: "#34d97b", name: "会问AI", use: "产品·绿" },
  { id: "pHome",     hex: "#ff8a5c", name: "Home",   use: "产品·橘（兼锥桶）" },
  { id: "pPine",     hex: "#f472b6", name: "松果",   use: "产品·粉" },
  { id: "pGd5j",     hex: "#a78bfa", name: "港东五街", use: "产品·紫" },
];
export const C = Object.fromEntries(PAL.map((p) => [p.id, p.hex]));
const INK = C.ink;
const SHADOW = "rgba(70,58,32,0.20)"; // 唯一允许的半透明：投影叠加层，不计入色板

/* ── 基础像素工具 ── */
const I = (v) => Math.round(v);
export function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(I(x), I(y), I(w), I(h)); }
function O(g, x, y, w, h, c = INK) {
  R(g, x, y, w, 1, c); R(g, x, y + h - 1, w, 1, c);
  R(g, x, y, 1, h, c); R(g, x + w - 1, y, 1, h, c);
}
function disc(g, cx, cy, r, c) {
  for (let yy = -r; yy <= r; yy++) {
    const ww = Math.floor(Math.sqrt(r * r - yy * yy + 0.3));
    R(g, cx - ww, cy + yy, ww * 2 + 1, 1, c);
  }
}
function blob(g, cx, cy, r, c) { disc(g, cx, cy, r + 1, INK); disc(g, cx, cy, r, c); }
function ring(g, cx, cy, r, c) {
  const n = Math.max(12, r * 7);
  for (let a = 0; a < n; a++) {
    const x = Math.round(cx + r * Math.cos((a / n) * 6.2832));
    const y = Math.round(cy + r * Math.sin((a / n) * 6.2832));
    R(g, x, y, 1, 1, c);
  }
}
function tri(g, cx, baseY, w, h, c) { // 顶点朝上的像素三角
  for (let r = 0; r < h; r++) {
    const rw = Math.max(1, Math.round((w * (r + 1)) / h));
    R(g, cx - (rw >> 1), baseY - h + r, rw, 1, c);
  }
}
function triOutlined(g, cx, baseY, w, h, c) {
  tri(g, cx, baseY + 1, w + 4, h + 2, INK);
  tri(g, cx, baseY, w, h, c);
}
export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.min(255, Math.max(0, Math.round(v * k)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
/* 3×5 像素数字 */
const DIG = {
  0: "111101101101111", 1: "010110010010111", 2: "111001111100111", 3: "111001111001111",
  4: "101101111001001", 5: "111100111001111", 6: "111100111101111", 7: "111001010010010",
  8: "111101111101111", 9: "111101111001111",
};
function digits(g, x, y, str, c, s = 1) {
  let dx = 0;
  for (const ch of str) {
    const m = DIG[ch];
    if (m) for (let i = 0; i < 15; i++) if (m[i] === "1") R(g, x + dx + (i % 3) * s, y + ((i / 3) | 0) * s, s, s, c);
    dx += 4 * s;
  }
}

/* ── 炊烟（4 帧循环 1.8s，向上并向东飘） ── */
export function drawSmoke(g, x, topY, t, phase = 0) {
  const F = 4, f = Math.floor((((t / 1.8) + phase) % 1) * F);
  for (let i = 0; i < 3; i++) {
    const k = ((f / F) + i / 3) % 1;
    const s = 2 + Math.floor(k * 3);
    const dx = Math.round(k * 5) + ((i + f) % 2);
    const col = k < 0.45 ? C.wallSh : C.paperSh;
    R(g, x - (s >> 1) + dx, topY - 3 - Math.round(k * 15), s, s, col);
  }
}
/* 树摇（3 帧乒乓 1.2s）→ 冠层 x 偏移 */
export function swayDx(t, phase = 0) { return [-1, 0, 1, 0][Math.floor(((t + phase) / 0.3)) % 4]; }

/* ══════════════ 精灵 ══════════════ */

/* 办公楼：W=64(16m) 墙高 FH 屋顶深 RD=20
   v0 破题=学院风(门柱/铭牌/屋顶旗) · v1 松果=生活感(窗台花箱/圆角女儿墙) · v2 港东五街=文旅(条纹遮阳棚/屋顶灯箱) */
export function drawOffice(g, bx, by, hue, FH = 44, v = 0) {
  const W = 64, RD = 20, x0 = bx - W / 2;
  R(g, x0 + 3, by - 2, W + 3, 4, SHADOW);
  R(g, x0, by - FH, W, FH, C.wall);
  R(g, x0 + W - 4, by - FH, 4, FH, C.wallSh);
  O(g, x0, by - FH, W, FH);
  const rows = FH >= 42 ? 3 : 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < 4; c++) {
    const wx = x0 + 6 + c * 14, wy = by - FH + 6 + r * 11;
    if (v === 2) { // 条纹遮阳棚
      for (let i = 0; i < 6; i++) R(g, wx - 2 + i * 2, wy - 4, 2, 3, i % 2 ? C.white : hue);
      R(g, wx - 2, wy - 5, 12, 1, INK); R(g, wx - 2, wy - 2, 12, 1, INK);
    }
    R(g, wx - 1, wy - 1, 10, 9, C.white);
    R(g, wx, wy, 8, 7, C.glass);
    R(g, wx, wy, 8, 2, C.white);
    O(g, wx - 1, wy - 1, 10, 9);
    if (v === 1) { // 窗台花箱
      R(g, wx - 1, wy + 8, 10, 3, C.leafMd); O(g, wx - 1, wy + 8, 10, 3);
      R(g, wx + 1, wy + 7, 2, 2, hue); R(g, wx + 6, wy + 7, 2, 2, C.white);
    }
  }
  R(g, bx - 5, by - 13, 10, 13, C.wood); O(g, bx - 5, by - 13, 10, 13);
  R(g, bx + 2, by - 7, 1, 2, C.amber);
  R(g, bx - 9, by - 16, 18, 3, hue); O(g, bx - 9, by - 16, 18, 3);
  if (v === 0) { // 门柱 + 铭牌
    R(g, bx - 9, by - 13, 3, 13, C.white); O(g, bx - 9, by - 13, 3, 13);
    R(g, bx + 6, by - 13, 3, 13, C.white); O(g, bx + 6, by - 13, 3, 13);
    R(g, bx + 11, by - 12, 7, 6, C.white); O(g, bx + 11, by - 12, 7, 6);
    R(g, bx + 13, by - 10, 3, 2, C.amber);
  }
  // 平顶
  R(g, x0 - 2, by - FH - RD, W + 4, RD, hue);
  R(g, x0 - 2, by - FH - 3, W + 4, 3, shade(hue, 0.72));
  R(g, x0 - 2, by - FH - RD, W + 4, 2, shade(hue, 1.22));
  O(g, x0 - 2, by - FH - RD, W + 4, RD);
  if (v === 1) { // 圆角女儿墙
    R(g, x0 - 2, by - FH - RD, 3, 1, C.paper); R(g, x0 + W - 1, by - FH - RD, 3, 1, C.paper);
    R(g, x0 - 1, by - FH - RD, 2, 2, INK); R(g, x0 + W - 1, by - FH - RD, 2, 2, INK);
  }
  if (v !== 2) {
    R(g, x0 + W - 17, by - FH - RD + 4, 11, RD - 10, C.steelLt);
    R(g, x0 + W - 17, by - FH - RD + 4, 11, 2, C.white);
    O(g, x0 + W - 17, by - FH - RD + 4, 11, RD - 10);
  }
  if (v === 0) { // 屋顶旗杆
    R(g, bx - 1, by - FH - RD - 12, 2, 12, C.steel);
    R(g, bx + 1, by - FH - RD - 12, 8, 4, hue); R(g, bx + 1, by - FH - RD - 12, 8, 1, INK);
  }
  if (v === 2) { // 屋顶灯箱（波浪纹）
    R(g, x0 + 14, by - FH - RD - 2, 3, 4, C.steel); R(g, x0 + W - 17, by - FH - RD - 2, 3, 4, C.steel);
    R(g, x0 + 10, by - FH - RD - 13, W - 20, 11, C.white); O(g, x0 + 10, by - FH - RD - 13, W - 20, 11);
    for (let i = 0; i < 9; i++) R(g, x0 + 14 + i * 4, by - FH - RD - 8 + (i % 2 ? 0 : -2), 4, 2, C.glass);
    R(g, x0 + 13, by - FH - RD - 5, W - 26, 1, C.amber);
  }
}
export const OFFICE_SIZE = [68, 66];

/* 纸片小屋：W=56 三角大屋顶 + 烟囱炊烟 */
/* v0 侦探社=放大镜圆窗+扇贝檐 · v1 会问AI=菱形窗+锯齿檐 · v2 Home=心形窗+虚线檐；烟囱左右交替 */
export function drawCottage(g, bx, by, hue, t = 0, v = 0) {
  const W = 56, FH = 28, RH = 24, x0 = bx - W / 2;
  R(g, x0 + 3, by - 2, W + 4, 4, SHADOW);
  R(g, x0, by - FH, W, FH, C.wall);
  R(g, x0 + W - 4, by - FH, 4, FH, C.wallSh);
  O(g, x0, by - FH, W, FH);
  // 大三角屋顶（悬出 6px）
  triOutlined(g, bx, by - FH + 1, W + 12, RH, hue);
  tri(g, bx, by - FH - RH + 6, 8, 5, shade(hue, 1.28)); // 脊高光
  // 剪纸檐边（族内三款）
  if (v === 0) for (let i = 0; i < 8; i++) R(g, x0 - 4 + i * 8, by - FH - 1, 4, 2, C.white);
  else if (v === 1) for (let i = 0; i < 16; i++) R(g, x0 - 4 + i * 4, by - FH - 1 - (i % 2), 3, 2, C.white);
  else for (let i = 0; i < 10; i++) R(g, x0 - 2 + i * 6, by - FH - 1, 3, 2, C.white);
  // 阁楼窗（族内三款）
  const ay = by - FH - 9;
  if (v === 0) { // 放大镜圆窗
    disc(g, bx, ay, 4, INK); disc(g, bx, ay, 3, C.white); disc(g, bx, ay, 2, C.glass);
    R(g, bx + 3, ay + 3, 2, 2, INK); R(g, bx - 2, ay - 2, 1, 1, C.white);
  } else if (v === 1) { // 菱形窗
    for (let i = -4; i <= 4; i++) { const w = 4 - Math.abs(i); R(g, bx - w, ay + i, w * 2 + 1, 1, INK); }
    for (let i = -3; i <= 3; i++) { const w = 3 - Math.abs(i); R(g, bx - w, ay + i, w * 2 + 1, 1, C.glass); }
    R(g, bx - 1, ay - 2, 1, 1, C.white);
  } else { // 心形窗
    R(g, bx - 4, ay - 2, 3, 3, C.white); R(g, bx + 1, ay - 2, 3, 3, C.white);
    R(g, bx - 4, ay, 8, 3, C.white); R(g, bx - 2, ay + 3, 4, 1, C.white); R(g, bx - 1, ay + 4, 2, 1, C.white);
  }
  // 烟囱（v1 在左，其余在右）
  const cxx = v === 1 ? bx - 18 : bx + 12;
  R(g, cxx, by - FH - RH + 4, 6, 12, C.steel);
  R(g, cxx - 1, by - FH - RH + 3, 8, 3, C.steelLt);
  O(g, cxx - 1, by - FH - RH + 3, 8, 3);
  drawSmoke(g, cxx + 3, by - FH - RH + 2, t, bx * 0.013);
  // 门口地垫
  R(g, bx - 4, by - 2, 8, 2, hue);
  // 圆头门
  R(g, bx - 5, by - 12, 10, 12, C.wood);
  R(g, bx - 4, by - 14, 8, 2, C.wood);
  O(g, bx - 5, by - 12, 10, 12); R(g, bx - 4, by - 15, 8, 1, INK); R(g, bx - 5, by - 14, 1, 2, INK); R(g, bx + 4, by - 14, 1, 2, INK);
  R(g, bx + 2, by - 7, 1, 2, C.amber);
  // 十字窗 ×2 + 花箱
  for (const wx of [x0 + 7, x0 + W - 17]) {
    R(g, wx - 1, by - FH + 6, 12, 12, C.white);
    R(g, wx, by - FH + 7, 10, 10, C.glass);
    R(g, wx + 4, by - FH + 7, 2, 10, C.white);
    R(g, wx, by - FH + 11, 10, 2, C.white);
    O(g, wx - 1, by - FH + 6, 12, 12);
    R(g, wx - 1, by - FH + 19, 12, 3, C.leafMd); O(g, wx - 1, by - FH + 19, 12, 3);
    R(g, wx + 2, by - FH + 18, 2, 2, hue); R(g, wx + 7, by - FH + 18, 2, 2, hue);
  }
}
export const COTTAGE_SIZE = [72, 72];

/* 厂房：W=88(22m) 锯齿顶 + 高烟囱 + 卷帘门 */
/* 厂房：W=88(22m)，4 座各有识别物
   v0 商务智能=锯齿顶×3+墙面图表牌 · v1 数据问答=平顶+双数据罐 · v2 调度优化=锯齿×2+龙门吊机 · v3 智能化战略=平顶+控制室/天线 */
export function drawFactory(g, bx, by, t = 0, v = 0) {
  const W = 88, FH = 34, TH = 16, x0 = bx - W / 2;
  R(g, x0 + 4, by - 2, W + 4, 4, SHADOW);
  R(g, x0, by - FH, W, FH, C.wall);
  R(g, x0 + W - 4, by - FH, 4, FH, C.wallSh);
  for (let i = 1; i < 4; i++) R(g, x0 + 1, by - FH + i * 8, W - 2, 1, C.wallSh);
  O(g, x0, by - FH, W, FH);
  if (v === 0 || v === 2) {
    // 锯齿顶：垂直边在左、斜面(天窗)向右下
    const n = v === 0 ? 3 : 2, tw = Math.floor(W / n);
    for (let i = 0; i < n; i++) {
      const tx = x0 + i * tw;
      for (let r = 0; r < TH; r++) {
        const rw = Math.round((tw * r) / TH);
        R(g, tx, by - FH - TH + r, Math.max(1, rw), 1, r < 2 ? C.steelLt : C.steel);
        if (rw > 1) R(g, tx + rw - 2, by - FH - TH + r, 2, 1, C.glass);
      }
      R(g, tx, by - FH - TH, 2, TH, INK);
      for (let r = 0; r < TH; r++) R(g, tx + Math.round((tw * r) / TH), by - FH - TH + r, 1, 1, INK);
    }
  } else {
    // 平顶 + 女儿墙
    R(g, x0 - 2, by - FH - 8, W + 4, 8, C.steel);
    R(g, x0 - 2, by - FH - 8, W + 4, 2, C.steelLt);
    O(g, x0 - 2, by - FH - 8, W + 4, 8);
  }
  R(g, x0, by - FH - 1, W, 1, INK);
  // 工业高窗 ×5
  for (let i = 0; i < 5; i++) {
    const wx = x0 + 8 + i * 16;
    R(g, wx, by - FH + 4, 9, 6, C.glass); R(g, wx, by - FH + 4, 9, 1, C.white); O(g, wx - 1, by - FH + 3, 11, 8);
  }
  // 卷帘门 + 警示条
  R(g, bx - 9, by - 15, 18, 15, C.steelLt);
  for (let i = 1; i < 5; i++) R(g, bx - 8, by - 15 + i * 3, 16, 1, C.steel);
  O(g, bx - 9, by - 15, 18, 15);
  for (let i = 0; i < 3; i++) {
    R(g, bx - 14 + i * 2, by - 4 + i, 2, 1, C.amber);
    R(g, bx + 12 - i * 2, by - 4 + i, 2, 1, C.amber);
  }
  if (v === 0) { // 墙面图表牌 + 烟囱
    R(g, x0 + 6, by - 28, 22, 13, C.white); O(g, x0 + 6, by - 28, 22, 13);
    R(g, x0 + 8, by - 18, 16, 1, C.wallSh);
    const bars = [2, 4, 3, 6, 8];
    bars.forEach((h, i) => R(g, x0 + 9 + i * 3, by - 18 - h, 2, h, i === 4 ? C.beacon : C.glass));
    chimney(g, x0 + W - 16, by, FH, TH, t, by * 0.017);
  } else if (v === 1) { // 双数据罐 + 输送管
    for (const s of [0, 1]) {
      const sx = x0 + W + 4 + s * 15;
      R(g, sx, by - 38 + s * 6, 12, 38 - s * 6, C.steelLt);
      R(g, sx + 1, by - 38 + s * 6, 3, 38 - s * 6, C.white);
      R(g, sx + 1, by - 40 + s * 6, 10, 2, C.steelLt);
      O(g, sx, by - 38 + s * 6, 12, 38 - s * 6); R(g, sx + 1, by - 41 + s * 6, 10, 1, INK);
      for (let ry = 0; ry < 3 - s; ry++) { R(g, sx + 2, by - 32 + s * 6 + ry * 9, 8, 1, C.steel); }
      R(g, sx + 4, by - 20, 4, 4, C.glass); O(g, sx + 3, by - 21, 6, 6); // 观察窗
    }
    R(g, x0 + W - 2, by - 12, 8, 3, C.steel); O(g, x0 + W - 2, by - 12, 8, 3); // 输送管
    drawSmoke(g, x0 + W + 10, by - 41, t, by * 0.011);
  } else if (v === 2) { // 龙门吊机 + 堆箱 + 烟囱
    const px = x0 + W + 20;
    R(g, px, by - 46, 4, 46, C.steel); O(g, px, by - 46, 4, 46);
    R(g, x0 + W - 12, by - 46, 38, 4, C.steel); O(g, x0 + W - 12, by - 46, 38, 4);
    R(g, x0 + W + 5, by - 42, 1, 14, INK); // 吊索
    drawCrate(g, x0 + W + 6, by - 18, 10);
    drawCrate(g, px + 10, by, 10); drawCrate(g, px + 10, by - 10, 10);
    chimney(g, x0 + 8, by, FH, TH, t, by * 0.013);
  } else { // v3 控制室 + 雷达碗 + 闪灯天线
    R(g, bx + 6, by - FH - 18, 26, 11, C.wall); O(g, bx + 6, by - FH - 18, 26, 11);
    R(g, bx + 8, by - FH - 15, 22, 4, C.glass); R(g, bx + 8, by - FH - 15, 22, 1, C.white);
    disc(g, bx + 36, by - FH - 16, 5, C.steelLt); disc(g, bx + 36, by - FH - 16, 2, C.steel);
    R(g, bx + 35, by - FH - 12, 2, 5, C.steel);
    R(g, bx - 24, by - FH - 26, 2, 19, C.steel);
    R(g, bx - 28, by - FH - 20, 10, 1, C.steel); R(g, bx - 27, by - FH - 15, 8, 1, C.steel);
    if (Math.floor(t * 2.5) % 2 === 0) { R(g, bx - 25, by - FH - 29, 4, 3, C.pPoti); R(g, bx - 24, by - FH - 28, 2, 1, C.white); }
  }
}
function chimney(g, cx, by, FH, TH, t, ph) {
  R(g, cx, by - FH - TH - 12, 8, TH + 12 + FH * 0.3, C.steel);
  R(g, cx, by - FH - TH - 12, 2, TH + 12, C.steelLt);
  R(g, cx - 1, by - FH - TH - 13, 10, 3, C.steelLt);
  O(g, cx - 1, by - FH - TH - 13, 10, 3);
  O(g, cx, by - FH - TH - 12, 8, TH + 24);
  drawSmoke(g, cx + 4, by - FH - TH - 14, t, ph);
}
export const FACTORY_SIZE = [96, 84];

/* 中央石碑 */
export function drawMonument(g, bx, by) {
  R(g, bx - 22, by - 2, 52, 4, SHADOW);
  R(g, bx - 26, by - 4, 52, 4, C.wallSh); O(g, bx - 26, by - 4, 52, 4); // 台基
  R(g, bx - 22, by - 32, 44, 28, C.wall);
  R(g, bx + 18, by - 32, 4, 28, C.wallSh);
  O(g, bx - 22, by - 32, 44, 28);
  R(g, bx - 24, by - 36, 48, 4, C.amber);
  R(g, bx - 24, by - 36, 48, 1, shade(C.amber, 1.5));
  O(g, bx - 24, by - 36, 48, 4);
  // 铭刻暗示（实际文字用 DOM 文字层叠加）
  R(g, bx - 14, by - 26, 28, 2, C.wallSh);
  R(g, bx - 10, by - 21, 20, 2, C.wallSh);
  R(g, bx - 14, by - 16, 28, 2, C.wallSh);
  R(g, bx + 12, by - 11, 4, 4, C.amber); // 印章
  // 两侧花坛
  for (const s of [-1, 1]) {
    const fx = bx + s * 30;
    R(g, fx - 4, by - 4, 8, 4, C.wallSh); O(g, fx - 4, by - 4, 8, 4);
    blob(g, fx, by - 7, 3, C.leafMd);
  }
}
export const MONUMENT_SIZE = [72, 42];

/* 观点广告牌（编号 01–06） */
/* 观点广告牌（编号 01–06）：奇数号换单柱 + 顶灯变体 */
export function drawBillboard(g, bx, by, no = "01") {
  const odd = parseInt(no) % 2 === 0;
  R(g, bx - 14, by - 1, 30, 3, SHADOW);
  if (odd) {
    R(g, bx - 2, by - 14, 4, 14, C.wood); O(g, bx - 2, by - 14, 4, 14);
    R(g, bx - 6, by - 12, 12, 2, C.wood);
  } else {
    R(g, bx - 12, by - 14, 3, 14, C.steel); O(g, bx - 12, by - 14, 3, 14);
    R(g, bx + 9, by - 14, 3, 14, C.steel); O(g, bx + 9, by - 14, 3, 14);
  }
  R(g, bx - 18, by - 36, 36, 24, C.white);
  O(g, bx - 18, by - 36, 36, 24);
  O(g, bx - 16, by - 34, 32, 20, C.amber);
  for (const [rx, ry] of [[-16, -34], [13, -34], [-16, -17], [13, -17]]) R(g, bx + rx + 1, by + ry + 1, 1, 1, INK);
  if (odd) { // 顶灯
    R(g, bx - 1, by - 39, 2, 3, C.steel);
    R(g, bx - 3, by - 41, 6, 3, C.pPoti); O(g, bx - 3, by - 41, 6, 3);
  }
  R(g, bx - 18, by - 36, 12, 8, C.amber); O(g, bx - 18, by - 36, 12, 8);
  digits(g, bx - 15, by - 34, no, C.white);
  // 版面文字占位（实际标题用 DOM 文字层）
  R(g, bx - 12, by - 24, 24, 2, C.wallSh);
  R(g, bx - 12, by - 20, 16, 2, C.wallSh);
}
export const BILLBOARD_SIZE = [44, 40];

/* 巨书 */
/* 巨书：三本高度/书脊深浅不同，第二本微开页 */
export function drawBook(g, bx, by, idx = 0) {
  const H = 36 - idx * 4;
  const spine = [1.0, 0.85, 0.7][idx % 3];
  R(g, bx - 16, by - 1, 34, 3, SHADOW);
  R(g, bx - 10, by - H + 2, 28, H - 2, C.white);
  for (let i = 1; i < Math.floor(H / 4) - 1; i++) R(g, bx - 9, by - H + 2 + i * 4, 26, 1, C.wallSh);
  R(g, bx - 10, by - H + 2, 28, 3, C.wallSh);
  O(g, bx - 10, by - H + 2, 28, H - 2);
  if (idx === 1) { // 微开的书页
    R(g, bx + 14, by - H + 6, 8, H - 10, C.white);
    R(g, bx + 15, by - H + 8, 6, 1, C.wallSh); R(g, bx + 15, by - H + 12, 6, 1, C.wallSh);
    O(g, bx + 14, by - H + 6, 8, H - 10);
  }
  R(g, bx - 18, by - H, 8, H, shade(C.glass, spine));
  R(g, bx - 17, by - H, 2, H, C.white);
  O(g, bx - 18, by - H, 8, H);
  R(g, bx - 18, by - H + 8, 8, 6, C.amber); O(g, bx - 18, by - H + 8, 8, 6); // 题签
  digits(g, bx - 16, by - H + 15, String(idx + 1), C.white);
}
export const BOOK_SIZE = [40, 40];

/* 联系信标塔（信标闪烁 + 扩散环，6 帧 1.8s） */
export function drawTower(g, bx, by, t = 0) {
  R(g, bx - 8, by - 1, 22, 3, SHADOW);
  R(g, bx - 8, by - 6, 16, 6, C.wallSh); O(g, bx - 8, by - 6, 16, 6);
  // 收分桁架
  const H = 44;
  for (let r = 0; r < H; r++) {
    const hw = Math.round(7 - (r / H) * 5);
    const y = by - 6 - r;
    R(g, bx - hw, y, 1, 1, C.steel); R(g, bx + hw - 1, y, 1, 1, C.steel);
    if (r % 10 === 0) R(g, bx - hw, y, hw * 2, 1, C.steel);
    if (r % 10 === 5) { R(g, bx - ((hw / 2) | 0), y, 1, 1, C.steelLt); R(g, bx + ((hw / 2) | 0), y, 1, 1, C.steelLt); }
  }
  R(g, bx - 3, by - 54, 6, 4, C.steel); O(g, bx - 3, by - 54, 6, 4); // 平台
  const f = Math.floor(((t / 1.8) % 1) * 6);
  const on = f < 3;
  R(g, bx - 2, by - 60, 4, 5, on ? C.beacon : shade(C.beacon, 0.55));
  O(g, bx - 2, by - 60, 4, 5);
  if (on) R(g, bx - 1, by - 59, 1, 1, C.white);
  const rr = 4 + f * 3;
  ring(g, bx, by - 58, rr, f < 3 ? C.beacon : shade(C.beacon, 1.5));
}
export const TOWER_SIZE = [40, 66];

/* 树 ×3 */
export function drawPine(g, bx, by, s = 1, t = 0) {
  const dx = swayDx(t, bx * 0.1);
  R(g, bx - 5 * s + 2, by - 1, 10 * s, 3, SHADOW);
  R(g, bx - 2, by - 7 * s, 4, 7 * s, C.wood); O(g, bx - 2, by - 7 * s, 4, 7 * s);
  triOutlined(g, bx + dx, by - 5 * s, 20 * s, 11 * s, C.leafDk);
  triOutlined(g, bx + dx, by - 12 * s, 16 * s, 10 * s, C.leafMd);
  triOutlined(g, bx + dx, by - 19 * s, 11 * s, 9 * s, C.leafMd);
  R(g, bx + dx - 1, by - 27 * s, 2, 2, C.lawn);
}
export function drawRound(g, bx, by, s = 1, t = 0) {
  const dx = swayDx(t, bx * 0.13);
  R(g, bx - 5 * s + 2, by - 1, 10 * s, 3, SHADOW);
  R(g, bx - 2, by - 8 * s, 4, 8 * s, C.wood); O(g, bx - 2, by - 8 * s, 4, 8 * s);
  blob(g, bx + dx, by - 15 * s, 9 * s, C.leafMd);
  disc(g, bx + dx + 2 * s, by - 12 * s, 5 * s, C.leafDk);
  disc(g, bx + dx - 3 * s, by - 18 * s, 3 * s, C.lawn);
  R(g, bx + dx - 5 * s, by - 20 * s, 2, 2, C.lawn);
}
export function drawSkillTree(g, bx, by, tier = 2, t = 0, shape = 0) { // tier 1/2/3 = 能力深度；shape 三款树形
  const s = 0.8 + tier * 0.35;
  const dx = swayDx(t, bx * 0.09);
  R(g, bx - 7 * s + 3, by - 1, 14 * s, 4, SHADOW);
  R(g, bx - 2, by - 10 * s, 5, 10 * s, C.wood);
  R(g, bx - 2, by - 10 * s, 2, 10 * s, C.sandDk);
  O(g, bx - 2, by - 10 * s, 5, 10 * s);
  if (shape === 0) { // 三球簇
    blob(g, bx + dx, by - 17 * s, 11 * s, C.leafMd);
    blob(g, bx + dx - 7 * s, by - 13 * s, 6 * s, C.leafMd);
    blob(g, bx + dx + 7 * s, by - 14 * s, 6 * s, C.leafDk);
    disc(g, bx + dx + 3 * s, by - 12 * s, 5 * s, C.leafDk);
    disc(g, bx + dx - 4 * s, by - 20 * s, 4 * s, C.lawn);
  } else if (shape === 1) { // 高椭圆（叠球向上）
    blob(g, bx + dx, by - 13 * s, 8 * s, C.leafDk);
    blob(g, bx + dx + s, by - 20 * s, 7 * s, C.leafMd);
    blob(g, bx + dx - s, by - 26 * s, 5 * s, C.leafMd);
    disc(g, bx + dx - 2 * s, by - 27 * s, 3 * s, C.lawn);
  } else { // 宽双冠
    blob(g, bx + dx - 6 * s, by - 14 * s, 8 * s, C.leafMd);
    blob(g, bx + dx + 7 * s, by - 15 * s, 7 * s, C.leafDk);
    blob(g, bx + dx, by - 19 * s, 6 * s, C.leafMd);
    disc(g, bx + dx - 8 * s, by - 17 * s, 3 * s, C.lawn);
    R(g, bx + dx + 5 * s, by - 20 * s, 2, 2, C.lawn);
  }
}
export const TREE_SIZES = { pine: [24, 32], round: [24, 30], skill: [48, 44] };

/* 灌木 / 石头 / 名牌石 / 长椅 */
export function drawBush(g, bx, by, s = 1) {
  R(g, bx - 4 * s + 1, by - 1, 8 * s, 2, SHADOW);
  blob(g, bx, by - 4 * s, 5 * s, C.leafMd);
  disc(g, bx - 2 * s, by - 3 * s, 3 * s, C.leafDk);
  R(g, bx + s, by - 7 * s, 2, 1, C.lawn);
}
export function drawRock(g, bx, by, s = 1) {
  R(g, bx - 4 * s + 1, by - 1, 8 * s, 2, SHADOW);
  const rows = [4, 8, 11, 12];
  rows.forEach((w, i) => R(g, bx - (w >> 1), by - (rows.length - i) * 2 * s, w * s, 2 * s, C.wallSh));
  R(g, bx - 4 * s, by - 6 * s, 3 * s, 2 * s, C.wall);
  O(g, bx - 6 * s, by - 8 * s + 2, 12 * s, 8 * s - 2);
}
export function drawSlab(g, bx, by) {
  R(g, bx - 6, by - 1, 14, 2, SHADOW);
  R(g, bx - 7, by - 9, 14, 9, C.wall);
  R(g, bx + 5, by - 9, 2, 9, C.wallSh);
  O(g, bx - 7, by - 9, 14, 9);
  R(g, bx - 4, by - 6, 8, 1, C.amber);
  R(g, bx - 3, by - 4, 6, 1, C.wallSh);
}
export function drawBench(g, bx, by) {
  R(g, bx - 7, by, 16, 2, SHADOW);
  R(g, bx - 8, by - 8, 16, 3, C.sandDk); O(g, bx - 8, by - 8, 16, 3); // 靠背
  R(g, bx - 8, by - 5, 16, 3, C.wood); O(g, bx - 8, by - 5, 16, 3);
  R(g, bx - 7, by - 2, 2, 2, INK); R(g, bx + 5, by - 2, 2, 2, INK);
}

/* 可撞道具 */
export function drawCrate(g, bx, by, s = 12) {
  R(g, bx - s / 2 + 1, by - s + 3, s, s, SHADOW);
  R(g, bx - s / 2, by - s, s, s, C.sandDk);
  R(g, bx - s / 2 + 1, by - s + 1, s - 2, 1, shade(C.sandDk, 1.25));
  O(g, bx - s / 2, by - s, s, s);
  for (let i = 1; i < s - 1; i++) {
    R(g, bx - s / 2 + i, by - s + i, 1, 1, C.wood);
    R(g, bx + s / 2 - 1 - i, by - s + i, 1, 1, C.wood);
  }
}
export function drawCone(g, bx, by) {
  R(g, bx - 3, by - 1, 8, 2, SHADOW);
  triOutlined(g, bx, by, 9, 9, C.pHome);
  R(g, bx - 2, by - 4, 5, 2, C.white);
  R(g, bx - 5, by - 1, 10, 2, C.pHome); O(g, bx - 5, by - 1, 10, 2);
}
export function drawBall(g, bx, by) {
  R(g, bx - 6, by - 1, 14, 3, SHADOW);
  blob(g, bx, by - 8, 7, C.pPoti);
  disc(g, bx + 2, by - 6, 4, shade(C.pPoti, 0.82));
  disc(g, bx - 3, by - 11, 2, C.white);
}

/* 广场铺装块 24×24 / 围栏段 24×14 */
export function drawPaving(g, x, y) {
  R(g, x, y, 24, 24, C.paper);
  R(g, x, y, 24, 1, C.paperSh); R(g, x, y, 1, 24, C.paperSh);
  R(g, x + 12, y + 12, 1, 1, C.wallSh);
  R(g, x + 4, y + 4, 2, 1, C.paperSh); R(g, x + 17, y + 18, 2, 1, C.paperSh);
}
export function drawFence(g, bx, by) {
  R(g, bx - 12, by - 1, 26, 2, SHADOW);
  R(g, bx - 12, by - 7, 24, 2, C.sandDk); R(g, bx - 12, by - 7, 24, 1, shade(C.sandDk, 1.2));
  R(g, bx - 12, by - 3, 24, 1, C.sandDk);
  for (const px of [-12, -1, 10]) { R(g, bx + px, by - 10, 3, 10, C.wood); O(g, bx + px, by - 10, 3, 10); }
}

/* 路灯：琴面世界里的小坁黄点 */
export function drawLamp(g, bx, by) {
  R(g, bx - 2, by - 1, 6, 2, SHADOW);
  R(g, bx - 2, by - 2, 4, 2, INK);
  R(g, bx - 1, by - 15, 2, 13, C.steel); R(g, bx - 1, by - 15, 1, 13, C.steelLt);
  R(g, bx - 3, by - 19, 6, 5, C.pPoti); O(g, bx - 3, by - 19, 6, 5);
  R(g, bx - 2, by - 18, 2, 2, C.white);
  R(g, bx - 4, by - 20, 8, 1, INK);
}
/* 矩形旗（2 帧波浪 0.4s/帧） */
export function drawFlag(g, bx, by, hue, t = 0) {
  R(g, bx - 2, by - 1, 6, 2, SHADOW);
  R(g, bx - 1, by - 24, 2, 24, C.steel); R(g, bx - 2, by - 25, 4, 2, INK);
  const f = Math.floor(((t + bx * 0.05) / 0.4) % 2);
  for (let i = 0; i < 12; i++) {
    const dy = (i > 7 ? (f ? 1 : -1) : i > 3 ? (f ? 0 : -1) + 1 - 1 : 0);
    const h = i < 10 ? 7 : 5;
    R(g, bx + 1 + i, by - 23 + dy + (7 - h), 1, h, hue);
  }
  R(g, bx + 1, by - 23, 1, 7, shade(hue, 0.72));
  R(g, bx + 1, by - 24, 12, 1, INK);
}
/* 花坛 */
export function drawFlowerBed(g, bx, by, hue) {
  R(g, bx - 8, by - 1, 18, 2, SHADOW);
  R(g, bx - 9, by - 5, 18, 5, C.wallSh); O(g, bx - 9, by - 5, 18, 5);
  R(g, bx - 8, by - 8, 16, 4, C.leafMd);
  R(g, bx - 8, by - 8, 16, 1, C.leafDk);
  for (let i = 0; i < 5; i++) R(g, bx - 7 + i * 3, by - 9, 2, 2, i % 2 ? C.white : hue);
}
/* 白桦：白杆墨痕 + 浅冠 */
export function drawBirch(g, bx, by, s = 1, t = 0) {
  const dx = swayDx(t, bx * 0.11);
  R(g, bx - 4 * s + 2, by - 1, 8 * s, 3, SHADOW);
  R(g, bx - 2, by - 11 * s, 4, 11 * s, C.white); O(g, bx - 2, by - 11 * s, 4, 11 * s);
  R(g, bx - 1, by - 4 * s, 2, 1, INK); R(g, bx, by - 7 * s, 1, 1, INK); R(g, bx - 1, by - 9 * s, 1, 1, INK);
  blob(g, bx + dx, by - 16 * s, 7 * s, C.lawn);
  disc(g, bx + dx + 2 * s, by - 14 * s, 4 * s, C.leafMd);
  R(g, bx + dx - 3 * s, by - 19 * s, 2, 1, C.white);
}
/* 果树：圆冠 + 琥珀果实 */
export function drawFruitTree(g, bx, by, s = 1, t = 0) {
  const dx = swayDx(t, bx * 0.17);
  R(g, bx - 5 * s + 2, by - 1, 10 * s, 3, SHADOW);
  R(g, bx - 2, by - 8 * s, 4, 8 * s, C.wood); O(g, bx - 2, by - 8 * s, 4, 8 * s);
  blob(g, bx + dx, by - 14 * s, 8 * s, C.leafMd);
  disc(g, bx + dx + 3 * s, by - 11 * s, 4 * s, C.leafDk);
  for (const [fx, fy] of [[-4, -16], [2, -18], [5, -13], [-1, -12]]) {
    R(g, bx + dx + fx * s, by + fy * s, 2, 2, C.pPoti);
  }
  R(g, bx + dx - 4 * s, by - 16 * s, 1, 1, C.white);
}
/* 鸭子池塘（地面层，鸭子漂移） */
export function drawPond(g, cx, cy, t = 0) {
  const rows = [[20], [30], [36], [38], [34], [26], [14]];
  rows.forEach(([w], i) => R(g, cx - w / 2 - 2, cy - 11 + i * 3, w + 4, 3, C.paperSh));
  rows.forEach(([w], i) => R(g, cx - w / 2, cy - 10 + i * 3, w, 3, C.glass));
  rows.forEach(([w], i) => { R(g, cx - w / 2, cy - 10 + i * 3, 1, 3, C.sandDk); R(g, cx + w / 2 - 1, cy - 10 + i * 3, 1, 3, C.sandDk); });
  // 波光
  const sp = Math.floor(t * 2) % 2;
  R(g, cx - 10 + sp * 3, cy - 4, 5, 1, C.white);
  R(g, cx + 4 - sp * 3, cy + 3, 4, 1, C.white);
  // 鸭子 ×2（慢漂）
  const dxk = Math.round(Math.sin(t * 0.5) * 5);
  const duck = (x, y, flip) => {
    R(g, x, y, 5, 3, C.white); O(g, x - 1, y - 1, 7, 5);
    R(g, x + (flip ? -1 : 3), y - 3, 3, 3, C.white); O(g, x + (flip ? -2 : 2), y - 4, 5, 5);
    R(g, x + (flip ? -3 : 6), y - 2, 2, 1, C.pPoti);
    R(g, x + (flip ? 0 : 4), y - 3, 1, 1, INK);
    R(g, x + (flip ? 6 : -3), y + 2, 3, 1, C.paperSh);
  };
  duck(cx - 8 + dxk, cy - 2, false);
  duck(cx + 6 - dxk, cy + 4, true);
}

/* 小车（北向 24×24）+ 任意角度旋转 */
export function drawCarN(g) { // 在 24×24 画布 (0,0) 绘制，车头朝上
  R(g, 4, 4, 3, 5, INK); R(g, 17, 4, 3, 5, INK);
  R(g, 4, 15, 3, 5, INK); R(g, 17, 15, 3, 5, INK);
  R(g, 6, 3, 12, 18, C.carBody);
  O(g, 6, 3, 12, 18);
  R(g, 7, 4, 10, 2, shade(C.carBody, 1.45)); // 车头盖高光
  R(g, 8, 8, 8, 3, C.glass); // 前风挡
  R(g, 8, 11, 8, 6, shade(C.carBody, 1.3)); // 车顶
  R(g, 8, 17, 8, 2, C.glass); // 后风挡
  R(g, 11, 3, 2, 5, C.pPoti); // 引擎盖琥珀条纹
  R(g, 7, 3, 2, 1, C.white); R(g, 15, 3, 2, 1, C.white); // 车灯
  R(g, 8, 20, 8, 1, C.amber); // 尾灯
}
export function makeCarFrames(n = 8) {
  const src = document.createElement("canvas");
  src.width = src.height = 24;
  const sg = src.getContext("2d");
  drawCarN(sg);
  const data = sg.getImageData(0, 0, 24, 24);
  const out = [];
  for (let d = 0; d < n; d++) {
    const ang = (d / n) * Math.PI * 2;
    const c = document.createElement("canvas");
    c.width = c.height = 24;
    const og = c.getContext("2d");
    const im = og.createImageData(24, 24);
    const cs = Math.cos(ang), sn = Math.sin(ang), h = 11.5;
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
      const sx = Math.round(cs * (x - h) - sn * (y - h) + h);
      const sy = Math.round(sn * (x - h) + cs * (y - h) + h);
      if (sx >= 0 && sx < 24 && sy >= 0 && sy < 24) {
        const si = (sy * 24 + sx) * 4, di = (y * 24 + x) * 4;
        for (let k = 0; k < 4; k++) im.data[di + k] = data.data[si + k];
      }
    }
    og.putImageData(im, 0, 0);
    out.push(c);
  }
  return out;
}
/* 车尾尘（3 帧 0.25s/帧） */
export function drawDustFrame(g, bx, by, f) {
  const cols = [C.sandDk, C.paperSh, C.paper];
  const s = 2 + f * 2;
  R(g, bx - (s >> 1), by - (s >> 1), s, s, cols[f]);
  if (f > 0) { R(g, bx - s, by - 1, 2, 2, cols[f]); R(g, bx + s - 2, by + 1, 2, 2, cols[f]); }
}

/* 布局数据统一在 src/data/world.ts —— 此库只负责精灵绘制。
   投影叠加色（不计入色板） */
export const SHADOW_FILL = SHADOW;
