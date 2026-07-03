"use client";

import { useEffect, useRef, useState } from "react";

/** Fade-up on first viewport entry. Wrap any block; delay in ms. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "p" | "h2" | "h3";
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag
      ref={ref as any}
      className={`${inView ? "reveal" : "pre-reveal"} ${className}`}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Section header: `NN / LABEL` + Chinese title, engineering-drawing style. */
export function SectionHead({
  index,
  label,
  title,
  note,
}: {
  index: string;
  label: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="mb-12 md:mb-16">
      <Reveal>
        <p className="sec-label mb-4">
          <b>{index}</b> / {label}
        </p>
      </Reveal>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <Reveal delay={60}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {title}
          </h2>
        </Reveal>
        {note && (
          <Reveal delay={120}>
            <p className="text-dim text-sm max-w-md leading-relaxed">{note}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
