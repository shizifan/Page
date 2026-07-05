"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#metrics", label: "关于" },
    { href: "#products", label: "产品" },
    { href: "#engineering", label: "工程" },
    { href: "#theses", label: "观点" },
    { href: "#writing", label: "写作" },
    { href: "#contact", label: "联系" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-scrolled" : ""
      }`}
    >
      <div className="w-full px-6 md:px-10 h-16 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo — slogan, no name */}
        <a
          href="#top"
          className="flex items-center gap-2.5 group"
          aria-label="让 AI 为人创造价值"
        >
          <span className="text-accent mono text-sm leading-none">▍</span>
          <span className="text-sm font-medium tracking-wide text-text group-hover:text-accent transition-colors duration-200">
            让 <span className="text-accent">AI</span> 为人创造价值
          </span>
        </a>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-7 text-sm text-dim">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-accent transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/"
            className="mono text-xs border border-accent/40 text-accent px-3 py-1.5 hover:bg-accent hover:text-white transition-colors duration-200"
          >
            🗺️ 世界地图
          </Link>
          <a
            href="mailto:shizifan@gmail.com"
            className="mono text-xs border border-line px-3 py-1.5 text-dim hover:text-accent hover:border-accent/50 transition-colors duration-200"
          >
            EMAIL ↗
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 -mr-1"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-px bg-text origin-center transition-all duration-300 ${
              menuOpen ? "w-5 rotate-45 translate-y-[6px]" : "w-5"
            }`}
          />
          <span
            className={`block h-px bg-text transition-all duration-300 ${
              menuOpen ? "w-0 opacity-0" : "w-4"
            }`}
          />
          <span
            className={`block h-px bg-text origin-center transition-all duration-300 ${
              menuOpen ? "w-5 -rotate-45 -translate-y-[6px]" : "w-5"
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        } ${scrolled || menuOpen ? "nav-scrolled" : ""}`}
      >
        <div className="border-t border-line px-8 py-5 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-base text-text hover:text-accent transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/"
            className="text-base text-accent hover:brightness-110 transition-all duration-200"
          >
            🗺️ 世界地图版
          </Link>
        </div>
      </div>
    </nav>
  );
}
