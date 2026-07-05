import OrchWorld from "@/components/world2d/OrchWorld";

export default function Page() {
  return (
    <>
      <noscript>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          这张系统图需要 JavaScript 才能运行。
          <a href="/classic" style={{ textDecoration: "underline" }}>
            前往简历版 →
          </a>
        </div>
      </noscript>
      <OrchWorld />
    </>
  );
}
