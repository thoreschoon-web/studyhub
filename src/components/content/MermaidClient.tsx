"use client";

import { useEffect, useId, useRef, useState } from "react";

export function MermaidClient({ code, title, caption }: { code: string; title?: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawId = useId().replace(/[:]/g, "");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          fontFamily: "var(--font-sans)",
          themeVariables: {
            background: "#0b0d13",
            primaryColor: "#1a1d29",
            primaryBorderColor: "#3a4153",
            primaryTextColor: "#e9ebf2",
            lineColor: "#646b7d",
            secondaryColor: "#14161f",
            tertiaryColor: "#14161f",
            fontSize: "14px",
          },
        });
        const { svg } = await mermaid.render(`m-${rawId}`, code);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (!cancelled) setErr(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, rawId]);

  return (
    <figure className="my-5">
      {title && <div className="mb-2 text-sm font-medium text-text">{title}</div>}
      <div className="overflow-x-auto rounded-xl border border-line bg-[#0b0d13] p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full">
        {err ? <pre className="text-xs text-bad">{err}</pre> : <div ref={ref} />}
      </div>
      {caption && <figcaption className="mt-2 text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}
