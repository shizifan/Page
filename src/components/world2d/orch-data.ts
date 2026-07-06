import { enterpriseWorks, posts, skills, theses, works } from "@/data/works";
import type { District, Poi } from "@/data/world";

/**
 * 「会呼吸的系统图」世界数据 —— 坐标基于 1400×1000 图板（x 右，y 下）。
 * 布局与 orchestration-art-v2.js 的 v2 深化稿同源，
 * 并落实评审意见：部署坞分两簇（K12 / 成人）、主干末端错落。
 */

export const BOARD = { w: 1400, h: 1000, margin: 46 };

export const RING = { x0: 330, y0: 330, x1: 1010, y1: 690 };
export const HUBS: Array<[number, number, number]> = [
  [330, 330, 0],
  [1010, 330, 1],
  [1010, 690, 2],
  [330, 690, 3],
];
/** 各枢纽在主环上的参数位（与 ringPoint 同参） */
export const HUB_U = [0, 0.3269, 0.5, 0.8269];

export const DEV_X = 1268;
export const BUS_X = 1180;

/**
 * 部署坞分两簇：上簇是三件 K12 教育产品，下簇三件成人产品。
 * slot: { workIdx: works 数组下标, y: 装置中心 }
 */
export const DEV_SLOTS: Array<{ workIdx: number; y: number }> = [
  { workIdx: 1, y: 165 }, // AI侦探社 · 检验台
  { workIdx: 2, y: 273 }, // 会问AI · 问答收发机
  { workIdx: 3, y: 381 }, // Home · 暖箱
  { workIdx: 0, y: 505 }, // 破题 · 蒸馏塔
  { workIdx: 4, y: 613 }, // 松果 · 节律记录仪
  { workIdx: 5, y: 721 }, // 港东五街 · 显影盘
];
export const DEV_HUES = ["#ffb224", "#5ac8fa", "#34d97b", "#ff8a5c", "#f472b6", "#a78bfa"];

export const TOOL_WALL = { x: 800, y: 190 };
export const TRUNK_XS = [600, 720, 840, 960];
export const TRUNK_VALS = [0.92, 0.88, 0.95, 0.9];
export const TRUNK_NAMES = ["商务智能Agent", "数据问答", "调度优化", "智能化战略"];
/** 主干末端错落（评审 §一.2） */
export const TRUNK_END_OFF = [0, -14, 8, -6];

/** 六条观点载体（位置即语义） */
export const CARRIERS = {
  luggage: { x: BUS_X, y: 452 }, // 01 行李牌 · 拴在部署总线
  enamel: { x: 1070, y: 790 }, // 02 搪瓷牌 · 执行区右侧空地（避开主干/图签/管线/枢纽）
  stencil: { x: 668, y: 800, text: "先问清楚，再动手" }, // 03 丝印在集流管上
  note4: { x: 935, y: 512 }, // 04 图钉便签
  note5: { x: 1105, y: 172 }, // 05 胶带便签
  draft: { x: 455, y: 468 }, // 06 草稿纸 + 修订云线
};

/**
 * 记忆档案架 —— 8 篇长文一排卷轴，每卷一枚主题图章。
 * 顺序与 works.ts 的 posts 一一对应。
 */
export const RACK = { cx: 305, y: 858, step: 52 };
export const archiveX = (i: number) => RACK.cx + (i - 3.5) * RACK.step;

const ARCHIVE_GLYPHS = ["orbit", "brain2", "graph", "loop", "badge", "compass", "gauge", "vmodel"];
const ARCHIVE_CAPS = ["三体", "数据平台", "编程平台", "流利度", "数字员工", "AI 教育", "AI 估工时", "估 AI 工时"];
const ARCHIVE_HANDS = [
  "没有稳定轨道",
  "理性和感性各归各",
  "对着人月神话四道题",
  "别当打字机使",
  "它得先认识你",
  "先问值不值得解",
  "人天是这时代的马力",
  "验证只走了一半",
];

