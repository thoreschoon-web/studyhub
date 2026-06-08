"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUBJECTS } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Layers, Sparkles, GraduationCap, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="no-print sticky top-0 hidden h-screen flex-col border-r border-line bg-bg-soft/80 px-3 py-5 backdrop-blur-xl lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-teal-400 text-lg font-bold text-white shadow-lg">
          ◆
        </span>
        <div className="leading-tight">
          <div className="font-display text-[1.15rem] font-medium tracking-tight">StudyHub</div>
          <div className="label-mono mt-0.5">SoSe 26</div>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <NavItem href="/" icon={<LayoutDashboard size={17} />} label="Übersicht" active={isActive("/")} />

        <div className="mt-5 mb-2 px-3 label-mono">
          Fächer
        </div>
        {SUBJECTS.map((s) => {
          const href = `/${s.id}`;
          const active = isActive(href);
          return (
            <Link
              key={s.id}
              href={href}
              style={{ "--accent": s.accent } as React.CSSProperties}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-surface-2 text-text" : "text-muted hover:bg-surface/70 hover:text-text",
              )}
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-[0.95rem] font-semibold"
                style={{
                  color: s.accent,
                  borderColor: `color-mix(in oklab, ${s.accent} 35%, transparent)`,
                  background: `color-mix(in oklab, ${s.accent} 12%, transparent)`,
                }}
              >
                {s.icon}
              </span>
              <span className="flex-1 truncate">{s.short}</span>
              {active && <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.accent }} />}
            </Link>
          );
        })}

        <div className="mt-5 mb-2 px-3 label-mono">
          Werkzeuge
        </div>
        <NavItem href="/karteikarten" icon={<Layers size={17} />} label="Karteikarten" active={isActive("/karteikarten")} />
        <NavItem href="/klausur" icon={<GraduationCap size={17} />} label="Klausur-Simulator" active={isActive("/klausur")} />
        <NavItem href="/tutor" icon={<Sparkles size={17} />} label="KI-Tutor" active={isActive("/tutor")} />
      </nav>

      <ThemeToggle className="mt-3 w-full justify-center" />

      {session?.user && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-surface/40 px-2.5 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold uppercase text-muted">
            {(session.user.email ?? "?").slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium" title={session.user.email ?? ""}>{session.user.email}</div>
            <div className="text-[0.65rem] text-faint">Angemeldet</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg p-1.5 text-faint transition-colors hover:text-bad"
            aria-label="Abmelden"
            title="Abmelden"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-surface-2 text-text" : "text-muted hover:bg-surface/70 hover:text-text",
      )}
    >
      <span className={cn("shrink-0", active && "text-text")}>{icon}</span>
      <span className="flex-1">{label}</span>
    </Link>
  );
}
