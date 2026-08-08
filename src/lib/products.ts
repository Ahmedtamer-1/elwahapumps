import { prisma } from "@/lib/prisma";
import type {
  ProductData,
  ProductModelGroup,
  ProductSpecGroup,
  ProductVariantGroup,
} from "@/data/products";

// Single source of truth lives in data/categories.ts, which is client-safe.
// Re-exported here so existing server-side importers keep working.
export { PRODUCT_CATEGORIES } from "@/data/categories";

/**
 * A catalogue entry as the public site consumes it: the original `ProductData`
 * shape (so ProductDetailView / CategoryView / ProductTabs keep working unchanged)
 * plus the commerce and localised fields that now live in the database.
 */
export interface CatalogProduct extends ProductData {
  /** Localised for the requested language, falling back to the other language. */
  title: string;
  desc: string;
  price: number | null;
  currency: string;
  stock: number | null;
  sku: string | null;
  /** Size selectors, in display order. Empty for products with no priced variants. */
  options: CatalogOption[];
  /** Every purchasable combination. Selecting one value per option resolves exactly one. */
  variantRows: CatalogVariant[];
  priceMin: number | null;
  priceMax: number | null;
}

export interface CatalogOptionValue {
  value: string;
  label: string;
  numeric: number | null;
}

export interface CatalogOption {
  key: string;
  label: string;
  unit: string | null;
  values: CatalogOptionValue[];
}

export interface CatalogVariant {
  id: string;
  comboKey: string;
  /** option key -> selected value */
  selections: Record<string, string>;
  /** Derived specs revealed once the variant is chosen (model code, motor kW, outlet…) */
  specs: Record<string, string>;
  price: number | null;
  currency: string;
  sku: string | null;
}

/** The JSON blob stored in Product.specs — everything the static file held minus id/category/gallery. */
type SpecsBlob = {
  specs?: string[];
  variants?: ProductVariantGroup[];
  tableSpecsEn?: Record<string, string>;
  tableSpecsAr?: Record<string, string>;
  modelNo?: string;
  featuresEn?: string[];
  featuresAr?: string[];
  modelGroups?: ProductModelGroup[];
  specGroups?: ProductSpecGroup[];
};

interface ProductRow {
  slug: string;
  nameEn: string;
  nameAr: string;
  descEn: string | null;
  descAr: string | null;
  price: number | null;
  currency: string;
  stock: number | null;
  sku: string | null;
  images: string;
  specs: string;
  priceMin: number | null;
  priceMax: number | null;
  category: { slug: string };
  options: {
    key: string;
    labelEn: string;
    labelAr: string;
    unit: string | null;
    values: {
      value: string;
      labelEn: string;
      labelAr: string;
      numeric: number | null;
    }[];
  }[];
  variants: {
    id: string;
    comboKey: string;
    selections: string;
    specs: string;
    price: number | null;
    currency: string;
    sku: string | null;
  }[];
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function toCatalogProduct(row: ProductRow, lang: string): CatalogProduct {
  const blob = safeParse<SpecsBlob>(row.specs, {});
  const gallery = safeParse<string[]>(row.images, []);
  const isAr = lang === "ar";

  return {
    id: row.slug,
    category: row.category.slug as ProductData["category"],
    gallery: gallery.length > 0 ? gallery : ["/images/products/pump-kurlar.png"],
    specs: blob.specs ?? [],
    variants: blob.variants ?? [],
    tableSpecsEn: blob.tableSpecsEn ?? {},
    tableSpecsAr: blob.tableSpecsAr ?? {},
    modelNo: blob.modelNo,
    featuresEn: blob.featuresEn,
    featuresAr: blob.featuresAr,
    modelGroups: blob.modelGroups,
    specGroups: blob.specGroups,
    title: (isAr ? row.nameAr : row.nameEn) || row.nameEn || row.nameAr || row.slug,
    desc: (isAr ? row.descAr : row.descEn) || row.descEn || row.descAr || "",
    price: row.price,
    currency: row.currency,
    stock: row.stock,
    sku: row.sku,
    options: row.options.map((o) => ({
      key: o.key,
      label: isAr ? o.labelAr : o.labelEn,
      unit: o.unit,
      values: o.values.map((v) => ({
        value: v.value,
        label: isAr ? v.labelAr : v.labelEn,
        numeric: v.numeric,
      })),
    })),
    variantRows: row.variants.map((v) => ({
      id: v.id,
      comboKey: v.comboKey,
      selections: safeParse<Record<string, string>>(v.selections, {}),
      specs: safeParse<Record<string, string>>(v.specs, {}),
      price: v.price,
      currency: v.currency,
      sku: v.sku,
    })),
    priceMin: row.priceMin,
    priceMax: row.priceMax,
  };
}

const select = {
  slug: true,
  nameEn: true,
  nameAr: true,
  descEn: true,
  descAr: true,
  price: true,
  currency: true,
  stock: true,
  sku: true,
  images: true,
  specs: true,
  priceMin: true,
  priceMax: true,
  category: { select: { slug: true } },
  options: {
    orderBy: { sortOrder: "asc" },
    select: {
      key: true,
      labelEn: true,
      labelAr: true,
      unit: true,
      values: {
        orderBy: { sortOrder: "asc" },
        select: { value: true, labelEn: true, labelAr: true, numeric: true },
      },
    },
  },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      comboKey: true,
      selections: true,
      specs: true,
      price: true,
      currency: true,
      sku: true,
    },
  },
} as const;

/**
 * Read straight from SQLite on each request. The catalogue is small and the DB
 * is local, so this costs well under a millisecond — and it means an admin price
 * edit is live immediately, with no cache-invalidation step that can go stale.
 */
async function getActiveProductRows(): Promise<ProductRow[]> {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select,
  });
}

export async function getCatalogProducts(lang: string): Promise<CatalogProduct[]> {
  const rows = await getActiveProductRows();
  return rows.map((row) => toCatalogProduct(row, lang));
}

export async function getCatalogProduct(
  slug: string,
  lang: string,
): Promise<CatalogProduct | null> {
  const rows = await getActiveProductRows();
  const row = rows.find((r) => r.slug === slug);
  return row ? toCatalogProduct(row, lang) : null;
}

export async function getCatalogProductsByCategory(
  category: string,
  lang: string,
): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts(lang);
  return products.filter((p) => p.category === category);
}
