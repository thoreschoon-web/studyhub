"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
    // Einmaliger Post-Hydration-Sync mit dem vom Init-Script gesetzten DOM-Attribut.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("studyhub.theme", next);
    } catch {}
    setTheme(next);
  }

  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={isDark ? "Heller Modus" : "Dunkler Modus"}
        className={cn("rounded-lg border border-line p-2 text-muted transition-colors hover:text-text", className)}
        suppressHydrationWarning
      >
        <Icon size={17} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Heller Modus" : "Dunkler Modus"}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-muted transition-colors hover:text-text",
        className,
      )}
      suppressHydrationWarning
    >
      <Icon size={16} />
      <span>{mounted ? (isDark ? "Heller Modus" : "Dunkler Modus") : "Theme"}</span>
    </button>
  );
}
