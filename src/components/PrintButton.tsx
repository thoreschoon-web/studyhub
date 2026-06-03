"use client";

import { Download } from "lucide-react";

export function PrintButton({ label = "Als PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/70 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-text"
    >
      <Download size={15} /> {label}
    </button>
  );
}
