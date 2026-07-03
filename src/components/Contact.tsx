import { Reveal } from "./Reveal";

// TODO(石子凡)：公众号 / 微信 / GitHub 定下来后在这里补充
const topics = [
  "Agent 工程落地",
  "企业 AI 培训 / 内训",
  "产品合作",
  "或者只是聊聊",
];

export function Contact() {
  return (
    <section id="contact">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <Reveal>
          <p className="sec-label mb-4">
            <b>06</b> / CONTACT
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <Reveal delay={60}>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-8">
                想聊聊？
                <br />
                <a
                  href="mailto:shizifan@gmail.com"
                  className="mono text-accent text-2xl md:text-4xl hover:brightness-110 transition-all duration-200 break-all"
                >
                  shizifan@gmail.com
                </a>
              </h2>
            </Reveal>
          </div>

          <Reveal delay={140}>
            <p className="text-dim text-[15px] leading-relaxed mb-5">
              我长期关注这几件事，如果你也在做，欢迎直接来信：
            </p>
            <ul className="space-y-3">
              {topics.map((t, i) => (
                <li
                  key={t}
                  className="flex items-baseline gap-4 text-[15px] text-dim border-b border-line pb-3"
                >
                  <span className="mono text-xs text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-line flex items-center justify-between flex-wrap gap-3 mono text-xs text-faint tracking-wider">
          <span>© {new Date().getFullYear()} SHIZIFAN.COM</span>
          <div className="flex items-center gap-8">
            <span>相信未来 / 笃行当下</span>
            <a
              href="#top"
              className="hover:text-accent transition-colors duration-200"
              aria-label="回到页面顶部"
            >
              ↑ TOP
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
