import { ImageResponse } from "next/og";
import { getDictionary, hasLocale, Locale } from "./dictionaries";
import { NAME_AR, NAME_EN } from "@/lib/company";

/**
 * Default share-card image for every page under a locale, unless a more
 * specific route defines its own (products/[slug]/opengraph-image.tsx
 * overrides this for product pages). Before this, links shared on
 * WhatsApp — the primary channel here — previewed with no image at all.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isAr = hasLocale(lang) ? lang === "ar" : true;
  const dict = hasLocale(lang) ? await getDictionary(lang as Locale) : null;
  const siteName = isAr ? NAME_AR : NAME_EN;
  const tagline = dict
    ? isAr
      ? "توريد وصيانة طلمبات ومواتير الآبار"
      : "Supply & maintenance of deep-well pumps and motors"
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0e3b2e",
          color: "#f6f5ef",
        }}
      >
        <div style={{ width: 64, height: 4, background: "#d2ab5c", marginBottom: 32 }} />
        <div style={{ fontSize: 72, fontWeight: 800, display: "flex" }}>{siteName}</div>
        {tagline && (
          <div style={{ fontSize: 32, marginTop: 24, color: "#f6f5efcc", display: "flex" }}>
            {tagline}
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
