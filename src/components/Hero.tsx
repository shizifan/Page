import { works } from "@/data/works";
import { Reveal } from "./Reveal";

const roles = ["AI ARCHITECT", "AGENT ENGINEERING", "ENTERPRISE AI TRAINER"];

export function Hero() {
  return (
    <section id="top" className="relative border-b border-line overflow-hidden">
      {/* Blueprint grid backdrop */}
      <div className="blueprint absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-14 lg:gap-16 items-center">
          {/* ── Left column ─────────────────────────────── */}
          <div>
            {/* Status line */}
            <Reveal>
              <div className="mono text-xs text-faint tracking-widest flex items-center gap-3 mb-10">
                <span className="dot-live" aria-hidden="true" />
                <span className="text-dim">SYSTEMS ONLINE</span>
                <span aria-hidden="true">·</span>
                <span>SINCE 2012</span>
              </div>
            </Reveal>

            {/* Role tags */}
            <Reveal delay={60}>
              <div className="mono text-[11px] md:text-xs tracking-[0.2em] text-dim flex flex-wrap gap-x-5 gap-y-2 mb-8">
                {roles.map((r, i) => (
                  <span key={r}>
                    {r}
                    {i < roles.length - 1 && (
                      <span className="text-accent ml-5" aria-hidden="true">
                        /
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={120}>
              <h1 className="text-[2.6rem] leading-[1.12] md:text-6xl xl:text-7xl font-bold tracking-tight mb-8">
                让 <span className="text-accent">AI</span> 为人创造价值
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mono text-sm text-faint tracking-[0.28em] mb-10">
                相信未来 / 笃行当下
              </p>
            </Reveal>

            {/* Intro */}
            <Reveal delay={240}>
              <p className="max-w-2xl text-base md:text-lg text-dim leading-[1.9] mb-12">
                AI 架构师，15
                年大数据与人工智能实战。长期在真实重场景里做企业级
                AI，业余把想法做成人人可用的产品——并把所见、所做、所想公开化。
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={300}>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#products"
                  className="mono text-sm bg-accent text-black font-medium px-6 py-3 hover:brightness-110 transition-all duration-200"
                >
                  查看产品 ↓
                </a>
                <a
                  href="#contact"
                  className="mono text-sm border border-line px-6 py-3 text-dim hover:text-accent hover:border-accent/50 transition-colors duration-200"
                >
                  直接联系 →
                </a>
              </div>
            </Reveal>
          </div>

          {/* ── Right column — live deployments console ──── */}
          <Reveal delay={360} className="hidden lg:block">
            <div className="panel">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
                <span className="mono text-[11px] tracking-[0.18em] text-dim">
                  ~/ DEPLOYMENTS
                </span>
                <span className="mono text-[11px] text-ok flex items-center gap-2">
                  <span className="dot-live" aria-hidden="true" />
                  {works.length}
                </span>
              </div>
              <ul>
                {works.map((w) => {
                  const domain = w.link?.replace("https://", "") ?? "";
                  return (
                    <li key={w.id}>
                      <a
                        href={w.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-5 py-3 border-b border-line last:border-0 group"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-ok shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-[13px] text-dim group-hover:text-text transition-colors duration-200 truncate">
                          {w.title.replace(/ ·.*$/, "")}
                        </span>
                        <span className="mono text-[10px] text-faint ml-auto group-hover:text-accent transition-colors duration-200 shrink-0">
                          {domain.replace(".shizifan.com", "")} ↗
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="px-5 py-3 mono text-[10px] tracking-wider text-faint border-t border-line">
                ALL SYSTEMS GO
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
