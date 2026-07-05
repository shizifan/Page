import {
  enterpriseWorks,
  posts,
  skills,
  theses,
  thesesIntro,
  works,
} from "./works";

/**
 * 世界坐标系：x 向东，z 向南，原点是出生广场。
 * 所有布局数据集中在这里，视觉、碰撞、小地图共用一份。
 */

export const WORLD = {
  /** 可行驶范围（车被钳制在 ±bound） */
  bound: 146,
  /** 围栏视觉半径 */
  fence: 150,
  /** 地面渲染尺寸 */
  ground: 360,
};

/* ────────────────────────── 兴趣点 ────────────────────────── */

export type PoiKind =
  | "product"
  | "enterprise"
  | "thesis"
  | "post"
  | "skills"
  | "about"
  | "hub"
  | "contact";

export type Poi = {
  id: string;
  kind: PoiKind;
  /** 触发圆心与半径 */
  x: number;
  z: number;
  r: number;
  /** 卡片内容 */
  label: string; // 卡片左上角小标
  title: string;
  body: string;
  tags?: string[];
  meta?: string;
  link?: string;
  linkText?: string;
  /** 图纸化卡片：顶带色（默认琥珀） */
  hue?: string;
  /** 图纸化卡片：编号章文字（如 P1 / H3 / T02） */
  no?: string;
  /** 图纸化卡片：一句楷体手写行 */
  hand?: string;
};

export type District = {
  id: string;
  name: string;
  en: string;
  x: number;
  z: number;
  r: number;
};

/** 车会被推开的静态障碍（AABB，中心 + 半宽） */
export type Obstacle = { x: number; z: number; hx: number; hz: number };

/** 道路段（中心线两端 + 宽度） */
export type Road = { x1: number; z1: number; x2: number; z2: number; w: number };

/* ────────────────────────── 产品城区（北） ────────────────────────── */

export type ProductBuilding = {
  poi: Poi;
  x: number;
  z: number;
  w: number; // 建筑宽（x）
  d: number; // 建筑深（z）
  h: number; // 高
  hue: string; // 屋顶主色
  short: string; // 楼体招牌短名
  en: string;
  /** cottage = 纸片小屋（K12 教育产品），office = 小楼 */
  style: "cottage" | "office";
  /** 造型变体（同族建筑之间的差异化） */
  v: number;
};

/** 布局原则：同区建筑前后错位 4–10m，拒绝齐平排 */
const PRODUCT_POS: Array<[number, number, number, string, number]> = [
  // x, z, height, hue, variant
  [-34, -59, 15, "#ffb224", 0], // 破题
  [2, -78, 12, "#5ac8fa", 0], // AI侦探社
  [34, -61, 11, "#34d97b", 1], // 会问AI
  [-30, -89, 10, "#ff8a5c", 2], // Home
  [4, -107, 12, "#f472b6", 1], // 松果
  [34, -90, 9, "#a78bfa", 2], // 港东五街
];

/** 面向 K12 AI 教育的产品用纸片小屋造型 */
const COTTAGE_IDS = new Set(["detective", "hwai", "home"]);

export const productBuildings: ProductBuilding[] = works.map((w, i) => {
  const [x, z, h, hue, v] = PRODUCT_POS[i];
  return {
    x,
    z,
    w: 16,
    d: 13,
    h,
    hue,
    v,
    short: w.title.split(" · ")[0],
    en: w.subtitle,
    style: COTTAGE_IDS.has(w.id) ? ("cottage" as const) : ("office" as const),
    poi: {
      id: `product-${w.id}`,
      kind: "product",
      x,
      z,
      r: 15,
      label: "产品 / PRODUCT",
      title: w.title,
      body: w.description,
      tags: w.tags,
      meta: `${w.year} · ${w.audience}`,
      link: w.link,
      linkText: "开进去看看 ↗",
    },
  };
});

/* ────────────────────────── 能力矩阵（东） ────────────────────────── */

