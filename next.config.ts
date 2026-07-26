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
};

export default nextConfig;
