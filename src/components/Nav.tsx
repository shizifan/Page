export function Nav() {
  return (
    <nav className="w-full px-6 md:px-12 pt-8 pb-4 flex items-center justify-between max-w-6xl mx-auto">
      <a href="#top" className="flex items-baseline gap-2">
        <span className="font-display text-xl text-ink">Shi Zifan</span>
        <span className="font-display-cn text-base text-ink-faded">石子凡</span>
      </a>
      <div className="hidden md:flex items-center gap-8 text-sm text-ink-soft">
        <a href="#about" className="hover:text-terracotta transition-colors">
          关于
        </a>
        <a href="#works" className="hover:text-terracotta transition-colors">
          作品
        </a>
        <a href="#contact" className="hover:text-terracotta transition-colors">
          联系
        </a>
      </div>
    </nav>
  );
}
