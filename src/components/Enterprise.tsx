import { enterpriseWorks } from "@/data/works";
import { Reveal, SectionHead } from "./Reveal";

export function Enterprise() {
  return (
    <section id="engineering" className="border-b border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <SectionHead
          index="03"
          label="ENTERPRISE ENGINEERING"
          title="企业级工程"
          note="企业内的工作没有公开链接，只讲能讲的：方法与数字。"
        />

        <div className="border-t border-line">
          {enterpriseWorks.map((w, i) => (
            <Reveal
              key={w.id}
              as="article"
              delay={i * 60}
              className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-5 lg:gap-16 py-10 border-b border-line"
            >
              <div>
                <p className="mono text-xs text-faint mb-3">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-snug mb-3">
                  {w.title}
                </h3>
                <p className="mono text-sm text-accent leading-relaxed">
                  {w.result}
                </p>
              </div>
              <div>
                <p className="text-dim text-[15px] leading-[1.9] mb-5">
                  {w.detail}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {w.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
