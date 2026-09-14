import React from "react";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import { FileText, Download, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCT_CATEGORIES, categoryLabel } from "@/data/categories";
import { localizedAlternates } from "@/lib/seo";
import { PHONE_SALES, AGENCIES } from "@/lib/company";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.productsPage.title,
    description: dict.productsPage.subtitle,
    alternates: localizedAlternates(lang, "/products"),
  };
}

/**
 * Category line-art, one file per slug under /public/images/categories.
 *
 * The source images are black line art on a white ground. They are inverted
 * to white and blended with `screen`, which drops the white ground to
 * transparent and leaves the strokes over pine — the drawings then sit in
 * the palette instead of arriving as white boxes (§04: flat pine, bone or
 * white only, and no additional colours).
 */
const CATEGORY_ART: Record<string, string> = {
  // Submersible and surface pumps share one category, so this drawing shows
  // both families together — the old pumps.jpeg was submersible-only.
  pumps: "/images/categories/pumps%202.jpeg",
  motors: "/images/categories/motors.jpeg",
  electrical: "/images/categories/electrical.jpeg",
  pipes: "/images/categories/pipes.jpeg",
  "spare-parts": "/images/categories/spare-parts.jpeg",
  cables: "/images/categories/cables.jpeg",
};

/**
 * Per-slug correction for drawings that lose height to their own proportions.
 *
 * Every tile is a square with `object-contain`, so what decides how big a
 * drawing *looks* is which edge of the square it hits first. The tall ones
 * — motors at 0.18 wide-to-high, cables at 0.35 — hit the top and bottom and
 * fill the tile. The pumps group is a landscape drawing at 1.72, so it hits
 * the sides and lands at roughly 55% of the height the others get, which is
 * why it read as the small one in the row.
 *
 * Scaling it back up is the only fix that keeps a square grid: it spills
 * past the cell into the gap, which is free space — the tiles either side
 * of it are narrow drawings with wide empty margins of their own.
 */
const ART_SCALE: Record<string, string> = {
  // Both states, because Tailwind cannot multiply: the hover figure is the
  // base one times the 1.06 every other tile lifts by.
  //
  // 1.22 rather than the 1.6 this wanted when the tiles were loose icons:
  // inside a bordered card the spill has somewhere to stop, and past about
  // 1.25 the drawing starts crossing its own border. It closes most of the
  // gap, not all of it — the real fix is a portrait crop of this artwork.
  pumps: "scale-[1.22] group-hover:scale-[1.29]",
};

