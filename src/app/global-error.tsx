"use client";

/** Letzte Verteidigungslinie: Fehler im Root-Layout selbst (ersetzt das komplette HTML). */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#111", color: "#eee" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 40, margin: 0, opacity: 0.5 }}>Ups.</h1>
          <p>StudyHub hat gerade ein Problem. Bitte lade die Seite neu.</p>
          {error.digest && <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.5 }}>Fehler-Code: {error.digest}</p>}
          <button
            onClick={reset}
            style={{ marginTop: 16, padding: "8px 16px", borderRadius: 8, border: "1px solid #444", background: "#222", color: "#eee", cursor: "pointer" }}
          >
            Neu laden
          </button>
        </div>
      </body>
    </html>
  );
}
