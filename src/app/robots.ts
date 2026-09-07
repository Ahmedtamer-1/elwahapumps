import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * AI-crawler-specific policy (GPTBot, ClaudeBot, PerplexityBot, etc.) is a
 * separate, deliberate decision — Stage 3 (S3-T02) — so it isn't folded in
 * here; this covers general crawlers only.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/*/cart"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
