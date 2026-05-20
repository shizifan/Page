import { SquiggleLine } from "./Doodles";

const links = [
  {
    label: "Email",
    value: "hello@shizifan.dev",
    href: "mailto:hello@shizifan.dev",
  },
  { label: "GitHub", value: "@shizifan", href: "https://github.com/" },
  { label: "Twitter / X", value: "@shizifan", href: "https://twitter.com/" },
  { label: "微信 · WeChat", value: "shizifan", href: "#" },
];

export function Contact() {
  return (
    <section
      id="contact"
      className="max-w-6xl mx-auto px-6 md:px-12 py-24 border-t border-line"
    >
      <p className="label mb-8">Contact</p>
      <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20 items-start">
        <div>
          <h2 className="font-display-cn text-3xl md:text-4xl text-ink leading-tight mb-3">
            想聊聊？
          </h2>
          <SquiggleLine className="w-20 h-2 text-terracotta mb-5" />
          <p className="text-ink-soft text-[15px] leading-relaxed max-w-xs">
            无论是产品合作、AI 应用咨询，还是只是想交个朋友——
            选一个你顺手的方式联系我。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="flex items-baseline justify-between gap-6 py-4 border-b border-line group"
            >
              <span className="label !text-ink-faded">{l.label}</span>
              <span className="text-ink group-hover:text-terracotta transition-colors text-[15px]">
                {l.value}
              </span>
            </a>
          ))}
        </div>
      </div>

      <footer className="mt-20 pt-8 border-t border-line flex items-center justify-between text-xs text-ink-faded flex-wrap gap-3">
        <span>© {new Date().getFullYear()} 石子凡 · Shi Zifan</span>
        <span>Built with Next.js · Designed in Figma</span>
      </footer>
    </section>
  );
}
