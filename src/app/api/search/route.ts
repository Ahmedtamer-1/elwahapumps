import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/products";

/**
 * The header search's index. Fetched by the browser the first time a visitor
 * opens the search, not rendered into every page: the catalogue is small
 * enough to filter client-side, and keeping it out of the HTML keeps it out
 * of every visitor's payload who never searches.
 *
 * Same revalidate window as the layout, so the index is never staler than
 * the pages it links to.
 */
export const revalidate = 60;

export async function GET() {
  const products = await getSearchIndex();
  return NextResponse.json(
    { products },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
