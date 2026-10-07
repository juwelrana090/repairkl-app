"use client";
import { useEffect } from "react";

/**
 * Root error boundary — catches errors the root layout itself throws, so it
 * must render its own <html>/<body> and cannot rely on Tailwind classes
 * (the layout's stylesheet may not have loaded). Inline styles only.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GLOBAL ERROR BOUNDARY]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5fa",
          fontFamily:
            "'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: "0 16px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#001353",
              letterSpacing: "-0.5px",
              margin: "0 0 12px",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#5b6480",
              margin: "0 0 24px",
            }}
          >
            RepairKL hit an unexpected error
            {error?.digest ? ` (ref: ${error.digest})` : ""}. Please try
            again — if it keeps happening, WhatsApp us on +60 11-5580 4809.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                height: 44,
                padding: "0 20px",
                background: "#034795",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                height: 44,
                padding: "0 20px",
                display: "inline-flex",
                alignItems: "center",
                background: "#eeeef6",
                color: "#001353",
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
