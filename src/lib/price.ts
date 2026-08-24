/**
 * Public-facing price rendering.
 *
 * El Waha quotes every line case by case, so the public site deliberately
 * shows no figures at all: both helpers ignore the amounts they are handed
 * and return the same "call us for the price" label. Prices are still stored
 * on the products and still visible in /admin — this is a display decision,
 * not a data one, so re-enabling numbers later is a change to this file only.
 */
export function priceOnRequestLabel(lang: string): string {
  return lang === "ar" ? "اتصل لمعرفة السعر" : "Call for price";
}

export function formatPrice(
  _price: number | null | undefined,
  _currency: string,
  lang: string,
): string {
  return priceOnRequestLabel(lang);
}

export function formatPriceRange(
  _min: number | null | undefined,
  _max: number | null | undefined,
  _currency: string,
  lang: string,
): string {
  return priceOnRequestLabel(lang);
}
