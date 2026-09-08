import {
  ADDRESS,
  AGENCIES,
  EMAIL,
  FOUNDED,
  GEO,
  LEGAL_NAME_AR,
  LEGAL_NAME_EN,
  NAME_AR,
  NAME_EN,
  PHONE_SALES,
  PHONE_SUPPORT,
  SOCIAL,
  WHATSAPP_SALES,
} from "@/lib/company";
import { SITE_URL } from "@/lib/seo";
import type { Locale } from "@/app/[lang]/dictionaries";

/**
 * Structured data, built from the same facts src/lib/company.ts already
 * derives copy from — so a schema field and the visible page text can't
 * quietly disagree the way the audit found "11" and "12" agencies on the
 * live site.
 *
 * Fields left out rather than guessed (see PLAN.md open questions):
 * ISO 9001 certificate number/body/scope, and any social profile other
 * than the two already linked from the footer. sameAs pointing at an
 * unverified or dead page is worse than omitting it.
 */

/** One Organization + LocalBusiness node, referenced by @id from other schema. */
export function organizationSchema(lang: Locale) {
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#org`,
    name: isAr ? NAME_AR : NAME_EN,
    legalName: isAr ? LEGAL_NAME_AR : LEGAL_NAME_EN,
    alternateName: [NAME_EN, NAME_AR, LEGAL_NAME_EN, LEGAL_NAME_AR],
    url: `${SITE_URL}/${lang}`,
    logo: `${SITE_URL}/images/brand/elwaha-logo.png`,
    foundingDate: String(FOUNDED),
    foundingLocation: {
      "@type": "Place",
      name: isAr ? ADDRESS.regionAr : ADDRESS.regionEn,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: isAr ? ADDRESS.streetAr : ADDRESS.streetEn,
      addressLocality: isAr ? ADDRESS.localityAr : ADDRESS.localityEn,
      addressRegion: isAr ? ADDRESS.regionAr : ADDRESS.regionEn,
      addressCountry: ADDRESS.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
    telephone: [PHONE_SALES, PHONE_SUPPORT],
    email: EMAIL,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: PHONE_SALES,
        url: `https://wa.me/${WHATSAPP_SALES}`,
        availableLanguage: ["ar", "en"],
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: PHONE_SUPPORT,
        availableLanguage: ["ar", "en"],
      },
    ],
    areaServed: { "@type": "Country", name: "EG" },
    sameAs: [SOCIAL.facebook, SOCIAL.youtube],
    brand: AGENCIES.map((a) => ({ "@type": "Brand", name: a.name })),
  };
}

/** WebSite node — declares the two locale variants exist under one site. */
export function websiteSchema(lang: Locale) {
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: isAr ? NAME_AR : NAME_EN,
    inLanguage: [lang],
    publisher: { "@id": `${SITE_URL}/#org` },
  };
}

/**
 * Props for a <script type="application/ld+json"> tag. Escapes `<` per
 * Next's own JSON-LD guide, so a stray "</script>" inside a product
 * description (user-editable, via the admin) can't break out of the tag.
 */
export function jsonLdScriptProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  };
}

export interface ProductForSchema {
  id: string;
  title: string;
  desc: string;
  gallery: string[];
  sku: string | null;
  variantRows: {
    id: string;
    selections: Record<string, string>;
    sku: string | null;
  }[];
}

/**
 * Product or ProductGroup JSON-LD for one product page. Price is
 * deliberately never included — this business quotes on request, and a
 * fabricated price is worse than none. sku/mpn are included only when the
 * catalogue actually has one: every product's sku is null today (nothing
 * in prisma/seed.ts populates it), and guessing a manufacturer model code
 * would be worse than omitting the field, per the Next.js JSON-LD guide's
 * own caution against unverifiable structured data.
 */
export function productSchema(lang: Locale, product: ProductForSchema, path: string) {
  const url = `${SITE_URL}/${lang}${path}`;
  const image = product.gallery[0] ? `${SITE_URL}${product.gallery[0]}` : undefined;
  const seller = { "@id": `${SITE_URL}/#org` };
  const baseOffer = {
    "@type": "Offer" as const,
    url,
    availability: "https://schema.org/InStock",
    seller,
  };

  if (product.variantRows.length === 0) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${url}#product`,
      name: product.title,
      description: product.desc,
      url,
      ...(image ? { image } : {}),
      ...(product.sku ? { sku: product.sku, mpn: product.sku } : {}),
      offers: baseOffer,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    "@id": `${url}#product`,
    name: product.title,
    description: product.desc,
    url,
    ...(image ? { image } : {}),
    productGroupID: product.id,
    variesBy: ["https://schema.org/name"],
    hasVariant: product.variantRows.map((variant) => ({
      "@type": "Product",
      name: `${product.title} — ${Object.values(variant.selections).join(" / ")}`,
      ...(variant.sku ? { sku: variant.sku, mpn: variant.sku } : {}),
      offers: { ...baseOffer, url },
    })),
  };
}

export interface JobForSchema {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  postedOn: string; // ISO date
}

/**
 * JobPosting for one live advert. Unlike Event schema (blocked on real
 * dates — see PLAN.md S1-T12), job postings already carry every field this
 * needs. validThrough is omitted rather than guessed: there's no real
 * expiry date in the Job model, and Google's own guidance is that a wrong
 * one is worse than none.
 */
export function jobPostingSchema(lang: Locale, job: JobForSchema, path: string) {
  const url = `${SITE_URL}/${lang}${path}`;
  const typeLower = job.type.toLowerCase();
  const employmentType = typeLower.includes("full")
    ? "FULL_TIME"
    : typeLower.includes("part")
      ? "PART_TIME"
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedOn,
    url,
    hiringOrganization: { "@id": `${SITE_URL}/#org` },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: ADDRESS.countryCode,
      },
    },
    ...(employmentType ? { employmentType } : {}),
  };
}

export interface BreadcrumbSegment {
  name: string;
  path: string; // locale-less, e.g. "/products" or "/products/pump-submersible"
}

/** BreadcrumbList JSON-LD for one page — see src/components/Breadcrumbs.tsx. */
export function breadcrumbSchema(lang: Locale, segments: BreadcrumbSegment[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: segment.name,
      item: `${SITE_URL}/${lang}${segment.path === "/" ? "" : segment.path}`,
    })),
  };
}
