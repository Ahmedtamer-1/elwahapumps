"use client";

import React, { useActionState, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SubmitButton, inputClass } from "@/components/admin/ui";
import {
  updateVariantPrices,
  adjustVariantPrices,
  toggleVariantActive,
  type VariantPriceState,
} from "@/lib/actions/variants";

export interface AdminVariantRow {
  id: string;
  label: string;
  specs: string;
  price: number | null;
  currency: string;
  isActive: boolean;
}

/**
 * Bulk price editing for one product. Prices move with the market, so the whole table
 * is a single form with one save — retyping 84 motor prices should not be 84 round
 * trips. The filter box narrows large products (the turbine range runs to 217 rows)
 * without touching what gets submitted: hidden rows keep their inputs mounted so an
 * unrelated search never silently drops an edit.
 */
export default function VariantPriceTable({
  productId,
  variants,
  currency,
}: {
  productId: string;
  variants: AdminVariantRow[];
  currency: string;
}) {
  const [saveState, saveAction, saving] = useActionState<VariantPriceState, FormData>(
    updateVariantPrices,
    {},
  );
  const [adjustState, adjustAction, adjusting] = useActionState<VariantPriceState, FormData>(
    adjustVariantPrices,
    {},
  );

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return variants;
    return variants.filter(
      (v) =>
        v.label.toLowerCase().includes(q) ||
        v.specs.toLowerCase().includes(q) ||
        String(v.price ?? "").includes(q),
    );
  }, [variants, query]);

  const visibleIds = visible.map((v) => v.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const status = saveState.error ?? adjustState.error;
  const savedCount = saveState.saved ?? adjustState.saved;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-light" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${variants.length} variants — try 6" or 7.5`}
            className={`${inputClass} pl-9`}
          />
        </div>
        <span className="text-xs font-semibold text-stone tabular-nums">
          {visible.length} shown · {selected.size} selected
        </span>
      </div>

      {status && (
        <div className="p-3 bg-error-container border border-error/30 text-on-error-container text-sm font-semibold">
          {status}
        </div>
      )}
      {savedCount !== undefined && !status && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold">
          {savedCount === 0
            ? "No changes to save."
            : `Updated ${savedCount} price${savedCount === 1 ? "" : "s"} — live on the site now.`}
        </div>
      )}

      {/* Percentage move across the ticked rows — the usual shape of a supplier increase. */}
      <form
        action={adjustAction}
        className="flex flex-wrap items-end gap-3 p-3 bg-bone border border-rule"
      >
        <input type="hidden" name="productId" value={productId} />
        {[...selected].map((id) => (
          <input key={id} type="hidden" name="selected" value={id} />
        ))}
        <label className="block">
          <span className="block text-xs font-bold text-stone uppercase mb-1">
            Adjust selected by %
          </span>
          <input
            name="percent"
            type="number"
            step="0.1"
            placeholder="10"
            className={`${inputClass} w-32`}
          />
        </label>
        <SubmitButton type="submit" variant="ghost" disabled={adjusting || selected.size === 0}>
          {adjusting ? "Applying…" : `Apply to ${selected.size}`}
        </SubmitButton>
        <p className="text-[11px] text-stone-light basis-full">
          Use a negative number to reduce. Results are  to whole {currency}.
        </p>
      </form>

      <form action={saveAction} className="space-y-3">
        <input type="hidden" name="productId" value={productId} />

        <div className="overflow-x-auto border border-rule">
          <table className="w-full text-sm">
            <thead className="bg-bone text-left">
              <tr className="text-xs font-bold text-stone uppercase">
                <th className="p-2 w-8">
                  <input
                    type="checkbox"
                    aria-label="Select all shown"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                  />
                </th>
                <th className="p-2">Variant</th>
                <th className="p-2">Details</th>
                <th className="p-2 w-36">Price ({currency})</th>
                <th className="p-2 w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule-light">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-stone-light">
                    Nothing matches “{query}”.
                  </td>
                </tr>
              )}
              {variants.map((v) => {
                const shown = visibleIds.includes(v.id);
                return (
                  <tr key={v.id} className={shown ? (v.isActive ? "" : "opacity-50") : "hidden"}>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        aria-label={`Select ${v.label}`}
                        checked={selected.has(v.id)}
                        onChange={() => toggleOne(v.id)}
                      />
                    </td>
                    <td className="p-2 font-semibold text-ink">{v.label}</td>
                    <td className="p-2 text-xs text-stone">{v.specs}</td>
                    <td className="p-2">
                      <input
                        name={`price:${v.id}`}
                        type="number"
                        step="1"
                        min="0"
                        defaultValue={v.price === null ? "" : String(v.price)}
                        placeholder="On request"
                        className={`${inputClass} tabular-nums`}
                      />
                    </td>
                    <td className="p-2">
                      <button
                        type="submit"
                        formAction={toggleVariantActive}
                        name="variantId"
                        value={v.id}
                        formNoValidate
                        className={`text-xs font-bold ${
 v.isActive
 ?"text-emerald-600 hover:underline"
                            : "text-stone-light hover:underline"
                        }`}
                      >
                        {v.isActive ? "Visible" : "Hidden"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <SubmitButton type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save prices"}
        </SubmitButton>
      </form>
    </div>
  );
}
