import { skills } from "@/data/works";
import { Reveal, SectionHead } from "./Reveal";

const metrics = [
  { value: "15", unit: "年", label: "大数据与 AI 实战" },
  { value: "6", unit: "个", label: "已上线个人产品" },
  { value: "10", unit: "+", label: "企业级 AI 项目落地" },
  { value: "数千", unit: "人", label: "单场培训覆盖" },
];

const track = [
  { period: "2012—2016", area: "大数据平台", note: "离线计算 · 广告计算 · 核心指标体系" },
  { period: "2016—2018", area: "人工智能中台", note: "多行业头部客户的运维平台产品" },
  { period: "2018—2025", area: "数字化运营平台", note: "统一门户 · RAG 知识问答 · 智能客服" },
  { period: "2025——", area: "AI 智能体平台", note: "跨业务场景的 Agent 架构设计与落地" },
];

export function About() {
  return (
    <section id="metrics" className="border-b border-line">
      {/* Metrics strip */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line-strong)] border border-line-strong">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 70} className="bg-raise p-6 md:p-8">
              <div className="metric">
                {m.value}
                <em>{m.unit}</em>
              </div>
              <p className="text-[13px] text-dim mt-3">{m.label}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* About body */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <SectionHead index="01" label="PROFILE" title="关于我" />

        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* Left — narrative */}
          <div className="space-y-6 text-dim text-base md:text-[17px] leading-[1.95]">
            <Reveal as="p">
              从 2012
              年起，我做过互联网离线计算平台、广告大数据、智能运维和数字化运营平台；现在的角色是
              AI 架构师，
              <span className="text-text">
                主导跨业务场景的智能体系统架构设计与落地
              </span>
              。
            </Reveal>
            <Reveal as="p" delay={80}>
              我写三类东西：Agent 工程的实操方法，工业重场景里 AI
              落地的真实边界，大组织做 AI
              的非技术路径。此外，我做过几十场企业级 AI
              培训与分享，
              <span className="text-text">单场覆盖数千人规模</span>。
            </Reveal>

            <Reveal delay={140}>
              <div className="pt-4">
                <p className="sec-label mb-4">
                  <b>&gt;</b> STACK
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right — track record */}
          <Reveal delay={100}>
            <p className="sec-label mb-5">
              <b>&gt;</b> TRACK
            </p>
            <div className="border-t border-line">
              {track.map((t) => (
                <div
                  key={t.period}
                  className="grid grid-cols-[105px_1fr] md:grid-cols-[130px_1fr] gap-4 py-4 border-b border-line items-baseline"
                >
                  <span className="mono text-xs text-faint tracking-wider">
                    {t.period}
                  </span>
                  <span className="text-[15px] leading-relaxed">
                    <span className="text-text font-medium">{t.area}</span>
                    <span className="text-faint"> · {t.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
