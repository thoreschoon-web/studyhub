"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabDef {
  id: string;
  label: string;
  badge?: number;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export function TabsShell({ tabs, initial }: { tabs: TabDef[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  return (
    <div>
      <div className="no-print sticky top-0 z-20 -mx-1 mb-6 flex gap-1 overflow-x-auto border-b border-line bg-bg/80 px-1 pb-px pt-1 backdrop-blur-md">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
              active === t.id ? "text-text" : "text-muted hover:text-text",
            )}
          >
            {t.icon}
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[0.65rem] tabular-nums text-muted">{t.badge}</span>
            )}
            {active === t.id && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ background: "var(--accent)" }} />
            )}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} className={cn(active === t.id ? "block animate-fade-in" : "hidden")}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
