export type Work = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  year: string;
  audience: string;
  category: "design" | "code" | "writing" | "other";
  color: "terracotta" | "sage" | "peach" | "mustard" | "rose";
  link?: string;
};

export const works: Work[] = [
  {
    id: "analytica",
    title: "Analytica",
    subtitle: "Analytica",
    description:
      "面向港口业务的商务智能分析 Agent。业务人员用自然语言描述需求，系统自动完成问题澄清、分析方案规划、并行查询执行，并交付图文 PPT 报告。",
    tags: ["LangGraph", "FastAPI", "Qwen3", "React 19"],
    year: "2025",
    audience: "港口企业",
    category: "code",
    color: "terracotta",
  },
  {
    id: "gd5j",
    title: "港东五街",
    subtitle: "GD5J",
    description:
      "船景融合 H5。用户上传大连街景照片，系统自动将邮轮合成至街道尽头，完整流程 8 秒内完成。集成视觉规划、匿名身份与场景缓存优化。",
    tags: ["Next.js 15", "Seedream", "火山方舟"],
    year: "2025 · v0.1.5",
    audience: "游客 / 文旅运营",
    category: "design",
    color: "sage",
  },
  {
    id: "quest",
    title: "AI Quest",
    subtitle: "Quest",
    description:
      "面向 10–12 岁儿童的沉浸式 AI 素养探险。通过奇幻剧情、角色陪伴与关卡交互，覆盖 22 条 AI 素养实现路径，内置安全护栏与多幕叙事系统。",
    tags: ["Next.js 14", "Phaser.js", "DeepSeek V4"],
    year: "2025 · v1.2",
    audience: "10–12 岁儿童",
    category: "design",
    color: "mustard",
  },
  {
    id: "home",
    title: "Home · 7 日 AI 启蒙",
    subtitle: "Home",
    description:
      "为 8–12 岁儿童设计的 7 天 AI 启蒙 H5。通过与 AI 玩具的语音/文字交互、记忆面板可视化与毕业卡分享，建立对 AI 系统机制的具身理解。",
    tags: ["Next.js 15", "DeepSeek", "DashScope"],
    year: "2025 · v1.0.2",
    audience: "8–12 岁儿童",
    category: "design",
    color: "peach",
  },
  {
    id: "interview",
    title: "AI 面试官系统",
    subtitle: "Interview",
    description:
      "蓝领招聘全流程自动化。覆盖证件 OCR、资质规则引擎、6 节点面试状态机、实时语音交互与评分排名，把招聘官从重复筛选中解放出来。",
    tags: ["FastAPI", "Qwen3", "DashScope"],
    year: "2025 · MVP",
    audience: "招聘方 / 蓝领",
    category: "code",
    color: "rose",
  },
  {
    id: "tracer",
    title: "Tracer · 溯",
    subtitle: "Tracer",
    description:
      "从订阅的行业信息源中自动提炼因果推理链与隐含假设，以可追溯的推理 DAG 呈现，帮助读者训练批判性思维与判断力。",
    tags: ["FastAPI", "ChromaDB", "DAG 可视化"],
    year: "2025 · v2.4",
    audience: "研究者 / 投资人",
    category: "code",
    color: "terracotta",
  },
];

export const skills = [
  "Product Design",
  "Full-stack",
  "AI / LLM",
  "Vibe Coding",
  "Next.js / React",
  "TypeScript",
  "Python · FastAPI",
  "LangGraph",
  "Figma",
];
