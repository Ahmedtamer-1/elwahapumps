"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { CatalogListProduct } from "@/lib/products";

/**
 * The home teaser's off-screen cards, rendered after the page has loaded.
 *
 * The teaser is a slow marquee below the fold: the first few cards are all
 * anyone sees for the first minute. Those stay server-rendered in
 * ProductTeaser. The rest arrive here as plain data, a few hundred bytes a
 * product, instead of as rendered cards, which cost ~2 KB of HTML each plus
 * the same again in the RSC payload. They mount once the browser is idle,
 * well before the drift reaches them.
 */
export default function DeferredProductCards({
  products,
  lang,
  labels,
}: {
  products: CatalogListProduct[];
  lang: string;
  labels: Record<string, string>;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const show = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(show, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(show, 200);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;

  return products.map((product) => (
    <div key={product.id} className="w-80 shrink-0 product-card">
      <ProductCard product={product} lang={lang} label={labels[product.category]} />
    </div>
  ));
}