export default async function ProductsPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const productCategories = PRODUCT_CATEGORIES.map((id) => ({
    id,
    label: categoryLabel(dict, id),
    art: CATEGORY_ART[id],
    artScale: ART_SCALE[id] ?? "",
  }));

  /* All twelve agencies, not the seven that were hardcoded here: the wall
     is the proof behind the "12 exclusive agencies" figure quoted on the
     home page, and a hand-kept copy of it had drifted to seven. There are
     no brand profile pages, so every tile is a plain mark, not a link. */
  const brandsList = AGENCIES.map((agency) => ({
    id: agency.name.toLowerCase().replace(/\s+/g, "-"),
    name: agency.name,
    logo: agency.logo,
  }));

  return (
    <div className="bg-white min-h-screen">
      {/* Category wall.
          The photograph behind it is El Waha's own warehouse. What used to
          sit here was a stock "industrial background" of somebody else's
          plant, which §06 rules out — the objection was whose plant it
          was, not that there was one.

          The scrim is ink, not pine. Pine here opened a page that was pine
          from the header down to the footer — this wall, the brands band and
          the catalogue band — and the warehouse read as a green-tinted
          screen rather than a photograph. Ink is one of the five colours, it
          keeps the photograph's own colour, and it is still dark enough for
          the white line-art to hold. Lighter through the middle so the
          warehouse shows where the drawings sit. */}
      {/*

          Note the wrapper below is `relative` with no `z-index`. That is
          load-bearing for the blend, not an oversight — see the note on the
          tiles. */}
      {/* Taller than its contents need, on purpose. The source frame is
          near-square (975x890) and this band is very wide, so `object-cover`
          scales it to the width and crops the top and bottom away - the
          shorter the band, the harder that crop and the more magnified the
          warehouse looks. Height is the only zoom control there is. */}
      {/* Fills the screen under the header rather than a fixed padding.
          At 1440 wide the near-square photo renders ~1310px tall, and a
          ~510px band was showing under 40% of it — the stock on the floor,
          the part worth seeing, was cropped off below. A full-height band
          shows ~56%, and the crop is anchored low (object-position below)
          so what is lost comes off the roof instead. Zooming out instead is
          not available: the photo is narrower than the band, so `contain`
          would leave empty bars at the sides. */}
      <section className="relative min-h-[calc(100svh-var(--header-h))] py-16 flex flex-col justify-center bg-ink overflow-hidden">
        <Image
          src="/images/about/warehouse-web.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          /* `priority` is deprecated in Next 16 — this is the LCP element,
             so it asks for eager loading at high fetch priority directly. */
          loading="eager"
          fetchPriority="high"
          /* Blurred so the warehouse reads as depth behind the wall rather
             than as detail competing with it — the line-art is fine white
             stroke, and every edge in a sharp photograph was crossing it.
             `scale-105` goes with the blur: a blur samples past the edges of
             the element and would otherwise feather the band's own top and
             bottom into the background. The section clips the overflow. */
          className="object-cover object-[50%_80%] scale-[1.03] blur-[2px]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(20,20,20,0.80) 0%, rgba(20,20,20,0.64) 45%, rgba(20,20,20,0.84) 100%)",
          }}
        />
        <div className="relative w-[95%] max-w-[1700px] mx-auto px-4">
          {/* The title and its brass rule are not painted: the six drawings
              under a nav item already marked "Products" say what this is,
              and the band is a photograph of the warehouse those ranges sit
              in — a caption on top of it was the one thing in the way. The
              h1 stays in the document, since a page still needs one for
              screen readers and for how a search result is titled. */}
          <h1 className="sr-only">{dict.productsPage.title}</h1>

          {/* Six cards rather than six loose icons, the way the reference
              wall is built: each range is a bordered plate the whole of
              which is the target, sitting on the shared photograph rather
              than replacing it. The panel is translucent black — it has to
              be, or the picture stops at the card edge.

              The cards fill their grid cells now. They used to be capped at
              220px and centred in the cell, which left the row floating in
              the middle of a very wide band with air on both sides. */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-10 md:gap-y-12">
            {productCategories.map((cat) => (
              <Link
                href={`/${lang}/products/category/${cat.id}`}
                key={cat.id}
                /* The bordered, translucent-black plates are gone. Each
                   range is now the drawing and its name straight on the
                   photograph, and the only structure is a hairline between
                   columns — the panels were six boxes over a picture that
                   is the reason the band exists.

                   The nth-child runs put that hairline on every cell except
                   the first of each row, restated per breakpoint because
                   the row length changes with the column count: 2 up to
                   md, 3 to lg, 6 above. `border-s` rather than `border-l`
                   so the rule stays on the reading-start edge in Arabic. */
                className="group flex flex-col items-center px-5 md:px-6 border-s border-white/12 [&:nth-child(2n+1)]:border-s-0 md:[&:nth-child(2n+1)]:border-s md:[&:nth-child(3n+1)]:border-s-0 lg:[&:nth-child(3n+1)]:border-s lg:[&:nth-child(6n+1)]:border-s-0"
              >
                {/* No background on this wrapper, deliberately. `screen`
                    blends against whatever is painted below the image
                    inside the nearest isolating stacking context, so what
                    the drawing sits on is decided here. The content wrapper
                    used to carry `z-10`, which made a stacking context and
                    sealed the photograph out; the tiles then needed their
                    own `bg-pine` to blend against or they rendered as black
                    boxes. With that `z-10` dropped, the backdrop is the
                    card's own translucent panel over the scrim and the
                    warehouse photograph — which is the point: the strokes
                    sit *on* the picture. Put an opaque background on either
                    element and the photograph disappears behind six boxes. */}
                <div className="relative w-full aspect-square">
                  <Image
                    src={cat.art}
                    // Decorative: the label below already names the category.
                    alt=""
                    aria-hidden="true"
                    fill
                    // Each card is roughly a sixth of a 1700px band, so a
                    // fixed hint is accurate to within a step. Leaving vw
                    // units here made Next serve a 3840px-wide file into a
                    // 220px slot.
                    sizes="280px"
                    className={`object-contain transition-transform duration-500 ease-out ${
                      cat.artScale || "group-hover:scale-[1.06]"
                    }`}
                    // invert -> white strokes on black; screen -> the black
                    // drops out, leaving the strokes over the photograph.
                    style={{ filter: "invert(1)", mixBlendMode: "screen" }}
                  />
                </div>
                {/* Plain white at a normal weight, the way the reference
                    wall sets its captions. Bone at 85% and semibold made
                    each label a small heading competing with the drawing
                    above it; the drawing is the thing being chosen. */}
                <span className="mt-5 text-[15px] md:text-base font-normal text-white group-hover:text-brass transition-colors text-center">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our brands — the whole roster, moving.

          Three things changed together. The brass rule over the heading is
          gone: the wall already has a hairline above it at the section
          border, and the rule was reading as a divider inside a band that
          does not need one. The heading is centred and set at display size
          rather than as a spec label, because it titles the band rather
          than labelling a column. And the static seven-tile grid is now a
          marquee of all twelve, paused on hover — twelve tiles at the size
          these marks need would not sit on one row.

          The row is the list twice over so the loop is seamless; the second
          copy is `aria-hidden` and out of the tab order, and the real list
          of names lives in the `sr-only` paragraph under the wall, so a
          screen reader or an answer engine reads each brand exactly once.
          §1.3 still holds: one fixed box, one optical height, marks in
          their own colours on a white tile. */}
      {/* White, not pine. Every one of the twelve marks is a dark logo —
          Rovatti's is near-black, Tormac's and Franklin's close to it — so on
          pine they were dark shapes on a dark band, and the band added a
          second slab of green under the wall. On white they read in their own
          colours. The heading moves from brass to pine with it: brass on
          white is 2.16:1 and ruled out by §04. */}
      <section className="bg-white py-section border-b border-rule">
        <div className="w-[95%] max-w-[1600px] mx-auto px-4">
          {/* Set like the reference band's caption — small, uppercase,
              widely tracked, centred — but only on the English side: mono
              and 0.18em tracking pull Arabic letterforms apart at the
              joins, so the Arabic heading keeps the body face and normal
              spacing at the same optical size. */}
          <h2
            className={`text-pine text-center mb-10 ${
              lang === "ar"
                ? "text-[17px] md:text-[19px] font-semibold"
                : "spec-label text-[15px] md:text-[17px] tracking-[0.18em]"
            }`}
          >
            {lang === "ar" ? "العلامات التجارية" : "Our brands"}
          </h2>

          <div className="relative w-full overflow-hidden">
            <div className="flex w-max gap-6 md:gap-8 animate-marquee-left hover:[animation-play-state:paused]">
              {[...brandsList, ...brandsList].map((brand, idx) => {
                const isClone = idx >= brandsList.length;
                const tile = (
                  <>
                    <Image
                      src={brand.logo}
                      alt={isClone ? "" : brand.name}
                      fill
                      quality={95}
                      className="object-contain"
                      sizes="(max-width: 768px) 150px, 190px"
                    />
                  </>
                );
                /* No tile behind the marks — every source PNG has a real
                   alpha channel, so they sit straight on the white.
                   Nothing to fade at the edges either, so the gradient mask
                   over the row is gone with it. */
                const shell =
                  "group relative flex w-[150px] md:w-[190px] h-20 md:h-24 shrink-0 items-center justify-center opacity-90 hover:opacity-100 transition-opacity duration-300";

                return (
                  <div
                    key={`${brand.id}-${idx}`}
                    className={shell}
                    aria-hidden={isClone ? true : undefined}
                  >
                    {tile}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="sr-only">
            {brandsList.map((brand, idx) => (
              <React.Fragment key={brand.id}>
                {idx > 0 && (lang === "ar" ? "، " : ", ")}
                {brand.name}
              </React.Fragment>
            ))}
          </p>
        </div>
      </section>

      {/* Catalogue prompt. The per-product datasheets now live on each
          product page; this is the whole-range request.

          Bone, so the page runs dark photograph → white brands → paper
          prompt → pine footer: the footer is the one green slab left, and
          it closes the page instead of being the fourth in a row. Pine
          carries the heading, the icon and the primary button — brass is
          not allowed on bone (§04). */}
      <section className="bg-bone">
        <div className="w-[95%] max-w-[1600px] mx-auto px-4">
          <div className="py-section flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-start">
              <FileText className="w-10 h-10 text-pine shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-h3 font-extrabold mb-2 text-pine">
                  {lang === "ar"
                    ? "كتالوج المنتجات والمواصفات الفنية الكاملة"
                    : "Request the full technical catalogue"}
                </h3>
                <p className="text-stone text-sm max-w-lg">
                  {lang === "ar"
                    ? "المقاسات والموديلات الكاملة للمواتير والطلمبات ولوحات التشغيل. الكتالوج الخاص بكل منتج متاح على صفحته."
                    : "Full dimensions, ratings and models for motors, pumps and control panels. Each product's own catalogue is on its page."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href={`/${lang}/contact?subject=${encodeURIComponent(
                  lang === "ar" ? "طلب كتالوج المنتجات" : "Product Catalog Request"
                )}`}
                className="inline-flex items-center justify-center gap-2 bg-pine hover:bg-field text-bone font-semibold px-8 py-4 text-sm transition-colors"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>{dict.productsPage.downloadCatalog}</span>
              </Link>
              <a
                href={`tel:${PHONE_SALES}`}
                className="inline-flex items-center justify-center gap-2 text-pine border border-pine/40 hover:border-pine hover:bg-white font-semibold px-8 py-4 text-sm transition-colors"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>{lang === "ar" ? "استفسار هاتفي" : "Phone Inquiry"}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
