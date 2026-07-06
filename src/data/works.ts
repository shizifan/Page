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
    id: "poti",
    title: "破题 · 学者的申报参谋",
    subtitle: "破题",
    description:
      "帮高校教师拿下基金本子的 AI 参谋。上传简历、论文、课题，LLM 编译成你的一组活文档画像，再从画像里长出申报方向、立项依据与研究基础初稿——不替你写本子，而是把你多年的积累先码放整齐。",
    tags: ["FastAPI", "Next.js", "画像引擎", "DeepSeek"],
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

/** 代表长文（档案区按此顺序展示） */
export const posts: Post[] = [
  {
    title: "欢迎来到不确定的 2026：Agent 时代的三体",
    date: "2026.01.01",
    summary:
      "模型、产品、组织三体互绕，Agent 时代没有稳定轨道，只有持续校准的航向。",
  },
  {
    title: "推荐一个远超预期的数据智能体平台",
    date: "2026.02.11",
    summary:
      "拆解亿问 Data Agent：一个不碰计算的逻辑左脑管准，一个懂人话的语义右脑管暖。BI 要的严谨、AI 要的灵活，各归各。",
  },
  {
    title: "再推荐一个远超预期的智能体编程平台",
    date: "2026.02.12",
    summary:
      "拆解 Qoder：用上下文工程把代码库的隐性知识挖出来，让 AI 从补全助手变成能扛异步长任务的执行者。对着《人月神话》那四道老题。",
  },
  {
    title: "万字长文：我们如何提升 AI 流利度",
    date: "2026.03.24",
    summary:
      "别把 AI 当打字机，当能来回磨的思考搭子。调研、探讨、生成、修正——给足上下文，出来的东西才不是通用废话。",
  },
  {
    title: "推荐一个远超预期的数字员工平台：Clawith",
    date: "2026.03.29",
    summary:
      "任务编排还是持久身份，两条路。给智能体真的记忆和身份，让它像个会认识你的数字同事一路长下去，而不是用完即弃的工具。",
  },
  {
    title: "从哈萨比斯出发：我们需要一种面向世界的 AI 教育",
    date: "2026.04.06",
    summary:
      "从哈萨比斯说起，他一辈子带着真问题在移动。AI 教育该从工具素养转向问题素养——先问这问题值不值得解，再谈用什么工具。",
  },
  {
    title: "AI 如何评估工作量",
    date: "2026.06.24",
    summary:
      "AI 报工期不是在算，是在认——把你的活儿投进它学过的「任务-工时」分布里认个数。人天，是这个时代的马力，连规划谬误都一并继承了。",
  },
  {
    title: "如何评估 AI 的工作量",
    date: "2026.06.30",
    summary:
      "生成和验证本是两笔账，过去捆在一个人天里估。AI 只加速了生成，验证还走一半——老的工作量估法，在 AI 时代失灵了。",
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
