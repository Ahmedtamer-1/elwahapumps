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

// STAGING=1 bakes noindex into this build: robots.txt disallows everything
// and every response carries X-Robots-Tag. That is right for
// new.elwahapumps.com and would de-index the real site, and the cPanel app's
// environment keeps STAGING set until someone removes it. So the build says
// so, loudly, rather than leaving it to be noticed in Search Console weeks
// after cutover.
if (process.env.STAGING === "1") {
  console.warn(
    "\n⚠  STAGING=1: this build is NOINDEX (robots.txt Disallow: / and X-Robots-Tag: noindex, nofollow).\n" +
      "   Correct for new.elwahapumps.com only. Unset STAGING and rebuild before this serves elwahapumps.com.\n",
  );
}

const nextConfig: NextConfig = {
  // cPanel's Node.js selector makes node_modules a symlink into
  // ~/nodevenv/<app>/<version>, outside the project, and Turbopack refuses to
  // build through a symlink that leaves its root. On the server the build runs
  // with TURBOPACK_ROOT=$HOME so the root covers both. Locally it is unset and
  // Next infers the root as before.
  ...(process.env.TURBOPACK_ROOT ? { turbopack: { root: process.env.TURBOPACK_ROOT } } : {}),
  experimental: {
    // Shared hosting caps the process count (LVE). Next starts one build
    // worker per CPU it can see (23 there), and spawning fails with EAGAIN.
    // The server build sets NEXT_BUILD_CPUS=2. Locally it is unset and the
    // default applies.
    ...(process.env.NEXT_BUILD_CPUS ? { cpus: Number(process.env.NEXT_BUILD_CPUS) } : {}),
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
      // Staging copy only (new.elwahapumps.com): keep every response out of
      // search indexes. Headers are fixed at build time, so this follows the
      // STAGING the build ran with, the same as src/app/robots.ts.
      ...(process.env.STAGING === "1"
        ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
        : []),
      {
        // Applied to everything. HSTS is only honoured over HTTPS, so it is
        // inert in local development and takes effect once deployed.
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            // Nothing on this site uses any of these. Denying them means a
            // compromised third-party script cannot silently reach for one.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            /*
              Enforcing. This ran report-only first, as the plan called
              for — a CSP that silently breaks the distributor map or the
              pump selector is worse than none — and was switched on once
              every page (map, selector, contact embed, header search,
              admin) loaded clean under it with no violations in the
              console. If something new needs a host, add it below with
              the reason, the way the existing ones are.

              Every allowance below is here because something on the site
              actually needs it — the hosts were taken from the code, not
              guessed:
                *.basemaps.cartocdn.com (img-src) — the distributor map's
                  raster tiles are PNGs fetched as images, from four
                  subdomains. A draft of this policy omitted them, which
                  would have blanked the map the moment it was enforced.
                www.google.com (frame-src) — the contact page's embedded
                  map is an iframe, and with no frame-src it would have
                  fallen back to default-src and been blocked.
                blob: (worker-src, img-src) — maplibre builds its workers
                  and some textures from blob URLs.
                'unsafe-inline' / 'unsafe-eval' (script-src) — Next's own
                  inline bootstrap. Removing these needs nonce-based CSP,
                  which is a task of its own.
                'unsafe-inline' (style-src) — inline styles, including the
                  hero scrim and the logo's own sizing.

              frame-ancestors 'none' blocks clickjacking site-wide; the
              admin area also gets X-Frame-Options below for older clients.
            */
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://*.basemaps.cartocdn.com",
              "worker-src 'self' blob:",
              "connect-src 'self' https://*.basemaps.cartocdn.com",
              "frame-src https://www.google.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // The CRM. frame-ancestors above already covers modern browsers;
        // this is the legacy equivalent, kept narrow to the admin area.
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          // Never cached anywhere — these pages carry customer data.
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
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
        // Surface pumps were folded into Pumps: one category now covers
        // submersible and surface alike, so the old slug has no page.
        source: '/:lang/products/category/surface-pumps',
        destination: '/:lang/products/category/pumps',
        permanent: true,
      },
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
