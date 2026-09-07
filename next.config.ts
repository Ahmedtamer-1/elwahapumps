import type { NextConfig } from "next";

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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'elwahapumps.com',
      },
    ],
    // Next 16 rejects any `quality` prop not in this list (default: [75]).
    // A few logo/partner components request 95 for crisp small marks — add
    // it explicitly instead of stripping their quality prop, since without
    // this the optimizer 400s and every one of those images breaks in prod.
    qualities: [75, 95],
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
    ];
  },
};

export default nextConfig;
