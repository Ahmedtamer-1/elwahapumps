import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'elwahapumps.com',
      },
    ],
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
