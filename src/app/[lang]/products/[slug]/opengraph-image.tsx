import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getCatalogProduct } from "@/lib/products";
import { NAME_AR, NAME_EN } from "@/lib/company";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProductOpengraphImage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const product = await getCatalogProduct(slug, lang);
  const isAr = lang === "ar";
  const siteName = isAr ? NAME_AR : NAME_EN;

  // Read from the local public/ folder (process.cwd() is the project
  // root), not a fetch to the live domain — this runs at build time,
  // before the build it's building has been deployed anywhere.
  const galleryPath = product?.gallery[0];
  let photoDataUri: string | null = null;
  if (galleryPath) {
    try {
      const buf = await readFile(join(process.cwd(), "public", galleryPath));
      const ext = galleryPath.split(".").pop()?.toLowerCase();
      const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
      photoDataUri = `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      // Missing/unreadable file — fall back to the text-only card below.
      photoDataUri = null;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0e3b2e",
          color: "#f6f5ef",
        }}
      >
        {photoDataUri && (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) renders its own <img>, not next/image
          <img
            src={photoDataUri}
            alt=""
            width={560}
            height={630}
            style={{ objectFit: "contain", background: "#f6f5ef" }}
          />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px",
          }}
        >
          <div style={{ width: 56, height: 4, background: "#d2ab5c", marginBottom: 28 }} />
          <div style={{ fontSize: 48, fontWeight: 800, display: "flex", lineHeight: 1.2 }}>
            {product?.title ?? siteName}
          </div>
          <div style={{ fontSize: 24, marginTop: 20, color: "#f6f5efcc", display: "flex" }}>
            {siteName}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