export type SkillPillar = {
  x: number;
  z: number;
  h: number;
  name: string;
  /** 1..3 = 能力深度（树冠档位） */
  tier: 1 | 2 | 3;
  /** 三款树形之一 */
  shape: 0 | 1 | 2;
};

const SKILL_CENTER = { x: 88, z: 0 };

/** 手摆有机环布，三档冠幅 × 三款树形，不再网格 */
const SKILL_SLOTS: Array<[number, number, 1 | 2 | 3, 0 | 1 | 2]> = [
  [76, -16, 3, 0], // Agent 工程 · Harness
  [92, -20, 2, 1], // Context Engineering
  [105, -8, 2, 2], // Eval 驱动开发
  [103, 8, 2, 0], // LangGraph · 多智能体
  [92, 18, 1, 1], // RAG · LlamaIndex
  [77, 14, 1, 2], // Spark · Hive
  [70, -2, 1, 0], // FastAPI · Python
  [86, -4, 1, 1], // Next.js · React
  [96, 1, 3, 2], // 企业 AI 培训
];
const TIER_H: Record<1 | 2 | 3, number> = { 1: 9, 2: 11.5, 3: 14 };

export const skillPillars: SkillPillar[] = skills.map((name, i) => {
  const [x, z, tier, shape] = SKILL_SLOTS[i];
  return { x, z, h: TIER_H[tier], name, tier, shape };
});

const skillsPoi: Poi = {
  id: "skills",
  kind: "skills",
  x: SKILL_CENTER.x,
  z: SKILL_CENTER.z,
  r: 31,
  label: "能力公园 / SKILL PARK",
  title: "十五年攒下的工具箱",
  body: "树越大，用得越深。从大数据平台到 Agent 工程，一条从数据到智能体的完整栈。",
  tags: skills,
  meta: "2012 → 2026 · 持续更新",
};

/* ────────────────────────── 企业工程区（南） ────────────────────────── */

export type EnterpriseBlock = {
  poi: Poi;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  short: string;
};

const ENTERPRISE_POS: Array<[number, number]> = [
  [-24, 66],
  [26, 76],
  [-27, 102],
  [24, 106],
];
const ENTERPRISE_SHORT = ["商务智能Agent", "数据问答", "调度优化", "智能化战略"];

export const enterpriseBlocks: EnterpriseBlock[] = enterpriseWorks.map(
  (e, i) => {
    const [x, z] = ENTERPRISE_POS[i];
    return {
      x,
      z,
      w: 22,
      d: 15,
      h: 9,
      short: ENTERPRISE_SHORT[i],
      poi: {
        id: `enterprise-${e.id}`,
        kind: "enterprise",
        x,
        z,
        r: 15,
        label: "企业工程 / ENTERPRISE",
        title: e.title,
        body: e.detail,
        tags: e.tags,
        meta: e.result,
      },
    };
  }
);

/* ────────────────────────── 观点大道（西） ────────────────────────── */

export type ThesisBillboard = {
  poi: Poi;
  x: number;
  z: number;
  /** 朝向（绕 y 弧度） */
  rotY: number;
  no: string;
  title: string;
};

/** 间距 13–17m 不等、离路远近有差，打破节拍 */
const BILLBOARD_POS: Array<[number, number]> = [
  [-34, -9],
  [-47, 11],
  [-64, -13],
  [-79, 8],
  [-95, -8],
  [-110, 12],
];

export const thesisBillboards: ThesisBillboard[] = theses.map((t, i) => {
  const [x, z] = BILLBOARD_POS[i];
  const north = z < 0;
  return {
    x,
    z,
    rotY: north ? 0.18 : Math.PI - 0.18,
    no: t.no,
    title: t.title,
    poi: {
      id: `thesis-${t.no}`,
      kind: "thesis",
      x,
      z: north ? z + 4 : z - 4,
      r: 9,
      label: `观点 ${t.no} / THESIS`,
      title: t.title,
      body: t.body,
      meta: "恒定的范式在人这一侧",
    },
  };
});

/* ────────────────────────── 长文档案（西北）与联系信标（西南） ────────────────────────── */

