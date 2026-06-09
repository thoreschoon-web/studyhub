import Link from "next/link";

const LINKS = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerruf" },
];

/** Pflicht-Links (Impressum etc.) — auf jeder Seite sichtbar, auch auf /login & /register. */
export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-4">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-faint lg:justify-start">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-muted">
            {l.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
