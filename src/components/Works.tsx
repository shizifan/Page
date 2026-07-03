import { works } from "@/data/works";
import { Reveal, SectionHead } from "./Reveal";

export function Works() {
  return (
    <section id="products" className="border-b border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <SectionHead
          index="02"
          label="LIVE PRODUCTS"
          title="线上产品"
          note="六个已上线、可点开试用的产品。全部独立完成——产品、开发、部署、运维。"
        />

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-px bg-[rgba(230,238,245,0.09)] border border-line">
          {works.map((w, i) => {
            const domain = w.link?.replace("https://", "") ?? "";
            return (
              <Reveal key={w.id} delay={(i % 3) * 80} className="bg-bg">
                <a
                  href={w.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="panel panel-accent !border-0 flex flex-col h-full p-7 md:p-8 group"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="mono text-xs text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mono text-[10px] tracking-[0.18em] text-ok flex items-center gap-2">
                      <span className="dot-live" aria-hidden="true" />
                      LIVE
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-1 group-hover:text-accent transition-colors duration-200">
                    {w.title}
                  </h3>
                  <p className="mono text-[11px] text-faint tracking-wider mb-5">
                    {w.audience} · {w.year}
                  </p>

                  <p className="text-dim text-[14.5px] leading-[1.85] mb-6 flex-1">
                    {w.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {w.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mono text-xs flex items-center justify-between pt-4 border-t border-line">
                    <span className="text-faint group-hover:text-dim transition-colors duration-200">
                      {domain}
                    </span>
                    <span className="text-dim group-hover:text-accent transition-all duration-200 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
