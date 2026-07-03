export type Work = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  year: string;
  audience: string;
  color: "terracotta" | "sage" | "peach" | "mustard" | "rose";
  link?: string;
};

/** 线上产品 — 全部可点开试用 */
export const works: Work[] = [
  {
    id: "tkb",
    title: "TKB · 学者的 AI 经纪人",
    subtitle: "TKB",
    description:
      "上传简历、论文、课题，LLM 持续编译成活文档画像——学术品牌、研究方向、项目经历三条线同步生长，主动塑造品牌、辅助科研、承接项目。",
    tags: ["FastAPI", "Next.js", "LLM Wiki", "DeepSeek"],
    year: "2026 · Demo 已上线",
    audience: "高校教师 / 研究者",
    color: "terracotta",
    link: "https://scholar.shizifan.com",
  },
  {
    id: "detective",
    title: "AI侦探社",
    subtitle: "Detective",
    description:
      "面向 10–12 岁儿童的 AI 素养教育互动游戏。孩子扮演 AI 侦探，靠「操作 AI 工具 + 推理」破案，一季 6 个案件，动森风格——不是知识问答，是动手用 AI。",
    tags: ["React 18", "TypeScript", "SVG 引擎"],
    year: "2026 · 已上线",
    audience: "10–12 岁儿童",
    color: "mustard",
    link: "https://detective.shizifan.com",
  },
  {
    id: "hwai",
    title: "会问AI · 2D 互动原型",
    subtitle: "Quest",
    description:
      "AI 素养教育游戏原型：动森风 2D 小岛探索，第 1 课完整可玩，22 张 AI 能力卡图鉴。核心理念是先学会「问」，再学会「用」。",
    tags: ["Next.js 16", "React 19", "Zustand"],
    year: "2026 · 已上线",
    audience: "10–12 岁儿童",
    color: "sage",
    link: "https://hwai.shizifan.com",
  },
  {
    id: "home",
    title: "Home · 数字小家",
    subtitle: "Home",
    description:
      "给 8–12 岁孩子的 7 天 AI 启蒙旅程：教会自己的毛绒玩具理解世界。语音交互、记忆面板可视化、世界观档案——让孩子亲手看见 AI 的记忆如何生长。",
    tags: ["Next.js", "DeepSeek", "DashScope ASR"],
    year: "2025 · v1.0.2",
    audience: "8–12 岁儿童",
    color: "peach",
    link: "https://home.shizifan.com",
  },
  {
    id: "pinecone",
    title: "松果",
    subtitle: "Songguo",
    description:
      "看得见身体节律的 AI 伙伴。地点打卡沉淀成情绪地图，周报梳理身心状态，AI 陪伴而不说教——青少年身心健康的自助工具。",
    tags: ["React", "Tailwind", "OpenAI 兼容端点"],
    year: "2026 · 已上线",
    audience: "青少年",
    color: "rose",
    link: "https://pinecone.shizifan.com",
  },
  {
    id: "gd5j",
    title: "港东五街",
    subtitle: "GD5J",
    description:
      "文旅 H5：拍一张你的街道，AI 把一艘邮轮放进画面尽头，几秒出片。视线的尽头有条前往远方的船。",
    tags: ["Next.js", "Seedream", "火山方舟"],
    year: "2025 · v0.1.5",
    audience: "游客 / 文旅运营",
    color: "sage",
    link: "https://gd5j.shizifan.com",
  },
];

export type EnterpriseWork = {
  id: string;
  title: string;
  result: string;
  detail: string;
  tags: string[];
};

