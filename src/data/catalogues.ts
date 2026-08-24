/**
 * Manufacturer catalogues, and which product each one documents.
 *
 * Brand Report §1.3 lists "no specifications anywhere" as the finding that
 * costs the most enquiries: "A buyer choosing a pump needs flow rate, head,
 * bore diameter, power and materials. The site describes; it never
 * specifies. Serious buyers leave to find a datasheet." These are the
 * datasheets — putting them on the product page is what stops that leak.
 *
 * The mapping lives here rather than in the product specs blob because
 * products are served from the database and the static file is only the
 * seed; keeping it in code means it applies without a reseed, and there is
 * one obvious place to edit when a catalogue is added or replaced.
 *
 * Files live in /public/Catalogue, so each `file` is web-served verbatim.
 */

/**
 * Which product family a catalogue documents. Same slugs as
 * PRODUCT_CATEGORIES in `data/categories.ts`, so the catalogues index can
 * label its groups from the same dictionary keys the products pages use.
 */
export type CatalogueCategory =
  | "pumps"
  | "motors"
  | "electrical"
  | "pipes"
  | "spare-parts"
  | "cables";

export interface Catalogue {
  id: string;
  /** Filename under /public/Catalogue. */
  file: string;
  /** Manufacturer, shown on the button so the source is never ambiguous. */
  brand: string;
  titleEn: string;
  titleAr: string;
  /** Megabytes, rounded. Shown up front — one of these is 25 MB and
   *  contractors read on phones between jobs (§07). */
  sizeMb: number;
  /** Page count, counted from the file. Sets the expectation before the tap. */
  pages: number;
  category: CatalogueCategory;
  /** Manufacturer mark under /public/images/brand. Omitted where no logo
   *  file exists — the index typesets the brand name instead. */
  logo?: string;
}

export const CATALOGUES: Catalogue[] = [
  {
    id: "kurlar-2025",
    file: "Kurlar-Product-Catalogue-2025.pdf",
    brand: "Kurlar",
    titleEn: "Product Catalogue 2025",
    titleAr: "كتالوج المنتجات 2025",
    sizeMb: 8.4,
    pages: 48,
    category: "pumps",
    logo: "/images/brand/kurlar-logo.png",
  },
  {
    id: "kurlar-ksx",
    file: "Kurlar KSX Catalogue.pdf",
    brand: "Kurlar",
    titleEn: "KSX Series Catalogue",
    titleAr: "كتالوج سلسلة KSX",
    sizeMb: 7.0,
    pages: 44,
    category: "pumps",
    logo: "/images/brand/kurlar-logo.png",
  },
  {
    id: "tormac-pumps",
    file: "Tormac Submersible Pumps_50Hz.pdf",
    brand: "Tormac",
    titleEn: "Submersible Pumps, 50 Hz",
    titleAr: "طلمبات غاطسة، 50 هرتز",
    sizeMb: 25.4,
    pages: 124,
    category: "pumps",
    logo: "/images/brand/Tormac.png",
  },
  {
    id: "tormac-motors",
    file: "Tormac Submersible Motor 50Hz.pdf",
    brand: "Tormac",
    titleEn: "Submersible Motors, 50 Hz",
    titleAr: "مواتير غاطسة، 50 هرتز",
    sizeMb: 4.5,
    pages: 42,
    category: "motors",
    logo: "/images/brand/Tormac.png",
  },
  {
    id: "novo-inverters",
    file: "NOVO solar pump inverter catalog.pdf",
    brand: "NOVO",
    titleEn: "Solar Pump Inverter Catalogue",
    titleAr: "كتالوج عاكسات الطلمبات الشمسية",
    sizeMb: 9.5,
    pages: 8,
    category: "electrical",
    logo: "/images/brand/NOVO.png",
  },
  {
    id: "astral-borewell",
    file: "Astral.pdf",
    brand: "Astral Pipes",
    // Title taken from the catalogue's own cover page.
    titleEn: "uPVC Bore Well Column Pipes",
    titleAr: "مواسير أعماق uPVC للآبار",
    sizeMb: 2.4,
    pages: 36,
    category: "pipes",
    logo: "/images/brand/astral-logo.png",
  },
  {
    id: "alka-thrust",
    file: "Alka.pdf",
    brand: "Alka",
    titleEn: "Thrust Bearings Catalogue",
    titleAr: "كتالوج كراسي التحميل",
    sizeMb: 3.5,
    pages: 12,
    category: "spare-parts",
    logo: "/images/brand/alka-logo.png",
  },
  {
    id: "voltson-winding-wire",
    // Cover identifies this as Voltson India's EXCELGRIP poly-wrapped
    // submersible winding wire. The file arrived as "Untitled.pdf" and was
    // renamed — the filename shows in the URL bar when the PDF opens.
    file: "Voltson EXCELGRIP Submersible Winding Wire.pdf",
    brand: "Voltson",
    titleEn: "EXCELGRIP Submersible Winding Wire",
    titleAr: "أسلاك لف المواتير الغاطسة EXCELGRIP",
    sizeMb: 1.2,
    pages: 2,
    category: "electrical",
    logo: "/images/brand/voltson.png",
  },
  {
    id: "franklin-motors",
    // Franklin Electric's motors & control boxes catalogue, 4"-12". Arrived as
    // "franklien.pdf" and was renamed — the filename shows in the URL bar.
    file: "Franklin Submersible Motors and Control Boxes.pdf",
    brand: "Franklin Electric",
    titleEn: "Submersible Motors & Control Boxes",
    titleAr: "مواتير غاطسة وصناديق تحكم",
    sizeMb: 3.0,
    pages: 60,
    category: "motors",
    logo: "/images/brand/franklin.jpeg",
  },
  {
    id: "rovatti-borehole",
    // Rovatti's general borehole catalogue, 6"-16", 50 Hz. Arrived as
    // "Rovati CU_IGFDE_6-16E-ER-ERC-EC50HZ (1).pdf" — the brand is spelt with
    // two t's — and was renamed, since the filename shows in the URL bar.
    file: "Rovatti 6-16 inch Borehole Pumps.pdf",
    brand: "Rovatti",
    titleEn: "6\"-16\" Borehole Pumps, 50 Hz",
    titleAr: "طلمبات آبار 6-16 بوصة، 50 هرتز",
    sizeMb: 9.8,
    pages: 132,
    category: "pumps",
    logo: "/images/brand/rovatti.jpeg",
  },
  {
    id: "panelli-sx",
    // Panelli's 140/180/230/270 SX semiaxial range, 6"-12". Arrived as
    // "paneli 140-sx-500.pdf" and was renamed — the filename shows in the
    // URL bar when the PDF opens. No Panelli logo file has been supplied,
    // so the catalogues index sets the name in mono instead.
    file: "Panelli SX Submersible Pumps.pdf",
    brand: "Panelli",
    titleEn: "140-270 SX Semiaxial Submersible Pumps",
    titleAr: "طلمبات غاطسة نصف محورية 140-270 SX",
    sizeMb: 6.6,
    pages: 52,
    category: "pumps",
  },
  {
    id: "untel-flat-cable",
    // Üntel Kablo, H07VVH6-F (UNFLAT). Certified for permanent submersion to
    // 10 bar, which is why it is the cable specified for well installations.
    file: "Untel Flat Power and Control Cable.pdf",
    brand: "Üntel",
    titleEn: "H07VVH6-F PVC Flat Power & Control Cable",
    titleAr: "كابل مسطح للقوى والتحكم H07VVH6-F",
    sizeMb: 4.0,
    pages: 3,
    category: "cables",
    logo: "/images/brand/Untel.png",
  },
];