export const ARCHIVE_ITEMS = posts.map((p, i) => ({
  glyph: ARCHIVE_GLYPHS[i],
  cap: ARCHIVE_CAPS[i],
  date: p.date,
  x: archiveX(i),
}));

export const CONSOLE: [number, number] = [128, 470];
export const INBOX: [number, number] = [670, 510];
export const TITLE_BLOCK: [number, number] = [1108, 866];

export const SPAWN = { x: 670, z: 556, heading: Math.PI };

/* ────────────────────────── 轨道图（全部轴对齐线段） ────────────────────────── */

export type Seg = { x1: number; y1: number; x2: number; y2: number };

export const TRACKS: Seg[] = (() => {
  const s: Seg[] = [];
  const add = (x1: number, y1: number, x2: number, y2: number) => s.push({ x1, y1, x2, y2 });
  // 主环
  add(RING.x0, RING.y0, RING.x1, RING.y0);
  add(RING.x1, RING.y0, RING.x1, RING.y1);
  add(RING.x1, RING.y1, RING.x0, RING.y1);
  add(RING.x0, RING.y1, RING.x0, RING.y0);
  // 部署总线（执行 → 右缘，上行 + 下延）
  add(RING.x1, RING.y1, BUS_X, RING.y1);
  add(BUS_X, RING.y1, BUS_X, 150);
  add(BUS_X, RING.y1, BUS_X, 750);
  // 六条装置支线
  for (const d of DEV_SLOTS) add(BUS_X, d.y, DEV_X - 63, d.y);
  // 生产集流管
  add(RING.x1, RING.y1, RING.x1, 800);
  add(RING.x1, 800, 560, 800);
  // 四条主干
  for (const x of TRUNK_XS) add(x, 800, x, 900);
  return s;
})();

/* ────────────────────────── POI ────────────────────────── */

const HUB_CARDS: Array<{ title: string; body: string; meta: string; hand: string }> = [
  {
    title: "感知 · PERCEIVE",
    body: "拿到问题别急着跑。口径是什么，边界在哪，先问清楚。做数据问答那年最大的教训就是这个：错的从来不是 SQL，是没听懂人话。",
    meta: "枢纽 01 · 把输入理顺",
    hand: "先听懂，再动手",
  },
  {
    title: "规划 · PLAN",
    body: "大活拆小活，能并行的并行，该人拍板的地方留个口子。计划要是错了，下面干得越卖力越糟——这种项目我见过不止一个。",
    meta: "枢纽 02 · 拆解与调度",
    hand: "拆开就不吓人了",
  },
  {
    title: "执行 · EXECUTE",
    body: "能用规则的就不劳驾模型。跑起来的东西才算数，PPT 不算。右边六台装置里的东西，都是这么一点点跑出来的。",
    meta: "枢纽 03 · 并行与交付",
    hand: "跑起来才算数",
  },
  {
    title: "记忆 · MEMORY",
    body: "干完的活要归档，不然下个月又从头猜一遍。破题和 Home 都是从这个念头长出来的：一个帮学者把积累码放整齐，一个让孩子看着 AI 的记忆长大。",
    meta: "枢纽 04 · 归档与再出发",
    hand: "抽屉没关严，老卡片总想出来",
  },
];

const DEV_HANDS = [
  "每一滴都是方法",
  "指纹在放大镜下过一遍",
  "把问题发出去，等句点回来",
  "它长大了就搬进去",
  "心情也值得被记录",
  "视线尽头有条船",
];

const productPois: Poi[] = DEV_SLOTS.map((slot) => {
  const w = works[slot.workIdx];
  return {
    id: `product-${w.id}`,
    kind: "product" as const,
    x: 1238,
    z: slot.y,
    r: 54,
    label: "已部署产品 / SHIPPED",
    title: w.title,
    body: w.description,
    tags: w.tags,
    meta: `${w.year} · ${w.audience}`,
    link: w.link,
    linkText: "访问端点 ↗",
    hue: DEV_HUES[slot.workIdx],
    no: `P${slot.workIdx + 1}`,
    hand: DEV_HANDS[slot.workIdx],
  };
});

