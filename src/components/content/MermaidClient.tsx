"use client";

import { useEffect, useId, useRef, useState } from "react";

const THEMES = {
  dark: {
    background: "#0b0d13",
    primaryColor: "#1a1d29",
    primaryBorderColor: "#3a4153",
    primaryTextColor: "#e9ebf2",
    lineColor: "#6a6679",
    secondaryColor: "#14161f",
    tertiaryColor: "#14161f",
    fontSize: "14px",
  },
  light: {
    background: "#fcfbf7",
    primaryColor: "#ffffff",
    primaryBorderColor: "#ccc7bb",
    primaryTextColor: "#2b2823",
    lineColor: "#9b958a",
    secondaryColor: "#f4f1ea",
    tertiaryColor: "#f4f1ea",
    fontSize: "14px",
  },
};

export function MermaidClient({ code, title, caption }: { code: string; title?: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawId = useId().replace(/[:]/g, "");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let renderSeq = 0;

    async function render() {
      const seq = ++renderSeq;
      try {
        const mermaid = (await import("mermaid")).default;
        const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          fontFamily: "var(--font-sans)",
          themeVariables: THEMES[theme],
        });
        const { svg } = await mermaid.render(`m-${rawId}-${seq}`, code);
        if (!cancelled && seq === renderSeq && ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (!cancelled) setErr(String(e));
      }
    }

    render();

    // Re-render when the theme toggles
    const obs = new MutationObserver((muts) => {
      if (muts.some((m) => m.attributeName === "data-theme")) render();
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelled = true;
      obs.disconnect();
    };
  }, [code, rawId]);

  return (
    <figure className="my-5">
      {title && <div className="mb-2 text-sm font-medium text-text">{title}</div>}
      <div className="overflow-x-auto rounded-xl border border-line bg-plot p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full">
        {err ? <pre className="text-xs text-bad">{err}</pre> : <div ref={ref} />}
      </div>
      {caption && <figcaption className="mt-2 text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}
