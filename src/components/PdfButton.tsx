"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

/**
 * Real PDF download: rasterises the given element exactly as rendered on screen
 * (incl. Karopapier, KaTeX, plots) and paginates it into an A4 PDF file.
 */
export function PdfButton({ targetId, filename, label = "Als PDF" }: { targetId: string; filename: string; label?: string }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    if (busy) return;
    setBusy(true);
    try {
      const node = document.getElementById(targetId);
      if (!node) return;

      const [{ toCanvas }, jspdf] = await Promise.all([import("html-to-image"), import("jspdf")]);
      const JsPDF = jspdf.jsPDF;

      // Cap resolution so the source canvas stays under the browser's max dimension (~32k px).
      const h = node.scrollHeight || 1;
      const pixelRatio = Math.min(2, Math.max(1, Math.floor(30000 / h)));
      const bg = getComputedStyle(node).backgroundColor || getComputedStyle(document.body).backgroundColor;

      const canvas = await toCanvas(node, { pixelRatio, backgroundColor: bg, cacheBust: true });
      const img = canvas.toDataURL("image/jpeg", 0.92);

      const pdf = new JsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;

      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }
      pdf.save(filename);
    } catch (e) {
      console.error("PDF-Export fehlgeschlagen:", e);
      alert("PDF-Export fehlgeschlagen. Details in der Browser-Konsole.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      className="no-print inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/70 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-text disabled:opacity-60"
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
      {busy ? "Erstelle PDF…" : label}
    </button>
  );
}
