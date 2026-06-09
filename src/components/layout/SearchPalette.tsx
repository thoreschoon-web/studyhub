"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_MAP } from "@/lib/subjects";
import { Search, CornerDownLeft } from "lucide-react";

type Hit = { topicId: string; subjectId: string; title: string; summary: string; heading?: string };

/**
 * Cmd/Ctrl+K-Suchpalette über alle Themen. Öffnet auch über das
 * CustomEvent "studyhub:search" (Trigger in Sidebar/MobileTopBar).
 */
export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("studyhub:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("studyhub:search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setHits([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    abortRef.current?.abort();
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        const j = await r.json();
        setHits(j.hits ?? []);
        setActive(0);
      } catch {
        /* abgebrochen oder offline — Ergebnisse einfach stehen lassen */
      }
    }, 150);
    return () => clearTimeout(id);
  }, [q]);

  const go = useCallback(
    (h: Hit) => {
      setOpen(false);
      router.push(`/${h.subjectId}/${h.topicId}`);
    },
    [router],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-bg-soft shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={17} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, hits.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && hits[active]) {
                e.preventDefault();
                go(hits[active]);
              }
            }}
            placeholder="Thema suchen…  (z. B. Lagrange, Hypothesentest, § 433)"
            className="w-full bg-transparent py-3.5 text-sm focus:outline-none"
          />
          <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.65rem] text-faint">esc</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim().length >= 2 && hits.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">Keine Themen gefunden.</p>
          )}
          {hits.map((h, i) => {
            const meta = SUBJECT_MAP[h.subjectId as keyof typeof SUBJECT_MAP];
            return (
              <button
                key={`${h.subjectId}/${h.topicId}`}
                onClick={() => go(h)}
                onMouseEnter={() => setActive(i)}
                className={
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left " +
                  (i === active ? "bg-surface-2" : "")
                }
              >
                {meta && (
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] border text-[0.85rem]"
                    style={{
                      color: meta.accent,
                      borderColor: `color-mix(in oklab, ${meta.accent} 32%, transparent)`,
                      background: `color-mix(in oklab, ${meta.accent} 10%, transparent)`,
                    }}
                  >
                    {meta.icon}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-text">{h.title}</span>
                  <span className="block truncate text-xs text-muted">
                    {meta?.short}
                    {h.heading ? ` · ${h.heading}` : ""}
                  </span>
                </span>
                {i === active && <CornerDownLeft size={14} className="shrink-0 text-faint" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