/**
 * 九件工具 —— 工具墙上每一件各是一个独立 POI（不再一张卡讲完九件）。
 * 工具在墙上等距排列：世界 x = TOOL_WALL.x - 216 + i·54。
 */
export const TOOL_X0 = TOOL_WALL.x - 216;
export const TOOL_STEP = 54;
const TOOL_LABELS = [
  "齿轮组",
  "漏斗滤纸",
  "游标卡尺",
  "道岔扳手",
  "卡片抽屉",
  "传送带",
  "水管阀门",
  "脚手架",
  "扩音喇叭",
];
const TOOL_BODIES = [
  "搭 agent 的骨架：状态机、工具编排、重试兜底。齿轮咬得准，整台机器才转得动。",
  "给模型喂什么、喂多少、按什么顺序。上下文是个漏斗，滤掉噪声才留得下信号。",
  "先有测试集，再谈准确率。没量过的改进，都是错觉。",
  "多个 agent 分工，靠图把控制流扳到对的岔道上。这把扳手今天被借去修调度那条线了。",
  "把资料切好、存好、取得准。检索不是搜索，是把对的那一张卡片抽出来。",
  "十五年的老本行。TB 级数据在传送带上跑批，喂饱上面那些新家伙。",
  "后端管道：接口、流量、异步。阀门拧对，数据才不漏不堵。",
  "前端搭台子。用户点得到、看得懂，agent 才算真落了地。",
  "把这一套讲给一线听。单场数千人——让 AI 真被用起来，比做出来更难。",
];
const TOOL_HANDS = [
  "先把骨架搭稳",
  "少喂，喂对",
  "量了才算数",
  "岔道扳对就不打架",
  "抽对那张卡",
  "老本行，跑批",
  "接口拧紧",
  "台子搭给人用",
  "讲到能用起来",
];

const skillPois: Poi[] = skills.map((s, i) => ({
  id: `skill-${i}`,
  kind: "skills" as const,
  x: TOOL_X0 + i * TOOL_STEP,
  z: TOOL_WALL.y - 5,
  r: 24,
  label: `工具 ${String(i + 1).padStart(2, "0")} / TOOLBOARD`,
  title: `${TOOL_LABELS[i]} · ${s}`,
  body: TOOL_BODIES[i],
  meta: "磨损度 = 被调用的深度",
  no: String(i + 1).padStart(2, "0"),
  hand: TOOL_HANDS[i],
}));

const TRUNK_HANDS = ["报告是一页页吐出来的", "先对齐口径再回答", "错峰，都过得去", "蓝图得先画对"];

const enterprisePois: Poi[] = enterpriseWorks.map((e, i) => ({
  id: `enterprise-${e.id}`,
  kind: "enterprise" as const,
  x: TRUNK_XS[i],
  z: 856 + TRUNK_END_OFF[i],
  r: 56,
  label: "生产级主干 / PRODUCTION",
  title: e.title,
  body: e.detail,
  tags: e.tags,
  meta: `${e.result} · SLA ${Math.round(TRUNK_VALS[i] * 100)}%`,
  no: `E${i + 1}`,
  hand: TRUNK_HANDS[i],
}));

const THESIS_POS: Array<[number, number, number]> = [
  // x, z, r —— 对应六种载体
  [CARRIERS.luggage.x - 10, CARRIERS.luggage.y, 46],
  [CARRIERS.enamel.x, CARRIERS.enamel.y, 46],
  [CARRIERS.stencil.x, CARRIERS.stencil.y, 42],
  [CARRIERS.note4.x, CARRIERS.note4.y, 52],
  [CARRIERS.note5.x, CARRIERS.note5.y, 52],
  [CARRIERS.draft.x, CARRIERS.draft.y, 50],
];
const THESIS_HANDS = ["装好就能用", "AI 是杠杆", "先问清楚", "把链路接回来", "贴着需求做", "还没想透的，圈起来"];

