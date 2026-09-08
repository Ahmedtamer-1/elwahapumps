"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CatalogOption, CatalogVariant } from "@/lib/products";

/**
 * Size selectors for a product, driven entirely by what the price sheet actually
 * contains. The axes are sparse — the motor sheet holds 84 of 528 possible
 * diameter × HP × material combinations — so values with no matching variant are
 * hidden rather than offered and then rejected.
 *
 * Availability cascades: each selector is narrowed by the ones before it, which
 * matches how the catalogue reads ("pick the model, then the number of stages").
 */

type Selections = Record<string, string | undefined>;

export interface VariantAxis {
  option: CatalogOption;
  values: CatalogOption["values"];
  selected: string | undefined;
}

export interface VariantSelection {
  axes: VariantAxis[];
  selected: CatalogVariant | null;
  choose: (key: string, value: string) => void;
}

/** A variant matches when every axis agrees, treating "absent" as its own value. */
function matches(variant: CatalogVariant, keys: string[], sel: Selections): boolean {
  return keys.every((k) => (variant.selections[k] ?? null) === (sel[k] ?? null));
}

/**
 * Walks the axes in order, keeping each selection only while it is still reachable
 * given the ones before it. Picking a 4" motor therefore drops an incompatible 150 HP
 * down to the largest 4" actually stocked instead of resolving to nothing.
 */
function resolve(
  options: CatalogOption[],
  variants: CatalogVariant[],
  wanted: Selections,
): { axes: VariantAxis[]; selected: CatalogVariant | null } {
  const axes: VariantAxis[] = [];
  const settled: Selections = {};
  let pool = variants;

  for (const option of options) {
    // Values still reachable given everything chosen so far.
    const seen = new Map<string, CatalogOption["values"][number]>();
    for (const v of pool) {
      const value = v.selections[option.key];
      if (value === undefined) continue;
      if (!seen.has(value)) {
        const meta = option.values.find((ov) => ov.value === value);
        if (meta) seen.set(value, meta);
      }
    }
    // Preserve the option's own ordering (numeric where the importer found a number).
    const values = option.values.filter((ov) => seen.has(ov.value));

    // An axis that doesn't apply to this branch — e.g. port size on a Franklin kit —
    // contributes no values and is left out of the UI entirely.
    if (values.length === 0) {
      axes.push({ option, values, selected: undefined });
      continue;
    }

    const desired = wanted[option.key];
    const selected =
      desired !== undefined && values.some((v) => v.value === desired)
        ? desired
        : values[0].value;

    settled[option.key] = selected;
    axes.push({ option, values, selected });
    pool = pool.filter((v) => v.selections[option.key] === selected);
  }

  const keys = options.map((o) => o.key);
  const selected = variants.find((v) => matches(v, keys, settled)) ?? null;
  return { axes, selected };
}

export function useVariantSelection(
  options: CatalogOption[],
  variants: CatalogVariant[],
): VariantSelection {
  // Start on the cheapest variant so a real price is on screen before any interaction.
  const initial = useMemo<Selections>(() => {
    const priced = variants.filter((v) => v.price !== null);
    const cheapest = priced.reduce<CatalogVariant | null>(
      (best, v) => (best === null || (v.price ?? 0) < (best.price ?? 0) ? v : best),
      null,
    );
    return { ...(cheapest ?? variants[0])?.selections };
  }, [variants]);

  const [wanted, setWanted] = useState<Selections>(initial);

  const { axes, selected } = useMemo(
    () => resolve(options, variants, wanted),
    [options, variants, wanted],
  );

  return {
    axes,
    selected,
    choose: (key, value) => setWanted((prev) => ({ ...prev, [key]: value })),
  };
}

export default function ProductVariantSelector({
  axes,
  choose,
}: Pick<VariantSelection, "axes" | "choose">) {
  const visible = axes.filter((a) => a.values.length > 0);
  if (visible.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {visible.map(({ option, values, selected }) => (
        <label key={option.key} className="block">
          {/* The unit is not repeated here — every value label already carries it, in
              the right language ("5.5 HP" / "5.5 حصان"). */}
          <span className="spec-label block mb-1.5">{option.label}</span>

          <div className="relative">
            <select
              value={selected ?? ""}
              onChange={(e) => choose(option.key, e.target.value)}
              // Only reachable combinations are rendered, so there is nothing to disable.
              /* Square, on a hairline, mono — a size is a specification, and
                 this control was the last thing on the page still wearing the
                 old surface tokens and a mint focus ring. No outline-none: the
                 brass :focus-visible ring in globals.css stays. */
              className="w-full appearance-none ps-3.5 pe-10 py-3 border border-rule
            bg-white text-ink font-mono text-[13px] cursor-pointer
            hover:border-pine focus:border-pine transition-colors"
            >
              {values.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="w-5 h-5 absolute end-3 top-1/2 -translate-y-1/2 text-stone pointer-events-none"
            />
          </div>

        </label>
      ))}
    </div>
  );
}
