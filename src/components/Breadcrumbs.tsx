import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { breadcrumbSchema, jsonLdScriptProps, type BreadcrumbSegment } from "@/lib/schema";
import type { Locale } from "@/app/[lang]/dictionaries";

export interface Crumb {
  name: string;
  /** Locale-less path, e.g. "/products" or "/products/pump-submersible". */
  path: string;
}

/**
 * Visible breadcrumb nav + matching BreadcrumbList JSON-LD, from the same
 * list of crumbs — the two can't disagree because there's only one source.
 *
 * There were no breadcrumbs anywhere on the site before this, and product
 * pages had no link back to their own category at all — only a "Back to
 * Products" link straight to the top-level list.
 */
export default function Breadcrumbs({
  lang,
  items,
  dark = false,
}: {
  lang: Locale;
  items: Crumb[];
  /** For a breadcrumb sitting on a dark ground (e.g. CategoryView's sidebar). */
  dark?: boolean;
}) {
  const isAr = lang === "ar";
  const Chevron = isAr ? ChevronLeft : ChevronRight;
  const segments: BreadcrumbSegment[] = items.map((c) => ({ name: c.name, path: c.path }));
  // Crumb links were neutral-400 in both variants: 2.52:1 on white and
  // 4.08:1 on the sidebar's grey. The separators are aria-hidden, so they
  // only owe the 3:1 non-text ratio, but the links owe 4.5:1 (S6-T02).
  const chevronClass = dark ? "text-bone/60" : "text-stone-light";
  const linkClass = dark ? "text-bone/75 hover:text-white" : "text-stone hover:text-pine";
  const currentClass = dark ? "text-bone/75" : "text-stone";

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbSchema(lang, segments))} />
      <nav aria-label={isAr ? "مسار التصفح" : "Breadcrumb"} className="text-xs">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {index > 0 && <Chevron className={`w-3.5 h-3.5 shrink-0 ${chevronClass}`} aria-hidden="true" />}
                {isLast ? (
                  <span className={currentClass} aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={`/${lang}${item.path === "/" ? "" : item.path}`}
                    className={`transition-colors ${linkClass}`}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
