import { posts } from "@/data/works";
import { Reveal, SectionHead } from "./Reveal";

export function Writing() {
  return (
    <section id="writing" className="border-b border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <SectionHead
          index="05"
          label="WRITING"
          title="长文代表作"
          note="写作是我的第二条产线：把真实场景里的判断沉淀成万字长文。"
        />

        <div className="border-t border-line">
          {posts.map((p, i) => (
            <Reveal
              key={p.title}
              as="article"
              delay={i * 60}
              className="grid md:grid-cols-[110px_minmax(0,5fr)_minmax(0,6fr)] gap-3 md:gap-10 py-8 border-b border-line items-baseline"
            >
              <span className="mono text-xs text-faint tracking-wider">
                {p.date}
              </span>
              <h3 className="text-lg md:text-xl font-bold tracking-tight leading-snug">
                {p.title}
              </h3>
              <p className="text-dim text-[14.5px] leading-[1.85]">
                {p.summary}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
