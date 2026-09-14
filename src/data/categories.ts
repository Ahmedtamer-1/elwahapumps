/**
 * Product categories, and how to label them.
 *
 * Kept here rather than in `lib/products.ts` because that module imports
 * Prisma, and the client components that need a category label (CategoryView,
 * ProductTabs) would drag the database client into the browser bundle.
 */

export const PRODUCT_CATEGORIES = [
  "pumps",
  "motors",
  "electrical",
  "pipes",
  "spare-parts",
  "cables",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Category slug → the key that labels it under `dict.productsPage`.
 *
 * Most slugs match their dictionary key, which is why a direct
 * `dict.productsPage[slug]` lookup appeared to work — but it silently fell
 * back to printing the raw slug for any category whose slug is hyphenated
 * and whose key is camelCase. Mapping them explicitly means adding a
 * category with a multi-word name can't reintroduce that.
 */
export const CATEGORY_DICT_KEY: Record<ProductCategory, string> = {
  pumps: "pumps",
  motors: "motors",
  electrical: "electrical",
  pipes: "pipes",
  "spare-parts": "spareParts",
  cables: "cables",
};

/** Localised category name, falling back to the slug only if truly unknown. */
export function categoryLabel(
  dict: { productsPage?: Record<string, unknown> } | undefined,
  slug: string
): string {
  const key = CATEGORY_DICT_KEY[slug as ProductCategory] ?? slug;
  const label = dict?.productsPage?.[key];
  return typeof label === "string" && label ? label : slug;
}
