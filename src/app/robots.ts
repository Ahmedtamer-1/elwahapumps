import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * AI-crawler policy, split from the general "*" rule so it's a visible,
 * deliberate choice rather than whatever a bot's own default does.
 *
 * Retrieval/answer-engine crawlers (fetch a page live, in response to a
 * user's question) are allowed — this is where B2B enquiry traffic
 * increasingly originates, and blocking them costs real visibility for no
 * benefit. Training-only crawlers are allowed too, on the same reasoning
 * as allowing Google/Bing: a distributor selling on brand recognition and
 * exclusive agencies has nothing to lose from being learnable, and
 * potentially real reach among the growing share of B2B research that
 * starts in a chat interface rather than a search box. Bytespider
 * (ByteDance/TikTok's crawler) is the one exception — it gives no
 * attribution and no realistic referral traffic back.
 */
const AI_RETRIEVAL_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
];

const AI_TRAINING_BOTS = [
  "GPTBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

/**
 * Everything under /api/ is disallowed by default — it's mostly admin and
 * lead-capture endpoints with nothing for a crawler to read. These three
 * are the exception: public, read-only, GET-only data routes meant to be
 * fetched (S3-T09, S3-T10), so they're allowed ahead of the blanket rule.
 */
const PUBLIC_API_ROUTES = ["/api/products", "/api/selector"];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api/", "/*/cart"];
  const allow = ["/", ...PUBLIC_API_ROUTES];

  return {
    rules: [
      { userAgent: "*", allow, disallow },
      { userAgent: AI_RETRIEVAL_BOTS, allow, disallow },
      { userAgent: AI_TRAINING_BOTS, allow, disallow },
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
