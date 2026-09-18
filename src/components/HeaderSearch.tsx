"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { SearchIndexEntry } from "@/lib/products";

export interface SearchLabels {
  search: string;
  searchPlaceholder: string;
  searchLabel: string;
  searchClose: string;
  searchLoading: string;
  searchNoResults: string;
  searchError: string;
  searchResultsCount: string;
  searchHint: string;
  allProducts: string;
}

const MAX_RESULTS = 8;

/*
  One fetch per page load, shared by every open. The index is small (a row per
  product, no descriptions) and comes from /api/search rather than the page
  itself, so a visitor who never searches never downloads it.
*/
let indexPromise: Promise<SearchIndexEntry[]> | null = null;
function loadIndex(): Promise<SearchIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch("/api/search")
      .then((res) => {
        if (!res.ok) throw new Error(`search index ${res.status}`);
        return res.json() as Promise<{ products: SearchIndexEntry[] }>;
      })
      .then((data) => data.products)
      .catch((err) => {
        // Let the next open try again instead of caching the failure.
        indexPromise = null;
        throw err;
      });
  }
  return indexPromise;
}

/** Warm the index before the dialog opens — called on hover/focus of a trigger. */
export function prefetchSearchIndex() {
  loadIndex().catch(() => {});
}

/**
 * Folds the spellings a visitor is likely to type interchangeably: case,
 * Arabic diacritics and tatweel, the alef forms, taa marbuta / haa and
 * alef maqsura / yaa.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

/** Model numbers are written "KSX 6-12", "ksx6-12" and "KSX6/12" alike — match with the separators gone. */
function compact(text: string): string {
  return text.replace(/[\s\-_./"'″]+/g, "");
}

interface Indexed {
  entry: SearchIndexEntry;
  name: string;
  otherName: string;
  hay: string;
  hayCompact: string;
}

function rank(item: Indexed, query: string, tokens: string[]): number {
  const q = compact(query);
  let score = 0;
  if (item.name.startsWith(query) || item.otherName.startsWith(query)) score += 50;
  if (item.entry.modelNo && compact(normalize(item.entry.modelNo)).startsWith(q)) score += 40;
  if (item.entry.brand && normalize(item.entry.brand) === query) score += 30;
  for (const t of tokens) if (item.name.includes(t)) score += 5;
  return score;
}

interface HeaderSearchProps {
  lang: string;
  labels: SearchLabels;
  categoryLabels: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HeaderSearch({ lang, labels, categoryLabels, open, onOpenChange }: HeaderSearchProps) {
  const router = useRouter();
  const isAr = lang === "ar";
  const baseId = useId();
  const listId = `${baseId}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndexEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);

  // Clearing here rather than in an effect on `open`: the next visit starts
  // on an empty field without a second render pass.
  const close = useCallback(() => {
    onOpenChange(false);
    setQuery("");
    setActive(0);
  }, [onOpenChange]);

  // "/" and Ctrl/Cmd+K open the search from anywhere, unless the visitor is
  // already typing into a field — "/" is an ordinary character there.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onOpenChange(true);
      } else if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Open: load the index, focus the field, lock page scroll, trap Tab, and
  // hand focus back to whatever opened it on close — the same contract as
  // the mobile drawer.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    let cancelled = false;
    loadIndex()
      .then((rows) => {
        if (cancelled) return;
        setIndex(rows);
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && previouslyFocused !== document.body) previouslyFocused.focus();
    };
  }, [open, close]);

  const indexed = useMemo<Indexed[]>(
    () =>
      (index ?? []).map((entry) => {
        const name = normalize(isAr ? entry.nameAr : entry.nameEn);
        const otherName = normalize(isAr ? entry.nameEn : entry.nameAr);
        const hay = [
          name,
          otherName,
          entry.brand ?? "",
          entry.modelNo ?? "",
          entry.models,
          categoryLabels[entry.category] ?? "",
          entry.slug,
        ]
          .map(normalize)
          .join(" ");
        return { entry, name, otherName, hay, hayCompact: compact(hay) };
      }),
    [index, isAr, categoryLabels],
  );

  const trimmed = normalize(query.trim());
  const results = useMemo(() => {
    if (!trimmed) return [];
    const tokens = trimmed.split(/\s+/);
    const whole = compact(trimmed);
    return indexed
      .filter(
        (item) =>
          item.hayCompact.includes(whole) ||
          tokens.every((t) => item.hay.includes(t) || item.hayCompact.includes(compact(t))),
      )
      .map((item) => ({ item, score: rank(item, trimmed, tokens) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map(({ item }) => item.entry);
  }, [indexed, trimmed]);

  const hrefFor = (slug: string) => `/${lang}/products/${slug}`;

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[active] ?? results[0];
      close();
      router.push(hrefFor(pick.slug));
    }
  };

  const status = !trimmed
    ? ""
    : failed
      ? labels.searchError
      : index === null
        ? labels.searchLoading
        : results.length === 0
          ? `${labels.searchNoResults} “${query.trim()}”`
          : labels.searchResultsCount.replace("{count}", String(results.length));

  return (
    <>
      <div
        className={`fixed inset-0 z-[65] bg-pine/40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={labels.searchLabel}
        inert={!open}
        className={`fixed inset-x-0 top-0 z-[70] bg-white border-b-2 border-brass transition-[opacity,transform] duration-200 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3 border-b-2 border-pine pb-2">
            <Search className="w-5 h-5 text-stone shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchLabel}
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results.length > 0 ? `${listId}-${active}` : undefined}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
              className="flex-1 min-w-0 bg-transparent py-2 text-base sm:text-lg text-ink placeholder:text-stone outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={close}
              className="p-2.5 -m-1.5 text-stone hover:text-pine transition-colors"
              aria-label={labels.searchClose}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <p role="status" aria-live="polite" className="sr-only">
            {status}
          </p>

          {!trimmed ? (
            <p className="mt-3 text-sm text-stone">{labels.searchHint}</p>
          ) : results.length === 0 ? (
            <p className="mt-4 text-sm text-stone" aria-hidden="true">
              {status}
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label={labels.searchLabel} className="mt-2 max-h-[60vh] overflow-y-auto">
              {results.map((p, i) => (
                <li key={p.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={hrefFor(p.slug)}
                    onClick={close}
                    onMouseEnter={() => setActive(i)}
                    tabIndex={-1}
                    className={`flex items-center gap-4 px-2 py-2.5 border-b border-rule-light transition-colors ${
                      i === active ? "bg-bone" : "hover:bg-bone"
                    }`}
                  >
                    <span className="w-11 h-11 shrink-0 bg-bone flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        <Image src={p.image} alt="" width={44} height={44} className="object-contain w-full h-full" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink truncate">
                        {isAr ? p.nameAr : p.nameEn}
                      </span>
                      <span className="block text-xs text-stone truncate">
                        {[p.brand, categoryLabels[p.category]].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    {p.modelNo ? (
                      <span dir="ltr" className="font-mono text-xs text-pine shrink-0">
                        {p.modelNo}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex justify-end">
            <Link
              href={`/${lang}/products`}
              onClick={close}
              className="font-mono text-xs font-medium tracking-[0.16em] uppercase text-pine hover:text-ink hover:underline underline-offset-4"
            >
              {labels.allProducts}
              <span aria-hidden="true" className="rtl:rotate-180 inline-block ms-2">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
