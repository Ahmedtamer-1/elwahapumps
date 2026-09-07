import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Redirect rules for every URL indexed on the old WordPress site
 * (PLAN.md Stage 2), parsed from scripts/legacy-urls.txt rather than
 * duplicated here — the two would otherwise drift, and the txt file is
 * also what scripts/verify-redirects.mjs reads to check these actually
 * work post-deploy.
 *
 * Source patterns must be percent-encoded (encodeURI), not the literal
 * decoded string — confirmed by testing against a running server with a
 * diagnostic rule in both forms: the encoded form matched, the literal
 * Arabic text did not. This is the opposite of what seemed like the more
 * likely behaviour going in, which is exactly the trap PLAN.md's S2-T03
 * warned this would be. Hex case (uppercase vs the sitemap's lowercase)
 * did not matter in that same test.
 */
function legacyRedirects() {
  const raw = readFileSync(join(process.cwd(), "scripts", "legacy-urls.txt"), "utf-8");
  const rules: { source: string; destination: string; permanent: true }[] = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [oldPath, newPath] = trimmed.split("\t");
    if (!oldPath || newPath === undefined) continue;
    // "/" itself is handled by src/proxy.ts (S2-T05), not a redirects()
    // rule — a rule here would compete with it.
    if (oldPath === "/") continue;

    const destination = newPath.startsWith("/sitemap")
      ? newPath
      : `/ar${newPath === "/" ? "" : newPath}`;

    // A source ending in "/" never matches here — confirmed against a
    // running server, not assumed — so every legacy URL, which the old
    // site always served (and Google always indexed) WITH a trailing
    // slash, needs the slash-less form to redirect straight to its real
    // destination.
    const slashless = oldPath.endsWith("/") ? oldPath.slice(0, -1) : oldPath;
    const source = encodeURI(slashless);
    rules.push({ source, destination, permanent: true });
  }

  return rules;
}

const nextConfig: NextConfig = {
  experimental: {
    // The site has two independent root layouts — [lang]/layout.tsx (public,
    // ar/en) and admin/layout.tsx — so there's no single layout to compose a
    // plain not-found.tsx from for genuinely unmatched top-level paths (an
    // invalid /:lang segment, e.g. /xyz, which fails hasLocale() inside the
    // [lang] layout itself and so bubbles past it). global-not-found.tsx
    // handles that case; [lang]/not-found.tsx handles everything else.
    globalNotFound: true,
  },
  images: {
    // The Unsplash hero placeholder (S4-T01) is gone — every image now
    // comes from this site's own /public, so no remote host needs to be
    // allow-listed any more.
    remotePatterns: [],
    // Next 16 rejects any `quality` prop not in this list (default: [75]).
    // A few logo/partner components request 95 for crisp small marks — add
    // it explicitly instead of stripping their quality prop, since without
    // this the optimizer 400s and every one of those images breaks in prod.
    qualities: [75, 95],
    // AVIF first, WebP as the fallback for browsers that don't support it
    // yet — next/image picks whichever the request's Accept header allows.
    formats: ["image/avif", "image/webp"],
    // Re-encoded source photographs (S4-T04) don't change once published;
    // a long TTL means the optimizer doesn't have to regenerate the same
    // variant on every cache eviction. 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [
      {
        // Re-encoded, static, and named by content — safe to cache hard.
        // immutable is honest here: these files don't change in place,
        // a replacement gets a new filename.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Datasheets are updated occasionally without a filename change,
        // so a shorter max-age plus revalidation instead of immutable.
        source: "/Catalogue/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, must-revalidate" }],
      },
    ];
  },

  async redirects() {
    return [
      {
        // The "Thrust Bearings" category became "Spare Parts" when Motor
        // Winding Wire moved into it, which changed its slug. Anything
        // already pointing at the old URL would otherwise 404 — the Brand
        // Report counted dead links among the things costing enquiries.
        source: '/:lang/products/category/thrust-bearings',
        destination: '/:lang/products/category/spare-parts',
        permanent: true,
      },
      ...legacyRedirects(),
    ];
  },
};

export default nextConfig;