/**
 * Product slug → catalogue ids, most relevant first.
 *
 * Matched on the manufacturer behind each product's model series: KP/KPS,
 * KSX and KM are Kurlar series, Bore-Well is Astral's, AP+ is Alka's. The
 * Tormac catalogues are listed alongside the Kurlar ones on the pump and
 * motor pages because El Waha is the agent for both and a buyer choosing a
 * unit wants to compare — every button names its brand, so the source is
 * never in doubt.
 */
const BY_PRODUCT: Record<string, string[]> = {
  // KP - KPS series
  "pump-submersible": ["kurlar-2025"],
  // KSX series
  "pump-cast-stainless": ["kurlar-ksx"],
  // 140/180/230/270 SX series. The one catalogue covers both the pump and the
  // motor pages — it is the only Panelli document supplied so far, and its
  // curves carry the 6"/8"/10"/12" motor sizing each pump needs.
  "pump-panelli-sx": ["panelli-sx"],
  "motor-panelli": ["panelli-sx"],
  // 8E/8ER/10E/10ER series, from the 6"-16" general catalogue.
  "pump-rovatti": ["rovatti-borehole"],
  "motor-franklin": ["franklin-motors"],
  // TS - TN series
  "pump-tormac-ts": ["tormac-pumps"],
  // KM series
  "motor-hitemp": ["kurlar-2025"],
  // D4 - D10 ECO series
  "motor-tormac-eco": ["tormac-motors"],
  "elec-inverter": ["novo-inverters"],
  // Bore-Well series — confirmed against the catalogue cover
  "pipe-upvc-column": ["astral-borewell"],
  // AP+ Series
  "thrust-bearing-heavy": ["alka-thrust"],
  // Confirmed against the catalogue cover: Voltson's EXCELGRIP is a
  // poly-wrapped winding wire, which is this product and not the cables.
  "winding-wire-voltson": ["voltson-winding-wire"],
  // H07VVH6-F (UNFLAT), confirmed against the catalogue's own product pages.
  "cable-flat-untel": ["untel-flat-cable"],
  // Still unmapped, because no catalogue has been supplied for it:
  //   cable-submersible  — Submersible Motor Cables
  // CatalogueButton renders nothing for it until a file is added.
};

const byId = new Map(CATALOGUES.map((c) => [c.id, c]));

/** Catalogues for a product, in display order. Empty if none is mapped. */
export function cataloguesForProduct(slug: string): Catalogue[] {
  return (BY_PRODUCT[slug] ?? []).map((id) => byId.get(id)).filter((c): c is Catalogue => Boolean(c));
}

/** Public URL for a catalogue. Encoded because several names contain spaces. */
export function catalogueHref(c: Catalogue): string {
  return `/Catalogue/${encodeURIComponent(c.file)}`;
}

/**
 * Reading order for the catalogues index: the families El Waha is asked for
 * most, first. Pumps and motors are the enquiry; everything else is what goes
 * down the well with them.
 */
const CATEGORY_ORDER: CatalogueCategory[] = [
  "pumps",
  "motors",
  "electrical",
  "cables",
  "pipes",
  "spare-parts",
];

/**
 * Catalogues grouped for the index, in reading order. A category with no
 * catalogue is dropped rather than rendered as an empty heading — §1.3 counts
 * empty shells as part of what makes a site read unattended.
 */
export function cataloguesByCategory(): {
  category: CatalogueCategory;
  items: Catalogue[];
}[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: CATALOGUES.filter((c) => c.category === category),
  })).filter((group) => group.items.length > 0);
}

/** Headline figures for the index: catalogues, manufacturers, total pages. */
export function catalogueTotals() {
  return {
    catalogues: CATALOGUES.length,
    brands: new Set(CATALOGUES.map((c) => c.brand)).size,
    pages: CATALOGUES.reduce((sum, c) => sum + c.pages, 0),
  };
}
