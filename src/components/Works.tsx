import { works, type Work } from "@/data/works";
import { ArrowRight } from "./Doodles";

const accentMap: Record<Work["color"], string> = {
  terracotta: "linear-gradient(135deg, #efc8b5 0%, #d8a18a 100%)",
  sage: "linear-gradient(135deg, #cfd9b8 0%, #aab98a 100%)",
  peach: "linear-gradient(135deg, #f0cfb1 0%, #d9a47e 100%)",
  mustard: "linear-gradient(135deg, #e8d398 0%, #c9a85a 100%)",
  rose: "linear-gradient(135deg, #e6c5cb 0%, #c69aa3 100%)",
};

const categoryLabel: Record<Work["category"], string> = {
  design: "Product · 产品",
  code: "Engineering · 工程",
  writing: "Writing · 写作",
  other: "Other",
};

function WorkCard({ work, index }: { work: Work; index: number }) {
  const idx = String(index + 1).padStart(2, "0");
  return (
    <article className="editorial-card overflow-hidden flex flex-col h-full group">
      {/* Cover band — subtle gradient, no childish doodle */}
      <div
        className="h-32 relative flex items-end justify-between px-5 pb-4"
        style={{ background: accentMap[work.color] }}
      >
        <span className="font-display italic text-3xl text-ink/75">
          {work.subtitle}
        </span>
        <span className="label !text-ink/55">{idx}</span>
      </div>

      <div className="p-6 md:p-7 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3 text-xs text-ink-faded">
          <span className="label !text-ink-faded">
            {categoryLabel[work.category]}
          </span>
          <span>{work.year}</span>
        </div>

        <h3 className="font-display-cn text-2xl text-ink leading-snug mb-2">
          {work.title}
        </h3>

        <p className="text-ink-soft text-[15px] leading-[1.75] mb-5 flex-1">
          {work.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {work.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-line">
          <span className="text-xs text-ink-faded">{work.audience}</span>
          <span className="inline-flex items-center gap-2 text-sm text-ink-soft group-hover:text-terracotta transition-colors">
            了解更多 <ArrowRight className="w-4 h-2 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function Works() {
  return (
    <section
      id="works"
      className="max-w-6xl mx-auto px-6 md:px-12 py-24 border-t border-line"
    >
      <div className="mb-14 flex items-end justify-between flex-wrap gap-6">
        <div>
          <p className="label mb-4">Selected Works</p>
          <h2 className="font-display-cn text-3xl md:text-4xl text-ink leading-tight">
            最近的一些工作
          </h2>
        </div>
        <p className="text-ink-soft text-[15px] max-w-sm leading-relaxed">
          从企业级 BI Agent，到面向儿童的 AI 素养教育，再到个人知识系统——
          一组围绕"让 AI 真正可用"展开的实践。
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {works.map((w, i) => (
          <WorkCard key={w.id} work={w} index={i} />
        ))}
      </div>
    </section>
  );
}
