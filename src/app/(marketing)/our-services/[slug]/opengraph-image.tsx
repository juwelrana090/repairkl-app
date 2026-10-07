import { ImageResponse } from "next/og";
import { SERVICES } from "@/lib/serviceContent";

// Per-service social card (SEO plan Step 13) — overrides the default card for
// /our-services/[slug]. Satori constraints: inline styles, flex layout only.
export const alt = "RepairKL service — book verified technicians in Kuala Lumpur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#001353",
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 44,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Repair<span style={{ color: "#fb6f27" }}>KL</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 24px",
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.25)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 24,
            }}
          >
            repairkl.com
          </div>
        </div>

        {/* Headline block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: 96,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#fb6f27",
              marginBottom: 32,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            {service ? service.name : "Appliance Repair"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#7ea6e0",
              marginTop: 20,
            }}
          >
            Verified technicians • Kuala Lumpur & Selangor
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.7)",
              fontSize: 26,
            }}
          >
            repairkl.com/our-services/{slug}
          </div>
          <div
            style={{
              display: "flex",
              padding: "12px 28px",
              borderRadius: 999,
              backgroundColor: "#034795",
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 500,
            }}
          >
            Book on WhatsApp
          </div>
        </div>
      </div>
    ),
    size,
  );
}
