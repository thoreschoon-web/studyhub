"use client";

import Link from "next/link";
import { useState } from "react";
import { SUBJECTS } from "@/lib/subjects";
import { Menu, X, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function MobileTopBar() {
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  return (
    <header className="app-header no-print sticky top-0 z-40 flex items-center justify-between border-b border-line bg-bg-soft/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-[var(--radius)] bg-heading font-display text-sm font-bold text-bg">
          S
        </span>
        <span className="font-display font-semibold tracking-tight text-heading">StudyHub</span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.dispatchEvent(new Event("studyhub:search"))}
          className="rounded-lg border border-line p-2 text-muted"
          aria-label="Suche"
        >
          <Search size={18} />
        </button>
        <ThemeToggle compact />
        <button onClick={() => setOpen((o) => !o)} className="rounded-lg border border-line p-2 text-muted" aria-label="Menü">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-bg-soft p-3 shadow-xl">
          <Link href="/" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface">
            Übersicht
          </Link>
          {SUBJECTS.map((s) => (
            <Link
              key={s.id}
              href={`/${s.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface"
            >
              <span style={{ color: s.accent }} className="font-semibold">
                {s.icon}
              </span>
              {s.title}
            </Link>
          ))}
          <div className="my-1 border-t border-line" />
          <Link href="/karteikarten" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface">
            Karteikarten
          </Link>
          <Link href="/klausur" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface">
            Klausur-Simulator
          </Link>
          <Link href="/tutor" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface">
            KI-Tutor
          </Link>
          {status === "unauthenticated" && (
            <>
              <div className="my-1 border-t border-line" />
              <Link href="/register" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold" style={{ color: "var(--accent)" }}>
                Registrieren
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface">
                Anmelden
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