/** 企业级工程 — 无公开链接，讲结果 */
export const enterpriseWorks: EnterpriseWork[] = [
  {
    id: "bi-agent",
    title: "商务智能分析 Agent",
    result: "自然语言到图文报告，一人独立交付",
    detail:
      "感知—规划—执行—反思四阶段状态机：业务人员用自然语言提需求，系统完成澄清、规划、并行查询，交付图文 / PPT / DOCX 报告。经多轮质量迭代与线上巡检，沉淀出一套以确定性优先、eval 把关的智能体工程方法论。",
    tags: ["LangGraph", "FastAPI", "React 19", "Eval 驱动"],
  },
  {
    id: "data-qa",
    title: "数据问答智能体",
    result: "以测试集驱动，把准确率做到可用",
    detail:
      "以一组常见问题为测试集，经多轮端到端验证把准确率从不可用提升到可用水平。AI 问数最难的不是取数，是澄清——先搞清楚口径和边界，再动手。",
    tags: ["数据智能体", "测试集驱动", "多轮迭代"],
  },
  {
    id: "optimizer",
    title: "资源调度优化引擎",
    result: "AI + 运筹，调度算法落地",
    detail:
      "大型作业场景的资源统筹与冲突解决：多类设备逐时计划，提示词演化 + evaluator 驱动的算法迭代。从立项到落地全程主导。",
    tags: ["运筹优化", "提示词演化", "联合研发"],
  },
  {
    id: "strategy",
    title: "集团级智能化战略规划",
    result: "从需求梳理到关键技术清单",
    detail:
      "完成集团层面的智能化需求梳理，收敛为一份关键技术清单，经集团讨论达成一致认可。大组织做 AI，规划先于工具。",
    tags: ["战略规划", "需求工程", "集团级"],
  },
];

export type Thesis = { no: string; title: string; body: string };

/** 核心观点 — 总纲 + 六条 */
export const thesesIntro =
  "技术每年都在换代，把信念押在某个具体技术上，它迟早随那个技术一起过时。真正恒定的范式不在技术那一侧，在人这一侧。";

export const theses: Thesis[] = [
  {
    no: "01",
    title: "AI 应当人人可用，而不是少数人的技术特权",
    body: "AI 的价值不在于它有多前沿，而在于有多少人能真正用上它。把使用门槛降到最低，比做一个炫技却没人用的对话机器人重要得多。",
  },
  {
    no: "02",
    title: "AI 让人更有价值，而不是取代人的价值",
    body: "方向不是用智障客服替换一线，而是用 AI 把一线人员武装成超级个体。AI 是帮人创造更大价值的杠杆，是助手，不是替身。",
  },
  {
    no: "03",
    title: "把问题表达清楚，比着急要答案更重要",
    body: "人负责定义意图，回答为什么做和做什么；AI 负责执行，回答怎么做。把意图定义清楚，是人不该让渡、也无法让渡的那部分价值。",
  },
  {
    no: "04",
    title: "AI 本质上是反内卷的",
    body: "AI 能让一个人的劳动直接转化成交付给客户的价值，再实实在在回馈到这个人自己身上——把劳动和回报之间被拉长、被截断的链路重新接上。",
  },
  {
    no: "05",
    title: "好的 AI 产品，是更贴合用户核心需求的产品",
    body: "产品的胜负手从来是贴不贴合用户的核心需求，而不是技术够不够炫。这件事说起来朴素，做起来最难。",
  },
  {
    no: "06",
    title: "品味与使命，是人不可被 AI 复制的内核",
    body: "劳作可以交给 AI，但愿景、方向和品味必须是自己的。基于使命去创作，写真正想在这个世界上看到的内容。",
  },
];

export type Post = { title: string; date: string; summary: string };

/** 代表长文 */
export const posts: Post[] = [
  {
    title: "欢迎来到不确定的 2026：Agent 时代的三体",
    date: "2026.01",
    summary:
      "一万五千字年度长文：模型、产品、组织三体互绕，Agent 时代没有稳定轨道，只有持续校准的航向。",
  },
  {
    title: "智能体主导下的期货交易与港口集团的金融定位",
    date: "2026.05",
    summary:
      "三万八千字行业推演，三个判断：AI 替代不了交易所的核心；智能体主导市场将逼迫交易机制重构；这是港口集团换赛道的机会。",
  },
  {
    title: "龙虾纪元 · 智能体的终极形态与终端的最后意义",
    date: "2026.03",
    summary:
      "当智能体可以自我演化，终端还剩下什么意义？一次关于智能体终极形态的思想实验。",
  },
];

export const skills = [
  "Agent 工程 · Harness",
  "Context Engineering",
  "Eval 驱动开发",
  "LangGraph · 多智能体",
  "RAG · LlamaIndex",
  "Spark · Hive 大数据",
  "FastAPI · Python",
  "Next.js · React",
  "企业 AI 培训",
];
