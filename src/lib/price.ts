/**
 * Public-facing price rendering. Products without a price fall back to
 * "Price on request" — El Waha quotes plenty of equipment case by case.
 */
export function formatPrice(
  price: number | null | undefined,
  currency: string,
  lang: string,
): string {
  if (price === null || price === undefined) {
    return lang === "ar" ? "السعر عند الطلب" : "Price on request";
  }

  const amount = price.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const label = currencyLabel(currency, lang);
  return lang === "ar" ? `${amount} ${label}` : `${label} ${amount}`;
}

/**
 * Listing pages show a product's span across its variants — "1,370 – 9,000 ج.م" — so a
 * customer sees real numbers before opening the page. Collapses to a single price when
 * every variant costs the same, and falls back to "price on request" when none is set.
 */
export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string,
  lang: string,
): string {
  if (min === null || min === undefined) return formatPrice(null, currency, lang);
  if (max === null || max === undefined || min === max) {
    return formatPrice(min, currency, lang);
  }

  const label = currencyLabel(currency, lang);
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const fmt = (n: number) =>
    n.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  // Currency symbol stated once, on the side the language expects.
  return lang === "ar"
    ? `${fmt(min)} – ${fmt(max)} ${label}`
    : `${label} ${fmt(min)} – ${fmt(max)}`;
}

function currencyLabel(currency: string, lang: string): string {
  if (lang !== "ar") return currency;
  const arabic: Record<string, string> = {
    EGP: "ج.م",
    USD: "دولار",
    EUR: "يورو",
    SAR: "ريال",
    AED: "درهم",
  };
  return arabic[currency] ?? currency;
}
