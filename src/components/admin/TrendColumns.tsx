"use client";

import React, { useState } from "react";

export interface TrendPoint {
  label: string;
  value: number;
}

/**
 * Single-series column chart (leads over time).
 *
 * Per the dataviz spec: one hue (brand green, validated >= 3:1 on white), columns
 * capped at 24px with a square cap and square baseline, a 2px surface gap
 * between adjacent marks, no legend (single series — the title names it), labels
 * only on the peak, and a per-mark hover/focus tooltip. The tooltip never gates
 * a value: the table view below carries every number.
 */
export default function TrendColumns({ data, caption }: { data: TrendPoint[]; caption: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const peakIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);

  return (
    <div>
      <div className="flex items-end gap-[2px] h-40" role="img" aria-label={caption}>
        {data.map((d, i) => {
          const heightPct = (d.value / max) * 100;
          const isActive = active === i;
          return (
            <div
              key={d.label}
              className="relative flex-1 h-full flex flex-col justify-end items-center group"
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              tabIndex={0}
            >
              {/* Peak gets the one direct label; the rest live in the tooltip and table. */}
              {i === peakIndex && d.value > 0 && (
                <span className="text-[10px] font-semibold text-stone mb-1">{d.value}</span>
              )}

              {isActive && (
                <div className="absolute bottom-full mb-6 z-10 whitespace-nowrap bg-pine px-2.5 py-1.5 pointer-events-none">
                  <span className="block text-sm font-bold text-white leading-tight">{d.value}</span>
                  <span className="block text-[10px] text-stone-light">{d.label}</span>
                </div>
              )}

              <div
                className="w-full max-w-6 transition-opacity"
                style={{
                  height: `${Math.max(heightPct, d.value > 0 ? 2 : 0.5)}%`,
                  backgroundColor: d.value > 0 ? "#1c7a40" : "#e4e4e7",
                  opacity: isActive ? 0.8 : 1,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Axis ticks: aligned figures, so tabular-nums applies here. */}
      <div className="flex gap-[2px] mt-2">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="flex-1 text-center text-[10px] text-stone-light tabular-nums truncate"
          >
            {i % 2 === 0 ? d.label : ""}
          </div>
        ))}
      </div>

      <details className="mt-4 group">
        <summary className="text-xs font-semibold text-stone cursor-pointer hover:text-pine list-none">
          View as table
        </summary>
        <table className="mt-2 w-full text-xs">
          <thead>
            <tr className="text-stone border-b border-rule">
              <th className="text-left font-semibold py-1.5">Period</th>
              <th className="text-right font-semibold py-1.5">Leads</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-b border-rule-light last:border-0">
                <td className="py-1.5 text-ink">{d.label}</td>
                <td className="py-1.5 text-right text-ink font-semibold tabular-nums">
                  {d.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