export type PostSlab = {
  poi: Poi;
  x: number;
  z: number;
  rotY: number;
  title: string;
  date: string;
};

const POST_POS: Array<[number, number, number]> = [
  [-136, -52, 0.5],
  [-120, -60, 0],
  [-104, -52, -0.5],
];

export const postSlabs: PostSlab[] = posts.map((p, i) => {
  const [x, z, rotY] = POST_POS[i];
  return {
    x,
    z,
    rotY,
    title: p.title,
    date: p.date,
    poi: {
      id: `post-${i}`,
      kind: "post",
      x,
      z,
      r: 11,
      label: "长文 / WRITING",
      title: p.title,
      body: p.summary,
      meta: p.date,
    },
  };
});

export const CONTACT_POS = { x: -120, z: 54 };

const contactPoi: Poi = {
  id: "contact",
  kind: "contact",
  x: CONTACT_POS.x,
  z: CONTACT_POS.z,
  r: 16,
  label: "联系 / CONTACT",
  title: "想聊聊？",
  body: "Agent 工程落地、企业 AI 培训 / 内训、产品合作，或者只是聊聊——欢迎直接来信。",
  meta: "shizifan@gmail.com",
  link: "mailto:shizifan@gmail.com",
  linkText: "发邮件 ✉",
};

/* ────────────────────────── 出生广场纪念碑 ────────────────────────── */

export const MONUMENT = { x: -18, z: -14, w: 12, d: 3, h: 6.5 };

const aboutPoi: Poi = {
  id: "about",
  kind: "about",
  x: MONUMENT.x,
  z: MONUMENT.z,
  r: 12,
  label: "关于 / PROFILE",
  title: "石子凡 · AI 架构师",
  body: "15 年大数据与人工智能实战，主导跨业务场景的智能体系统架构设计与落地。6 个已上线个人产品，10+ 企业级 AI 项目，单场培训覆盖数千人。相信未来，笃行当下。",
  tags: ["2012—2016 大数据平台", "2016—2018 AI 中台", "2018—2025 数字化运营", "2025— Agent 平台"],
  meta: "让 AI 为人创造价值",
  link: "/classic",
  linkText: "查看简历版 →",
};

/* ────────────────────────── 汇总 ────────────────────────── */

export const pois: Poi[] = [
  aboutPoi,
  ...productBuildings.map((b) => b.poi),
  skillsPoi,
  ...enterpriseBlocks.map((b) => b.poi),
  ...thesisBillboards.map((b) => b.poi),
  ...postSlabs.map((s) => s.poi),
  contactPoi,
];

export const districts: District[] = [
  { id: "spawn", name: "中心广场", en: "PLAZA", x: 0, z: 0, r: 24 },
  { id: "products", name: "产品城区", en: "PRODUCTS", x: 0, z: -84, r: 42 },
  { id: "skills", name: "能力公园", en: "SKILL PARK", x: 88, z: 0, r: 34 },
  { id: "enterprise", name: "企业工程区", en: "ENTERPRISE", x: 0, z: 87, r: 38 },
  { id: "theses", name: "观点大道", en: "THESES AVE.", x: -76, z: 0, r: 46 },
  { id: "writing", name: "长文档案", en: "WRITING", x: -120, z: -54, r: 26 },
  { id: "contact", name: "联系信标", en: "CONTACT", x: -120, z: 54, r: 22 },
];

export const roads: Road[] = [
  { x1: 0, z1: -14, x2: 0, z2: -58, w: 5 }, // 北 → 产品
  { x1: 14, z1: 0, x2: 66, z2: 0, w: 5 }, // 东 → 能力
  { x1: 0, z1: 14, x2: 0, z2: 60, w: 5 }, // 南 → 企业
  { x1: -14, z1: 0, x2: -122, z2: 0, w: 5 }, // 西 → 观点大道
  { x1: -120, z1: -2, x2: -120, z2: -44, w: 4 }, // 支路 → 长文
  { x1: -120, z1: 2, x2: -120, z2: 44, w: 4 }, // 支路 → 联系
  { x1: -32, z1: -68, x2: 32, z2: -68, w: 4 }, // 产品区前街
  { x1: -32, z1: -98, x2: 32, z2: -98, w: 4 }, // 产品区后街
  { x1: 0, z1: -58, x2: 0, z2: -108, w: 4 }, // 产品区纵街
  { x1: 0, z1: 60, x2: 0, z2: 108, w: 4 }, // 企业区纵街
];

