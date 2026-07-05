import { theses, thesesIntro } from "@/data/works";
import { Reveal, SectionHead } from "./Reveal";

export function Theses() {
  return (
    <section id="theses" className="border-b border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <SectionHead
          index="04"
          label="THESES"
          title="真正的范式不在技术，在人"
        />

        <Reveal delay={120}>
          <p className="text-dim text-base md:text-lg leading-[1.9] max-w-3xl -mt-6 mb-14 border-l-2 border-accent pl-5">
            {thesesIntro}
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)] border border-line">
          {theses.map((t, i) => (
            <Reveal key={t.no} delay={(i % 3) * 80} className="bg-bg">
              <div className="panel !border-0 h-full p-7 md:p-8">
                <p className="mono text-xs text-accent mb-4">{t.no}</p>
                <h3 className="text-lg font-bold tracking-tight leading-snug mb-3">
                  {t.title}
                </h3>
                <p className="text-dim text-[14px] leading-[1.85]">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
