import { ArrowRight } from "./Doodles";

export function Hero() {
  return (
    <section
      id="top"
      className="relative max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-28 md:pt-24 md:pb-36"
    >
      <p className="label mb-8">Portfolio · 2025</p>

      <h1 className="font-display-cn text-5xl md:text-7xl leading-[1.15] text-ink mb-8 max-w-4xl">
        和 <span className="squiggle">AI</span> 一起，
        <br />
        把好工具带给更多人。
      </h1>

      <p className="max-w-2xl text-lg md:text-xl text-ink-soft leading-relaxed mb-12">
        我是 <span className="font-display italic text-ink">石子凡</span>
        ，一名产品工程师与全栈开发者。
        日常用 <span className="mark">Vibe Coding</span>{" "}
        构建产品，关注 AI 趋势，相信好的 AI 应用能让普通人也享受到智能带来的杠杆。
      </p>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <a
          href="#works"
          className="inline-flex items-center gap-3 bg-ink text-paper px-6 py-3 rounded-full text-sm font-medium hover:bg-terracotta transition-colors"
        >
          查看作品
          <ArrowRight className="w-5 h-2.5" />
        </a>
        <a
          href="#contact"
          className="text-sm text-ink-soft hover:text-terracotta transition-colors"
        >
          或者直接联系我 →
        </a>
      </div>
    </section>
  );
}