/** 地面分区大字 */
export const groundLabels: Array<{
  x: number;
  z: number;
  cn: string;
  en: string;
  rotY?: number;
}> = [
  { x: 0, z: -46, cn: "产品城区", en: "PRODUCTS — 6 SHIPPED" },
  { x: 56, z: -16, cn: "能力公园", en: "SKILL PARK — 9 TREES", rotY: -Math.PI / 2 },
  { x: 0, z: 46, cn: "企业工程区", en: "ENTERPRISE ×4", rotY: Math.PI },
  { x: -56, z: 20, cn: "观点大道", en: "SIX THESES", rotY: Math.PI / 2 },
  { x: -120, z: -32, cn: "长文档案", en: "LONGFORM ×3" },
  { x: -120, z: 32, cn: "联系信标", en: "SAY HELLO", rotY: Math.PI },
];

/* ────────────────────────── 碰撞体 ────────────────────────── */

export const obstacles: Obstacle[] = [
  // 纪念碑
  { x: MONUMENT.x, z: MONUMENT.z, hx: MONUMENT.w / 2, hz: MONUMENT.d / 2 },
  // 产品楼
  ...productBuildings.map((b) => ({ x: b.x, z: b.z, hx: b.w / 2 - 0.5, hz: b.d / 2 - 0.5 })),
  // 能力树（只挡树干）
  ...skillPillars.map((p) => ({ x: p.x, z: p.z, hx: 1.3, hz: 1.3 })),
  // 企业块
  ...enterpriseBlocks.map((b) => ({ x: b.x, z: b.z, hx: b.w / 2 - 0.5, hz: b.d / 2 - 0.5 })),
  // 广告牌立柱
  ...thesisBillboards.map((b) => ({ x: b.x, z: b.z, hx: 1.2, hz: 1.2 })),
  // 长文石碑
  ...postSlabs.map((s) => ({ x: s.x, z: s.z, hx: 5, hz: 1.8 })),
  // 联系信标塔
  { x: CONTACT_POS.x, z: CONTACT_POS.z, hx: 3.4, hz: 3.4 },
];

/* ────────────────────────── 物理玩具 ────────────────────────── */

export type Toy =
  | { kind: "crate"; x: number; y: number; z: number; s: number }
  | { kind: "cone"; x: number; z: number }
  | { kind: "ball"; x: number; z: number; r: number };

export const toys: Toy[] = [
  // 出生点旁的板条箱金字塔（撞它！）
  { kind: "crate", x: 9, y: 0.8, z: -26, s: 1.6 },
  { kind: "crate", x: 10.8, y: 0.8, z: -26, s: 1.6 },
  { kind: "crate", x: 12.6, y: 0.8, z: -26, s: 1.6 },
  { kind: "crate", x: 9.9, y: 2.4, z: -27.5, s: 1.6 },
  { kind: "crate", x: 11.7, y: 2.4, z: -27.5, s: 1.6 },
  { kind: "crate", x: 10.8, y: 4.0, z: -29, s: 1.6 },
  // 东路锥桶阵
  { kind: "cone", x: 28, z: 5.5 },
  { kind: "cone", x: 34, z: -5.5 },
  { kind: "cone", x: 40, z: 5.5 },
  { kind: "cone", x: 46, z: -5.5 },
  { kind: "cone", x: 52, z: 5.5 },
  // 大球
  { kind: "ball", x: -26, z: 14, r: 2.2 },
  // 产品区散箱 + 门前
  { kind: "crate", x: -14, y: 0.8, z: -80, s: 1.6 },
  { kind: "crate", x: 15, y: 0.8, z: -86, s: 1.6 },
  { kind: "crate", x: 14, y: 0.7, z: -84.4, s: 1.4 },
  { kind: "cone", x: -18, z: -60 },
  { kind: "ball", x: 48, z: -80, r: 1.6 },
  // 企业区散箱 + 厂区堆场杂物
  { kind: "crate", x: -8, y: 0.8, z: 66, s: 1.6 },
  { kind: "crate", x: 9, y: 0.8, z: 90, s: 1.6 },
  { kind: "crate", x: -38, y: 0.8, z: 74, s: 1.6 },
  { kind: "crate", x: -36.4, y: 0.8, z: 74, s: 1.6 },
  { kind: "crate", x: -37.2, y: 0.7, z: 72.5, s: 1.4 },
  { kind: "cone", x: 12, z: 70 },
  { kind: "cone", x: -10, z: 98 },
  { kind: "crate", x: 38, y: 0.8, z: 82, s: 1.6 },
  { kind: "crate", x: 40, y: 0.8, z: 110, s: 1.6 },
];