const thesisPois: Poi[] = theses.map((t, i) => ({
  id: `thesis-${t.no}`,
  kind: "thesis" as const,
  x: THESIS_POS[i][0],
  z: THESIS_POS[i][1],
  r: THESIS_POS[i][2],
  label: `观点 ${t.no} / SYSTEM PROMPT`,
  title: t.title,
  body: t.body,
  meta: "挂在系统上的约束",
  no: `S${i + 1}`,
  hand: THESIS_HANDS[i],
}));

const postPois: Poi[] = posts.map((p, i) => ({
  id: `post-${i}`,
  kind: "post" as const,
  x: archiveX(i),
  z: RACK.y,
  r: 24,
  label: `记忆档案 / ARCHIVE`,
  title: p.title,
  body: p.summary,
  meta: `${p.date} · 长文`,
  hue: "#7fa7c6",
  no: `T${i + 1}`,
  hand: ARCHIVE_HANDS[i],
}));

const hubPois: Poi[] = HUBS.map(([x, y, k]) => ({
  id: `hub-${k}`,
  kind: "hub" as const,
  x,
  z: y,
  r: 72,
  label: "枢纽站 / HUB",
  title: HUB_CARDS[k].title,
  body: HUB_CARDS[k].body,
  meta: HUB_CARDS[k].meta,
  no: `H${k + 1}`,
  hand: HUB_CARDS[k].hand,
}));

const contactPoi: Poi = {
  id: "contact",
  kind: "contact",
  x: CONSOLE[0],
  z: CONSOLE[1],
  r: 62,
  label: "人工接管 / HUMAN-IN-THE-LOOP",
  title: "呼叫图纸主人",
  body: "聊工程落地、聊培训，或者就是路过打个招呼。邮件我都会回。",
  meta: "shizifan@gmail.com",
  link: "mailto:shizifan@gmail.com",
  linkText: "发邮件 ✉",
  hue: "#d94f3d",
  no: "HIL",
  hand: "这是全图唯一的红",
};

const aboutPoi: Poi = {
  id: "about",
  kind: "about",
  x: TITLE_BLOCK[0] + 122,
  z: TITLE_BLOCK[1] + 48,
  r: 70,
  label: "图签 / TITLE BLOCK",
  title: "石子凡 · AI 架构师",
  body: "2012 年入行，从大数据平台一路做到智能体系统。图上跑的东西都是真的：右边六台装置全部可以点进去用，下面四条主干在客户的生产环境里跑着。",
  tags: ["2012—2016 大数据平台", "2016—2018 AI 中台", "2018—2025 数字化运营", "2025— Agent 平台"],
  meta: "REV 2026.07 · 1:1 运行中",
  no: "石",
  hand: "相信未来，笃行当下",
  link: "/classic",
  linkText: "查看简历版 →",
};

export const orchPois: Poi[] = [
  ...productPois,
  ...skillPois,
  ...enterprisePois,
  ...thesisPois,
  ...postPois,
  ...hubPois,
  contactPoi,
  aboutPoi,
];

/* ────────────────────────── 分区（toast + 小地图） ────────────────────────── */

export const orchDistricts: District[] = [
  { id: "spawn", name: "任务入口", en: "INBOX", x: INBOX[0], z: INBOX[1], r: 95 },
  { id: "perceive", name: "感知区", en: "PERCEIVE", x: 330, z: 330, r: 165 },
  { id: "plan", name: "规划区", en: "PLAN", x: 800, z: 215, r: 175 },
  { id: "execute", name: "执行区", en: "EXECUTE", x: 1010, z: 690, r: 165 },
  { id: "memory", name: "记忆区", en: "MEMORY", x: 330, z: 690, r: 165 },
  { id: "devs", name: "部署坞", en: "SHIPPED ×6", x: 1250, z: 440, r: 165 },
  { id: "trunks", name: "生产主干", en: "PRODUCTION", x: 780, z: 872, r: 125 },
  { id: "archives", name: "档案架", en: "ARCHIVE ×8", x: RACK.cx, z: RACK.y - 8, r: 210 },
  { id: "console", name: "接管台", en: "SAY HELLO", x: CONSOLE[0], z: CONSOLE[1], r: 85 },
];
