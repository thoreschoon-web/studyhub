import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <div className="text-6xl font-bold text-faint">404</div>
        <p className="mt-3 text-muted">Diese Seite gibt es (noch) nicht.</p>
        <Link href="/" className="mt-5 inline-block rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm font-medium hover:bg-surface-3">
          Zur Übersicht
        </Link>
      </div>
    </div>
  );
}