/* ────────────────────────── 街道家具（2D 像素层使用） ────────────────────────── */

export const lamps: Array<[number, number]> = [
  [4, -26], [-4, -44], [24, 4], [42, -4], [60, 4], [4, 26], [-4, 44],
  [-26, 4], [-50, -4], [-74, 4], [-98, -4], [-116, -24], [-116, 28], [4, -84], [-4, 84],
];

export const flags: Array<[number, number, string]> = [
  [-8, -58, "#ffb224"],
  [8, -58, "#5ac8fa"],
  [-112, -46, "#7fa7c6"],
  [-112, 46, "#12b76a"],
  [62, -8, "#6aa348"],
  [-8, 58, "#7c8694"],
];

export const flowerBeds: Array<[number, number, string]> = [
  [11, -11, "#ffb224"],
  [11, 11, "#f472b6"],
  [-11, 11, "#34d97b"],
];

export const POND = { x: 106, z: 18 };

/* ────────────────────────── 绿化装饰（树/灌木/石头） ────────────────────────── */

export type DecoKind = "pine" | "tree" | "birch" | "fruit" | "bush" | "rock";
export type Deco = { kind: DecoKind; x: number; z: number; s: number };

/** 简单的确定性伪随机，避免每次刷新布局不同 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260704);

/** 绿化混布：松 28% / 圆冠 18% / 白桦 12% / 果树 12% / 灌木 18% / 石头 12% */
export const decos: Deco[] = (() => {
  const zones: Array<[number, number, number]> = [
    [64, -64, 34], [72, 72, 34], [-64, -84, 26], [-60, 66, 30],
    [122, -34, 22], [122, 40, 22], [-30, -40, 14], [30, 36, 14],
    [30, -36, 14], [-30, 34, 14], [100, 88, 24], [-100, -88, 24],
    [-136, 92, 16], [136, -96, 16], [-88, -30, 12], [-88, 30, 12],
    [56, -96, 18], [-56, 96, 18], [-50, -68, 9], [50, -84, 9],
    [16, -58, 6], [44, 70, 8], [-44, 92, 8],
  ];
  const out: Deco[] = [];
  for (const [cx, cz, r] of zones) {
    const n = 7 + Math.floor(rand() * 6);
    for (let i = 0; i < n; i++) {
      const x = cx + (rand() - 0.5) * r * 2;
      const z = cz + (rand() - 0.5) * r * 2;
      const roll = rand();
      const s = 0.8 + rand() * 0.7;
      const kind: DecoKind =
        roll < 0.28 ? "pine" : roll < 0.46 ? "tree" : roll < 0.58 ? "birch" :
        roll < 0.7 ? "fruit" : roll < 0.88 ? "bush" : "rock";
      out.push({ kind, x, z, s });
    }
  }
  return out;
})();

/* ────────────────────────── 文案 ────────────────────────── */

export const INTRO = {
  name: "石子凡",
  slogan: "让 AI 为人创造价值",
  sub: "相信未来 / 笃行当下",
  hint: "这是我的能力与产品地图 —— 开车逛逛。",
  thesesIntro,
};
